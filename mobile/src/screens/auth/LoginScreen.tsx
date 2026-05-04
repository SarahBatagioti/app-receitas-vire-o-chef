import React from 'react';

import { AuthButton, AuthContainer, AuthInput } from '../../components/auth';
import { AppText } from '../../components/ui';
import { useAppTheme } from '../../contexts';
import { useAuth } from '../../hooks/useAuth';

type LoginScreenProps = {
  onBack: () => void;
  onRegister: () => void;
};

function LoginScreen({ onBack, onRegister }: LoginScreenProps) {
  const { theme } = useAppTheme();
  const { authError, clearAuthError, login } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [showEmailLoginValidation, setShowEmailLoginValidation] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleLogin = React.useCallback(async () => {
    clearAuthError();
    setError(null);
    setShowEmailLoginValidation(false);

    if (!email || !password) {
      setShowEmailLoginValidation(true);
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

  const resolvedError = error ?? authError;

  return (
    <AuthContainer onBack={onBack} showBackButton title="Login">
      <AuthInput
        accessibilityLabel="Campo de e-mail"
        error={!email && showEmailLoginValidation ? 'Informe seu e-mail.' : undefined}
        inputType="email"
        label="Seu e-mail:"
        onChangeText={setEmail}
        placeholder="exemplo@email.com"
        value={email}
      />

      <AuthInput
        accessibilityLabel="Campo de senha"
        error={!password && showEmailLoginValidation ? 'Informe sua senha.' : undefined}
        inputType="password"
        label="Senha:"
        onChangeText={setPassword}
        placeholder="**********"
        value={password}
      />

      {/* Botao de recuperacao de senha ocultado temporariamente.
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
      */}

      <AuthButton label="Entrar com o e-mail" loading={loading} onPress={handleLogin} />

      {resolvedError ? (
        <AppText color="error" size="sm" style={{ marginTop: theme.spacing.md }}>
          {resolvedError}
        </AppText>
      ) : null}

      {/* Fluxo social pausado por enquanto.
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
      */}

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
