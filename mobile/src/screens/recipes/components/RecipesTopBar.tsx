import React from 'react';
import { Pressable } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';

import { AppContainer, AppText } from '../../../components/ui';
import { useAppTheme } from '../../../contexts';
import { FontSizeKey } from '../../../styles/fontSizes';

type RecipesTopBarProps = {
  title: string;
  onBack?: () => void;
  titleSize?: FontSizeKey;
};

function RecipesTopBar({ title, onBack, titleSize = '2xl' }: RecipesTopBarProps) {
  const { theme } = useAppTheme();

  return (
    <AppContainer
      align="center"
      direction="row"
      marginBottom="2xl"
      style={{ minHeight: theme.spacing['4xl'] }}
    >
      {onBack ? (
        <Pressable
          accessibilityLabel="Voltar"
          onPress={onBack}
          style={{
            alignItems: 'center',
            height: theme.spacing['4xl'],
            justifyContent: 'center',
            marginRight: theme.spacing.md,
            width: theme.spacing['4xl'],
          }}
        >
          <ChevronLeft color={theme.colors.primary} size={theme.spacing['2xl']} strokeWidth={2.4} />
        </Pressable>
      ) : null}

      <AppText
        color="text"
        size={titleSize}
        style={{
          fontWeight: theme.fontWeights.bold,
        }}
      >
        {title}
      </AppText>
    </AppContainer>
  );
}

export default RecipesTopBar;
