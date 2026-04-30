import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthProvider, ThemeProvider, useAppTheme } from './src/contexts';
import { AppContainer } from './src/components/ui';
import BottomNav from './src/components/BottomNav';
import { useAuth } from './src/hooks/useAuth';
import {
  AccessScreen,
  CompleteSocialRegisterScreen,
  ForgotPasswordScreen,
  InicioScreen,
  LoginScreen,
  PerfilScreen,
  ProdutosScreen,
  ReceitasScreen,
  RefeicoesScreen,
  RegisterScreen,
} from './src/screens';
import { AuthUser } from './src/types/auth';
import { AppScreenKey, ScreenKey } from './src/types/navigation';

const SCREENS: Record<ScreenKey, React.ComponentType> = {
  inicio: InicioScreen,
  produtos: ProdutosScreen,
  receitas: ReceitasScreen,
  refeicoes: RefeicoesScreen,
  perfil: PerfilScreen,
};

const STATIC_AUTH_USERS = {
  login: {
    id: 'auth-login',
    email: 'usuario@exemplo.com',
    name: 'chef.demo',
  },
  social: {
    id: 'auth-social',
    email: 'usuario.social@exemplo.com',
    name: 'chef.social',
  },
  register: {
    id: 'auth-register',
    email: 'novo.usuario@exemplo.com',
    name: 'chef.novo',
  },
} satisfies Record<string, AuthUser>;

function AppContent() {
  const [activeScreen, setActiveScreen] = React.useState<AppScreenKey>('access');
  const { theme, themeMode } = useAppTheme();
  const { isAuthenticated, setSession } = useAuth();
  const isMainScreen = activeScreen in SCREENS;
  const ActiveScreen = isMainScreen ? SCREENS[activeScreen as ScreenKey] : null;

  const openApp = React.useCallback((user: AuthUser) => {
    setSession('authenticated', user);
    setActiveScreen('inicio');
  }, [setSession]);

  const goBackToAccess = React.useCallback(() => {
    setActiveScreen('access');
  }, []);

  React.useEffect(() => {
    if (!isAuthenticated && isMainScreen) {
      setActiveScreen('access');
    }
  }, [activeScreen, isAuthenticated, isMainScreen]);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
      }}
      edges={['top']}
    >
      <StatusBar
        barStyle={themeMode === 'light' ? 'dark-content' : 'light-content'}
        backgroundColor={theme.colors.background}
      />

      <AppContainer flex direction="column" justify="flex-start" backgroundColor="background">
        {activeScreen === 'access' ? (
          <AccessScreen
            onEmailPress={() => setActiveScreen('login')}
            onGooglePress={() => setActiveScreen('complete-social-register')}
            onRegisterPress={() => setActiveScreen('register')}
          />
        ) : null}

        {activeScreen === 'login' ? (
          <LoginScreen
            onBack={goBackToAccess}
            onForgotPassword={() => setActiveScreen('forgot-password')}
            onLogin={() => openApp(STATIC_AUTH_USERS.login)}
            onRegister={() => setActiveScreen('register')}
            onGoogleAuth={() => setActiveScreen('complete-social-register')}
            onFacebookAuth={() => openApp(STATIC_AUTH_USERS.social)}
          />
        ) : null}

        {activeScreen === 'register' ? (
          <RegisterScreen
            onBack={goBackToAccess}
            onLogin={() => setActiveScreen('login')}
            onRegister={() => openApp(STATIC_AUTH_USERS.register)}
            onGoogleAuth={() => setActiveScreen('complete-social-register')}
            onFacebookAuth={() => openApp(STATIC_AUTH_USERS.social)}
          />
        ) : null}

        {activeScreen === 'forgot-password' ? (
          <ForgotPasswordScreen
            onBack={() => setActiveScreen('login')}
            onSent={() => setActiveScreen('login')}
          />
        ) : null}

        {activeScreen === 'complete-social-register' ? (
          <CompleteSocialRegisterScreen
            email={STATIC_AUTH_USERS.social.email}
            onBack={goBackToAccess}
            onComplete={() => openApp(STATIC_AUTH_USERS.social)}
          />
        ) : null}

        {ActiveScreen ? (
          <AppContainer flex padding="lg" backgroundColor="background">
            <ActiveScreen />
          </AppContainer>
        ) : null}
      </AppContainer>

      {isMainScreen ? (
        <BottomNav
          activeScreen={activeScreen as ScreenKey}
          onChangeScreen={setActiveScreen as (screen: ScreenKey) => void}
        />
      ) : null}
    </SafeAreaView>
  );
}

function App() {
  return (
    <ThemeProvider initialTheme="light">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
