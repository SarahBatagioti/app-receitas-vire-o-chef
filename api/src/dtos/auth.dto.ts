import { AuthProvider } from '../models/user.model';

export interface AuthStatusResponseDto {
  feature: 'auth';
  ready: boolean;
  message: string;
  providers: {
    emailPassword: boolean;
    firebase: boolean;
    socialLogin: boolean;
  };
}

export interface RegisterUserDto {
  email: string;
  password: string;
  username: string;
}

export interface LoginUserDto {
  email: string;
  password: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}

export interface SocialLoginDto {
  firebaseToken: string;
  provider: 'google';
}

export interface CompleteSocialRegisterDto {
  firebaseToken: string;
  provider: 'google';
  password: string;
  username: string;
}

export interface RegisteredUserDto {
  id: string;
  email: string;
  username: string;
  provider: AuthProvider;
  isSocialAccount: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthenticatedUserDto {
  id: string;
  email: string;
  username: string;
  provider: AuthProvider;
}

export interface LoginResponseDto {
  token: string;
  user: AuthenticatedUserDto;
}

export interface GenericMessageResponseDto {
  success: true;
  message: string;
}

export interface SocialLoginPendingResponseDto {
  requiresCompletion: true;
  email: string;
  provider: 'google';
}

export interface SocialLoginSuccessResponseDto {
  requiresCompletion: false;
  token: string;
  user: AuthenticatedUserDto;
}

export type SocialLoginResponseDto =
  | SocialLoginPendingResponseDto
  | SocialLoginSuccessResponseDto;
