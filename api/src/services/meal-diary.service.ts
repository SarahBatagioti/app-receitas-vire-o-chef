import { database } from '../config/database';
import {
  MealDiaryDayDto,
  MealDiaryMealDto,
  ReplaceMealDiaryMealDto,
} from '../dtos/meal-diary.dto';
import { MealType } from '../models/meal-entry.model';
import {
  MealDiaryEntryAggregate,
  MealDiaryRepository,
  ORDERED_MEAL_TYPES,
} from '../repositories/meal-diary.repository';
import { RecipeRepository } from '../repositories/recipe.repository';
import { UserRepository } from '../repositories/user.repository';
import { AppError } from '../utils/app-error';

const userRepository = new UserRepository();
const recipeRepository = new RecipeRepository();
const mealDiaryRepository = new MealDiaryRepository();

export class MealDiaryService {
  async listarDiarioPorData(date: string, userId: string): Promise<MealDiaryDayDto> {
    await this.ensureInfrastructure();
    await this.ensureUserExists(userId);

    const entries = await mealDiaryRepository.listEntriesByUserAndDate(userId, date);

    return {
      date,
      meals: ORDERED_MEAL_TYPES.map((mealType) => buildMealDto(mealType, entries)),
    };
  }

  async substituirRefeicao(
    date: string,
    mealType: MealType,
    dto: ReplaceMealDiaryMealDto,
    userId: string,
  ): Promise<MealDiaryMealDto> {
    await this.ensureInfrastructure();
    await this.ensureUserExists(userId);

    const connection = await database.getConnection();

    try {
      await connection.beginTransaction();

      const normalizedItems = [];

      for (const item of dto.items) {
        const recipe = await this.getAccessibleRecipe(item.recipeId, userId);

        normalizedItems.push({
          recipeId: item.recipeId,
          quantity: item.quantity,
          caloriesSnapshot: recipe.nutrition?.calories ?? 0,
        });
      }

      await mealDiaryRepository.replaceMealEntries(
        userId,
        date,
        mealType,
        normalizedItems,
        connection,
      );

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    const entries = await mealDiaryRepository.listEntriesByUserAndDate(userId, date);
    return buildMealDto(mealType, entries);
  }

  private async ensureInfrastructure(): Promise<void> {
    await userRepository.ensureUsersTable();
    await recipeRepository.ensureTables();
    await mealDiaryRepository.ensureTables();
  }

  private async ensureUserExists(userId: string): Promise<void> {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AppError('Usuario nao encontrado.', 404);
    }
  }

  private async getAccessibleRecipe(recipeId: string, userId: string) {
    const recipe =
      (await recipeRepository.findRecipeByIdAndAuthorId(recipeId, userId)) ??
      (await recipeRepository.findPublishedRecipeById(recipeId));

    if (!recipe) {
      throw new AppError('Receita nao encontrada.', 404);
    }

    return recipe;
  }
}

function buildMealDto(mealType: MealType, entries: MealDiaryEntryAggregate[]): MealDiaryMealDto {
  const items = entries
    .filter((entry) => entry.mealType === mealType)
    .map((entry) => ({
      id: entry.id,
      recipeId: entry.recipeId,
      recipeName: entry.recipeName,
      recipeImageUrl: entry.recipeImageUrl,
      authorName: entry.authorName,
      baseCalories: roundToTwo(entry.caloriesSnapshot),
      quantity: roundToTwo(entry.quantity),
      totalCalories: roundToTwo(entry.caloriesSnapshot * entry.quantity),
    }));

  return {
    type: mealType,
    totalCalories: roundToTwo(items.reduce((sum, item) => sum + item.totalCalories, 0)),
    items,
  };
}

function roundToTwo(value: number): number {
  return Math.round(value * 100) / 100;
}
