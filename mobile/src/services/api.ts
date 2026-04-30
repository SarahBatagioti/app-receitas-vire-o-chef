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

function buildUrl(path: string): string {
  const baseUrl = env.apiBaseUrl.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
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
  const requestHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...headers,
  };

  if (body !== undefined) {
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
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      'Não foi possível se conectar ao servidor. Verifique se o backend está rodando e se a API_BASE_URL está correta.',
      0,
    );
  }

  const payload = await parseResponse(response);

  if (!response.ok) {
    throw new ApiError(
      extractErrorMessage(payload, 'Não foi possível concluir a solicitação no momento.'),
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
};
