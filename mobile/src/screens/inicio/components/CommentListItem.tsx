import React from 'react';
import { UserRound } from 'lucide-react-native';
import { AppContainer, AppText } from '../../../components/ui';
import { useAppTheme } from '../../../contexts';
import { PublicationComment } from '../types';

type CommentListItemProps = {
  comment: PublicationComment;
};

function CommentListItem({ comment }: CommentListItemProps) {
  const { theme } = useAppTheme();
  const authorInitial = React.useMemo(() => {
    const normalizedName = comment.autor.nome.trim();

    return normalizedName ? normalizedName.charAt(0).toUpperCase() : '?';
  }, [comment.autor.nome]);

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
      <AppContainer
        align="center"
        backgroundColor="primary"
        borderRadius="full"
        justify="center"
        style={{
          height: theme.spacing['5xl'],
          marginRight: theme.spacing.md,
          width: theme.spacing['5xl'],
        }}
      >
        {authorInitial === '?' ? (
          <UserRound color={theme.colors.textInverse} size={theme.spacing['2xl']} />
        ) : (
          <AppText color="textInverse" size="xl" style={{ fontWeight: theme.fontWeights.bold }}>
            {authorInitial}
          </AppText>
        )}
      </AppContainer>
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
