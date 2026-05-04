export type RecipeDifficulty = 'facil' | 'intermediario' | 'dificil';
export type RecipesRoute = 'home' | 'create' | 'detail';

export type RecipeCreateFormValues = {
  title: string;
  prepMinutes: string;
  servings: string;
  difficulty: RecipeDifficulty;
  isCollaborative: boolean;
};

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

export type RecipeAuthor = {
  name: string;
  followers: number;
  avatarUrl: string;
};

export type RecipeNutrition = {
  calories: string;
  proteins: string;
  carbohydrates: string;
  fats: string;
};

export type RecipeIngredient = {
  id: string;
  name: string;
  quantity: string;
  imageUrl: string;
  checked?: boolean;
};

export type RecipeStep = {
  id: string;
  title: string;
  description: string;
  accentColor: 'brandGreen' | 'brandYellow' | 'brandOrange';
};

export type RecipeDetail = RecipeListItem & {
  reviewsCount: number;
  commentsCount: number;
  author: RecipeAuthor;
  nutrition: RecipeNutrition;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
};

export type RecipesHomeCollections = {
  myPublications: RecipeListItem[];
  favoriteRecipes: RecipeListItem[];
  draftRecipes: RecipeListItem[];
};
