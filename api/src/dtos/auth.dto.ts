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
