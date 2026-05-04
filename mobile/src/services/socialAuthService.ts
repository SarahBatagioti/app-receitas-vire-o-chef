import { SocialAuthResult, SocialProvider } from '../types/auth';

class SocialAuthService {
  async signInWithGoogle(): Promise<SocialAuthResult> {
    return {
      cancelled: true,
      provider: 'google',
    };
  }

  async signInWithFacebook(): Promise<SocialAuthResult> {
    return {
      cancelled: true,
      provider: 'facebook',
    };
  }

  async clearProviderSessions(): Promise<void> {
    return;
  }
}

export const socialAuthService = new SocialAuthService();
