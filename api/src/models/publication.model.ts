export type PublicationMediaType = 'IMAGEM';

export interface PublicationModel {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatarUrl: string | null;
  recipeId: string | null;
  recipeName: string | null;
  caption: string;
  mediaUrl: string;
  mediaType: PublicationMediaType;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isLikedByRequester: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublicationCommentModel {
  id: string;
  publicationId: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatarUrl: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
}
