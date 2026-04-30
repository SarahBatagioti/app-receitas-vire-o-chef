import React from 'react';

import { AuthButton, AuthContainer, AuthInput, SocialButton } from '../../components/auth';
import { AppContainer, AppText } from '../../components/ui';
import { useAppTheme } from '../../contexts';
import { useAuth } from '../../hooks/useAuth';

type RegisterScreenProps = {
  onBack: () => void;
  onLogin: () => void;
  onSocialRegisterRequired: () => void;
};

function RegisterScreen({ onBack, onLogin, onSocialRegisterRequired }: RegisterScreenProps) {
  const { theme } = useAppTheme();
  const { authError, clearAuthError, loginWithFacebook, loginWithGoogle, register } = useAuth();
  const [email, setEmail] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [socialLoading, setSocialLoading] = React.useState<'google' | 'facebook' | null>(null);

  const handleRegister = React.useCallback(async () => {
    clearAuthError();
    setError(null);

    if (!email || !username || !password) {
      setError('Preencha os campos para concluir o cadastro.');
      return;
    }

    setLoading(true);

    try {
      await register({
        email: email.trim(),
        name: username.trim(),
        username: username.trim(),
        password,
      });
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : 'Não foi possível concluir o cadastro.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [clearAuthError, email, password, register, username]);

  const handleGoogleAuth = React.useCallback(async () => {
    clearAuthError();
    setError(null);
    setSocialLoading('google');

    try {
      const response = await loginWithGoogle();

      if (response.cancelled) {
        setError('Cadastro com Google cancelado.');
        return;
      }

      if (response.requiresSocialCompletion) {
        onSocialRegisterRequired();
      }
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : 'Não foi possível iniciar o cadastro com Google.';
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
        setError('Cadastro com Facebook cancelado.');
        return;
      }

      if (response.requiresSocialCompletion) {
        onSocialRegisterRequired();
      }
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : 'Não foi possível iniciar o cadastro com Facebook.';
      setError(message);
    } finally {
      setSocialLoading(null);
    }
  }, [clearAuthError, loginWithFacebook, onSocialRegisterRequired]);

  const resolvedError = error ?? authError;

  return (
    <AuthContainer onBack={onBack} showBackButton title="Cadastro">
      <AuthInput
        accessibilityLabel="Campo de e-mail para cadastro"
        error={!email && resolvedError ? 'Informe seu e-mail.' : undefined}
        inputType="email"
        label="Seu e-mail:"
        onChangeText={setEmail}
        placeholder="exemplo@email.com"
        value={email}
      />

      <AuthInput
        accessibilityLabel="Campo de nome de usuário"
        error={!username && resolvedError ? 'Informe seu nome de usuário.' : undefined}
        label="Nome de usuário:"
        onChangeText={setUsername}
        placeholder="**********"
        value={username}
      />

      <AuthInput
        accessibilityLabel="Campo de senha para cadastro"
        error={!password && resolvedError ? 'Informe sua senha.' : undefined}
        inputType="password"
        label="Senha:"
        onChangeText={setPassword}
        placeholder="**********"
        value={password}
      />

      <AuthButton label="Cadastrar" loading={loading} onPress={handleRegister} />

      {resolvedError && email && username && password ? (
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
        label="Cadastre-se com o Google"
        loading={socialLoading === 'google'}
        onPress={handleGoogleAuth}
      />

      <AppContainer style={{ height: theme.spacing.lg, backgroundColor: 'transparent' }} />

      <SocialButton
        provider="facebook"
        label="Cadastre-se com o Facebook"
        loading={socialLoading === 'facebook'}
        onPress={handleFacebookAuth}
      />

      <AppContainer style={{ height: theme.spacing.xl, backgroundColor: 'transparent' }} />

      <AppText color="textSecondary" size="lg" style={{ textAlign: 'center' }}>
        Já tem uma conta?{' '}
        <AppText
          accessibilityRole="button"
          color="primary"
          onPress={onLogin}
          size="lg"
          style={{ textDecorationLine: 'underline' }}
          weight="bold"
        >
          Login
        </AppText>
      </AppText>
    </AuthContainer>
  );
}

export default RegisterScreen;
