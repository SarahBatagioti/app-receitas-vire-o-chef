export type AuthSessionStatus =
  | 'checking'
  | 'authenticated'
  | 'unauthenticated';

export type SocialProvider = 'google' | 'facebook';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  name: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface SocialLoginPayload {
  provider: SocialProvider;
  accessToken: string;
  idToken?: string;
}

export interface PendingSocialAuth {
  provider: SocialProvider;
  accessToken: string;
  email: string;
}

export interface CompleteSocialRegisterPayload {
  provider: SocialProvider;
  accessToken: string;
  email: string;
  name: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
  message?: string;
}

export interface SocialLoginResponse {
  requiresSocialCompletion: boolean;
  pendingSocialAuth?: PendingSocialAuth;
  token?: string;
  user?: AuthUser;
  message?: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface AuthContextValue {
  status: AuthSessionStatus;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  authError: string | null;
  pendingSocialAuth: PendingSocialAuth | null;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  clearSession: () => Promise<void>;
  forgotPassword: (payload: ForgotPasswordPayload) => Promise<ForgotPasswordResponse>;
  completeSocialRegister: (
    payload: Omit<CompleteSocialRegisterPayload, 'provider' | 'accessToken' | 'email'>,
  ) => Promise<void>;
  loginWithGoogle: (payload?: Omit<SocialLoginPayload, 'provider'>) => Promise<SocialLoginResponse>;
  loginWithFacebook: (payload?: Omit<SocialLoginPayload, 'provider'>) => Promise<SocialLoginResponse>;
  clearAuthError: () => void;
}
