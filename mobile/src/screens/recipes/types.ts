export type RecipeDifficulty = 'facil' | 'intermediario' | 'dificil';
export type RecipesRoute = 'home' | 'create' | 'detail';
export type RecipeStatus = 'published' | 'draft';
export type RecipeCreateMediaType = 'image' | 'video';

export type RecipeCreateFormValues = {
  title: string;
  prepMinutes: string;
  servings: string;
  difficulty: RecipeDifficulty;
  isCollaborative: boolean;
  selectedIngredients: RecipeCreateIngredient[];
  nutrition: RecipeCreateNutrition;
  preparationSteps: RecipeCreateStep[];
  media: RecipeCreateMedia[];
};

export type RecipeCreateValidationErrors = Partial<{
  title: string;
  prepMinutes: string;
  servings: string;
  selectedIngredients: string;
  preparationSteps: string;
  submit: string;
}>;

export type RecipeCreateIngredient = {
  id: string;
  name: string;
  unit?: string;
  quantity?: string;
};

export type RecipeCreateNutrition = {
  calories: string;
  proteins: string;
  carbohydrates: string;
  fats: string;
};

export type RecipeCreateStepAttachment = {
  fileName: string;
  mimeType: string;
  type: RecipeCreateMediaType;
  uri: string;
  fileSize?: number;
};

export type RecipeCreateStep = {
  id: string;
  description: string;
  attachment?: RecipeCreateStepAttachment;
};

export type RecipeCreateMedia = {
  id: string;
  type: RecipeCreateMediaType;
  fileName: string;
  mimeType: string;
  uri: string;
  fileSize?: number;
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
  isCollaborative?: boolean;
  status?: RecipeStatus;
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

export type RecipeDetailMedia = {
  id: string;
  type: RecipeCreateMediaType;
  url: string;
  fileName: string;
};

export type RecipeDetail = RecipeListItem & {
  reviewsCount: number;
  commentsCount: number;
  author: RecipeAuthor;
  nutrition: RecipeNutrition;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  media: RecipeDetailMedia[];
};

export type RecipesHomeCollections = {
  myPublications: RecipeListItem[];
  favoriteRecipes: RecipeListItem[];
  draftRecipes: RecipeListItem[];
};
