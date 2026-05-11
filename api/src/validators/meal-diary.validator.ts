import { NextFunction, Request, Response } from 'express';
import {
  MealDiaryReplaceItemDto,
  ReplaceMealDiaryMealDto,
} from '../dtos/meal-diary.dto';
import { MealType } from '../models/meal-entry.model';
import { buildErrorResponse } from '../utils/api-response';
import { AppError } from '../utils/app-error';

const SUPPORTED_MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'afternoonSnack', 'dinner'];

export function validateMealDiaryDateQuery(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const rawDate = request.query.date;

  if (typeof rawDate !== 'string' || !rawDate.trim()) {
    return response
      .status(422)
      .json(buildErrorResponse('Data invalida.', ['Informe uma data valida no formato YYYY-MM-DD.']));
  }

  if (!isValidIsoDate(rawDate.trim())) {
    return response
      .status(422)
      .json(buildErrorResponse('Data invalida.', ['A data deve seguir o formato YYYY-MM-DD.']));
  }

  request.query.date = rawDate.trim();
  return next();
}

export function validateMealTypeParam(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const { mealType } = request.params;

  if (typeof mealType !== 'string' || !SUPPORTED_MEAL_TYPES.includes(mealType as MealType)) {
    return response.status(422).json(
      buildErrorResponse('Tipo de refeicao invalido.', [
        'Informe um tipo de refeicao valido.',
      ]),
    );
  }

  request.params.mealType = mealType.trim();
  return next();
}

export function validateReplaceMealDiaryMealRequest(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    request.body = validateReplaceMealDiaryMealDto(request.body as Partial<ReplaceMealDiaryMealDto>);
    return next();
  } catch (error) {
    if (error instanceof AppError) {
      return response
        .status(error.statusCode)
        .json(buildErrorResponse(error.message, error.details));
    }

    return next(error);
  }
}

export function validateReplaceMealDiaryMealDto(
  input: Partial<ReplaceMealDiaryMealDto>,
): ReplaceMealDiaryMealDto {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new AppError('Dados da refeicao invalidos.', 422, [
      'O corpo da requisicao deve ser um objeto JSON valido.',
    ]);
  }

  if (!Array.isArray(input.items)) {
    throw new AppError('Dados da refeicao invalidos.', 422, [
      'A lista de itens da refeicao e obrigatoria.',
    ]);
  }

  const errors: string[] = [];
  const seenRecipeIds = new Set<string>();
  const items = input.items.reduce<MealDiaryReplaceItemDto[]>((accumulator, item, index) => {
    const recipeId = typeof item?.recipeId === 'string' ? item.recipeId.trim() : '';
    const quantity = typeof item?.quantity === 'number' ? item.quantity : Number.NaN;

    if (!recipeId) {
      errors.push(`Item ${index + 1}: recipeId e obrigatorio.`);
      return accumulator;
    }

    if (seenRecipeIds.has(recipeId)) {
      errors.push(`Item ${index + 1}: recipeId duplicado na mesma refeicao.`);
      return accumulator;
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      errors.push(`Item ${index + 1}: quantity deve ser um numero positivo.`);
      return accumulator;
    }

    seenRecipeIds.add(recipeId);
    accumulator.push({
      recipeId,
      quantity: roundToTwo(quantity),
    });

    return accumulator;
  }, []);

  if (errors.length > 0) {
    throw new AppError('Dados da refeicao invalidos.', 422, errors);
  }

  return { items };
}

function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [yearRaw, monthRaw, dayRaw] = value.split('-');
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function roundToTwo(value: number): number {
  return Math.round(value * 100) / 100;
}
