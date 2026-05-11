import { ImageSourcePropType } from 'react-native';
import { MealDiaryRecordItem, MealType } from '../../services/mealDiaryService';
import { RecipeRecord } from '../../services/recipeService';

export type MealsRoute = 'home' | 'search';

export interface MealUiConfig {
  type: MealType;
  label: string;
  color: string;
  imageSource: ImageSourcePropType;
}

export interface WeekCalendarDay {
  isoDate: string;
  weekdayLabel: string;
  dayNumber: string;
  isToday: boolean;
  isSelected: boolean;
}

export interface MealRecipeListItem {
  id: string;
  title: string;
  imageUrl: string | null;
  authorName: string;
  calories: number;
  servings: number;
  rawRecipe: RecipeRecord;
}

export interface MealDraftItem {
  recipeId: string;
  recipeName: string;
  recipeImageUrl: string | null;
  authorName: string;
  baseCalories: number;
  quantity: number;
}

export interface MealDraftSummary extends MealDiaryRecordItem {
  isPersisted: boolean;
}
