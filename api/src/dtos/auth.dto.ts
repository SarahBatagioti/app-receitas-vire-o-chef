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

export interface RegisteredUserDto {
  id: string;
  email: string;
  username: string;
  provider: 'local';
  isSocialAccount: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthenticatedUserDto {
  id: string;
  email: string;
  username: string;
}

export interface LoginResponseDto {
  token: string;
  user: AuthenticatedUserDto;
}
