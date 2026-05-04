import React from 'react';
import { Pressable } from 'react-native';
import { PlusCircle, Search } from 'lucide-react-native';

import { AppContainer, AppInput } from '../../../components/ui';
import { useAppTheme } from '../../../contexts';

type RecipeSearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  onAddRecipe?: () => void;
};

function RecipeSearchBar({ value, onChangeText, onAddRecipe }: RecipeSearchBarProps) {
  const { theme } = useAppTheme();

  return (
    <AppContainer align="center" direction="row" marginBottom="2xl">
      <AppContainer flex style={{ marginRight: theme.spacing.md }}>
        <AppInput
          borderColor="surface"
          fullWidth
          leftIcon={<Search color={theme.colors.primary} size={theme.spacing['2xl']} strokeWidth={2} />}
          onChangeText={onChangeText}
          placeholder="Pesquisar receitas..."
          size="lg"
          style={{ marginBottom: 0 }}
          value={value}
        />
      </AppContainer>

      <Pressable
        accessibilityLabel="Adicionar receita"
        onPress={onAddRecipe}
        style={{
          alignItems: 'center',
          backgroundColor: theme.colors.primary,
          borderRadius: theme.borderRadius['2xl'],
          height: theme.spacing['6xl'],
          justifyContent: 'center',
          width: theme.spacing['6xl'],
          ...theme.shadows.sm,
        }}
      >
        <PlusCircle
          color={theme.colors.textInverse}
          size={theme.spacing['3xl']}
          strokeWidth={1.9}
        />
      </Pressable>
    </AppContainer>
  );
}

export default RecipeSearchBar;
