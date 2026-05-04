import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BottomNav from './src/components/BottomNav';
import { AppContainer, AppHeader, AppText } from './src/components/ui';
import { AuthProvider, ThemeProvider, useAppTheme } from './src/contexts';
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
import { AppScreenKey, ScreenKey } from './src/types/navigation';

const SCREENS: Record<ScreenKey, React.ComponentType> = {
  inicio: InicioScreen,
  produtos: ProdutosScreen,
  receitas: ReceitasScreen,
  refeicoes: RefeicoesScreen,
  perfil: PerfilScreen,
};

function AppContent() {
  const [activeScreen, setActiveScreen] = React.useState<AppScreenKey>('access');
  const { theme, themeMode } = useAppTheme();
  const { isAuthenticated, isInitializing, pendingSocialAuth } = useAuth();
  const isMainScreen = activeScreen in SCREENS;
  const ActiveScreen = isMainScreen ? SCREENS[activeScreen as ScreenKey] : null;
  const screenBackgroundColor =
    !isInitializing && activeScreen === 'access' ? theme.colors.surface : theme.colors.background;

  const goBackToAccess = React.useCallback(() => {
    setActiveScreen('access');
  }, []);

  React.useEffect(() => {
    if (isInitializing) {
      return;
    }

    if (isAuthenticated && !isMainScreen) {
      setActiveScreen('inicio');
      return;
    }

    if (!isAuthenticated && isMainScreen) {
      setActiveScreen('access');
    }
  }, [isAuthenticated, isInitializing, isMainScreen]);

  React.useEffect(() => {
    if (pendingSocialAuth && activeScreen !== 'complete-social-register') {
      setActiveScreen('complete-social-register');
    }
  }, [activeScreen, pendingSocialAuth]);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: screenBackgroundColor,
      }}
      edges={['top']}
    >
      <StatusBar
        barStyle={themeMode === 'light' ? 'dark-content' : 'light-content'}
        backgroundColor={screenBackgroundColor}
      />

      <AppContainer flex direction="column" justify="flex-start" backgroundColor="background">
        {isInitializing ? (
          <AppContainer flex padding="lg" backgroundColor="background">
            <AppHeader />

            <AppContainer flex align="center" justify="center" padding="xl">
              <AppText color="primary" size="xl" weight="bold">
                Carregando sua sessão...
              </AppText>
            </AppContainer>
          </AppContainer>
        ) : null}

        {!isInitializing && activeScreen === 'access' ? (
          <AccessScreen
            onEmailPress={() => setActiveScreen('login')}
            onRegisterPress={() => setActiveScreen('register')}
          />
        ) : null}

        {!isInitializing && activeScreen === 'login' ? (
          <LoginScreen
            onBack={goBackToAccess}
            onRegister={() => setActiveScreen('register')}
          />
        ) : null}

        {!isInitializing && activeScreen === 'register' ? (
          <RegisterScreen
            onBack={goBackToAccess}
            onLogin={() => setActiveScreen('login')}
          />
        ) : null}

        {!isInitializing && activeScreen === 'forgot-password' ? (
          <ForgotPasswordScreen
            onBack={() => setActiveScreen('login')}
            onSent={() => setActiveScreen('login')}
          />
        ) : null}

        {!isInitializing && activeScreen === 'complete-social-register' ? (
          <CompleteSocialRegisterScreen
            onBack={goBackToAccess}
            onComplete={() => setActiveScreen('inicio')}
          />
        ) : null}

        {!isInitializing && ActiveScreen ? (
          <AppContainer flex padding="lg" backgroundColor="background">
            {activeScreen !== 'receitas' ? <AppHeader /> : null}
            {activeScreen !== 'receitas' ? (
              <AppContainer style={{ height: theme.spacing.lg, backgroundColor: 'transparent' }} />
            ) : null}
            <ActiveScreen />
          </AppContainer>
        ) : null}
      </AppContainer>

      {!isInitializing && isMainScreen ? (
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
