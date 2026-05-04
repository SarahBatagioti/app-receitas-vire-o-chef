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
  jwt: {
    secret: process.env.JWT_SECRET ?? '',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID ?? '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? '',
    privateKey: process.env.FIREBASE_PRIVATE_KEY ?? '',
  },
  email: {
    host: process.env.EMAIL_HOST ?? '',
    port: toNumber(process.env.EMAIL_PORT, 587),
    user: process.env.EMAIL_USER ?? '',
    password: process.env.EMAIL_PASSWORD ?? '',
    from: process.env.EMAIL_FROM ?? '',
  },
  frontendResetPasswordUrl: process.env.FRONTEND_RESET_PASSWORD_URL ?? '',
  database: {
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: toNumber(process.env.DATABASE_PORT, 3306),
    user: process.env.DATABASE_USER ?? 'root',
    password: process.env.DATABASE_PASSWORD ?? '',
    name: process.env.DATABASE_NAME ?? '',
  },
  upload: {
    maxFileSizeBytes: toNumber(process.env.UPLOAD_MAX_FILE_SIZE_BYTES, 25 * 1024 * 1024),
    maxFiles: toNumber(process.env.UPLOAD_MAX_FILES, 10),
  },
};

export const isProduction = env.nodeEnv === 'production';
