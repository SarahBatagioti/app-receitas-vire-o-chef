import React from 'react';
import { Pressable } from 'react-native';

import { AuthButton, AuthContainer, AuthInput, SocialButton } from '../../components/auth';
import { AppContainer, AppText } from '../../components/ui';
import { useAppTheme } from '../../contexts';

type LoginScreenProps = {
  onBack: () => void;
  onForgotPassword: () => void;
  onLogin: () => void;
  onRegister: () => void;
  onGoogleAuth: () => void;
  onFacebookAuth: () => void;
};

function LoginScreen({
  onBack,
  onForgotPassword,
  onLogin,
  onRegister,
  onGoogleAuth,
  onFacebookAuth,
}: LoginScreenProps) {
  const { theme } = useAppTheme();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [socialLoading, setSocialLoading] = React.useState<'google' | 'facebook' | null>(null);

  const handleLogin = React.useCallback(() => {
    setError('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      if (!email || !password) {
        setError('Preencha e-mail e senha para continuar.');
        return;
      }

      onLogin();
    }, 700);
  }, [email, onLogin, password]);

  const handleGoogleAuth = React.useCallback(() => {
    setError('');
    setSocialLoading('google');

    setTimeout(() => {
      setSocialLoading(null);
      onGoogleAuth();
    }, 700);
  }, [onGoogleAuth]);

  const handleFacebookAuth = React.useCallback(() => {
    setError('');
    setSocialLoading('facebook');

    setTimeout(() => {
      setSocialLoading(null);
      onFacebookAuth();
    }, 700);
  }, [onFacebookAuth]);

  return (
    <AuthContainer onBack={onBack} showBackButton title="Login">
      <AuthInput
        accessibilityLabel="Campo de e-mail"
        error={!email && error ? 'Informe seu e-mail.' : undefined}
        inputType="email"
        label="Seu e-mail:"
        onChangeText={setEmail}
        placeholder="exemplo@email.com"
        value={email}
      />

      <AuthInput
        accessibilityLabel="Campo de senha"
        error={!password && error ? 'Informe sua senha.' : undefined}
        inputType="password"
        label="Senha:"
        onChangeText={setPassword}
        placeholder="**********"
        value={password}
      />

      <Pressable accessibilityRole="button" onPress={onForgotPassword}>
        <AppText
          color="textSecondary"
          size="lg"
          style={{
            textDecorationLine: 'underline',
            marginBottom: theme.spacing.xl,
            marginTop: -theme.spacing.sm,
          }}
        >
          Esqueci minha senha
        </AppText>
      </Pressable>

      <AuthButton label="Entrar com o e-mail" loading={loading} onPress={handleLogin} />

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
        provider="google"
        label="Entrar com o Google"
        loading={socialLoading === 'google'}
        onPress={handleGoogleAuth}
      />

      <AppContainer style={{ height: theme.spacing.lg, backgroundColor: 'transparent' }} />

      <SocialButton
        provider="facebook"
        label="Entrar com o Facebook"
        loading={socialLoading === 'facebook'}
        onPress={handleFacebookAuth}
      />

      <AppContainer style={{ height: theme.spacing.xl, backgroundColor: 'transparent' }} />

      <AppText color="textSecondary" size="lg" style={{ textAlign: 'center' }}>
        Ainda não tem uma conta?{' '}
        <AppText
          accessibilityRole="button"
          color="primary"
          onPress={onRegister}
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

export default LoginScreen;
