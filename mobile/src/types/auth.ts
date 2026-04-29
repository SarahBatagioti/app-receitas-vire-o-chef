export type AuthSessionStatus =
  | 'checking'
  | 'authenticated'
  | 'unauthenticated';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthBootstrapStatus {
  feature: 'auth';
  ready: boolean;
  message: string;
}

export interface AuthContextValue {
  status: AuthSessionStatus;
  user: AuthUser | null;
  isAuthenticated: boolean;
  setSession: (status: AuthSessionStatus, user?: AuthUser | null) => void;
  clearSession: () => void;
}
