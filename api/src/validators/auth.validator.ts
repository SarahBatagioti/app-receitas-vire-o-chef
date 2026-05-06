import { NextFunction, Request, Response } from 'express';
import {
  CompleteSocialRegisterDto,
  ForgotPasswordDto,
  LoginUserDto,
  RegisterUserDto,
  ResetPasswordDto,
  SocialLoginDto,
} from '../dtos/auth.dto';
import { VerifyFirebaseTokenDto } from '../types/firebase';
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

  validateEmail(email, errors);
  validateUsername(username, errors);
  validatePassword(password, errors);

  if (errors.length > 0) {
    return response
      .status(422)
      .json(buildErrorResponse('Dados de cadastro invalidos.', errors));
  }

  request.body = {
    email: email!.trim(),
    password: password!,
    username: username!.trim(),
  } satisfies RegisterUserDto;

  return next();
}

export function validateLoginUserRequest(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const { email, password } = request.body as Partial<LoginUserDto>;
  const errors: string[] = [];

  validateEmail(email, errors);

  if (!password) {
    errors.push('Senha e obrigatoria.');
  }

  if (errors.length > 0) {
    return response
      .status(422)
      .json(buildErrorResponse('Dados de login invalidos.', errors));
  }

  request.body = {
    email: email!.trim(),
    password: password!,
  } satisfies LoginUserDto;

  return next();
}

export function validateForgotPasswordRequest(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const { email } = request.body as Partial<ForgotPasswordDto>;
  const errors: string[] = [];

  validateEmail(email, errors);

  if (errors.length > 0) {
    return response
      .status(422)
      .json(buildErrorResponse('Dados de recuperacao invalidos.', errors));
  }

  request.body = {
    email: email!.trim(),
  } satisfies ForgotPasswordDto;

  return next();
}

export function validateResetPasswordRequest(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const { token, newPassword } = request.body as Partial<ResetPasswordDto>;
  const errors: string[] = [];

  if (!token?.trim()) {
    errors.push('Token de redefinicao e obrigatorio.');
  }

  if (!newPassword) {
    errors.push('Nova senha e obrigatoria.');
  } else if (!isStrongPassword(newPassword)) {
    errors.push(
      'Nova senha deve ter ao menos 8 caracteres, com letra maiuscula, letra minuscula e numero.',
    );
  }

  if (errors.length > 0) {
    return response
      .status(422)
      .json(buildErrorResponse('Dados de redefinicao invalidos.', errors));
  }

  request.body = {
    token: token!.trim(),
    newPassword: newPassword!,
  } satisfies ResetPasswordDto;

  return next();
}

export function validateSocialLoginRequest(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const { firebaseToken, provider } = request.body as Partial<SocialLoginDto>;
  const errors: string[] = [];

  if (!firebaseToken?.trim()) {
    errors.push('Firebase token e obrigatorio.');
  }

  if (!isAllowedSocialProvider(provider)) {
    errors.push('Provider deve ser google.');
  }

  if (errors.length > 0) {
    return response
      .status(422)
      .json(buildErrorResponse('Dados de login social invalidos.', errors));
  }

  request.body = {
    firebaseToken: firebaseToken!.trim(),
    provider: provider!,
  } satisfies SocialLoginDto;

  return next();
}

export function validateCompleteSocialRegisterRequest(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const {
    firebaseToken,
    provider,
    password,
    username,
  } = request.body as Partial<CompleteSocialRegisterDto>;
  const errors: string[] = [];

  if (!firebaseToken?.trim()) {
    errors.push('Firebase token e obrigatorio.');
  }

  if (!isAllowedSocialProvider(provider)) {
    errors.push('Provider deve ser google.');
  }

  validatePassword(password, errors);
  validateUsername(username, errors);

  if (errors.length > 0) {
    return response
      .status(422)
      .json(buildErrorResponse('Dados de complemento de cadastro invalidos.', errors));
  }

  request.body = {
    firebaseToken: firebaseToken!.trim(),
    provider: provider!,
    password: password!,
    username: username!.trim(),
  } satisfies CompleteSocialRegisterDto;

  return next();
}

export function validateFirebaseVerifyTokenRequest(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const { token } = request.body as Partial<VerifyFirebaseTokenDto>;

  if (!token?.trim()) {
    return response
      .status(422)
      .json(buildErrorResponse('Token Firebase obrigatorio.', [
        'Informe um token Firebase valido.',
      ]));
  }

  request.body = {
    token: token.trim(),
  } satisfies VerifyFirebaseTokenDto;

  return next();
}

function validateEmail(email: string | undefined, errors: string[]) {
  if (!email?.trim()) {
    errors.push('E-mail e obrigatorio.');
  } else if (!isValidEmail(email)) {
    errors.push('Informe um e-mail valido.');
  }
}

function validatePassword(password: string | undefined, errors: string[]) {
  if (!password) {
    errors.push('Senha e obrigatoria.');
  } else if (!isStrongPassword(password)) {
    errors.push(
      'Senha deve ter ao menos 8 caracteres, com letra maiuscula, letra minuscula e numero.',
    );
  }
}

function validateUsername(username: string | undefined, errors: string[]) {
  if (!username?.trim()) {
    errors.push('Nome de usuario e obrigatorio.');
  } else if (!isValidUsername(username)) {
    errors.push(
      'Nome de usuario deve ter entre 3 e 30 caracteres e usar apenas letras, numeros, ponto ou underline.',
    );
  }
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

function isAllowedSocialProvider(provider: string | undefined): provider is 'google' {
  return provider === 'google';
}
