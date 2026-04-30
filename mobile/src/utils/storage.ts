const AUTH_TOKEN_SERVICE = 'vire-o-chef.auth.token';
const AUTH_TOKEN_USERNAME = 'auth-token';

type KeychainCredentials = {
  password: string;
};

type KeychainModule = {
  setGenericPassword: (
    username: string,
    password: string,
    options?: Record<string, unknown>,
  ) => Promise<unknown>;
  getGenericPassword: (options?: Record<string, unknown>) => Promise<false | KeychainCredentials>;
  resetGenericPassword: (options?: Record<string, unknown>) => Promise<boolean>;
};

function getKeychainModule(): KeychainModule {
  try {
    const keychainModule = require('react-native-keychain');
    return keychainModule?.default ?? keychainModule;
  } catch {
    throw new Error(
      'Armazenamento seguro indisponível. Instale e configure a biblioteca react-native-keychain para persistir o token JWT com segurança.',
    );
  }
}

export async function saveAuthToken(token: string): Promise<void> {
  const keychain = getKeychainModule();

  await keychain.setGenericPassword(AUTH_TOKEN_USERNAME, token, {
    service: AUTH_TOKEN_SERVICE,
  });
}

export async function getAuthToken(): Promise<string | null> {
  const keychain = getKeychainModule();
  const credentials = await keychain.getGenericPassword({
    service: AUTH_TOKEN_SERVICE,
  });

  if (!credentials) {
    return null;
  }

  return credentials.password;
}

export async function clearAuthToken(): Promise<void> {
  const keychain = getKeychainModule();

  await keychain.resetGenericPassword({
    service: AUTH_TOKEN_SERVICE,
  });
}
