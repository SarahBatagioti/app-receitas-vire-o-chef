import { createHash, randomBytes } from 'crypto';

export function generateSecureToken(size = 32): string {
  return randomBytes(size).toString('hex');
}

export function hashOpaqueToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function buildExpirationDate(minutesFromNow: number): string {
  const expirationDate = new Date();
  expirationDate.setMinutes(expirationDate.getMinutes() + minutesFromNow);
  return expirationDate.toISOString();
}

export function buildResetPasswordLink(baseUrl: string, token: string): string {
  if (!baseUrl) {
    throw new Error('FRONTEND_RESET_PASSWORD_URL ausente.');
  }

  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}token=${encodeURIComponent(token)}`;
}
