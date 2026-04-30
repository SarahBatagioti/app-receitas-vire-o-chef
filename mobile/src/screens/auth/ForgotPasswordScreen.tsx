import React from 'react';

import { AuthButton, AuthContainer, AuthInput } from '../../components/auth';

type ForgotPasswordScreenProps = {
  onBack: () => void;
  onSent: () => void;
};

function ForgotPasswordScreen({ onBack, onSent }: ForgotPasswordScreenProps) {
  const [email, setEmail] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleForgotPassword = React.useCallback(() => {
    setError('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      if (!email) {
        setError('Informe o e-mail para envio das instruções.');
        return;
      }

      onSent();
    }, 700);
  }, [email, onSent]);

  return (
    <AuthContainer
      helperText="Informe o e-mail de usado no cadastro para ser enviado as instruções"
      onBack={onBack}
      showBackButton
      title={'Redefinir\nsenha'}
    >
      <AuthInput
        accessibilityLabel="Campo de e-mail para redefinir senha"
        error={error || undefined}
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
    </AuthContainer>
  );
}

export default ForgotPasswordScreen;
