export type RecipeDifficulty = 'FACIL' | 'INTERMEDIARIO' | 'DIFICIL';

export type RecipeStatus = 'PUBLICADA' | 'RASCUNHO';

export interface RecipeModel {
  id: string;
  name: string;
  preparationTimeMinutes: number | null;
  yieldPortions: number | null;
  difficulty: RecipeDifficulty | null;
  isCollaborative: boolean;
  status: RecipeStatus;
  averageRating: number;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}
