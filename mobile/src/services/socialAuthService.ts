import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {
  GoogleAuthProvider,
  getIdToken,
  signInWithCredential,
  signOut as firebaseSignOut,
} from 'firebase/auth';

import { getFirebaseAuth } from '../config/firebase';
import { SocialAuthResult } from '../types/auth';
import { env } from '../utils/env';

let isGoogleConfigured = false;

function ensureGoogleConfigured() {
  if (isGoogleConfigured) {
    return;
  }

  GoogleSignin.configure({
    webClientId: env.googleWebClientId,
    iosClientId: env.googleIosClientId,
  });

  isGoogleConfigured = true;
}

async function resolveGoogleIdToken() {
  const tokens = await GoogleSignin.getTokens();

  if (!tokens.idToken) {
    throw new Error('Nao foi possivel obter o token do Google.');
  }

  return tokens.idToken;
}

class SocialAuthService {
  async signInWithGoogle(): Promise<SocialAuthResult> {
    try {
      ensureGoogleConfigured();
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      const signInResult = await GoogleSignin.signIn();

      if (signInResult.type !== 'success') {
        console.warn('[GoogleSignIn] Fluxo encerrado antes de concluir.', signInResult.type);

        return {
          cancelled: true,
          provider: 'google',
        };
      }

      const idToken = signInResult.data.idToken ?? (await resolveGoogleIdToken());
      const credential = GoogleAuthProvider.credential(idToken);
      const auth = getFirebaseAuth();
      const userCredential = await signInWithCredential(auth, credential);
      const firebaseToken = await getIdToken(userCredential.user, true);

      return {
        cancelled: false,
        provider: 'google',
        firebaseToken,
        email: signInResult.data.user.email,
        name: signInResult.data.user.name ?? userCredential.user.displayName ?? undefined,
        avatarUrl: signInResult.data.user.photo ?? userCredential.user.photoURL ?? undefined,
      };
    } catch (error) {
      console.error('[GoogleSignIn] Falha ao autenticar.', error);
      throw error;
    }
  }

  async clearProviderSessions(): Promise<void> {
    const auth = getFirebaseAuth();

    await Promise.allSettled([GoogleSignin.signOut(), firebaseSignOut(auth)]);
  }
}

export const socialAuthService = new SocialAuthService();
