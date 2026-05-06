type RuntimeEnv = Record<string, string | undefined>;

type RequiredEnvKey =
  | 'API_BASE_URL'
  | 'FIREBASE_API_KEY'
  | 'FIREBASE_AUTH_DOMAIN'
  | 'FIREBASE_PROJECT_ID'
  | 'FIREBASE_STORAGE_BUCKET'
  | 'FIREBASE_MESSAGING_SENDER_ID'
  | 'FIREBASE_APP_ID'
  | 'GOOGLE_WEB_CLIENT_ID';

type OptionalEnvKey =
  | 'GOOGLE_ANDROID_CLIENT_ID'
  | 'GOOGLE_IOS_CLIENT_ID';

function readRuntimeEnv(): RuntimeEnv {
  try {
    const configModule = require('react-native-config');
    const config = configModule?.default ?? configModule;

    if (config && typeof config === 'object') {
      return config as RuntimeEnv;
    }
  } catch {}

  const runtimeProcess = globalThis as { process?: { env?: RuntimeEnv } };

  return runtimeProcess.process?.env ?? {};
}

function getRequiredEnv(key: RequiredEnvKey): string {
  const value = readRuntimeEnv()[key]?.trim();

  if (!value) {
    throw new Error(`A variavel ${key} nao foi configurada no ambiente do aplicativo.`);
  }

  return value;
}

function getOptionalEnv(key: OptionalEnvKey): string | undefined {
  const value = readRuntimeEnv()[key]?.trim();
  return value ? value : undefined;
}

export const env = {
  get apiBaseUrl() {
    return getRequiredEnv('API_BASE_URL');
  },
  get firebaseApiKey() {
    return getRequiredEnv('FIREBASE_API_KEY');
  },
  get firebaseAuthDomain() {
    return getRequiredEnv('FIREBASE_AUTH_DOMAIN');
  },
  get firebaseProjectId() {
    return getRequiredEnv('FIREBASE_PROJECT_ID');
  },
  get firebaseStorageBucket() {
    return getRequiredEnv('FIREBASE_STORAGE_BUCKET');
  },
  get firebaseMessagingSenderId() {
    return getRequiredEnv('FIREBASE_MESSAGING_SENDER_ID');
  },
  get firebaseAppId() {
    return getRequiredEnv('FIREBASE_APP_ID');
  },
  get googleWebClientId() {
    return getRequiredEnv('GOOGLE_WEB_CLIENT_ID');
  },
  get googleAndroidClientId() {
    return getOptionalEnv('GOOGLE_ANDROID_CLIENT_ID');
  },
  get googleIosClientId() {
    return getOptionalEnv('GOOGLE_IOS_CLIENT_ID');
  },
};
