import {
  CommentAction,
  FeedAction,
  PublicationCommentsState,
  PublicationsFeedState,
} from './types';

function mergeById<T extends { id: string }>(currentItems: T[], nextItems: T[]): T[] {
  const mergedMap = new Map<string, T>();

  [...currentItems, ...nextItems].forEach((item) => {
    mergedMap.set(item.id, item);
  });

  return Array.from(mergedMap.values());
}

export const initialFeedState: PublicationsFeedState = {
  items: [],
  nextCursor: null,
  hasMore: true,
  isLoadingInitial: true,
  isRefreshing: false,
  isLoadingMore: false,
  errorMessage: null,
  searchValue: '',
  searchQuery: '',
};

export const initialCommentsState: PublicationCommentsState = {
  items: [],
  nextCursor: null,
  hasMore: true,
  isLoadingInitial: true,
  isLoadingMore: false,
  isSubmitting: false,
  errorMessage: null,
};

export function feedReducer(state: PublicationsFeedState, action: FeedAction): PublicationsFeedState {
  switch (action.type) {
    case 'SET_SEARCH_VALUE':
      return {
        ...state,
        searchValue: action.payload,
      };
    case 'APPLY_SEARCH_QUERY':
      return {
        ...state,
        searchQuery: action.payload,
        items: [],
        nextCursor: null,
        hasMore: true,
        isLoadingInitial: true,
        errorMessage: null,
      };
    case 'LOAD_INITIAL_START':
      return {
        ...state,
        isLoadingInitial: true,
        errorMessage: null,
      };
    case 'LOAD_INITIAL_SUCCESS':
      return {
        ...state,
        items: action.payload.items,
        nextCursor: action.payload.nextCursor,
        hasMore: action.payload.hasMore,
        isLoadingInitial: false,
        isRefreshing: false,
        isLoadingMore: false,
        errorMessage: null,
      };
    case 'LOAD_INITIAL_ERROR':
      return {
        ...state,
        items: [],
        nextCursor: null,
        hasMore: false,
        isLoadingInitial: false,
        isRefreshing: false,
        isLoadingMore: false,
        errorMessage: action.payload,
      };
    case 'REFRESH_START':
      return {
        ...state,
        isRefreshing: true,
        errorMessage: null,
      };
    case 'REFRESH_SUCCESS':
      return {
        ...state,
        items: action.payload.items,
        nextCursor: action.payload.nextCursor,
        hasMore: action.payload.hasMore,
        isLoadingInitial: false,
        isRefreshing: false,
        isLoadingMore: false,
        errorMessage: null,
      };
    case 'LOAD_MORE_START':
      return {
        ...state,
        isLoadingMore: true,
        errorMessage: null,
      };
    case 'LOAD_MORE_SUCCESS':
      return {
        ...state,
        items: mergeById(state.items, action.payload.items),
        nextCursor: action.payload.nextCursor,
        hasMore: action.payload.hasMore,
        isLoadingMore: false,
      };
    case 'LOAD_MORE_ERROR':
      return {
        ...state,
        isLoadingMore: false,
        errorMessage: action.payload,
      };
    case 'UPSERT_PUBLICATION': {
      const existingIndex = state.items.findIndex((item) => item.id === action.payload.id);

      if (existingIndex === -1) {
        return {
          ...state,
          items: [action.payload, ...state.items],
        };
      }

      const nextItems = [...state.items];
      nextItems[existingIndex] = action.payload;
      return {
        ...state,
        items: nextItems,
      };
    }
    case 'SYNC_PUBLICATION':
      return {
        ...state,
        items: state.items.map((item) => (item.id === action.payload.id ? action.payload : item)),
      };
    case 'REMOVE_PUBLICATION':
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };
    default:
      return state;
  }
}

export function commentsReducer(
  state: PublicationCommentsState,
  action: CommentAction,
): PublicationCommentsState {
  switch (action.type) {
    case 'LOAD_INITIAL_START':
      return {
        ...state,
        isLoadingInitial: true,
        errorMessage: null,
      };
    case 'LOAD_INITIAL_SUCCESS':
      return {
        ...state,
        items: action.payload.items,
        nextCursor: action.payload.nextCursor,
        hasMore: action.payload.hasMore,
        isLoadingInitial: false,
        isLoadingMore: false,
        errorMessage: null,
      };
    case 'LOAD_INITIAL_ERROR':
      return {
        ...state,
        items: [],
        nextCursor: null,
        hasMore: false,
        isLoadingInitial: false,
        isLoadingMore: false,
        errorMessage: action.payload,
      };
    case 'LOAD_MORE_START':
      return {
        ...state,
        isLoadingMore: true,
      };
    case 'LOAD_MORE_SUCCESS':
      return {
        ...state,
        items: mergeById(state.items, action.payload.items),
        nextCursor: action.payload.nextCursor,
        hasMore: action.payload.hasMore,
        isLoadingMore: false,
      };
    case 'LOAD_MORE_ERROR':
      return {
        ...state,
        isLoadingMore: false,
        errorMessage: action.payload,
      };
    case 'SUBMIT_START':
      return {
        ...state,
        isSubmitting: true,
        errorMessage: null,
      };
    case 'SUBMIT_SUCCESS':
      return {
        ...state,
        isSubmitting: false,
        items: [action.payload, ...state.items],
      };
    case 'SUBMIT_ERROR':
      return {
        ...state,
        isSubmitting: false,
        errorMessage: action.payload,
      };
    default:
      return state;
  }
}
