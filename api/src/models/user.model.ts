export interface UserModel {
  id: string;
  email: string;
  passwordHash: string;
  username: string;
  provider: 'local';
  isSocialAccount: boolean;
  createdAt: string;
  updatedAt: string;
}
