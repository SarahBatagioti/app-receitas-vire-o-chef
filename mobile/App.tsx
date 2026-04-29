import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemeProvider, useAppTheme } from './src/contexts';
import { AppContainer } from './src/components/ui';
import BottomNav from './src/components/BottomNav';
import {
  InicioScreen,
  PerfilScreen,
  ProdutosScreen,
  ReceitasScreen,
  RefeicoesScreen,
} from './src/screens';
import { ScreenKey } from './src/types/navigation';

const SCREENS: Record<ScreenKey, React.ComponentType> = {
  inicio: InicioScreen,
  produtos: ProdutosScreen,
  receitas: ReceitasScreen,
  refeicoes: RefeicoesScreen,
  perfil: PerfilScreen,
};

/**
 * Componente AppContent
 * Contém a lógica de navegação e usa o tema global
 * Separado para conseguir acessar useAppTheme
 */
function AppContent() {
  const [activeScreen, setActiveScreen] = React.useState<ScreenKey>('inicio');
  const { theme, themeMode } = useAppTheme();
  const ActiveScreen = SCREENS[activeScreen];

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

      <AppContainer
        flex
        padding="lg"
        direction="column"
        justify="flex-start"
      >
        <ActiveScreen />
      </AppContainer>

      <BottomNav activeScreen={activeScreen} onChangeScreen={setActiveScreen} />
    </SafeAreaView>
  );
}

/**
 * Componente App
 * Raiz da aplicação com ThemeProvider
 */
function App() {
  return (
    <ThemeProvider initialTheme="light">
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
