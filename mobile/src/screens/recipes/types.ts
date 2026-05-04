export type RecipeDifficulty = 'facil' | 'intermediario' | 'dificil';

export type RecipeListItem = {
  id: string;
  title: string;
  imageUrl: string;
  difficulty: RecipeDifficulty;
  prepMinutes: number;
  rating: number;
  servings: number;
  isFavorite?: boolean;
};

export type RecipesHomeCollections = {
  myPublications: RecipeListItem[];
  favoriteRecipes: RecipeListItem[];
  draftRecipes: RecipeListItem[];
};
