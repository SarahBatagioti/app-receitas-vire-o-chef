jest.mock('react-native-config', () => ({
  API_BASE_URL: 'http://localhost:3000/api',
}));

import {
  normalizeCursorPage,
  normalizePublicationComment,
  normalizePublicationFeedItem,
} from '../src/services/publicationService';

describe('publicationService normalizers', () => {
  it('normalizes publication feed items', () => {
    const publication = normalizePublicationFeedItem({
      id: 'pub-1',
      legenda: 'Legenda da receita',
      mediaUrl: '/uploads/publicacoes/pub-1/foto.jpg',
      likeCount: 4,
      commentCount: 2,
      shareCount: 1,
      isLikedByRequester: true,
      createdAt: '2026-05-10T12:00:00.000Z',
      updatedAt: '2026-05-10T12:05:00.000Z',
      autor: {
        id: 'user-1',
        nome: 'Sarah',
        username: 'sarah',
        avatarUrl: null,
      },
      receita: {
        id: 'recipe-1',
        nome: 'Bife acebolado',
      },
    });

    expect(publication.id).toBe('pub-1');
    expect(publication.autor.username).toBe('sarah');
    expect(publication.receita?.id).toBe('recipe-1');
    expect(publication.isLikedByRequester).toBe(true);
    expect(publication.mediaUrl).toContain('/uploads/publicacoes/pub-1/foto.jpg');
  });

  it('normalizes comment items', () => {
    const comment = normalizePublicationComment({
      id: 'comment-1',
      conteudo: 'Receita perfeita',
      createdAt: '2026-05-10T12:00:00.000Z',
      updatedAt: '2026-05-10T12:00:00.000Z',
      autor: {
        id: 'user-2',
        nome: 'Aline',
        username: 'aline',
        avatarUrl: null,
      },
    });

    expect(comment.id).toBe('comment-1');
    expect(comment.autor.nome).toBe('Aline');
  });

  it('normalizes cursor page payloads', () => {
    const page = normalizeCursorPage(
      {
        data: {
          items: [
            {
              id: 'pub-1',
              legenda: '',
              mediaUrl: '/uploads/publicacoes/pub-1/foto.jpg',
              likeCount: 0,
              commentCount: 0,
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
            },
          ],
          nextCursor: 'cursor-1',
          hasMore: true,
        },
      },
      normalizePublicationFeedItem,
    );

    expect(page.items).toHaveLength(1);
    expect(page.nextCursor).toBe('cursor-1');
    expect(page.hasMore).toBe(true);
  });
});
