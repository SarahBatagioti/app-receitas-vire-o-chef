import React from 'react';
import { Pressable } from 'react-native';
import { Bookmark } from 'lucide-react-native';
import { AppContainer, AppText } from '../../../components/ui';
import { useAppTheme } from '../../../contexts';

type RecipeLinkTagProps = {
  visible: boolean;
  onPress?: () => void;
};

function RecipeLinkTag({ visible, onPress }: RecipeLinkTagProps) {
  const { theme } = useAppTheme();

  if (!visible) {
    return null;
  }

  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      <AppContainer
        align="center"
        backgroundColor="brandGreen"
        borderRadius="full"
        direction="row"
        paddingHorizontal="md"
        paddingVertical="sm"
        style={{ gap: theme.spacing.sm }}
      >
        <Bookmark color={theme.colors.textInverse} fill={theme.colors.textInverse} size={16} />
        <AppText color="textInverse" size="sm" style={{ fontWeight: theme.fontWeights.bold }}>
          Acessar receita
        </AppText>
      </AppContainer>
    </Pressable>
  );
}

export default RecipeLinkTag;
