import React from 'react';

import { AuthButton, AuthContainer, AuthInput } from '../../components/auth';
import { AppText } from '../../components/ui';
import { useAppTheme } from '../../contexts';
import { useAuth } from '../../hooks/useAuth';

type RegisterScreenProps = {
  onBack: () => void;
  onLogin: () => void;
};

function RegisterScreen({ onBack, onLogin }: RegisterScreenProps) {
  const { theme } = useAppTheme();
  const { authError, clearAuthError, register } = useAuth();
  const [email, setEmail] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [showEmailRegisterValidation, setShowEmailRegisterValidation] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleRegister = React.useCallback(async () => {
    clearAuthError();
    setError(null);
    setShowEmailRegisterValidation(false);

    if (!email || !username || !password) {
      setShowEmailRegisterValidation(true);
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
        requestError instanceof Error ? requestError.message : 'Nao foi possivel concluir o cadastro.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [clearAuthError, email, password, register, username]);

  // const handleGoogleAuth = React.useCallback(async () => {
  //   clearAuthError();
  //   setError(null);
  //   setSocialLoading('google');
  //
  //   try {
  //     await loginWithGoogle();
  //   } catch (requestError) {
  //     const message =
  //       requestError instanceof Error ? requestError.message : 'Nao foi possivel continuar com o Google.';
  //     setError(message);
  //   } finally {
  //     setSocialLoading(null);
  //   }
  // }, [clearAuthError, loginWithGoogle]);

  const resolvedError = error ?? authError;

  return (
    <AuthContainer onBack={onBack} showBackButton title="Cadastro">
      <AuthInput
        accessibilityLabel="Campo de e-mail para cadastro"
        error={!email && showEmailRegisterValidation ? 'Informe seu e-mail.' : undefined}
        inputType="email"
        label="Seu e-mail:"
        onChangeText={setEmail}
        placeholder="exemplo@email.com"
        value={email}
      />

      <AuthInput
        accessibilityLabel="Campo de nome de usuario"
        error={!username && showEmailRegisterValidation ? 'Informe seu nome de usuario.' : undefined}
        label="Nome de usuario:"
        onChangeText={setUsername}
        placeholder="**********"
        value={username}
      />

      <AuthInput
        accessibilityLabel="Campo de senha para cadastro"
        error={!password && showEmailRegisterValidation ? 'Informe sua senha.' : undefined}
        inputType="password"
        label="Senha:"
        onChangeText={setPassword}
        placeholder="**********"
        value={password}
      />

      <AuthButton label="Cadastrar" loading={loading} onPress={handleRegister} />

      {resolvedError ? (
        <AppText color="error" size="sm" style={{ marginTop: theme.spacing.md }}>
          {resolvedError}
        </AppText>
      ) : null}

      {/* <AppContainer
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
        label="Cadastre-se com o Google"
        loading={socialLoading === 'google'}
        onPress={handleGoogleAuth}
      />
      
      <AppContainer style={{ height: theme.spacing.xl, backgroundColor: 'transparent' }} /> */}

      <AppText color="textSecondary" size="lg" style={{ textAlign: 'center' }}>
        Ja tem uma conta?{' '}
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
