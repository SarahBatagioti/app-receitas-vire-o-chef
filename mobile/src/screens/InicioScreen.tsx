import React from 'react';
import { ScrollView } from 'react-native';
import { useAppTheme } from '../contexts';
import { AppButton, AppContainer, AppInput, AppText } from '../components/ui';
import { firebaseTestService } from '../services/firebase/firebase-test.service';

function InicioScreen() {
  const { theme, themeMode, toggleTheme } = useAppTheme();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [firebaseToken, setFirebaseToken] = React.useState('');
  const [statusMessage, setStatusMessage] = React.useState(
    'Use uma conta criada no Firebase Authentication para gerar um ID token temporario.',
  );
  const [backendResult, setBackendResult] = React.useState('');
  const [loadingToken, setLoadingToken] = React.useState(false);
  const [loadingBackendValidation, setLoadingBackendValidation] = React.useState(false);

  const handleGenerateToken = async () => {
    if (!email.trim() || !password) {
      setStatusMessage('Preencha e-mail e senha para gerar o token.');
      return;
    }

    try {
      setLoadingToken(true);
      setBackendResult('');
      const response = await firebaseTestService.generateIdToken(
        email.trim(),
        password,
      );

      setFirebaseToken(response.idToken);
      setStatusMessage(
        `Token gerado com sucesso para ${response.email}. Agora voce pode validar no backend.`,
      );
    } catch (error) {
      setFirebaseToken('');
      setStatusMessage(
        error instanceof Error
          ? error.message
          : 'Nao foi possivel gerar o token Firebase.',
      );
    } finally {
      setLoadingToken(false);
    }
  };

  const handleVerifyWithBackend = async () => {
    if (!firebaseToken.trim()) {
      setBackendResult('Gere o token primeiro.');
      return;
    }

    try {
      setLoadingBackendValidation(true);
      const response = await firebaseTestService.verifyTokenWithBackend(
        firebaseToken.trim(),
      );

      setBackendResult(JSON.stringify(response, null, 2));
    } catch (error) {
      setBackendResult(
        error instanceof Error
          ? error.message
          : 'Nao foi possivel validar o token no backend.',
      );
    } finally {
      setLoadingBackendValidation(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ paddingBottom: theme.spacing['4xl'] }}
    >
      <AppContainer
        padding="lg"
        borderRadius="3xl"
        backgroundColor="surface"
        shadow="md"
      >
        <AppText size="2xl" weight="bold" color="text">
          Teste rapido do Firebase
        </AppText>

        <AppContainer marginVertical="md" />

        <AppText size="md" color="textSecondary" lineHeight="relaxed">
          Esta tela gera um Firebase ID token via e-mail e senha apenas para
          testar o endpoint `POST /api/auth/firebase/verify-token`.
        </AppText>
      </AppContainer>

      <AppContainer marginVertical="md" />

      <AppContainer
        padding="lg"
        borderRadius="3xl"
        backgroundColor="surface"
        shadow="sm"
      >
        <AppInput
          label="E-mail do Firebase"
          placeholder="usuario@email.com"
          inputType="email"
          value={email}
          onChangeText={setEmail}
          fullWidth
        />

        <AppContainer marginVertical="sm" />

        <AppInput
          label="Senha do Firebase"
          placeholder="Digite sua senha"
          inputType="password"
          value={password}
          onChangeText={setPassword}
          fullWidth
        />

        <AppContainer marginVertical="md" />

        <AppButton
          label="Gerar Firebase ID token"
          fullWidth
          loading={loadingToken}
          onPress={handleGenerateToken}
        />

        <AppContainer marginVertical="sm" />

        <AppButton
          label="Validar token no backend"
          variant="outline"
          fullWidth
          loading={loadingBackendValidation}
          onPress={handleVerifyWithBackend}
        />
      </AppContainer>

      <AppContainer marginVertical="md" />

      <AppContainer
        padding="lg"
        borderRadius="3xl"
        backgroundColor="surface"
        shadow="sm"
      >
        <AppText size="sm" weight="semibold" color="text">
          Status
        </AppText>
        <AppText
          size="sm"
          color="textSecondary"
          lineHeight="relaxed"
          style={{ marginTop: theme.spacing.xs }}
        >
          {statusMessage}
        </AppText>
      </AppContainer>

      <AppContainer marginVertical="md" />

      <AppContainer
        padding="lg"
        borderRadius="3xl"
        backgroundColor="surface"
        shadow="sm"
      >
        <AppText size="sm" weight="semibold" color="text">
          Firebase ID token
        </AppText>
        <AppText
          size="sm"
          color={firebaseToken ? 'textSecondary' : 'warning'}
          lineHeight="relaxed"
          selectable
          style={{ marginTop: theme.spacing.xs }}
        >
          {firebaseToken || 'O token aparecera aqui para voce copiar e testar.'}
        </AppText>
      </AppContainer>

      <AppContainer marginVertical="md" />

      <AppContainer
        padding="lg"
        borderRadius="3xl"
        backgroundColor="surface"
        shadow="sm"
      >
        <AppText size="sm" weight="semibold" color="text">
          Resposta do backend
        </AppText>
        <AppText
          size="sm"
          color={backendResult ? 'textSecondary' : 'textTertiary'}
          lineHeight="relaxed"
          selectable
          style={{ marginTop: theme.spacing.xs }}
        >
          {backendResult || 'A resposta da validacao aparecera aqui.'}
        </AppText>
      </AppContainer>

      <AppContainer padding="lg">
        <AppButton
          label={themeMode === 'light' ? 'Tema Escuro' : 'Tema Claro'}
          variant="ghost"
          size="md"
          fullWidth
          onPress={toggleTheme}
        />
      </AppContainer>
    </ScrollView>
  );
}

export default InicioScreen;
