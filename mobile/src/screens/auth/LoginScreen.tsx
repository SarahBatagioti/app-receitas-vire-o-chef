import React from 'react';
import { Pressable } from 'react-native';

import { AuthButton, AuthContainer, AuthInput, SocialButton } from '../../components/auth';
import { AppContainer, AppText } from '../../components/ui';
import { useAppTheme } from '../../contexts';
import { useAuth } from '../../hooks/useAuth';

type LoginScreenProps = {
  onBack: () => void;
  onForgotPassword: () => void;
  onRegister: () => void;
  onSocialRegisterRequired: () => void;
};

function LoginScreen({
  onBack,
  onForgotPassword,
  onRegister,
  onSocialRegisterRequired,
}: LoginScreenProps) {
  const { theme } = useAppTheme();
  const { authError, clearAuthError, login, loginWithFacebook, loginWithGoogle } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [socialLoading, setSocialLoading] = React.useState<'google' | 'facebook' | null>(null);

  const handleLogin = React.useCallback(async () => {
    clearAuthError();
    setError(null);

    if (!email || !password) {
      setError('Preencha e-mail e senha para continuar.');
      return;
    }

    setLoading(true);

    try {
      await login({
        email: email.trim(),
        password,
      });
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : 'Não foi possível entrar agora.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [clearAuthError, email, login, password]);

  const handleGoogleAuth = React.useCallback(async () => {
    clearAuthError();
    setError(null);
    setSocialLoading('google');

    try {
      const response = await loginWithGoogle();

      if (response.cancelled) {
        setError('Login com Google cancelado.');
        return;
      }

      if (response.requiresSocialCompletion) {
        onSocialRegisterRequired();
      }
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : 'Não foi possível iniciar o login com Google.';
      setError(message);
    } finally {
      setSocialLoading(null);
    }
  }, [clearAuthError, loginWithGoogle, onSocialRegisterRequired]);

  const handleFacebookAuth = React.useCallback(async () => {
    clearAuthError();
    setError(null);
    setSocialLoading('facebook');

    try {
      const response = await loginWithFacebook();

      if (response.cancelled) {
        setError('Login com Facebook cancelado.');
        return;
      }

      if (response.requiresSocialCompletion) {
        onSocialRegisterRequired();
      }
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : 'Não foi possível iniciar o login com Facebook.';
      setError(message);
    } finally {
      setSocialLoading(null);
    }
  }, [clearAuthError, loginWithFacebook, onSocialRegisterRequired]);

  const resolvedError = error ?? authError;

  return (
    <AuthContainer onBack={onBack} showBackButton title="Login">
      <AuthInput
        accessibilityLabel="Campo de e-mail"
        error={!email && resolvedError ? 'Informe seu e-mail.' : undefined}
        inputType="email"
        label="Seu e-mail:"
        onChangeText={setEmail}
        placeholder="exemplo@email.com"
        value={email}
      />

      <AuthInput
        accessibilityLabel="Campo de senha"
        error={!password && resolvedError ? 'Informe sua senha.' : undefined}
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

      {resolvedError && email && password ? (
        <AppText color="error" size="sm" style={{ marginTop: theme.spacing.md }}>
          {resolvedError}
        </AppText>
      ) : null}

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
