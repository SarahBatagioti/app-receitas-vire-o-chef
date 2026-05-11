import { buildServerUrl, api } from './api';
import {
  CursorPage,
  PublicationComment,
  PublicationCreateInput,
  PublicationFeedItem,
  PublicationUpdateInput,
} from '../screens/inicio/types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function readNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function readBoolean(value: unknown): boolean {
  return Boolean(value);
}

function extractDataPayload(payload: unknown, invalidMessage: string): unknown {
  if (!isRecord(payload)) {
    throw new Error(invalidMessage);
  }

  return payload.data ?? payload;
}

export function normalizePublicationFeedItem(payload: unknown): PublicationFeedItem {
  if (!isRecord(payload)) {
    throw new Error('Resposta invalida recebida ao ler publicacao.');
  }

  const autor = isRecord(payload.autor) ? payload.autor : null;
  const receita = isRecord(payload.receita) ? payload.receita : null;
  const id = readString(payload.id);
  const mediaUrl = readString(payload.mediaUrl);
  const authorId = autor ? readString(autor.id) : undefined;
  const authorName = autor ? readString(autor.nome) : undefined;
  const authorUsername = autor ? readString(autor.username) : undefined;
  const authorAvatarUrl = autor && typeof autor.avatarUrl !== 'undefined' ? readString(autor.avatarUrl) ?? null : null;

  if (!id || !mediaUrl || !authorId || !authorName || !authorUsername) {
    throw new Error('Resposta invalida recebida ao ler publicacao.');
  }

  return {
    id,
    legenda: readString(payload.legenda) ?? '',
    mediaUrl: /^https?:\/\//i.test(mediaUrl) ? mediaUrl : buildServerUrl(mediaUrl),
    mediaType: 'image',
    likeCount: readNumber(payload.likeCount),
    commentCount: readNumber(payload.commentCount),
    shareCount: readNumber(payload.shareCount),
    isLikedByRequester: readBoolean(payload.isLikedByRequester),
    createdAt: readString(payload.createdAt) ?? '',
    updatedAt: readString(payload.updatedAt) ?? '',
    autor: {
      id: authorId,
      nome: authorName,
      username: authorUsername,
      avatarUrl: authorAvatarUrl,
    },
    receita: receita
      ? {
          id: readString(receita.id) ?? '',
          nome: readString(receita.nome) ?? '',
        }
      : null,
  };
}

export function normalizePublicationComment(payload: unknown): PublicationComment {
  if (!isRecord(payload)) {
    throw new Error('Resposta invalida recebida ao ler comentario.');
  }

  const autor = isRecord(payload.autor) ? payload.autor : null;
  const id = readString(payload.id);
  const authorId = autor ? readString(autor.id) : undefined;
  const authorName = autor ? readString(autor.nome) : undefined;
  const authorUsername = autor ? readString(autor.username) : undefined;
  const authorAvatarUrl = autor && typeof autor.avatarUrl !== 'undefined' ? readString(autor.avatarUrl) ?? null : null;

  if (!id || !authorId || !authorName || !authorUsername) {
    throw new Error('Resposta invalida recebida ao ler comentario.');
  }

  return {
    id,
    conteudo: readString(payload.conteudo) ?? '',
    createdAt: readString(payload.createdAt) ?? '',
    updatedAt: readString(payload.updatedAt) ?? '',
    autor: {
      id: authorId,
      nome: authorName,
      username: authorUsername,
      avatarUrl: authorAvatarUrl,
    },
  };
}

export function normalizeCursorPage<T>(
  payload: unknown,
  itemMapper: (item: unknown) => T,
): CursorPage<T> {
  const data = extractDataPayload(payload, 'Resposta invalida recebida da API.');

  if (!isRecord(data) || !Array.isArray(data.items)) {
    throw new Error('Resposta invalida recebida da API.');
  }

  return {
    items: data.items.map(itemMapper),
    nextCursor: readString(data.nextCursor) ?? null,
    hasMore: readBoolean(data.hasMore),
  };
}

