import { Request, Response } from 'express';
import { ReplaceMealDiaryMealDto } from '../dtos/meal-diary.dto';
import { MealType } from '../models/meal-entry.model';
import { MealDiaryService } from '../services/meal-diary.service';
import { buildSuccessResponse } from '../utils/api-response';
import { AppError } from '../utils/app-error';

const mealDiaryService = new MealDiaryService();

export class MealDiaryController {
  async getByDate(request: Request, response: Response) {
    const authUser = getAuthenticatedUser(request);
    const date = getDateQuery(request);
    const diary = await mealDiaryService.listarDiarioPorData(date, authUser.id);

    return response.status(200).json(buildSuccessResponse(diary));
  }

  async replaceMeal(request: Request, response: Response) {
    const authUser = getAuthenticatedUser(request);
    const date = getDateQuery(request);
    const mealType = getMealType(request);
    const payload = request.body as ReplaceMealDiaryMealDto;
    const meal = await mealDiaryService.substituirRefeicao(date, mealType, payload, authUser.id);

    return response.status(200).json(buildSuccessResponse(meal));
  }
}

function getAuthenticatedUser(request: Request) {
  if (!request.authUser) {
    throw new AppError('Token de autenticacao invalido.', 401);
  }

  return request.authUser;
}

function getDateQuery(request: Request): string {
  const rawDate = request.query.date;

  if (typeof rawDate !== 'string' || !rawDate.trim()) {
    throw new AppError('Data invalida.', 422, ['Informe uma data valida no formato YYYY-MM-DD.']);
  }

  return rawDate.trim();
}

function getMealType(request: Request): MealType {
  const { mealType } = request.params;

  if (
    mealType !== 'breakfast' &&
    mealType !== 'lunch' &&
    mealType !== 'afternoonSnack' &&
    mealType !== 'dinner'
  ) {
    throw new AppError('Tipo de refeicao invalido.', 422);
  }

  return mealType;
}
