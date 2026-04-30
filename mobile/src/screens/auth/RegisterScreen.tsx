import React from 'react';

import { AuthButton, AuthContainer, AuthInput, SocialButton } from '../../components/auth';
import { AppContainer, AppText } from '../../components/ui';
import { useAppTheme } from '../../contexts';

type RegisterScreenProps = {
  onBack: () => void;
  onLogin: () => void;
  onRegister: () => void;
  onGoogleAuth: () => void;
  onFacebookAuth: () => void;
};

function RegisterScreen({
  onBack,
  onLogin,
  onRegister,
  onGoogleAuth,
  onFacebookAuth,
}: RegisterScreenProps) {
  const { theme } = useAppTheme();
  const [email, setEmail] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [socialLoading, setSocialLoading] = React.useState<'google' | 'facebook' | null>(null);

  const handleRegister = React.useCallback(() => {
    setError('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      if (!email || !username || !password) {
        setError('Preencha os campos para concluir o cadastro.');
        return;
      }

      onRegister();
    }, 700);
  }, [email, onRegister, password, username]);

  const handleGoogleAuth = React.useCallback(() => {
    setSocialLoading('google');
    setTimeout(() => {
      setSocialLoading(null);
      onGoogleAuth();
    }, 700);
  }, [onGoogleAuth]);

  const handleFacebookAuth = React.useCallback(() => {
    setSocialLoading('facebook');
    setTimeout(() => {
      setSocialLoading(null);
      onFacebookAuth();
    }, 700);
  }, [onFacebookAuth]);

  return (
    <AuthContainer onBack={onBack} showBackButton title="Cadastro">
      <AuthInput
        accessibilityLabel="Campo de e-mail para cadastro"
        error={!email && error ? 'Informe seu e-mail.' : undefined}
        inputType="email"
        label="Seu e-mail:"
        onChangeText={setEmail}
        placeholder="exemplo@email.com"
        value={email}
      />

      <AuthInput
        accessibilityLabel="Campo de nome de usuário"
        error={!username && error ? 'Informe seu nome de usuário.' : undefined}
        label="Nome de usuário:"
        onChangeText={setUsername}
        placeholder="**********"
        value={username}
      />

      <AuthInput
        accessibilityLabel="Campo de senha para cadastro"
        error={!password && error ? 'Informe sua senha.' : undefined}
        inputType="password"
        label="Senha:"
        onChangeText={setPassword}
        placeholder="**********"
        value={password}
      />

      <AuthButton label="Cadastrar" loading={loading} onPress={handleRegister} />

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
