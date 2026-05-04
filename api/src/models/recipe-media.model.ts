export type RecipeMediaType = 'IMAGEM' | 'VIDEO';

export interface RecipeMediaModel {
  id: string;
  recipeId: string;
  url: string;
  type: RecipeMediaType;
  fileName: string | null;
  mimeType: string | null;
  size: number | null;
  order: number;
  createdAt: string;
}
