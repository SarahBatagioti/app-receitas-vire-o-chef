import React from 'react';
import { Image } from 'react-native';
import { UserRound } from 'lucide-react-native';
import { AppContainer, AppText } from '../../../components/ui';
import { useAppTheme } from '../../../contexts';
import { PublicationComment } from '../types';

type CommentListItemProps = {
  comment: PublicationComment;
};

function CommentListItem({ comment }: CommentListItemProps) {
  const { theme } = useAppTheme();

  return (
    <AppContainer
      align="center"
      backgroundColor="surface"
      borderRadius="3xl"
      direction="row"
      marginBottom="lg"
      padding="md"
      shadow="sm"
    >
      {comment.autor.avatarUrl ? (
        <Image
          source={{ uri: comment.autor.avatarUrl }}
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
      <AppContainer backgroundColor="surface" style={{ flex: 1 }}>
        <AppText color="text" size="xl" style={{ fontWeight: theme.fontWeights.bold }}>
          {comment.autor.nome}
        </AppText>
        <AppText color="text" size="lg" style={{ lineHeight: theme.fontSizes.lg * 1.4 }}>
          {comment.conteudo}
        </AppText>
      </AppContainer>
    </AppContainer>
  );
}

export default CommentListItem;
