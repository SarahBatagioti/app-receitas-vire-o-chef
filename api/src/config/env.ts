import dotenv from 'dotenv';

dotenv.config();

const toNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  port: toNumber(process.env.PORT, 3000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  bcryptSaltRounds: toNumber(process.env.BCRYPT_SALT_ROUNDS, 10),
  database: {
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: toNumber(process.env.DATABASE_PORT, 3306),
    user: process.env.DATABASE_USER ?? 'root',
    password: process.env.DATABASE_PASSWORD ?? '',
    name: process.env.DATABASE_NAME ?? '',
  },
};

export const isProduction = env.nodeEnv === 'production';
