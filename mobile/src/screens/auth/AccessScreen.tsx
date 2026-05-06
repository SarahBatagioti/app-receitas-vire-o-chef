import React from 'react';

import { AuthButton, AuthContainer, SocialButton } from '../../components/auth';
import { AppButton, AppContainer, AppText } from '../../components/ui';
import { useAppTheme } from '../../contexts';
import { useAuth } from '../../hooks/useAuth';

type AccessScreenProps = {
  onEmailPress: () => void;
  onRegisterPress: () => void;
};

function AccessScreen({ onEmailPress, onRegisterPress }: AccessScreenProps) {
  const { theme } = useAppTheme();
  const { authError, clearAuthError, loginWithGoogle } = useAuth();
  const [socialLoading, setSocialLoading] = React.useState<'google' | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleGoogleAuth = React.useCallback(async () => {
    clearAuthError();
    setError(null);
    setSocialLoading('google');

    try {
      await loginWithGoogle();
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : 'Nao foi possivel entrar com o Google.';
      setError(message);
    } finally {
      setSocialLoading(null);
    }
  }, [clearAuthError, loginWithGoogle]);

  const resolvedError = error ?? authError;

  return (
    <AuthContainer title={'Vire\no Chef'} variant="access">
      <AuthButton label="Entrar com o e-mail" onPress={onEmailPress} />

      <AppContainer style={{ height: theme.spacing.lg, backgroundColor: 'transparent' }} />

      <AppButton
        accessibilityRole="button"
        borderRadius="2xl"
        fullWidth
        label="Crie sua conta"
        onPress={onRegisterPress}
        style={{ minHeight: theme.spacing['7xl'], justifyContent: 'center', backgroundColor: '#FFFFFF' }}
        textStyle={{ fontSize: theme.fontSizes.lg }}
        variant="outline"
      />

      <AppContainer
        align="center"
        backgroundColor="background"
        direction="row"
        justify="center"
        style={{
          backgroundColor: 'transparent',
          marginVertical: theme.spacing['2xl'],
          gap: theme.spacing.lg,
        }}
      >
        <AppContainer flex backgroundColor="text" style={{ height: 1 }} />
        <AppText color="text" size="xl" weight="bold">
          Ou
        </AppText>
        <AppContainer flex backgroundColor="text" style={{ height: 1 }} />
      </AppContainer>

      <SocialButton
        label="Entrar com o Google"
        loading={socialLoading === 'google'}
        onPress={handleGoogleAuth}
      />

      {resolvedError ? (
        <AppText color="error" size="sm" style={{ marginTop: theme.spacing.lg, textAlign: 'center' }}>
          {resolvedError}
        </AppText>
      ) : null}
    </AuthContainer>
  );
}

export default AccessScreen;
