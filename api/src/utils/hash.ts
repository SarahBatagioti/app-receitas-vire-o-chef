import bcrypt from 'bcrypt';
import { env } from '../config/env';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, env.bcryptSaltRounds);
}
