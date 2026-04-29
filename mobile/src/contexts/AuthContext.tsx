import React, { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { AuthContextValue, AuthSessionStatus, AuthUser } from '../types/auth';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [status, setStatus] = useState<AuthSessionStatus>('unauthenticated');
  const [user, setUser] = useState<AuthUser | null>(null);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      isAuthenticated: status === 'authenticated',
      setSession: (nextStatus, nextUser = null) => {
        setStatus(nextStatus);
        setUser(nextUser);
      },
      clearSession: () => {
        setStatus('unauthenticated');
        setUser(null);
      },
    }),
    [status, user],
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
