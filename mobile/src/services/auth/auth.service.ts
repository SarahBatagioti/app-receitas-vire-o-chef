import { AuthBootstrapStatus } from '../../types/auth';

export class AuthService {
  async getBootstrapStatus(): Promise<AuthBootstrapStatus> {
    return {
      feature: 'auth',
      ready: false,
      message: 'Estrutura inicial de autenticacao pronta no app. Fluxos ainda nao implementados.',
    };
  }
}

export const authService = new AuthService();
