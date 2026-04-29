import { getFirebaseAuth } from '../config/firebase';
import { FirebaseTokenPayload } from '../types/firebase';
import { AppError } from '../utils/app-error';

export class FirebaseAuthService {
  async verifyToken(token: string): Promise<FirebaseTokenPayload> {
    try {
      const decodedToken = await getFirebaseAuth().verifyIdToken(token);

      return {
        uid: decodedToken.uid,
        email: decodedToken.email ?? null,
        name: decodedToken.name ?? null,
        picture: decodedToken.picture ?? null,
        provider: decodedToken.firebase?.sign_in_provider ?? null,
      };
    } catch {
      throw new AppError('Token Firebase invalido ou expirado.', 401);
    }
  }
}
