import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from './app-error';

export interface JwtPayload {
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

export function verifyAccessToken(token: string): JwtPayload {
  if (!env.jwt.secret) {
    throw new AppError('Configuracao de autenticacao incompleta.', 500);
  }

  try {
    const decoded = jwt.verify(token, env.jwt.secret) as jwt.JwtPayload;

    if (
      typeof decoded.sub !== 'string' ||
      typeof decoded.email !== 'string' ||
      typeof decoded.username !== 'string'
    ) {
      throw new AppError('Token invalido.', 401);
    }

    return {
      sub: decoded.sub,
      email: decoded.email,
      username: decoded.username,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError('Token invalido ou expirado.', 401);
  }
}
