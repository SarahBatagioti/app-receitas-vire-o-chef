import {
  AuthStatusResponseDto,
  LoginResponseDto,
  LoginUserDto,
  RegisteredUserDto,
  RegisterUserDto,
} from '../dtos/auth.dto';
import { UserRepository } from '../repositories/user.repository';
import { AppError } from '../utils/app-error';
import { comparePassword, hashPassword } from '../utils/hash';
import { generateAccessToken } from '../utils/jwt';

const userRepository = new UserRepository();

export class AuthService {
  getAuthBootstrapStatus(): AuthStatusResponseDto {
    return {
      feature: 'auth',
      ready: false,
      message: 'Estrutura inicial de autenticacao preparada. Fluxos ainda nao implementados.',
      providers: {
        emailPassword: false,
        firebase: false,
        socialLogin: false,
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
      isSocialAccount: false,
    });

    return {
      id: createdUser.id,
      email: createdUser.email,
      username: createdUser.username,
      provider: createdUser.provider,
      isSocialAccount: createdUser.isSocialAccount,
      createdAt: createdUser.createdAt,
      updatedAt: createdUser.updatedAt,
    };
  }

  async loginUser(input: LoginUserDto): Promise<LoginResponseDto> {
    const normalizedEmail = input.email.trim().toLowerCase();
    const user = await userRepository.findByEmail(normalizedEmail);

    if (!user?.passwordHash) {
      throw new AppError('E-mail ou senha invalidos.', 401);
    }

    const isPasswordValid = await comparePassword(input.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AppError('E-mail ou senha invalidos.', 401);
    }

    const token = generateAccessToken({
      sub: user.id,
      email: user.email,
      username: user.username,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  }
}
