import { AuthStatusResponseDto } from '../dtos/auth.dto';

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
}
