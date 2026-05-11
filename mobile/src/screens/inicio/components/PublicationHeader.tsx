import React from 'react';
import { Image, Pressable } from 'react-native';
import { EllipsisVertical, UserRound } from 'lucide-react-native';
import { AppContainer, AppText } from '../../../components/ui';
import { useAppTheme } from '../../../contexts';
import { PublicationAuthor } from '../types';

type PublicationHeaderProps = {
  author: PublicationAuthor;
  canManage: boolean;
  onPressOptions?: () => void;
};

function PublicationHeader({ author, canManage, onPressOptions }: PublicationHeaderProps) {
  const { theme } = useAppTheme();

  return (
    <AppContainer
      align="center"
      backgroundColor="surface"
      direction="row"
      justify="space-between"
      style={{
        left: theme.spacing.lg,
        position: 'absolute',
        top: theme.spacing.lg,
        zIndex: 2,
      }}
    >
      <AppContainer
        align="center"
        backgroundColor="surface"
        borderRadius="full"
        direction="row"
        paddingHorizontal="md"
        paddingVertical="md"
        shadow="md"
        style={{ maxWidth: '78%' }}
      >
        {author.avatarUrl ? (
          <Image
            source={{ uri: author.avatarUrl }}
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
        <AppText
          color="text"
          numberOfLines={1}
          size="xl"
          style={{ flexShrink: 1, fontWeight: theme.fontWeights.bold }}
        >
          {author.nome}
        </AppText>
      </AppContainer>

      {canManage ? (
        <Pressable
          accessibilityLabel="Abrir opções da publicação"
          onPress={onPressOptions}
          style={{
            alignItems: 'center',
            backgroundColor: theme.colors.surface,
            borderRadius: theme.borderRadius.full,
            height: theme.spacing['5xl'],
            justifyContent: 'center',
            marginLeft: theme.spacing.md,
            width: theme.spacing['5xl'],
            ...theme.shadows.sm,
          }}
        >
          <EllipsisVertical color={theme.colors.text} size={theme.spacing['2xl']} />
        </Pressable>
      ) : null}
    </AppContainer>
  );
}

export default PublicationHeader;
