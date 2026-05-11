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
        padding="lg"
        shadow="sm"
      >
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={{
              borderRadius: theme.borderRadius.full,
              height: theme.spacing['5xl'],
              marginRight: theme.spacing.md,
              width: theme.spacing['5xl'],
            }}
          />
        ) : (
          <AppContainer
            align="center"
            backgroundColor="surfaceSecondary"
            borderRadius="full"
            justify="center"
            style={{
              height: theme.spacing['5xl'],
              marginRight: theme.spacing.md,
              width: theme.spacing['5xl'],
            }}
          >
            <UserRound color={theme.colors.icon} size={theme.spacing['2xl']} />
          </AppContainer>
        )}
        <AppText color="textTertiary" size="xl">
          Comece uma publicação
        </AppText>
      </AppContainer>
    </Pressable>
  );
}

export default PublicationComposerCard;
