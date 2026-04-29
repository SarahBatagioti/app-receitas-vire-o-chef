import { NextFunction, Request, Response } from 'express';
import { UserRepository } from '../repositories/user.repository';
import { AppError } from '../utils/app-error';
import { verifyAccessToken } from '../utils/jwt';

const userRepository = new UserRepository();

export async function authenticateJwt(
  request: Request,
  _response: Response,
  next: NextFunction,
) {
  const authorizationHeader = request.headers.authorization;

  if (!authorizationHeader) {
    return next(new AppError('Token de autenticacao ausente.', 401));
  }

  const [scheme, token] = authorizationHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new AppError('Token de autenticacao invalido.', 401));
  }

  const payload = verifyAccessToken(token);
  const user = await userRepository.findById(payload.sub);

  if (!user) {
    return next(new AppError('Usuario autenticado nao encontrado.', 404));
  }

  request.authUser = {
    id: user.id,
    email: user.email,
    username: user.username,
    provider: user.provider,
  };

  return next();
}
