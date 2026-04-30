import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { authService } from '../services/authService';
import { ApiError, getErrorMessage, setApiAuthToken } from '../services/api';
import {
  AuthContextValue,
  AuthResponse,
  AuthSessionStatus,
  CompleteSocialRegisterPayload,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  LoginPayload,
  PendingSocialAuth,
  RegisterPayload,
  SocialLoginPayload,
  SocialLoginResponse,
  SocialProvider,
  AuthUser,
} from '../types/auth';
import { clearAuthToken, getAuthToken, saveAuthToken } from '../utils/storage';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [status, setStatus] = useState<AuthSessionStatus>('checking');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [pendingSocialAuth, setPendingSocialAuth] = useState<PendingSocialAuth | null>(null);

  const clearSessionState = React.useCallback(() => {
    setApiAuthToken(null);
    setPendingSocialAuth(null);
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const persistAuthenticatedSession = React.useCallback(async (session: AuthResponse) => {
    await saveAuthToken(session.token);
    setApiAuthToken(session.token);
    setPendingSocialAuth(null);
    setUser(session.user);
    setStatus('authenticated');
  }, []);

  const restoreSession = React.useCallback(async () => {
    setIsInitializing(true);
    setStatus('checking');
    setAuthError(null);

    try {
      const token = await getAuthToken();

      if (!token) {
        clearSessionState();
        return;
      }

      setApiAuthToken(token);
      const currentUser = await authService.getMe();
      setUser(currentUser);
      setStatus('authenticated');
    } catch (error) {
      await clearAuthToken().catch(() => undefined);
      clearSessionState();

      if (!(error instanceof ApiError && error.status === 401)) {
        setAuthError(getErrorMessage(error));
      }
    } finally {
      setIsInitializing(false);
    }
  }, [clearSessionState]);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  const logout = React.useCallback(async () => {
    setAuthError(null);
    await clearAuthToken().catch(() => undefined);
    clearSessionState();
  }, [clearSessionState]);

  const login = React.useCallback(
    async (payload: LoginPayload) => {
      setAuthError(null);

      try {
        const session = await authService.login(payload);
        await persistAuthenticatedSession(session);
      } catch (error) {
        const message = getErrorMessage(error, 'Não foi possível entrar com este e-mail.');
        setAuthError(message);
        throw new Error(message);
      }
    },
    [persistAuthenticatedSession],
  );

  const register = React.useCallback(
    async (payload: RegisterPayload) => {
      setAuthError(null);

      try {
        const session = await authService.register(payload);
        await persistAuthenticatedSession(session);
      } catch (error) {
        const message = getErrorMessage(error, 'Não foi possível concluir o cadastro.');
        setAuthError(message);
        throw new Error(message);
      }
    },
    [persistAuthenticatedSession],
  );

  const forgotPassword = React.useCallback(
    async (payload: ForgotPasswordPayload): Promise<ForgotPasswordResponse> => {
      setAuthError(null);

      try {
        return await authService.forgotPassword(payload);
      } catch (error) {
        const message = getErrorMessage(error, 'Não foi possível enviar o e-mail de redefinição.');
        setAuthError(message);
        throw new Error(message);
      }
    },
    [],
  );

  const authenticateWithSocialProvider = React.useCallback(
    async (
      provider: SocialProvider,
      payload?: Omit<SocialLoginPayload, 'provider'>,
    ): Promise<SocialLoginResponse> => {
      setAuthError(null);

      if (!payload?.accessToken) {
        const message = `Integração com ${provider === 'google' ? 'Google' : 'Facebook'} ainda não configurada no app. Conecte o SDK social para obter o token do provedor antes de chamar o backend.`;
        setAuthError(message);
        throw new Error(message);
      }

      try {
        const response = await authService.socialLogin({
          provider,
          accessToken: payload.accessToken,
          idToken: payload.idToken,
        });

        if (response.requiresSocialCompletion && response.pendingSocialAuth) {
          setPendingSocialAuth(response.pendingSocialAuth);
          setStatus('unauthenticated');
          return response;
        }

        if (!response.token || !response.user) {
          throw new Error('Não foi possível finalizar o login social.');
        }

        await persistAuthenticatedSession({
          token: response.token,
          user: response.user,
          message: response.message,
        });

        return response;
      } catch (error) {
        const message = getErrorMessage(error, 'Não foi possível autenticar com a conta social.');
        setAuthError(message);
        throw new Error(message);
      }
    },
    [persistAuthenticatedSession],
  );

  const completeSocialRegister = React.useCallback(
    async (
      payload: Omit<CompleteSocialRegisterPayload, 'provider' | 'accessToken' | 'email'>,
    ) => {
      setAuthError(null);

      if (!pendingSocialAuth) {
        const message =
          'Não encontramos um cadastro social pendente. Inicie novamente o login com Google ou Facebook.';
        setAuthError(message);
        throw new Error(message);
      }

      try {
        const session = await authService.completeSocialRegister({
          provider: pendingSocialAuth.provider,
          accessToken: pendingSocialAuth.accessToken,
          email: pendingSocialAuth.email,
          ...payload,
        });

        await persistAuthenticatedSession(session);
      } catch (error) {
        const message = getErrorMessage(error, 'Não foi possível concluir o cadastro social.');
        setAuthError(message);
        throw new Error(message);
      }
    },
    [pendingSocialAuth, persistAuthenticatedSession],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      isAuthenticated: status === 'authenticated',
      isInitializing,
      authError,
      pendingSocialAuth,
      login,
      register,
      logout,
      clearSession: logout,
      forgotPassword,
      completeSocialRegister,
      loginWithGoogle: (payload) => authenticateWithSocialProvider('google', payload),
      loginWithFacebook: (payload) => authenticateWithSocialProvider('facebook', payload),
      clearAuthError: () => setAuthError(null),
    }),
    [
      authError,
      authenticateWithSocialProvider,
      completeSocialRegister,
      forgotPassword,
      isInitializing,
      login,
      logout,
      pendingSocialAuth,
      register,
      status,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }

  return context;
}
