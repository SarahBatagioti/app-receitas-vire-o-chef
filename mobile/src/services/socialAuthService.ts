import { FacebookAuthProvider, GoogleAuthProvider, signInWithCredential, signOut } from 'firebase/auth';
import { Platform } from 'react-native';

import { getFirebaseAuth } from '../config/firebase';
import { SocialAuthResult, SocialProvider } from '../types/auth';
import { env } from '../utils/env';

type GoogleSignInModule = {
  GoogleSignin: {
    configure: (options: Record<string, unknown>) => void;
    hasPlayServices: (options?: Record<string, unknown>) => Promise<boolean>;
    signIn: () => Promise<unknown>;
    signOut: () => Promise<void>;
  };
};

type FacebookModule = {
  LoginManager: {
    logInWithPermissions: (permissions: string[]) => Promise<{ isCancelled: boolean }>;
    logOut: () => void;
  };
  AccessToken: {
    getCurrentAccessToken: () => Promise<{ accessToken: string } | null>;
  };
  Settings: {
    setAppID: (appId: string) => void;
    setClientToken: (token: string) => void;
    initializeSDK: () => void;
  };
};

function getGoogleModule(): GoogleSignInModule {
  return require('@react-native-google-signin/google-signin') as GoogleSignInModule;
}

function getFacebookModule(): FacebookModule {
  return require('react-native-fbsdk-next') as FacebookModule;
}

function extractGoogleIdToken(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const data = payload as {
    idToken?: string;
    data?: { idToken?: string };
    user?: { idToken?: string };
    type?: string;
  };

  return data.idToken ?? data.data?.idToken ?? data.user?.idToken ?? null;
}

function extractGoogleProfile(payload: unknown): {
  email?: string;
  name?: string;
  avatarUrl?: string;
  cancelled?: boolean;
} {
  if (!payload || typeof payload !== 'object') {
    return {};
  }

  const response = payload as {
    type?: string;
    user?: {
      email?: string;
      name?: string;
      photo?: string;
      photoURL?: string;
    };
    data?: {
      user?: {
        email?: string;
        name?: string;
        photo?: string;
        photoURL?: string;
      };
    };
  };

  const user = response.user ?? response.data?.user;

  return {
    cancelled: response.type === 'cancelled',
    email: user?.email,
    name: user?.name,
    avatarUrl: user?.photoURL ?? user?.photo,
  };
}

function isGoogleCancellation(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const code = (error as { code?: string }).code;
  return code === 'SIGN_IN_CANCELLED' || code === '12501';
}

function isGoogleInProgress(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  return (error as { code?: string }).code === 'IN_PROGRESS';
}

function isGooglePlayServicesError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  return (error as { code?: string }).code === 'PLAY_SERVICES_NOT_AVAILABLE';
}

function isGoogleConfigurationError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const googleError = error as { code?: string; message?: string };
  const normalizedMessage = googleError.message?.toLowerCase() ?? '';

  return (
    googleError.code === '10' ||
    googleError.code === '12500' ||
    googleError.code === 'DEVELOPER_ERROR' ||
    normalizedMessage.includes('non-recoverable sign in failure') ||
    normalizedMessage.includes('developer console is not set up correctly') ||
    normalizedMessage.includes('developer_error')
  );
}

function buildFirebaseTokenResult(
  provider: SocialProvider,
  email?: string,
  name?: string,
  avatarUrl?: string,
) {
  return async (firebaseProviderToken: string) => {
    const credential =
      provider === 'google'
        ? GoogleAuthProvider.credential(firebaseProviderToken)
        : FacebookAuthProvider.credential(firebaseProviderToken);

    const firebaseCredential = await signInWithCredential(getFirebaseAuth(), credential);
    const firebaseToken = await firebaseCredential.user.getIdToken();

    return {
      cancelled: false,
      provider,
      firebaseToken,
      email: email ?? firebaseCredential.user.email ?? undefined,
      name: name ?? firebaseCredential.user.displayName ?? undefined,
      avatarUrl: avatarUrl ?? firebaseCredential.user.photoURL ?? undefined,
    } satisfies SocialAuthResult;
  };
}

