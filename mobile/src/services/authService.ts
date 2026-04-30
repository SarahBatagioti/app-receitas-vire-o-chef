import { api } from './api';
import {
  AuthResponse,
  AuthUser,
  CompleteSocialRegisterPayload,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  LoginPayload,
  PendingSocialAuth,
  RegisterPayload,
  SocialLoginPayload,
  SocialLoginResponse,
} from '../types/auth';

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function extractNestedRecord(payload: Record<string, unknown>, key: string): Record<string, unknown> | null {
  const value = payload[key];
  return isRecord(value) ? value : null;
}

function normalizeUser(payload: unknown): AuthUser {
  const userPayload = isRecord(payload) ? payload : {};
  const id = readString(userPayload.id) ?? readString(userPayload._id) ?? '';
  const email = readString(userPayload.email) ?? '';
  const name =
    readString(userPayload.name) ??
    readString(userPayload.username) ??
    readString(userPayload.fullName) ??
    '';

  return {
    id,
    email,
    name,
    avatarUrl: readString(userPayload.avatarUrl) ?? readString(userPayload.avatar),
  };
}

function extractToken(payload: Record<string, unknown>): string | null {
  return (
    readString(payload.token) ??
    readString(payload.accessToken) ??
    readString(extractNestedRecord(payload, 'data')?.token) ??
    readString(extractNestedRecord(payload, 'data')?.accessToken) ??
    null
  );
}

function extractUser(payload: Record<string, unknown>): AuthUser | null {
  const directUser = extractNestedRecord(payload, 'user');

  if (directUser) {
    return normalizeUser(directUser);
  }

  const dataPayload = extractNestedRecord(payload, 'data');
  const dataUser = dataPayload ? extractNestedRecord(dataPayload, 'user') : null;

  if (dataUser) {
    return normalizeUser(dataUser);
  }

  if (readString(payload.email) || readString(payload.name) || readString(payload.username)) {
    return normalizeUser(payload);
  }

  return null;
}

function normalizeAuthResponse(payload: unknown): AuthResponse {
  const responsePayload = isRecord(payload) ? payload : {};
  const token = extractToken(responsePayload);
  const user = extractUser(responsePayload);

  if (!token || !user) {
    throw new Error('Resposta de autenticação inválida recebida do backend.');
  }

  return {
    token,
    user,
    message:
      readString(responsePayload.message) ??
      readString(extractNestedRecord(responsePayload, 'data')?.message),
  };
}

function normalizePendingSocialAuth(
  payload: Record<string, unknown>,
  request: SocialLoginPayload,
): PendingSocialAuth {
  const dataPayload = extractNestedRecord(payload, 'data') ?? {};

  return {
    provider: request.provider,
    accessToken: request.accessToken,
    email: readString(payload.email) ?? readString(dataPayload.email) ?? '',
  };
}

class AuthService {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await api.post<unknown, RegisterPayload>('/auth/register', payload);
    return normalizeAuthResponse(response);
  }

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await api.post<unknown, LoginPayload>('/auth/login', payload);
    return normalizeAuthResponse(response);
  }

  async socialLogin(payload: SocialLoginPayload): Promise<SocialLoginResponse> {
    const response = await api.post<unknown, SocialLoginPayload>('/auth/social-login', payload);
    const responsePayload = isRecord(response) ? response : {};
    const token = extractToken(responsePayload);
    const user = extractUser(responsePayload);
    const requiresSocialCompletion = Boolean(
      responsePayload.requiresSocialCompletion ??
        responsePayload.socialRegistrationPending ??
        (!token && !user),
    );

    if (requiresSocialCompletion) {
      return {
        requiresSocialCompletion: true,
        pendingSocialAuth: normalizePendingSocialAuth(responsePayload, payload),
        message:
          readString(responsePayload.message) ??
          'Complete o cadastro para finalizar o acesso com a conta social.',
      };
    }

    if (!token || !user) {
      throw new Error('Resposta de login social inválida recebida do backend.');
    }

    return {
      requiresSocialCompletion: false,
      token,
      user,
      message: readString(responsePayload.message),
    };
  }

  async completeSocialRegister(payload: CompleteSocialRegisterPayload): Promise<AuthResponse> {
    const response = await api.post<unknown, CompleteSocialRegisterPayload>(
      '/auth/social-complete-register',
      payload,
    );

    return normalizeAuthResponse(response);
  }

  async forgotPassword(payload: ForgotPasswordPayload): Promise<ForgotPasswordResponse> {
    const response = await api.post<unknown, ForgotPasswordPayload>('/auth/forgot-password', payload);
    const responsePayload = isRecord(response) ? response : {};

    return {
      message:
        readString(responsePayload.message) ??
        'Se o e-mail estiver cadastrado, você receberá as instruções de redefinição.',
    };
  }

  async getMe(): Promise<AuthUser> {
    const response = await api.get<unknown>('/auth/me', true);
    const responsePayload = isRecord(response) ? response : {};
    const user = extractUser(responsePayload);

    if (!user) {
      throw new Error('Não foi possível carregar os dados do usuário autenticado.');
    }

    return user;
  }
}

export const authService = new AuthService();
