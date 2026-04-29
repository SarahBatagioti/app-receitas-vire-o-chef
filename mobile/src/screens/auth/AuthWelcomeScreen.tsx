import React from 'react';
import { useAppTheme } from '../../contexts';
import { useAuth } from '../../hooks/useAuth';
import { AppButton, AppContainer, AppText } from '../../components/ui';

function AuthWelcomeScreen() {
  const { theme } = useAppTheme();
  const { status, isAuthenticated, clearSession } = useAuth();

  return (
    <AppContainer
      padding="lg"
      borderRadius="3xl"
      backgroundColor="surface"
      shadow="md"
    >
      <AppText size="2xl" weight="bold" color="text">
        Autenticacao
      </AppText>

      <AppContainer marginVertical="md" />

      <AppText size="md" color="textSecondary" lineHeight="relaxed">
        A base de autenticacao foi preparada para as proximas etapas. Login,
        cadastro e integracao com Firebase ainda nao foram implementados.
      </AppText>

      <AppContainer marginVertical="md" />

      <AppContainer
        padding="md"
        borderRadius="xl"
        backgroundColor="surfaceSecondary"
      >
        <AppText size="sm" weight="semibold" color="text">
          Status atual: {status}
        </AppText>
        <AppText
          size="sm"
          color={isAuthenticated ? 'success' : 'warning'}
          style={{ marginTop: theme.spacing.xs }}
        >
          {isAuthenticated ? 'Sessao autenticada.' : 'Fluxo ainda em preparacao.'}
        </AppText>
      </AppContainer>

      <AppContainer marginVertical="md" />

      <AppButton
        label="Limpar estado de autenticacao"
        variant="outline"
        fullWidth
        onPress={clearSession}
      />
    </AppContainer>
  );
}

export default AuthWelcomeScreen;
