import React from 'react';

import { AuthButton, AuthContainer, AuthInput } from '../../components/auth';
import { AppText } from '../../components/ui';
import { useAppTheme } from '../../contexts';

type CompleteSocialRegisterScreenProps = {
  email: string;
  onBack: () => void;
  onComplete: () => void;
};

function CompleteSocialRegisterScreen({
  email,
  onBack,
  onComplete,
}: CompleteSocialRegisterScreenProps) {
  const { theme } = useAppTheme();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleCompleteSocialRegister = React.useCallback(() => {
    setError('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      if (!username || !password) {
        setError('Preencha usuário e senha para finalizar o cadastro.');
        return;
      }

      onComplete();
    }, 700);
  }, [onComplete, password, username]);

  return (
    <AuthContainer onBack={onBack} showBackButton title="Cadastro">
      <AppText
        color="text"
        size="lg"
        weight="bold"
        style={{ marginBottom: theme.spacing.md }}
      >
        E-mail vinculado:
      </AppText>

      <AppText
        color="textSecondary"
        size="lg"
        style={{ marginBottom: theme.spacing.xl }}
      >
        {email}
      </AppText>

      <AuthInput
        accessibilityLabel="Campo de nome de usuário do cadastro social"
        error={!username && error ? 'Informe seu nome de usuário.' : undefined}
        label="Nome de usuário:"
        onChangeText={setUsername}
        placeholder="exemplo@email.com"
        value={username}
      />

      <AuthInput
        accessibilityLabel="Campo de senha do cadastro social"
        error={!password && error ? 'Informe sua senha.' : undefined}
        inputType="password"
        label="Senha:"
        onChangeText={setPassword}
        placeholder="**********"
        value={password}
      />

      <AuthButton
        label="Finalizar cadastro"
        loading={loading}
        onPress={handleCompleteSocialRegister}
      />
    </AuthContainer>
  );
}

export default CompleteSocialRegisterScreen;
