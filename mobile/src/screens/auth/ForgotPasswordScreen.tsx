import React from 'react';

import { AuthButton, AuthContainer, AuthInput } from '../../components/auth';
import { AppText } from '../../components/ui';
import { useAppTheme } from '../../contexts';
import { useAuth } from '../../hooks/useAuth';

type ForgotPasswordScreenProps = {
  onBack: () => void;
  onSent: () => void;
};

function ForgotPasswordScreen({ onBack, onSent }: ForgotPasswordScreenProps) {
  const { theme } = useAppTheme();
  const { authError, clearAuthError, forgotPassword } = useAuth();
  const [email, setEmail] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleForgotPassword = React.useCallback(async () => {
    clearAuthError();
    setError(null);
    setSuccessMessage(null);

    if (!email) {
      setError('Informe o e-mail para envio das instruções.');
      return;
    }

    setLoading(true);

    try {
      const response = await forgotPassword({
        email: email.trim(),
      });

      setSuccessMessage(response.message);
      onSent();
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : 'Não foi possível enviar o e-mail de redefinição.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [clearAuthError, email, forgotPassword, onSent]);

  const resolvedError = error ?? authError;

  return (
    <AuthContainer
      helperText="Informe o e-mail de usado no cadastro para ser enviado as instruções"
      onBack={onBack}
      showBackButton
      title={'Redefinir\nsenha'}
    >
      <AuthInput
        accessibilityLabel="Campo de e-mail para redefinir senha"
        error={resolvedError || undefined}
        inputType="email"
        onChangeText={setEmail}
        placeholder="exemplo@email.com"
        value={email}
      />

      <AuthButton
        label="Enviar e-mail de redefinição"
        loading={loading}
        onPress={handleForgotPassword}
      />

      {successMessage ? (
        <AppText color="success" size="sm" style={{ marginTop: theme.spacing.md }}>
          {successMessage}
        </AppText>
      ) : null}
    </AuthContainer>
  );
}

export default ForgotPasswordScreen;
