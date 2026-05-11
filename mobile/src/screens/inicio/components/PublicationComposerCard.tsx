import React from 'react';
import { Image, Pressable } from 'react-native';
import { UserRound } from 'lucide-react-native';
import { AppContainer, AppText } from '../../../components/ui';
import { useAppTheme } from '../../../contexts';

type PublicationComposerCardProps = {
  avatarUrl?: string | null;
  onPress: () => void;
};

function PublicationComposerCard({ avatarUrl, onPress }: PublicationComposerCardProps) {
  const { theme } = useAppTheme();

  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      <AppContainer
        align="center"
        backgroundColor="surface"
        borderRadius="3xl"
        direction="row"
        marginBottom="xl"
        padding="md"
        shadow="sm"
      >
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={{
              borderRadius: theme.borderRadius.full,
              height: theme.spacing['4xl'],
              marginRight: theme.spacing.sm,
              width: theme.spacing['4xl'],
            }}
          />
        ) : (
          <AppContainer
            align="center"
            backgroundColor="surfaceSecondary"
            borderRadius="full"
            justify="center"
            style={{
              height: theme.spacing['4xl'],
              marginRight: theme.spacing.sm,
              width: theme.spacing['4xl'],
            }}
          >
            <UserRound color={theme.colors.icon} size={theme.spacing.xl} />
          </AppContainer>
        )}
        <AppText color="textTertiary" size="md">
          Comece uma publicação
        </AppText>
      </AppContainer>
    </Pressable>
  );
}

export default PublicationComposerCard;
