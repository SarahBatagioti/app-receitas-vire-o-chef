export interface FirebaseTokenPayload {
  uid: string;
  email: string | null;
  name: string | null;
  picture: string | null;
  provider: string | null;
}

export interface VerifyFirebaseTokenDto {
  token: string;
}
