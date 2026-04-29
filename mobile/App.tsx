import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BottomNav from './src/components/BottomNav';
import {
  InicioScreen,
  PerfilScreen,
  ProdutosScreen,
  ReceitasScreen,
  RefeicoesScreen,
} from './src/screens';
import { ScreenKey } from './src/types/navigation';

const BACKGROUND = '#e5e5e5';

const SCREENS: Record<ScreenKey, React.ComponentType> = {
  inicio: InicioScreen,
  produtos: ProdutosScreen,
  receitas: ReceitasScreen,
  refeicoes: RefeicoesScreen,
  perfil: PerfilScreen,
};

function App() {
  const [activeScreen, setActiveScreen] = React.useState<ScreenKey>('inicio');
  const ActiveScreen = SCREENS[activeScreen];

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={BACKGROUND} />

      <View style={styles.contentArea}>
        <ActiveScreen />
      </View>

      <BottomNav
        activeScreen={activeScreen}
        onChangeScreen={setActiveScreen}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  contentArea: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 22,
    justifyContent: 'center',
  },
});

export default App;
