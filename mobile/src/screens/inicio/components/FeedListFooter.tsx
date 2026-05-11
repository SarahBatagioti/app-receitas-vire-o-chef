import React from 'react';
import { ActivityIndicator } from 'react-native';
import { AppContainer, AppText } from '../../../components/ui';
import { useAppTheme } from '../../../contexts';

type FeedListFooterProps = {
  isLoadingMore: boolean;
  hasMore: boolean;
  itemCount?: number;
};

function FeedListFooter({
  isLoadingMore,
  hasMore,
  itemCount = 0,
}: FeedListFooterProps) {
  const { theme } = useAppTheme();

  if (isLoadingMore) {
    return (
      <AppContainer align="center" backgroundColor="background" padding="lg">
        <ActivityIndicator color={theme.colors.primary} />
      </AppContainer>
    );
  }

  if (!hasMore && itemCount > 0) {
    return (
      <AppContainer align="center" backgroundColor="background" padding="lg">
        <AppText color="textSecondary">Você chegou ao fim das publicações.</AppText>
      </AppContainer>
    );
  }

  return null;
}

export default FeedListFooter;
