export type MealType = 'breakfast' | 'lunch' | 'afternoonSnack' | 'dinner';

export interface MealEntryModel {
  id: string;
  userId: string;
  date: string;
  mealType: MealType;
  recipeId: string;
  quantity: number;
  caloriesSnapshot: number;
  createdAt: string;
  updatedAt: string;
}
