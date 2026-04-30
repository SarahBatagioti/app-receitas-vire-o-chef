import {
  AuthStatusResponseDto,
  AuthenticatedUserDto,
  CompleteSocialRegisterDto,
  ForgotPasswordDto,
  GenericMessageResponseDto,
  LoginResponseDto,
  LoginUserDto,
  RegisteredUserDto,
  RegisterUserDto,
  ResetPasswordDto,
  SocialLoginDto,
  SocialLoginResponseDto,
  SocialLoginSuccessResponseDto,
} from '../dtos/auth.dto';
import { env } from '../config/env';
import { PasswordResetRepository } from '../repositories/password-reset.repository';
import { UserRepository } from '../repositories/user.repository';
import { AppError } from '../utils/app-error';
import { comparePassword, hashPassword } from '../utils/hash';
import { generateAccessToken } from '../utils/jwt';
import {
  buildExpirationDate,
  buildResetPasswordLink,
  generateSecureToken,
  hashOpaqueToken,
} from '../utils/token';
import { FirebaseAuthService } from './firebase-auth.service';
import { EmailService } from './email.service';

const userRepository = new UserRepository();
const passwordResetRepository = new PasswordResetRepository();
const firebaseAuthService = new FirebaseAuthService();
const emailService = new EmailService();
const PASSWORD_RESET_EXPIRATION_MINUTES = 60;
const GENERIC_FORGOT_PASSWORD_MESSAGE =
  'Se existir uma conta vinculada a este e-mail, enviaremos instrucoes para redefinicao de senha.';

export class AuthService {
  getAuthBootstrapStatus(): AuthStatusResponseDto {
    return {
      feature: 'auth',
      ready: false,
      message: 'Estrutura inicial de autenticacao preparada. Fluxos ainda nao implementados.',
      providers: {
        emailPassword: false,
        firebase: true,
        socialLogin: true,
      },
    };
  }

  async registerUser(input: RegisterUserDto): Promise<RegisteredUserDto> {
    const normalizedEmail = input.email.trim().toLowerCase();
    const normalizedUsername = input.username.trim();

    const [existingEmailUser, existingUsernameUser] = await Promise.all([
      userRepository.findByEmail(normalizedEmail),
      userRepository.findByUsername(normalizedUsername),
    ]);

    if (existingEmailUser) {
      throw new AppError('Ja existe uma conta cadastrada com este e-mail.', 409);
    }

    if (existingUsernameUser) {
      throw new AppError('Nome de usuario indisponivel.', 409);
    }

    const passwordHash = await hashPassword(input.password);

    const createdUser = await userRepository.create({
      email: normalizedEmail,
      passwordHash,
      username: normalizedUsername,
      provider: 'local',
      firebaseUid: null,
      isSocialAccount: false,
      isRegistrationCompleted: true,
    });

    return mapRegisteredUser(createdUser);
  }

  async loginUser(input: LoginUserDto): Promise<LoginResponseDto> {
    const normalizedEmail = input.email.trim().toLowerCase();
    const user = await userRepository.findByEmail(normalizedEmail);

    if (!user?.passwordHash || !user.username || !user.isRegistrationCompleted) {
      throw new AppError('E-mail ou senha invalidos.', 401);
    }

    const isPasswordValid = await comparePassword(input.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AppError('E-mail ou senha invalidos.', 401);
    }

    return buildLoginResponse(user.id, user.email, user.username, user.provider);
  }

  async socialLogin(input: SocialLoginDto): Promise<SocialLoginResponseDto> {
    const identity = await firebaseAuthService.verifySocialToken(
      input.firebaseToken,
      input.provider,
    );

    const normalizedEmail = identity.email!.trim().toLowerCase();
    const [userByEmail, userByFirebaseUid] = await Promise.all([
      userRepository.findByEmail(normalizedEmail),
      userRepository.findByFirebaseUid(identity.uid),
    ]);

    const user = userByEmail ?? userByFirebaseUid;

    if (!user) {
      return {
        requiresCompletion: true,
        email: normalizedEmail,
        provider: input.provider,
      };
    }

    if (!user.isRegistrationCompleted || !user.username) {
      return {
        requiresCompletion: true,
        email: user.email,
        provider: input.provider,
      };
    }

    if (user.provider === 'local' && !user.isSocialAccount) {
      return buildLoginResponse(user.id, user.email, user.username, user.provider);
    }

    if (user.provider !== input.provider && user.provider !== 'local') {
      throw new AppError('Conta social vinculada a outro provider.', 409);
    }

    return buildLoginResponse(user.id, user.email, user.username, user.provider);
  }

