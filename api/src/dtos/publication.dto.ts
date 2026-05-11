import { PublicationMediaType } from '../models/publication.model';

export interface CursorPageDto<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface CreatePublicationDto {
  legenda?: string;
  recipeId?: string | null;
}

export interface UpdatePublicationDto {
  legenda?: string;
  recipeId?: string | null;
}

export interface CreatePublicationCommentDto {
  conteudo?: string;
}

export interface PublicationMediaUploadDto {
  arquivo: UploadedPublicationMediaFileDto;
  campos: Record<string, string[]>;
}

export interface UploadedPublicationMediaFileDto {
  fieldName: string;
  fileName: string;
  mimeType: string;
  size: number;
  absolutePath: string;
  publicUrl: string;
  inferredType: PublicationMediaType;
}

export interface PublicationFeedItemDto {
  id: string;
  legenda: string;
  mediaUrl: string;
  mediaType: PublicationMediaType;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isLikedByRequester: boolean;
  createdAt: string;
  updatedAt: string;
  autor: {
    id: string;
    nome: string;
    username: string;
    avatarUrl: string | null;
  };
  receita: {
    id: string;
    nome: string;
  } | null;
}

export interface PublicationCommentDto {
  id: string;
  conteudo: string;
  createdAt: string;
  updatedAt: string;
  autor: {
    id: string;
    nome: string;
    username: string;
    avatarUrl: string | null;
  };
}
