import React from 'react';

import { AuthButton, AuthContainer } from '../../components/auth';
import { AppButton, AppContainer } from '../../components/ui';
import { useAppTheme } from '../../contexts';

type AccessScreenProps = {
  onEmailPress: () => void;
  onRegisterPress: () => void;
};

function AccessScreen({ onEmailPress, onRegisterPress }: AccessScreenProps) {
  const { theme } = useAppTheme();

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

      {/* Fluxo social pausado por enquanto.
      <SocialButton
        provider="google"
        label="Entrar com o Google"
        onPress={onGooglePress}
      />
      */}

      {/* Link de cadastro pausado nesta tela, já que o CTA principal acima
      assume essa função por enquanto.
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
      */}
    </AuthContainer>
  );
}

export default AccessScreen;
