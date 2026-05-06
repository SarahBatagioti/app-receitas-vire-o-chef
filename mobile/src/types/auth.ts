export type AuthSessionStatus =
  | 'checking'
  | 'authenticated'
  | 'unauthenticated';

export type SocialProvider = 'google';

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
  username?: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface SocialIdentity {
  provider: SocialProvider;
  firebaseToken: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

export interface SocialLoginPayload extends SocialIdentity {}

export interface PendingSocialAuth extends SocialIdentity {}

export interface CompleteSocialRegisterPayload extends SocialIdentity {
  password: string;
  username?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
  message?: string;
}

export interface SocialLoginResponse {
  requiresSocialCompletion: boolean;
  cancelled?: boolean;
  pendingSocialAuth?: PendingSocialAuth;
  token?: string;
  user?: AuthUser;
  message?: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface SocialAuthResult {
  cancelled: boolean;
  provider: SocialProvider;
  firebaseToken?: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
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
    payload: Pick<CompleteSocialRegisterPayload, 'name' | 'password'>,
  ) => Promise<void>;
  loginWithGoogle: () => Promise<SocialLoginResponse>;
  clearAuthError: () => void;
}