class SocialAuthService {
  private isGoogleConfigured = false;
  private isFacebookConfigured = false;

  private configureGoogle() {
    if (this.isGoogleConfigured) {
      return;
    }

    const { GoogleSignin } = getGoogleModule();
    const googleConfig: Record<string, unknown> = {
      webClientId: env.googleWebClientId,
      offlineAccess: false,
    };

    if (Platform.OS === 'ios') {
      googleConfig.iosClientId = env.googleIosClientId;
    }

    GoogleSignin.configure(googleConfig);

    this.isGoogleConfigured = true;
  }

  private configureFacebook() {
    if (this.isFacebookConfigured) {
      return;
    }

    const { Settings } = getFacebookModule();

    Settings.setAppID(env.facebookAppId);
    Settings.setClientToken(env.facebookClientToken);
    Settings.initializeSDK();

    this.isFacebookConfigured = true;
  }

  async signInWithGoogle(): Promise<SocialAuthResult> {
    this.configureGoogle();

    const { GoogleSignin } = getGoogleModule();

    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const result = await GoogleSignin.signIn();
      const profile = extractGoogleProfile(result);

      if (profile.cancelled) {
        return {
          cancelled: true,
          provider: 'google',
        };
      }

      const idToken = extractGoogleIdToken(result);

      if (!idToken) {
        throw new Error('NÃ£o foi possÃ­vel obter o token do Google.');
      }

      return buildFirebaseTokenResult(
        'google',
        profile.email,
        profile.name,
        profile.avatarUrl,
      )(idToken);
    } catch (error) {
      if (isGoogleCancellation(error)) {
        return {
          cancelled: true,
          provider: 'google',
        };
      }

      if (isGoogleInProgress(error)) {
        throw new Error('O login com Google jÃ¡ estÃ¡ em andamento.');
      }

      if (isGooglePlayServicesError(error)) {
        throw new Error('Os serviÃ§os do Google Play nÃ£o estÃ£o disponÃ­veis neste dispositivo.');
      }

      if (isGoogleConfigurationError(error)) {
        throw new Error(
          'O login com Google no Android nÃ£o estÃ¡ configurado corretamente. Habilite o provider Google no Firebase, cadastre o app Android com package `com.mobile`, adicione o SHA1 `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`, baixe o `google-services.json` atualizado e coloque em `mobile/android/app/google-services.json`, depois gere um novo build do app.',
        );
      }

      if (error instanceof Error) {
        throw error;
      }

      throw new Error('NÃ£o foi possÃ­vel iniciar o login com Google.');
    }
  }

  async signInWithFacebook(): Promise<SocialAuthResult> {
    this.configureFacebook();

    const { AccessToken, LoginManager } = getFacebookModule();

    try {
      const loginResult = await LoginManager.logInWithPermissions(['public_profile', 'email']);

      if (loginResult.isCancelled) {
        return {
          cancelled: true,
          provider: 'facebook',
        };
      }

      const currentAccessToken = await AccessToken.getCurrentAccessToken();

      if (!currentAccessToken?.accessToken) {
        throw new Error('NÃ£o foi possÃ­vel obter o token do Facebook.');
      }

      return buildFirebaseTokenResult('facebook')(currentAccessToken.accessToken);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      throw new Error('NÃ£o foi possÃ­vel iniciar o login com Facebook.');
    }
  }

  async clearProviderSessions(): Promise<void> {
    const { GoogleSignin } = getGoogleModule();
    const { LoginManager } = getFacebookModule();

    await Promise.allSettled([
      GoogleSignin.signOut(),
      Promise.resolve().then(() => LoginManager.logOut()),
      signOut(getFirebaseAuth()),
    ]);
  }
}

export const socialAuthService = new SocialAuthService();
