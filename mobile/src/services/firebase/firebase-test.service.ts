import { env } from '../../utils/env';

interface FirebasePasswordLoginResponse {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
}

interface FirebaseVerifyTokenResponse {
  success: boolean;
  data?: {
    uid: string;
    email: string | null;
    name: string | null;
    picture: string | null;
    provider: string | null;
  };
  message?: string;
  details?: string[];
}

class FirebaseTestService {
  async generateIdToken(email: string, password: string): Promise<FirebasePasswordLoginResponse> {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${env.firebaseWebApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
      },
    );

    const data = (await response.json()) as {
      idToken?: string;
      email?: string;
      refreshToken?: string;
      expiresIn?: string;
      localId?: string;
      error?: {
        message?: string;
      };
    };

    if (!response.ok || !data.idToken) {
      throw new Error(mapFirebaseError(data.error?.message));
    }

    return {
      idToken: data.idToken,
      email: data.email ?? email,
      refreshToken: data.refreshToken ?? '',
      expiresIn: data.expiresIn ?? '',
      localId: data.localId ?? '',
    };
  }

  async verifyTokenWithBackend(token: string): Promise<FirebaseVerifyTokenResponse> {
    const response = await fetch(`${env.apiBaseUrl}/auth/firebase/verify-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    const data = (await response.json()) as FirebaseVerifyTokenResponse;

    if (!response.ok) {
      throw new Error(data.message ?? 'Nao foi possivel validar o token no backend.');
    }

    return data;
  }
}

function mapFirebaseError(errorCode?: string): string {
  switch (errorCode) {
    case 'EMAIL_NOT_FOUND':
    case 'INVALID_PASSWORD':
    case 'INVALID_LOGIN_CREDENTIALS':
      return 'E-mail ou senha do Firebase invalidos.';
    case 'USER_DISABLED':
      return 'Conta Firebase desativada.';
    case 'TOO_MANY_ATTEMPTS_TRY_LATER':
      return 'Muitas tentativas. Tente novamente mais tarde.';
    default:
      return 'Nao foi possivel gerar o token do Firebase.';
  }
}

export const firebaseTestService = new FirebaseTestService();
