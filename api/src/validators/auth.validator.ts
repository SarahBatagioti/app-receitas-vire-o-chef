import { NextFunction, Request, Response } from 'express';
import { RegisterUserDto } from '../dtos/auth.dto';
import { buildErrorResponse } from '../utils/api-response';

export function validateAuthBootstrapRequest(
  _request: Request,
  _response: Response,
  next: NextFunction,
) {
  next();
}

export function validateRegisterUserRequest(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const { email, password, username } = request.body as Partial<RegisterUserDto>;
  const errors: string[] = [];

  if (!email?.trim()) {
    errors.push('E-mail e obrigatorio.');
  } else if (!isValidEmail(email)) {
    errors.push('Informe um e-mail valido.');
  }

  if (!username?.trim()) {
    errors.push('Nome de usuario e obrigatorio.');
  } else if (!isValidUsername(username)) {
    errors.push(
      'Nome de usuario deve ter entre 3 e 30 caracteres e usar apenas letras, numeros, ponto ou underline.',
    );
  }

  if (!password) {
    errors.push('Senha e obrigatoria.');
  } else if (!isStrongPassword(password)) {
    errors.push(
      'Senha deve ter ao menos 8 caracteres, com letra maiuscula, letra minuscula e numero.',
    );
  }

  if (errors.length > 0) {
    return response
      .status(422)
      .json(buildErrorResponse('Dados de cadastro invalidos.', errors));
  }

  const sanitizedEmail = email!.trim();
  const sanitizedUsername = username!.trim();
  const sanitizedPassword = password!;

  request.body = {
    email: sanitizedEmail,
    password: sanitizedPassword,
    username: sanitizedUsername,
  } satisfies RegisterUserDto;

  return next();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongPassword(password: string): boolean {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
}

function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9._]{3,30}$/.test(username.trim());
}
