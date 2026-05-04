import React from 'react';

import { useAppTheme } from '../../contexts';
import { useAuth } from '../../hooks/useAuth';
import { AppButton, AppContainer, AppInput, AppText } from '../../components/ui';

function AuthWelcomeScreen() {
  const { theme, themeMode, toggleTheme } = useAppTheme();
  const { status, isAuthenticated, user, logout } = useAuth();

  return (
    <AppContainer
      backgroundColor="surface"
      borderRadius="3xl"
      padding="lg"
      shadow="md"
    >
      <AppText color="text" size="2xl" weight="bold">
        Minha conta
      </AppText>

      <AppText color="textSecondary" size="md" lineHeight="relaxed" marginTop="sm">
        Consulte rapidamente qual conta esta ativa no aplicativo.
      </AppText>

      <AppContainer
        backgroundColor="surfaceSecondary"
        borderRadius="xl"
        marginTop="lg"
        padding="md"
      >
        <AppText color="text" size="sm" weight="semibold">
          Status atual: {status}
        </AppText>
        <AppText
          color={isAuthenticated ? 'success' : 'warning'}
          size="sm"
          style={{ marginTop: 4 }}
        >
          {isAuthenticated ? 'Sessao autenticada.' : 'Nenhuma conta conectada.'}
        </AppText>
      </AppContainer>

      <AppContainer backgroundColor="surface" marginTop="lg">
        <AppInput
          editable={false}
          fullWidth
          label="E-mail"
          value={user?.email ?? 'usuario@exemplo.com'}
        />
      </AppContainer>

      <AppContainer backgroundColor="surface" marginTop="sm">
        <AppInput
          editable={false}
          fullWidth
          label="Nome de usuario"
          value={user?.name ?? 'chef.demo'}
        />
      </AppContainer>

      <AppContainer
        backgroundColor="surfaceSecondary"
        borderRadius="xl"
        marginTop="lg"
        padding="md"
      >
        <AppText color="text" size="sm" weight="semibold">
          Aparencia do aplicativo
        </AppText>
        <AppText color="textSecondary" size="sm" style={{ marginTop: 4 }}>
          Tema atual: {themeMode === 'light' ? 'claro' : 'escuro'}.
        </AppText>

        <AppContainer marginTop="md">
          <AppButton
            fullWidth
            label={
              themeMode === 'light'
                ? 'Mudar para tema escuro'
                : 'Mudar para tema claro'
            }
            onPress={toggleTheme}
            style={{ minHeight: theme.spacing['6xl'] }}
            variant="secondary"
          />
        </AppContainer>
      </AppContainer>

      <AppContainer marginTop="lg">
        <AppButton
          fullWidth
          label="Sair da conta"
          onPress={logout}
          variant="outline"
        />
      </AppContainer>
    </AppContainer>
  );
}

export default AuthWelcomeScreen;
