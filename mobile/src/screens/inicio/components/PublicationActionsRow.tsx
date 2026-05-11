import React from 'react';
import { Pressable } from 'react-native';
import { Heart, MessageCircle } from 'lucide-react-native';
import { AppContainer, AppText } from '../../../components/ui';
import { useAppTheme } from '../../../contexts';
import RecipeLinkTag from './RecipeLinkTag';

type PublicationActionsRowProps = {
  isLiked: boolean;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  hasRecipeLink: boolean;
  onPressLike: () => void;
  onPressComments: () => void;
  onPressShare: () => void;
  onPressRecipeLink?: () => void;
};

function ActionButton({
  icon,
  value,
  onPress,
}: {
  icon: React.ReactNode;
  value: string;
  onPress: () => void;
}) {
  const { theme } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={{ alignItems: 'center', flexDirection: 'row', marginRight: theme.spacing.md }}
    >
      {icon}
      <AppText color="text" size="sm" style={{ fontWeight: theme.fontWeights.semibold, marginLeft: theme.spacing.xs }}>
        {value}
      </AppText>
    </Pressable>
  );
}

function formatCompactCount(value: number): string {
  if (value >= 1000) {
    return `${Math.round(value / 100) / 10} mil`;
  }

  return String(value);
}

function PublicationActionsRow({
  isLiked,
  likeCount,
  commentCount,
  shareCount,
  hasRecipeLink,
  onPressLike,
  onPressComments,
  onPressShare,
  onPressRecipeLink,
}: PublicationActionsRowProps) {
  const { theme } = useAppTheme();

  return (
    <AppContainer
      align="center"
      backgroundColor="surface"
      direction="row"
      justify="space-between"
      marginTop="lg"
      style={{ gap: theme.spacing.md }}
    >
      <AppContainer backgroundColor="surface" direction="row" style={{ flex: 1 }}>
        <ActionButton
          icon={
            <Heart
              color={isLiked ? theme.colors.primary : theme.colors.text}
              fill={isLiked ? theme.colors.primary : 'transparent'}
              size={theme.spacing.xl}
            />
          }
          onPress={onPressLike}
          value={formatCompactCount(likeCount)}
        />
        <ActionButton
          icon={<MessageCircle color={theme.colors.text} size={theme.spacing.xl} />}
          onPress={onPressComments}
          value={formatCompactCount(commentCount)}
        />
        {/* <ActionButton
          icon={<Send color={theme.colors.text} size={theme.spacing.xl} />}
          onPress={onPressShare}
          value={formatCompactCount(shareCount)}
        /> */}
      </AppContainer>
      <RecipeLinkTag visible={hasRecipeLink} onPress={onPressRecipeLink} />
    </AppContainer>
  );
}

export default PublicationActionsRow;
