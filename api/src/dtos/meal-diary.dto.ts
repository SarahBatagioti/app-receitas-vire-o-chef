import { MealType } from '../models/meal-entry.model';

export interface MealDiaryReplaceItemDto {
  recipeId: string;
  quantity: number;
}

export interface ReplaceMealDiaryMealDto {
  items: MealDiaryReplaceItemDto[];
}

export interface MealDiaryItemDto {
  id: string;
  recipeId: string;
  recipeName: string;
  recipeImageUrl: string | null;
  authorName: string;
  baseCalories: number;
  quantity: number;
  totalCalories: number;
}

export interface MealDiaryMealDto {
  type: MealType;
  totalCalories: number;
  items: MealDiaryItemDto[];
}

export interface MealDiaryDayDto {
  date: string;
  meals: MealDiaryMealDto[];
}
