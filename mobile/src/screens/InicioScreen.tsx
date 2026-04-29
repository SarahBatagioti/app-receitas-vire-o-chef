import React from 'react';
import { useAppTheme } from '../contexts';
import ScreenCard from './ScreenCard';
import { AppButton, AppContainer } from '../components/ui';

function InicioScreen() {
  const { themeMode, toggleTheme } = useAppTheme();

  return (
    <>
      <ScreenCard
        title="Tela de Inicio"
        subtitle="Resumo rapido do aplicativo e atalhos principais."
      />
      <AppContainer padding="lg">
        <AppButton
          label={themeMode === 'light' ? '🌙 Tema Escuro' : '☀️ Tema Claro'}
          variant="outline"
          size="md"
          fullWidth
          onPress={toggleTheme}
        />
      </AppContainer>
    </>
  );
}

export default InicioScreen;