  async forgotPassword(
    input: ForgotPasswordDto,
  ): Promise<GenericMessageResponseDto> {
    const normalizedEmail = input.email.trim().toLowerCase();
    const user = await userRepository.findByEmail(normalizedEmail);

    if (!user || !user.isRegistrationCompleted) {
      return {
        success: true,
        message: GENERIC_FORGOT_PASSWORD_MESSAGE,
      };
    }

    const rawToken = generateSecureToken();
    const tokenHash = hashOpaqueToken(rawToken);
    const expiresAt = buildExpirationDate(PASSWORD_RESET_EXPIRATION_MINUTES);

    await passwordResetRepository.invalidateActiveTokensByUserId(user.id);
    await passwordResetRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    try {
      const resetLink = buildResetPasswordLink(
        env.frontendResetPasswordUrl,
        rawToken,
      );

      await emailService.sendPasswordResetEmail(user.email, resetLink);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError('Nao foi possivel iniciar a redefinicao de senha.', 500);
    }

    return {
      success: true,
      message: GENERIC_FORGOT_PASSWORD_MESSAGE,
    };
  }

  async resetPassword(
    input: ResetPasswordDto,
  ): Promise<GenericMessageResponseDto> {
    const tokenHash = hashOpaqueToken(input.token.trim());
    const resetToken = await passwordResetRepository.findValidByTokenHash(tokenHash);

    if (!resetToken) {
      throw new AppError('Token de redefinicao invalido ou expirado.', 401);
    }

    const user = await userRepository.findById(resetToken.userId);

    if (!user) {
      throw new AppError('Token de redefinicao invalido ou expirado.', 401);
    }

    const passwordHash = await hashPassword(input.newPassword);

    await userRepository.updatePasswordById(user.id, passwordHash);
    await passwordResetRepository.markAsUsed(resetToken.id);
    await passwordResetRepository.invalidateActiveTokensByUserId(user.id);

    return {
      success: true,
      message: 'Senha redefinida com sucesso.',
    };
  }

  async completeSocialRegister(
    input: CompleteSocialRegisterDto,
  ): Promise<SocialLoginResponseDto> {
    const identity = await firebaseAuthService.verifySocialToken(
      input.firebaseToken,
      input.provider,
    );

    const normalizedEmail = identity.email!.trim().toLowerCase();
    const normalizedUsername = input.username.trim();

    const [existingEmailUser, existingUsernameUser, existingFirebaseUser] =
      await Promise.all([
        userRepository.findByEmail(normalizedEmail),
        userRepository.findByUsername(normalizedUsername),
        userRepository.findByFirebaseUid(identity.uid),
      ]);

    if (
      existingUsernameUser &&
      existingUsernameUser.email !== normalizedEmail
    ) {
      throw new AppError('Nome de usuario indisponivel.', 409);
    }

    const passwordHash = await hashPassword(input.password);
    const targetUser = existingEmailUser ?? existingFirebaseUser;

    if (!targetUser) {
      const createdUser = await userRepository.create({
        email: normalizedEmail,
        passwordHash,
        username: normalizedUsername,
        provider: input.provider,
        firebaseUid: identity.uid,
        isSocialAccount: true,
        isRegistrationCompleted: true,
      });

      return buildLoginResponse(
        createdUser.id,
        createdUser.email,
        createdUser.username!,
        createdUser.provider,
      );
    }

    if (
      targetUser.provider === 'local' &&
      targetUser.isRegistrationCompleted &&
      !targetUser.isSocialAccount
    ) {
      throw new AppError(
        'Ja existe uma conta local com este e-mail. Faça o vínculo de forma autenticada antes de usar login social.',
        409,
      );
    }

    if (targetUser.isRegistrationCompleted && targetUser.username) {
      if (
        targetUser.provider !== input.provider &&
        targetUser.provider !== 'local'
      ) {
        throw new AppError('Conta social vinculada a outro provider.', 409);
      }

      return buildLoginResponse(
        targetUser.id,
        targetUser.email,
        targetUser.username,
        targetUser.provider,
      );
    }

    const completedUser = await userRepository.completeSocialRegistration(
      targetUser.id,
      {
        passwordHash,
        username: normalizedUsername,
        provider: input.provider,
        firebaseUid: identity.uid,
        isSocialAccount: true,
      },
    );

    return buildLoginResponse(
      completedUser.id,
      completedUser.email,
      completedUser.username!,
      completedUser.provider,
    );
  }

  async getAuthenticatedUser(userId: string): Promise<AuthenticatedUserDto> {
    const user = await userRepository.findById(userId);

    if (!user || !user.username) {
      throw new AppError('Usuario autenticado nao encontrado.', 404);
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      provider: user.provider,
    };
  }
}

function buildLoginResponse(
  id: string,
  email: string,
  username: string,
  provider: AuthenticatedUserDto['provider'],
): SocialLoginSuccessResponseDto {
  const token = generateAccessToken({
    sub: id,
    email,
    username,
  });

  return {
    requiresCompletion: false,
    token,
    user: {
      id,
      email,
      username,
      provider,
    },
  };
}

function mapRegisteredUser(user: {
  id: string;
  email: string;
  username: string | null;
  provider: AuthenticatedUserDto['provider'];
  isSocialAccount: boolean;
  createdAt: string;
  updatedAt: string;
}): RegisteredUserDto {
  if (!user.username) {
    throw new AppError('Usuario sem nome de usuario valido.', 500);
  }

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    provider: user.provider,
    isSocialAccount: user.isSocialAccount,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
