import { buildServerUrl, api } from './api';

export type MealType = 'breakfast' | 'lunch' | 'afternoonSnack' | 'dinner';

export interface MealDiaryReplaceItemPayload {
  recipeId: string;
  quantity: number;
}

export interface MealDiaryRecordItem {
  id: string;
  recipeId: string;
  recipeName: string;
  recipeImageUrl: string | null;
  authorName: string;
  baseCalories: number;
  quantity: number;
  totalCalories: number;
}

export interface MealDiaryRecordMeal {
  type: MealType;
  totalCalories: number;
  items: MealDiaryRecordItem[];
}

export interface MealDiaryDayRecord {
  date: string;
  meals: MealDiaryRecordMeal[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function readNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function extractDataPayload(
  payload: unknown,
  invalidResponseMessage = 'Resposta invalida recebida da API.',
): unknown {
  if (!isRecord(payload)) {
    throw new Error(invalidResponseMessage);
  }

  return payload.data ?? payload;
}

function normalizeMealType(value: unknown): MealType | null {
  return value === 'breakfast' ||
    value === 'lunch' ||
    value === 'afternoonSnack' ||
    value === 'dinner'
    ? value
    : null;
}

function resolveImageUrl(value: string | null): string | null {
  if (!value) {
    return null;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return buildServerUrl(value.startsWith('/') ? value : `/${value}`);
}

function normalizeMealItem(payload: unknown): MealDiaryRecordItem | null {
  if (!isRecord(payload)) {
    return null;
  }

  const id = readString(payload.id);
  const recipeId = readString(payload.recipeId);
  const recipeName = readString(payload.recipeName);
  const authorName = readString(payload.authorName);
  const baseCalories = readNumber(payload.baseCalories);
  const quantity = readNumber(payload.quantity);
  const totalCalories = readNumber(payload.totalCalories);

  if (!id || !recipeId || !recipeName || !authorName || baseCalories === null || quantity === null || totalCalories === null) {
    return null;
  }

  return {
    id,
    recipeId,
    recipeName,
    recipeImageUrl: resolveImageUrl(readString(payload.recipeImageUrl) ?? null),
    authorName,
    baseCalories,
    quantity,
    totalCalories,
  };
}

function normalizeMeal(payload: unknown): MealDiaryRecordMeal | null {
  if (!isRecord(payload)) {
    return null;
  }

  const type = normalizeMealType(payload.type);
  const totalCalories = readNumber(payload.totalCalories);

  if (!type || totalCalories === null) {
    return null;
  }

  const items = Array.isArray(payload.items)
    ? payload.items.map(normalizeMealItem).filter((item): item is MealDiaryRecordItem => Boolean(item))
    : [];

  return {
    type,
    totalCalories,
    items,
  };
}

function normalizeMealDiaryDay(
  payload: unknown,
  invalidResponseMessage = 'Resposta invalida recebida do diario de refeicoes.',
): MealDiaryDayRecord {
  const extractedPayload = extractDataPayload(payload, invalidResponseMessage);

  if (!isRecord(extractedPayload)) {
    throw new Error(invalidResponseMessage);
  }

  const date = readString(extractedPayload.date);

  if (!date || !Array.isArray(extractedPayload.meals)) {
    throw new Error(invalidResponseMessage);
  }

  const meals = extractedPayload.meals
    .map(normalizeMeal)
    .filter((meal): meal is MealDiaryRecordMeal => Boolean(meal));

  return {
    date,
    meals,
  };
}

class MealDiaryService {
  async getDiaryByDate(date: string): Promise<MealDiaryDayRecord> {
    const response = await api.get<unknown>(`/refeicoes?date=${encodeURIComponent(date)}`, true);
    return normalizeMealDiaryDay(response);
  }

  async replaceMeal(
    date: string,
    mealType: MealType,
    items: MealDiaryReplaceItemPayload[],
  ): Promise<MealDiaryRecordMeal> {
    const response = await api.put<unknown, { items: MealDiaryReplaceItemPayload[] }>(
      `/refeicoes/${mealType}?date=${encodeURIComponent(date)}`,
      { items },
      true,
    );

    const normalizedMeal = normalizeMeal(
      extractDataPayload(response, 'Resposta invalida recebida ao salvar refeicao.'),
    );

    if (!normalizedMeal) {
      throw new Error('Resposta invalida recebida ao salvar refeicao.');
    }

    return normalizedMeal;
  }
}

export const mealDiaryService = new MealDiaryService();
