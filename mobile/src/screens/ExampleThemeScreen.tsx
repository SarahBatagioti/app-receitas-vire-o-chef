/**
 * Exemplo de Tela com Componentes Globais
 * Esta tela demonstra como usar a estrutura de tema e componentes reutilizáveis
 */

import React from 'react';
import { ScrollView } from 'react-native';
import { useAppTheme } from '../contexts';
import {
  AppContainer,
  AppText,
  AppButton,
  AppInput,
} from '../components/ui';

export function ExampleThemeScreen() {
  const { theme, toggleTheme, themeMode } = useAppTheme();
  const [inputValue, setInputValue] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background, flex: 1 }}
      contentContainerStyle={{ paddingBottom: theme.spacing.lg }}
    >
      {/* Header */}
      <AppContainer
        paddingHorizontal="lg"
        paddingVertical="xl"
        marginBottom="lg"
        backgroundColor="surface"
        shadow="md"
      >
        <AppText size="3xl" weight="bold" marginBottom="sm">
          Tema {themeMode === 'light' ? '🌞' : '🌙'}
        </AppText>
        <AppText size="md" color="textSecondary">
          Estrutura escalável com suporte a customização
        </AppText>
      </AppContainer>

      {/* Exemplos de Tipografia */}
      <AppContainer paddingHorizontal="lg" marginBottom="lg">
        <AppText size="2xl" weight="bold" marginBottom="md">
          Tipografia
        </AppText>

        <AppText size="xs" color="textSecondary" marginBottom="sm">
          Muito pequeno (xs)
        </AppText>
        <AppText size="sm" color="textSecondary" marginBottom="sm">
          Pequeno (sm)
        </AppText>
        <AppText size="base" marginBottom="sm">
          Padrão (base)
        </AppText>
        <AppText size="md" marginBottom="sm">
          Médio (md)
        </AppText>
        <AppText size="lg" marginBottom="sm">
          Grande (lg)
        </AppText>
        <AppText size="xl" weight="semibold" marginBottom="sm">
          Extra grande (xl)
        </AppText>
        <AppText size="2xl" weight="bold" marginBottom="lg">
          2XL - Para títulos
        </AppText>

        <AppText weight="light" marginBottom="sm">
          Light weight
        </AppText>
        <AppText weight="regular" marginBottom="sm">
          Regular weight
        </AppText>
        <AppText weight="semibold" marginBottom="sm">
          Semibold weight
        </AppText>
        <AppText weight="bold" marginBottom="lg">
          Bold weight
        </AppText>
      </AppContainer>

      {/* Exemplos de Cores */}
      <AppContainer paddingHorizontal="lg" marginBottom="lg">
        <AppText size="2xl" weight="bold" marginBottom="md">
          Cores
        </AppText>

        <AppContainer
          padding="md"
          backgroundColor="primary"
          borderRadius="lg"
          marginBottom="md"
        >
          <AppText color="textInverse" weight="semibold">
            Cor Primária
          </AppText>
        </AppContainer>

        <AppContainer
          padding="md"
          backgroundColor="success"
          borderRadius="lg"
          marginBottom="md"
        >
          <AppText color="textInverse" weight="semibold">
            Cor Sucesso
          </AppText>
        </AppContainer>

        <AppContainer
          padding="md"
          backgroundColor="warning"
          borderRadius="lg"
          marginBottom="md"
        >
          <AppText color="textInverse" weight="semibold">
            Cor Aviso
          </AppText>
        </AppContainer>

        <AppContainer
          padding="md"
          backgroundColor="error"
          borderRadius="lg"
          marginBottom="lg"
        >
          <AppText color="textInverse" weight="semibold">
            Cor Erro
          </AppText>
        </AppContainer>
      </AppContainer>

      {/* Exemplos de Botões */}
      <AppContainer paddingHorizontal="lg" marginBottom="lg">
        <AppText size="2xl" weight="bold" marginBottom="md">
          Botões
        </AppText>

        <AppButton
          label="Botão Primário"
          variant="primary"
          onPress={() => console.log('Primary')}
          fullWidth
          style={{ marginBottom: theme.spacing.md }}
        />

        <AppButton
          label="Botão Secundário"
          variant="secondary"
          onPress={() => console.log('Secondary')}
          fullWidth
          style={{ marginBottom: theme.spacing.md }}
        />

        <AppButton
          label="Botão Outline"
          variant="outline"
          onPress={() => console.log('Outline')}
          fullWidth
          style={{ marginBottom: theme.spacing.md }}
        />

        <AppButton
          label="Botão Ghost"
          variant="ghost"
          onPress={() => console.log('Ghost')}
          fullWidth
          style={{ marginBottom: theme.spacing.md }}
        />

        <AppButton
          label="Botão Pequeno"
          size="sm"
          fullWidth
          style={{ marginBottom: theme.spacing.md }}
        />

        <AppButton
          label="Botão Grande"
          size="lg"
          fullWidth
          style={{ marginBottom: theme.spacing.md }}
        />

        <AppButton
          label="Botão Desativado"
          disabled
          fullWidth
          style={{ marginBottom: theme.spacing.md }}
        />

        <AppButton
          label="Carregando..."
          loading
          fullWidth
          style={{ marginBottom: theme.spacing.lg }}
        />
      </AppContainer>

      {/* Exemplos de Inputs */}
      <AppContainer paddingHorizontal="lg" marginBottom="lg">
        <AppText size="2xl" weight="bold" marginBottom="md">
          Inputs
        </AppText>

        <AppInput
          label="Campo de Texto"
          placeholder="Digite algo..."
          value={inputValue}
          onChangeText={setInputValue}
          fullWidth
          style={{ marginBottom: theme.spacing.md }}
        />

        <AppInput
          label="Email"
          placeholder="seu@email.com"
          inputType="email"
          value={email}
          onChangeText={setEmail}
          fullWidth
          style={{ marginBottom: theme.spacing.md }}
        />

        <AppInput
          label="Senha"
          placeholder="Digite sua senha"
          inputType="password"
          value={password}
          onChangeText={setPassword}
          fullWidth
          style={{ marginBottom: theme.spacing.md }}
        />

        <AppInput
          label="Campo Desativado"
          placeholder="Não é possível editar"
          editable={false}
          fullWidth
          style={{ marginBottom: theme.spacing.md }}
        />

        <AppInput
          label="Campo com Erro"
          placeholder="Este campo tem erro"
          error="Este campo é obrigatório"
          required
          fullWidth
          style={{ marginBottom: theme.spacing.lg }}
        />
      </AppContainer>

      {/* Botão de Toggle de Tema */}
      <AppContainer paddingHorizontal="lg">
        <AppButton
          label={`Alternar para tema ${themeMode === 'light' ? 'escuro' : 'claro'}`}
          variant="secondary"
          onPress={toggleTheme}
          fullWidth
        />
      </AppContainer>
    </ScrollView>
  );
}

export default ExampleThemeScreen;
