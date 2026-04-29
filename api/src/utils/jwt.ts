import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from './app-error';

interface JwtPayload {
  sub: string;
  email: string;
  username: string;
}

export function generateAccessToken(payload: JwtPayload): string {
  if (!env.jwt.secret) {
    throw new AppError('Configuracao de autenticacao incompleta.', 500);
  }

  const secret: Secret = env.jwt.secret;
  const options: SignOptions = {
    expiresIn: env.jwt.expiresIn as SignOptions['expiresIn'],
  };

  return jwt.sign(payload, secret, options);
}
