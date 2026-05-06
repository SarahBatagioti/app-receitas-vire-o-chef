import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { authService } from '../services/authService';
import { ApiError, getErrorMessage, setApiAuthToken } from '../services/api';
import { socialAuthService } from '../services/socialAuthService';
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
  SocialLoginResponse,
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
    restoreSession().catch(() => undefined);
  }, [restoreSession]);

  const logout = React.useCallback(async () => {
    setAuthError(null);
    await Promise.allSettled([clearAuthToken(), socialAuthService.clearProviderSessions()]);
    clearSessionState();
  }, [clearSessionState]);

  const login = React.useCallback(
    async (payload: LoginPayload) => {
      setAuthError(null);

      try {
        const session = await authService.login(payload);
        await persistAuthenticatedSession(session);
      } catch (error) {
        const message = getErrorMessage(error, 'Nao foi possivel entrar com este e-mail.');
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
        const message = getErrorMessage(error, 'Nao foi possivel concluir o cadastro.');
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
        const message = getErrorMessage(error, 'Nao foi possivel enviar o e-mail de redefinicao.');
        setAuthError(message);
        throw new Error(message);
      }
    },
    [],
  );

  const handleSocialResponse = React.useCallback(
    async (response: SocialLoginResponse): Promise<SocialLoginResponse> => {
      if (response.cancelled) {
        return response;
      }

      if (response.requiresSocialCompletion && response.pendingSocialAuth) {
        setPendingSocialAuth(response.pendingSocialAuth);
        setStatus('unauthenticated');
        return response;
      }

      if (!response.token || !response.user) {
        throw new Error('Nao foi possivel finalizar o login social.');
      }

      await persistAuthenticatedSession({
        token: response.token,
        user: response.user,
        message: response.message,
      });

      return response;
    },
    [persistAuthenticatedSession],
  );

  const loginWithGoogle = React.useCallback(async (): Promise<SocialLoginResponse> => {
    setAuthError(null);

    try {
      const socialResult = await socialAuthService.signInWithGoogle();

      if (socialResult.cancelled) {
        throw new Error(
          'O login com Google foi interrompido antes de concluir. Se voce nao fechou a conta manualmente, revise a configuracao Android/Firebase do Google Sign-In.',
        );
      }

      const response = await authService.socialLogin({
        provider: 'google',
        firebaseToken: socialResult.firebaseToken ?? '',
        email: socialResult.email ?? '',
        name: socialResult.name,
        avatarUrl: socialResult.avatarUrl,
      });

      return await handleSocialResponse(response);
    } catch (error) {
      const message = getErrorMessage(error, 'Nao foi possivel autenticar com a conta Google.');
      setAuthError(message);
      throw new Error(message);
    }
  }, [handleSocialResponse]);

  const completeSocialRegister = React.useCallback(
    async (payload: Pick<CompleteSocialRegisterPayload, 'name' | 'password'>) => {
      setAuthError(null);

      if (!pendingSocialAuth) {
        const message = 'Nao encontramos um cadastro social pendente. Inicie novamente o login com Google.';
        setAuthError(message);
        throw new Error(message);
      }

      try {
        const session = await authService.completeSocialRegister({
          provider: pendingSocialAuth.provider,
          firebaseToken: pendingSocialAuth.firebaseToken,
          email: pendingSocialAuth.email,
          name: payload.name,
          username: payload.name,
          password: payload.password,
          avatarUrl: pendingSocialAuth.avatarUrl,
        });

        await persistAuthenticatedSession(session);
      } catch (error) {
        const message = getErrorMessage(error, 'Nao foi possivel concluir o cadastro social.');
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
      loginWithGoogle,
      clearAuthError: () => setAuthError(null),
    }),
    [
      authError,
      completeSocialRegister,
      forgotPassword,
      isInitializing,
      login,
      loginWithGoogle,
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
