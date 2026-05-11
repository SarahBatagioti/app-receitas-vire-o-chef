import React from 'react';
import { Pressable } from 'react-native';
import { AppContainer, AppText } from '../../../components/ui';
import { useAppTheme } from '../../../contexts';
import { PublicationFeedItem } from '../types';
import PublicationActionsRow from './PublicationActionsRow';
import PublicationHeader from './PublicationHeader';
import PublicationMedia from './PublicationMedia';
import PublicationOptionsMenu from './PublicationOptionsMenu';

type PublicationCardProps = {
  publication: PublicationFeedItem;
  isOwner: boolean;
  onPressLike: () => void;
  onPressComments: () => void;
  onPressShare: () => void;
  onPressRecipeLink?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

function PublicationCard({
  publication,
  isOwner,
  onPressLike,
  onPressComments,
  onPressShare,
  onPressRecipeLink,
  onEdit,
  onDelete,
}: PublicationCardProps) {
  const { theme } = useAppTheme();
  const [isMenuVisible, setIsMenuVisible] = React.useState(false);

  return (
    <>
      <AppContainer
        backgroundColor="surface"
        borderRadius="3xl"
        marginBottom="xl"
        padding="lg"
        shadow="md"
      >
        <AppContainer style={{ backgroundColor: 'transparent', marginBottom: theme.spacing.lg }}>
          <PublicationMedia uri={publication.mediaUrl} />
          <PublicationHeader
            author={publication.autor}
            canManage={isOwner}
            onPressOptions={() => setIsMenuVisible(true)}
          />
        </AppContainer>

        <PublicationActionsRow
          commentCount={publication.commentCount}
          hasRecipeLink={Boolean(publication.receita)}
          isLiked={publication.isLikedByRequester}
          likeCount={publication.likeCount}
          onPressComments={onPressComments}
          onPressLike={onPressLike}
          onPressRecipeLink={onPressRecipeLink}
          onPressShare={onPressShare}
          shareCount={publication.shareCount}
        />

        <Pressable accessibilityRole="button" onPress={onPressComments}>
          <AppContainer backgroundColor="surface" marginTop="lg">
            <AppText color="text" size="md" style={{ fontWeight: theme.fontWeights.bold }}>
              {publication.autor.nome}
            </AppText>
            <AppText color="text" size="md" style={{ lineHeight: theme.fontSizes.md * 1.55 }}>
              {' '}
              {publication.legenda || 'Sem legenda.'}
            </AppText>
          </AppContainer>
        </Pressable>
      </AppContainer>

      {isOwner && onEdit && onDelete ? (
        <PublicationOptionsMenu
          onClose={() => setIsMenuVisible(false)}
          onDelete={() => {
            setIsMenuVisible(false);
            onDelete();
          }}
          onEdit={() => {
            setIsMenuVisible(false);
            onEdit();
          }}
          visible={isMenuVisible}
        />
      ) : null}
    </>
  );
}

export default PublicationCard;
