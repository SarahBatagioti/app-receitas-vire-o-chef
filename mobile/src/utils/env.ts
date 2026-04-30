type RuntimeEnv = {
  API_BASE_URL?: string;
};

function readRuntimeEnv(): RuntimeEnv {
  try {
    const configModule = require('react-native-config');
    const config = configModule?.default ?? configModule;

    if (config?.API_BASE_URL) {
      return {
        API_BASE_URL: String(config.API_BASE_URL),
      };
    }
  } catch {}

  const runtimeProcess = globalThis as { process?: { env?: Record<string, string | undefined> } };

  if (runtimeProcess.process?.env) {
    return {
      API_BASE_URL: runtimeProcess.process.env.API_BASE_URL,
    };
  }

  return {};
}

function getRequiredEnv(key: keyof RuntimeEnv): string {
  const value = readRuntimeEnv()[key]?.trim();

  if (!value) {
    throw new Error(
      'A variável API_BASE_URL não foi configurada. Defina o valor no .env e instale a integração de variáveis de ambiente do app.',
    );
  }

  return value;
}

export const env = {
  get apiBaseUrl() {
    return getRequiredEnv('API_BASE_URL');
  },
};
