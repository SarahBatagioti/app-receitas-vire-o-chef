import React from 'react';
import { AppContainer } from '../../../components/ui';
import { useAppTheme } from '../../../contexts';

function FeedSkeletonCard() {
  const { theme } = useAppTheme();

  return (
    <AppContainer
      backgroundColor="surface"
      borderRadius="3xl"
      marginBottom="xl"
      padding="lg"
      shadow="sm"
    >
      <AppContainer
        backgroundColor="surfaceSecondary"
        borderRadius="3xl"
        style={{ aspectRatio: 1.02, marginBottom: theme.spacing.lg }}
      />
      <AppContainer backgroundColor="surfaceSecondary" borderRadius="full" style={{ height: 18, width: '40%' }} />
      <AppContainer backgroundColor="surfaceSecondary" borderRadius="full" marginTop="sm" style={{ height: 14, width: '80%' }} />
    </AppContainer>
  );
}

export default FeedSkeletonCard;
