import {
  commentsReducer,
  feedReducer,
  initialCommentsState,
  initialFeedState,
} from '../src/screens/inicio/publicationState';

const publication = {
  id: 'pub-1',
  legenda: 'Legenda',
  mediaUrl: 'https://example.com/image.jpg',
  mediaType: 'image' as const,
  likeCount: 2,
  commentCount: 1,
  shareCount: 0,
  isLikedByRequester: false,
  createdAt: '2026-05-10T12:00:00.000Z',
  updatedAt: '2026-05-10T12:00:00.000Z',
  autor: {
    id: 'user-1',
    nome: 'Sarah',
    username: 'sarah',
    avatarUrl: null,
  },
  receita: null,
};

describe('publication state reducers', () => {
  it('deduplicates feed items on load more', () => {
    const stateAfterInitial = feedReducer(initialFeedState, {
      type: 'LOAD_INITIAL_SUCCESS',
      payload: {
        items: [publication],
        nextCursor: 'cursor-1',
        hasMore: true,
      },
    });

    const stateAfterLoadMore = feedReducer(stateAfterInitial, {
      type: 'LOAD_MORE_SUCCESS',
      payload: {
        items: [publication],
        nextCursor: null,
        hasMore: false,
      },
    });

    expect(stateAfterLoadMore.items).toHaveLength(1);
    expect(stateAfterLoadMore.hasMore).toBe(false);
  });

  it('updates an existing publication optimistically', () => {
    const stateAfterInitial = feedReducer(initialFeedState, {
      type: 'LOAD_INITIAL_SUCCESS',
      payload: {
        items: [publication],
        nextCursor: null,
        hasMore: false,
      },
    });

    const updatedState = feedReducer(stateAfterInitial, {
      type: 'SYNC_PUBLICATION',
      payload: {
        ...publication,
        likeCount: 3,
        isLikedByRequester: true,
      },
    });

    expect(updatedState.items[0].likeCount).toBe(3);
    expect(updatedState.items[0].isLikedByRequester).toBe(true);
  });

  it('prepends comments after submit success', () => {
    const updatedState = commentsReducer(initialCommentsState, {
      type: 'SUBMIT_SUCCESS',
      payload: {
        id: 'comment-1',
        conteudo: 'Novo comentário',
        createdAt: '2026-05-10T12:00:00.000Z',
        updatedAt: '2026-05-10T12:00:00.000Z',
        autor: {
          id: 'user-1',
          nome: 'Sarah',
          username: 'sarah',
          avatarUrl: null,
        },
      },
    });

    expect(updatedState.items).toHaveLength(1);
    expect(updatedState.items[0].conteudo).toBe('Novo comentário');
  });
});
