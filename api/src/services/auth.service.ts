import {
  AuthStatusResponseDto,
  RegisteredUserDto,
  RegisterUserDto,
} from '../dtos/auth.dto';
import { UserRepository } from '../repositories/user.repository';
import { AppError } from '../utils/app-error';
import { hashPassword } from '../utils/hash';

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
}
