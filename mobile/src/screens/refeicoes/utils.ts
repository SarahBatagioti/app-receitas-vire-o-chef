import { MealDiaryDayRecord, MealDiaryRecordMeal, MealType } from '../../services/mealDiaryService';
import { RecipeRecord } from '../../services/recipeService';
import { MealDraftItem, MealRecipeListItem, WeekCalendarDay } from './types';

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'] as const;
const ORDERED_MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'afternoonSnack', 'dinner'];

export function getTodayLocalIsoDate(): string {
  return formatDateToIso(new Date());
}

export function formatDateToIso(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function parseIsoDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

export function addDaysToIsoDate(value: string, amount: number): string {
  const date = parseIsoDate(value);
  date.setDate(date.getDate() + amount);
  return formatDateToIso(date);
}

export function addWeeksToIsoDate(value: string, amount: number): string {
  return addDaysToIsoDate(value, amount * 7);
}

export function startOfWeekMonday(value: string): string {
  const date = parseIsoDate(value);
  const weekday = date.getDay();
  const daysFromMonday = weekday === 0 ? 6 : weekday - 1;
  date.setDate(date.getDate() - daysFromMonday);
  return formatDateToIso(date);
}

export function buildWeekCalendar(selectedDate: string, today = getTodayLocalIsoDate()): WeekCalendarDay[] {
  const startOfWeek = startOfWeekMonday(selectedDate);

  return Array.from({ length: 7 }, (_, index) => {
    const isoDate = addDaysToIsoDate(startOfWeek, index);
    const date = parseIsoDate(isoDate);

    return {
      isoDate,
      weekdayLabel: WEEKDAY_LABELS[date.getDay()],
      dayNumber: `${date.getDate()}`,
      isToday: isoDate === today,
      isSelected: isoDate === selectedDate,
    };
  });
}

export function createEmptyMealDiaryDay(date: string): MealDiaryDayRecord {
  return {
    date,
    meals: ORDERED_MEAL_TYPES.map((type) => ({
      type,
      totalCalories: 0,
      items: [],
    })),
  };
}

export function getMealByType(day: MealDiaryDayRecord, mealType: MealType): MealDiaryRecordMeal {
  return day.meals.find((meal) => meal.type === mealType) ?? {
    type: mealType,
    totalCalories: 0,
    items: [],
  };
}

export function replaceMealInDay(
  day: MealDiaryDayRecord,
  nextMeal: MealDiaryRecordMeal,
): MealDiaryDayRecord {
  return {
    ...day,
    meals: ORDERED_MEAL_TYPES.map((type) =>
      type === nextMeal.type ? nextMeal : getMealByType(day, type),
    ),
  };
}

export function mergeAndDeduplicateRecipes(
  myRecipes: RecipeRecord[],
  publicRecipes: RecipeRecord[],
): MealRecipeListItem[] {
  const deduplicatedRecipes = new Map<string, MealRecipeListItem>();

  [...myRecipes, ...publicRecipes].forEach((recipe) => {
    if (deduplicatedRecipes.has(recipe.id)) {
      return;
    }

    deduplicatedRecipes.set(recipe.id, {
      id: recipe.id,
      title: recipe.nome,
      imageUrl: recipe.midiaPrincipal?.url ?? recipe.midias[0]?.url ?? null,
      authorName: recipe.autorNome || recipe.autorUsername || 'Autor da receita',
      calories: recipe.informacaoNutricional?.calorias ?? 0,
      servings: recipe.rendimentoPorcoes ?? 1,
      rawRecipe: recipe,
    });
  });

  return Array.from(deduplicatedRecipes.values());
}

export function createDraftItemsFromMeal(meal: MealDiaryRecordMeal): MealDraftItem[] {
  return meal.items.map((item) => ({
    recipeId: item.recipeId,
    recipeName: item.recipeName,
    recipeImageUrl: item.recipeImageUrl,
    authorName: item.authorName,
    baseCalories: item.baseCalories,
    quantity: item.quantity,
  }));
}

export function upsertDraftItem(
  items: MealDraftItem[],
  recipe: MealRecipeListItem,
): MealDraftItem[] {
  const existingItem = items.find((item) => item.recipeId === recipe.id);

  if (existingItem) {
    return items.map((item) =>
      item.recipeId === recipe.id
        ? {
            ...item,
            quantity: roundToTwo(item.quantity + 0.5),
          }
        : item,
    );
  }

  return [
    ...items,
    {
      recipeId: recipe.id,
      recipeName: recipe.title,
      recipeImageUrl: recipe.imageUrl,
      authorName: recipe.authorName,
      baseCalories: recipe.calories,
      quantity: 1,
    },
  ];
}

export function updateDraftItemQuantity(
  items: MealDraftItem[],
  recipeId: string,
  quantity: number,
): MealDraftItem[] {
  if (quantity <= 0) {
    return items.filter((item) => item.recipeId !== recipeId);
  }

  return items.map((item) =>
    item.recipeId === recipeId
      ? {
          ...item,
          quantity: roundToTwo(quantity),
        }
      : item,
  );
}

export function calculateDraftMealTotal(items: MealDraftItem[]): number {
  return roundToTwo(items.reduce((sum, item) => sum + item.baseCalories * item.quantity, 0));
}

export function formatCalories(value: number): string {
  if (Number.isInteger(value)) {
    return `${value}`;
  }

  return value
    .toFixed(value * 10 === Math.trunc(value * 10) ? 1 : 2)
    .replace('.', ',');
}

export function formatQuantity(value: number): string {
  if (Number.isInteger(value)) {
    return `${value}x`;
  }

  return `${value.toFixed(value * 10 === Math.trunc(value * 10) ? 1 : 2).replace('.', ',')}x`;
}

export function formatServingsLabel(value: number): string {
  return `${value} ${value === 1 ? 'porção' : 'porções'}`;
}

function roundToTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

export { ORDERED_MEAL_TYPES };
