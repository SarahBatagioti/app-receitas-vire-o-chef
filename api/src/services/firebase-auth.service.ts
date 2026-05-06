import { FirebaseTokenPayload } from '../types/firebase';
import { AppError } from '../utils/app-error';
import { getFirebaseAuth } from '../config/firebase';

const PROVIDER_MAP = {
  'google.com': 'google',
} as const;

export class FirebaseAuthService {
  async verifyToken(token: string): Promise<FirebaseTokenPayload> {
    try {
      const decodedToken = await getFirebaseAuth().verifyIdToken(token);

      return {
        uid: decodedToken.uid,
        email: decodedToken.email ?? null,
        name: decodedToken.name ?? null,
        picture: decodedToken.picture ?? null,
        provider: normalizeProvider(decodedToken.firebase?.sign_in_provider ?? null),
      };
    } catch {
      throw new AppError('Token Firebase invalido ou expirado.', 401);
    }
  }

  async verifySocialToken(
    token: string,
    provider: 'google',
  ): Promise<FirebaseTokenPayload> {
    const identity = await this.verifyToken(token);

    if (!identity.email) {
      throw new AppError('Conta social sem e-mail disponivel.', 422);
    }

    if (identity.provider !== provider) {
      throw new AppError('Provider social invalido para o token informado.', 422);
    }

    return identity;
  }
}

function normalizeProvider(provider: string | null): 'google' | null {
  if (!provider) {
    return null;
  }

  return PROVIDER_MAP[provider as keyof typeof PROVIDER_MAP] ?? null;
}
