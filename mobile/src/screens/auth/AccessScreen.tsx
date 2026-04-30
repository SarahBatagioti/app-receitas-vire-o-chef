import React from 'react';

import { AuthButton, AuthContainer, SocialButton } from '../../components/auth';
import { AppContainer, AppText } from '../../components/ui';
import { useAppTheme } from '../../contexts';

type AccessScreenProps = {
  onEmailPress: () => void;
  onGooglePress: () => void;
  onRegisterPress: () => void;
};

function AccessScreen({ onEmailPress, onGooglePress, onRegisterPress }: AccessScreenProps) {
  const { theme } = useAppTheme();

  return (
    <AuthContainer title={'Vire\no Chef'} variant="access">
      <AuthButton label="Entrar com o e-mail" onPress={onEmailPress} />

      <AppContainer style={{ height: theme.spacing.lg, backgroundColor: 'transparent' }} />

      <SocialButton
        provider="google"
        label="Entrar com o Google"
        onPress={onGooglePress}
      />

      <AppContainer style={{ height: theme.spacing.xl, backgroundColor: 'transparent' }} />

      <AppText size="lg" color="text" style={{ textAlign: 'center' }}>
        Ainda não tem uma conta?{' '}
        <AppText
          accessibilityRole="button"
          color="primary"
          onPress={onRegisterPress}
          size="lg"
          style={{ textDecorationLine: 'underline' }}
          weight="bold"
        >
          Cadastre-se
        </AppText>
      </AppText>
    </AuthContainer>
  );
}

export default AccessScreen;
