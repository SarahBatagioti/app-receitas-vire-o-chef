import { RecipeDetail, RecipeListItem } from '../recipes';

export type InicioRoute = 'feed' | 'comments' | 'composer' | 'recipe-detail';

export type CursorPage<T> = {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type PublicationAuthor = {
  id: string;
  nome: string;
  username: string;
  avatarUrl: string | null;
};

export type PublicationRecipeLink = {
  id: string;
  nome: string;
};

export type PublicationFeedItem = {
  id: string;
  legenda: string;
  mediaUrl: string;
  mediaType: 'image';
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isLikedByRequester: boolean;
  createdAt: string;
  updatedAt: string;
  autor: PublicationAuthor;
  receita: PublicationRecipeLink | null;
};

export type PublicationComment = {
  id: string;
  conteudo: string;
  createdAt: string;
  updatedAt: string;
  autor: PublicationAuthor;
};

export type PublicationCreateInput = {
  legenda: string;
  recipeId: string | null;
  image: {
    uri: string;
    fileName: string;
    mimeType: string;
  };
};

export type PublicationUpdateInput = {
  legenda: string;
  recipeId: string | null;
};

export type PublicationComposerValues = {
  legenda: string;
  recipeId: string | null;
  imageUri: string | null;
  imageFileName: string | null;
  imageMimeType: string | null;
};

export type PublicationsFeedState = {
  items: PublicationFeedItem[];
  nextCursor: string | null;
  hasMore: boolean;
  isLoadingInitial: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  errorMessage: string | null;
  searchValue: string;
  searchQuery: string;
};

export type PublicationCommentsState = {
  items: PublicationComment[];
  nextCursor: string | null;
  hasMore: boolean;
  isLoadingInitial: boolean;
  isLoadingMore: boolean;
  isSubmitting: boolean;
  errorMessage: string | null;
};

export type FeedAction =
  | { type: 'SET_SEARCH_VALUE'; payload: string }
  | { type: 'APPLY_SEARCH_QUERY'; payload: string }
  | { type: 'LOAD_INITIAL_START' }
  | { type: 'LOAD_INITIAL_SUCCESS'; payload: CursorPage<PublicationFeedItem> }
  | { type: 'LOAD_INITIAL_ERROR'; payload: string }
  | { type: 'REFRESH_START' }
  | { type: 'REFRESH_SUCCESS'; payload: CursorPage<PublicationFeedItem> }
  | { type: 'LOAD_MORE_START' }
  | { type: 'LOAD_MORE_SUCCESS'; payload: CursorPage<PublicationFeedItem> }
  | { type: 'LOAD_MORE_ERROR'; payload: string }
  | { type: 'UPSERT_PUBLICATION'; payload: PublicationFeedItem }
  | { type: 'REMOVE_PUBLICATION'; payload: string }
  | { type: 'SYNC_PUBLICATION'; payload: PublicationFeedItem };

export type CommentAction =
  | { type: 'LOAD_INITIAL_START' }
  | { type: 'LOAD_INITIAL_SUCCESS'; payload: CursorPage<PublicationComment> }
  | { type: 'LOAD_INITIAL_ERROR'; payload: string }
  | { type: 'LOAD_MORE_START' }
  | { type: 'LOAD_MORE_SUCCESS'; payload: CursorPage<PublicationComment> }
  | { type: 'LOAD_MORE_ERROR'; payload: string }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_SUCCESS'; payload: PublicationComment }
  | { type: 'SUBMIT_ERROR'; payload: string };

export type InicioFlowProps = {
  onOpenRecipesScreen?: () => void;
};

export type PublicationRecipeOption = Pick<RecipeListItem, 'id' | 'title'>;

export type PublicationRecipeDetailRoute = {
  publication: PublicationFeedItem;
  recipe: RecipeDetail | null;
  isLoading: boolean;
  errorMessage: string | null;
};
