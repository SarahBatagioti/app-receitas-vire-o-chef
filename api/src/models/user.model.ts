export type AuthProvider = 'local' | 'google' | 'facebook';

export interface UserModel {
  id: string;
  email: string;
  passwordHash: string | null;
  username: string | null;
  provider: AuthProvider;
  firebaseUid: string | null;
  isSocialAccount: boolean;
  isRegistrationCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}
