import React from 'react';
import { Switch } from 'react-native';

import { AppContainer, AppText } from '../../../components/ui';
import { useAppTheme } from '../../../contexts';

type RecipeCollaborativeSwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
};

function RecipeCollaborativeSwitch({ value, onValueChange }: RecipeCollaborativeSwitchProps) {
  const { theme } = useAppTheme();

  return (
    <AppContainer
      align="center"
      direction="row"
      justify="space-between"
      marginTop="2xl"
      marginBottom="4xl"
    >
      <AppContainer style={{ flex: 1, marginRight: theme.spacing.lg }}>
        <AppText
          color="text"
          size="md"
          style={{
            fontWeight: theme.fontWeights.bold,
            marginBottom: theme.spacing.xs,
          }}
        >
          É uma receita colaborativa?
        </AppText>
        <AppText color="text" lineHeight="relaxed" size="md">
          Múltiplos usuários podem editar uma mesma receita em tempo real
        </AppText>
      </AppContainer>

      <Switch
        ios_backgroundColor={theme.colors.disabled}
        onValueChange={onValueChange}
        thumbColor={theme.colors.surface}
        trackColor={{
          false: theme.colors.disabled,
          true: theme.colors.success,
        }}
        value={value}
      />
    </AppContainer>
  );
}

export default RecipeCollaborativeSwitch;