function toMultipartFormData(input: PublicationCreateInput): FormData {
  const formData = new FormData();
  formData.append('legenda', input.legenda);

  if (input.recipeId) {
    formData.append('recipeId', input.recipeId);
  }

  formData.append('arquivo', {
    uri: input.image.uri,
    name: input.image.fileName,
    type: input.image.mimeType,
  } as unknown as Blob);

  return formData;
}

class PublicationService {
  async listFeed(cursor?: string | null, username?: string): Promise<CursorPage<PublicationFeedItem>> {
    const params = new URLSearchParams();
    params.set('limit', '10');

    if (cursor) {
      params.set('cursor', cursor);
    }

    if (username?.trim()) {
      params.set('username', username.trim());
    }

    const response = await api.get<unknown>(`/publicacoes?${params.toString()}`, true);
    return normalizeCursorPage(response, normalizePublicationFeedItem);
  }

  async listMyPublications(): Promise<PublicationFeedItem[]> {
    const response = await api.get<unknown>('/publicacoes/minhas', true);
    const payload = extractDataPayload(response, 'Resposta invalida recebida ao listar suas publicacoes.');

    if (!Array.isArray(payload)) {
      throw new Error('Resposta invalida recebida ao listar suas publicacoes.');
    }

    return payload.map(normalizePublicationFeedItem);
  }

  async createPublication(input: PublicationCreateInput): Promise<PublicationFeedItem> {
    const response = await api.post<unknown, FormData>(
      '/publicacoes',
      toMultipartFormData(input),
      true,
    );
    return normalizePublicationFeedItem(extractDataPayload(response, 'Resposta invalida ao criar publicacao.'));
  }

  async updatePublication(publicationId: string, input: PublicationUpdateInput): Promise<PublicationFeedItem> {
    const response = await api.patch<unknown, PublicationUpdateInput>(
      `/publicacoes/${publicationId}`,
      input,
      true,
    );

    return normalizePublicationFeedItem(
      extractDataPayload(response, 'Resposta invalida ao atualizar publicacao.'),
    );
  }

  async deletePublication(publicationId: string): Promise<void> {
    await api.delete<unknown>(`/publicacoes/${publicationId}`, true);
  }

  async likePublication(publicationId: string): Promise<PublicationFeedItem> {
    const response = await api.post<unknown, Record<string, never>>(
      `/publicacoes/${publicationId}/curtidas`,
      {},
      true,
    );
    return normalizePublicationFeedItem(extractDataPayload(response, 'Resposta invalida ao curtir publicacao.'));
  }

  async unlikePublication(publicationId: string): Promise<PublicationFeedItem> {
    const response = await api.delete<unknown>(`/publicacoes/${publicationId}/curtidas`, true);
    return normalizePublicationFeedItem(
      extractDataPayload(response, 'Resposta invalida ao descurtir publicacao.'),
    );
  }

  async listComments(
    publicationId: string,
    cursor?: string | null,
  ): Promise<CursorPage<PublicationComment>> {
    const params = new URLSearchParams();
    params.set('limit', '10');

    if (cursor) {
      params.set('cursor', cursor);
    }

    const response = await api.get<unknown>(
      `/publicacoes/${publicationId}/comentarios?${params.toString()}`,
      true,
    );

    return normalizeCursorPage(response, normalizePublicationComment);
  }

  async createComment(publicationId: string, conteudo: string): Promise<PublicationComment> {
    const response = await api.post<unknown, { conteudo: string }>(
      `/publicacoes/${publicationId}/comentarios`,
      { conteudo },
      true,
    );
    return normalizePublicationComment(extractDataPayload(response, 'Resposta invalida ao comentar publicacao.'));
  }

  async registerShare(publicationId: string): Promise<PublicationFeedItem> {
    const response = await api.post<unknown, Record<string, never>>(
      `/publicacoes/${publicationId}/compartilhamentos`,
      {},
      true,
    );
    return normalizePublicationFeedItem(
      extractDataPayload(response, 'Resposta invalida ao compartilhar publicacao.'),
    );
  }
}

export const publicationService = new PublicationService();
