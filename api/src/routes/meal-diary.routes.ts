import { Router } from 'express';
import { MealDiaryController } from '../controllers/meal-diary.controller';
import { authenticateJwt } from '../middlewares/auth.middleware';
import {
  validateMealDiaryDateQuery,
  validateMealTypeParam,
  validateReplaceMealDiaryMealRequest,
} from '../validators/meal-diary.validator';

const mealDiaryRoutes = Router();
const mealDiaryController = new MealDiaryController();

mealDiaryRoutes.use(authenticateJwt);

mealDiaryRoutes.get('/', validateMealDiaryDateQuery, (request, response, next) =>
  mealDiaryController.getByDate(request, response).catch(next),
);

mealDiaryRoutes.put(
  '/:mealType',
  validateMealTypeParam,
  validateMealDiaryDateQuery,
  validateReplaceMealDiaryMealRequest,
  (request, response, next) => mealDiaryController.replaceMeal(request, response).catch(next),
);

export { mealDiaryRoutes };
