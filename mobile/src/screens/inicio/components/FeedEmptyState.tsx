import React from 'react';
import { AppContainer, AppText } from '../../../components/ui';
import { useAppTheme } from '../../../contexts';

type FeedEmptyStateProps = {
  message?: string | null;
};

function FeedEmptyState({ message }: FeedEmptyStateProps) {
  const { theme } = useAppTheme();

  return (
    <AppContainer align="center" backgroundColor="background" padding="xl">
      <AppText
        color="text"
        size="xl"
        style={{ fontWeight: theme.fontWeights.bold, textAlign: 'center' }}
      >
        Nenhuma publicação encontrada
      </AppText>
      {message ? (
        <AppText
          color="textSecondary"
          size="md"
          style={{ marginTop: theme.spacing.sm, textAlign: 'center' }}
        >
          {message}
        </AppText>
      ) : null}
    </AppContainer>
  );
}

export default FeedEmptyState;
