export interface RecipeIngredientModel {
  id: string;
  recipeId: string;
  name: string;
  quantity: string | null;
  unit: string | null;
}
