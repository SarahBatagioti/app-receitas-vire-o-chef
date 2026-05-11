import React from 'react';
import { ActivityIndicator, FlatList } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { AppContainer, AppText } from '../../../components/ui';
import { useAppTheme } from '../../../contexts';
import { PublicationComment } from '../types';
import CommentComposer from './CommentComposer';
import CommentListItem from './CommentListItem';
import FeedListFooter from './FeedListFooter';

type CommentsScreenProps = {
  avatarUrl?: string | null;
  comments: PublicationComment[];
  value: string;
  onChangeText: (value: string) => void;
  onBack: () => void;
  onSubmit: () => void;
  onLoadMore: () => void;
  isSubmitting?: boolean;
  isLoadingInitial?: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  errorMessage?: string | null;
};

function CommentsScreen({
  avatarUrl,
  comments,
  value,
  onChangeText,
  onBack,
  onSubmit,
  onLoadMore,
  isSubmitting = false,
  isLoadingInitial = false,
  isLoadingMore = false,
  hasMore = false,
  errorMessage,
}: CommentsScreenProps) {
  const { theme } = useAppTheme();

  return (
    <AppContainer flex backgroundColor="background">
      <AppContainer
        align="center"
        backgroundColor="background"
        direction="row"
        marginBottom="xl"
        style={{ minHeight: theme.spacing['5xl'] }}
      >
        <ChevronLeft color={theme.colors.primary} size={theme.spacing['3xl']} onPress={onBack} />
        <AppText color="text" size="2xl" style={{ fontWeight: theme.fontWeights.bold, marginLeft: theme.spacing.md }}>
          Comentários
        </AppText>
      </AppContainer>

      <CommentComposer
        avatarUrl={avatarUrl}
        disabled={isSubmitting}
        onChangeText={onChangeText}
        onSubmit={onSubmit}
        value={value}
      />

      {isLoadingInitial ? (
        <AppContainer align="center" backgroundColor="background" flex justify="center">
          <ActivityIndicator color={theme.colors.primary} />
        </AppContainer>
      ) : (
        <FlatList
          contentContainerStyle={{ paddingBottom: theme.spacing['7xl'] }}
          data={comments}
          keyExtractor={(item) => item.id}
          onEndReached={() => {
            if (!isLoadingMore && hasMore) {
              onLoadMore();
            }
          }}
          onEndReachedThreshold={0.4}
          renderItem={({ item }) => <CommentListItem comment={item} />}
          ListFooterComponent={<FeedListFooter hasMore={hasMore} isLoadingMore={isLoadingMore} />}
          ListEmptyComponent={
            errorMessage ? (
              <AppText color="error">{errorMessage}</AppText>
            ) : (
              <AppText color="textSecondary">Ainda não há comentários nesta publicação.</AppText>
            )
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </AppContainer>
  );
}

export default CommentsScreen;
