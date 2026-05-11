import { Platform } from 'react-native';
import { env } from '../utils/env';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

interface ApiRequestOptions<TBody> {
  method?: HttpMethod;
  body?: TBody;
  headers?: Record<string, string>;
  authenticated?: boolean;
}

let authToken: string | null = null;

function ensureApiBasePath(baseUrl: string): string {
  try {
    const url = new URL(baseUrl);
    const normalizedPath = url.pathname.replace(/\/+$/, '');
    const suffix = `${url.search}${url.hash}`;

    if (!normalizedPath) {
      return `${url.origin}/api${suffix}`;
    }

    if (normalizedPath === '/api' || normalizedPath.endsWith('/api')) {
      return `${url.origin}${normalizedPath}${suffix}`;
    }

    return url.toString();
  } catch {
    return baseUrl;
  }
}

function normalizeBaseUrl(baseUrl: string): string {
  const trimmedBaseUrl = baseUrl.trim();
  const normalizedBaseUrl =
    Platform.OS === 'android'
      ? trimmedBaseUrl.replace('://localhost', '://10.0.2.2').replace('://127.0.0.1', '://10.0.2.2')
      : trimmedBaseUrl;

  return ensureApiBasePath(normalizedBaseUrl);
}

function buildUrl(path: string): string {
  const baseUrl = normalizeBaseUrl(env.apiBaseUrl).replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
}

export function buildApiUrl(path: string): string {
  return buildUrl(path);
}

export function buildServerUrl(path: string): string {
  const normalizedBaseUrl = normalizeBaseUrl(env.apiBaseUrl);
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  try {
    const url = new URL(normalizedBaseUrl);
    return `${url.origin}${normalizedPath}`;
  } catch {
    return buildUrl(path);
  }
}

function extractErrorMessage(payload: unknown, fallbackMessage: string): string {
  if (!payload || typeof payload !== 'object') {
    return fallbackMessage;
  }

  const errorPayload = payload as Record<string, unknown>;

  if (typeof errorPayload.message === 'string' && errorPayload.message.trim()) {
    return errorPayload.message;
  }

  if (typeof errorPayload.error === 'string' && errorPayload.error.trim()) {
    return errorPayload.error;
  }

  if (Array.isArray(errorPayload.errors) && errorPayload.errors.length > 0) {
    const firstError = errorPayload.errors[0];

    if (typeof firstError === 'string') {
      return firstError;
    }
  }

  return fallbackMessage;
}

async function parseResponse(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type');

  if (contentType?.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  return text ? { message: text } : null;
}

async function request<TResponse, TBody = undefined>(
  path: string,
  options: ApiRequestOptions<TBody> = {},
): Promise<TResponse> {
  const { method = 'GET', body, headers, authenticated = false } = options;
  const isMultipartBody = typeof FormData !== 'undefined' && body instanceof FormData;
  const requestHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...headers,
  };

  if (body !== undefined && !isMultipartBody) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (authenticated && authToken) {
    requestHeaders.Authorization = `Bearer ${authToken}`;
  }

  let response: Response;

  try {
    response = await fetch(buildUrl(path), {
      method,
      headers: requestHeaders,
      body:
        body === undefined
          ? undefined
          : isMultipartBody
            ? body
            : JSON.stringify(body),
    });
  } catch {
    const attemptedUrl = buildUrl(path);
    const androidHint =
      Platform.OS === 'android'
        ? ' No emulador Android, use 10.0.2.2. Em dispositivo fisico, use o IP da maquina na rede local.'
        : '';

    throw new ApiError(
      `Nao foi possivel se conectar ao servidor em ${attemptedUrl}. Verifique se o backend esta rodando e se a API_BASE_URL esta correta.${androidHint}`,
      0,
    );
  }

  const payload = await parseResponse(response);

  if (!response.ok) {
    throw new ApiError(
      extractErrorMessage(payload, 'Nao foi possivel concluir a solicitacao no momento.'),
      response.status,
      payload,
    );
  }

  return payload as TResponse;
}

export function setApiAuthToken(token: string | null): void {
  authToken = token;
}

export function getErrorMessage(
  error: unknown,
  fallbackMessage = 'Ocorreu um erro inesperado.',
): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
}

export const api = {
  get: <TResponse>(path: string, authenticated = false) =>
    request<TResponse>(path, { method: 'GET', authenticated }),
  post: <TResponse, TBody>(path: string, body: TBody, authenticated = false) =>
    request<TResponse, TBody>(path, { method: 'POST', body, authenticated }),
  patch: <TResponse, TBody>(path: string, body: TBody, authenticated = false) =>
    request<TResponse, TBody>(path, { method: 'PATCH', body, authenticated }),
  delete: <TResponse>(path: string, authenticated = false) =>
    request<TResponse>(path, { method: 'DELETE', authenticated }),
};
