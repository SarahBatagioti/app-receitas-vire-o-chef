export interface RecipeNutritionModel {
  id: string;
  recipeId: string;
  calories: number | null;
  proteins: number | null;
  carbohydrates: number | null;
  fats: number | null;
}
