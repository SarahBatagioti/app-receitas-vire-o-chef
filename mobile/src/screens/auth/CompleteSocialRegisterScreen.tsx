import React from 'react';

import { AuthButton, AuthContainer, AuthInput } from '../../components/auth';
import { AppText } from '../../components/ui';
import { useAppTheme } from '../../contexts';
import { useAuth } from '../../hooks/useAuth';

type CompleteSocialRegisterScreenProps = {
  onBack: () => void;
  onComplete: () => void;
};

function CompleteSocialRegisterScreen({ onBack, onComplete }: CompleteSocialRegisterScreenProps) {
  const { theme } = useAppTheme();
  const { authError, clearAuthError, completeSocialRegister, pendingSocialAuth } = useAuth();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleCompleteSocialRegister = React.useCallback(async () => {
    clearAuthError();
    setError(null);

    if (!username || !password) {
      setError('Preencha usuário e senha para finalizar o cadastro.');
      return;
    }

    setLoading(true);

    try {
      await completeSocialRegister({
        name: username.trim(),
        password,
      });

      onComplete();
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : 'Não foi possível concluir o cadastro social.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [clearAuthError, completeSocialRegister, onComplete, password, username]);

  const resolvedError = error ?? authError;
  const email = pendingSocialAuth?.email ?? 'Nenhum e-mail social disponível';

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
        error={!username && resolvedError ? 'Informe seu nome de usuário.' : undefined}
        label="Nome de usuário:"
        onChangeText={setUsername}
        placeholder="**********"
        value={username}
      />

      <AuthInput
        accessibilityLabel="Campo de senha do cadastro social"
        error={!password && resolvedError ? 'Informe sua senha.' : undefined}
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

      {resolvedError && username && password ? (
        <AppText color="error" size="sm" style={{ marginTop: theme.spacing.md }}>
          {resolvedError}
        </AppText>
      ) : null}
    </AuthContainer>
  );
}

export default CompleteSocialRegisterScreen;
