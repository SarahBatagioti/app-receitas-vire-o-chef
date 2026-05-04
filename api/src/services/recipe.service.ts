import { database } from '../config/database';
import {
  CreateRecipeDto,
  RecipeDetailsDto,
  RecipeSummaryDto,
  UpdateRecipeDto,
} from '../dtos/recipe.dto';
import { UserRepository } from '../repositories/user.repository';
import {
  RecipeAggregate,
  RecipeRepository,
} from '../repositories/recipe.repository';
import { AppError } from '../utils/app-error';
import {
  validateCreateRecipeDto,
  validateUpdateRecipeDto,
} from '../validators/recipe.validator';

const recipeRepository = new RecipeRepository();
const userRepository = new UserRepository();

export class RecipeService {
  async criarReceita(
    dto: Partial<CreateRecipeDto>,
    usuarioId: string,
  ): Promise<RecipeDetailsDto> {
    await this.ensureInfrastructure();
    await this.ensureUserExists(usuarioId);

    const normalizedDto = validateCreateRecipeDto(dto);
    const connection = await database.getConnection();

    try {
      await connection.beginTransaction();

      const recipeId = await recipeRepository.createRecipe(
        {
          nome: normalizedDto.nome,
          tempoPreparoMinutos: normalizedDto.tempoPreparoMinutos,
          rendimentoPorcoes: normalizedDto.rendimentoPorcoes,
          dificuldade: normalizedDto.dificuldade,
          isColaborativa: normalizedDto.isColaborativa ?? false,
          status: normalizedDto.status ?? 'RASCUNHO',
          usuarioId,
        },
        connection,
      );

      await recipeRepository.replaceRecipeIngredients(
        recipeId,
        normalizedDto.ingredientes ?? [],
        connection,
      );
      await recipeRepository.replaceRecipePreparationSteps(
        recipeId,
        normalizedDto.modoPreparo ?? [],
        connection,
      );
      await recipeRepository.replaceRecipeNutrition(
        recipeId,
        normalizedDto.informacaoNutricional ?? null,
        connection,
      );

      await connection.commit();

      const createdRecipe = await recipeRepository.findRecipeByIdAndAuthorId(
        recipeId,
        usuarioId,
      );

      if (!createdRecipe) {
        throw new AppError('Falha ao buscar receita criada.', 500);
      }

      return mapRecipeAggregate(createdRecipe);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async listarMinhasReceitas(usuarioId: string): Promise<RecipeSummaryDto[]> {
    await this.ensureInfrastructure();
    await this.ensureUserExists(usuarioId);

    const recipes = await recipeRepository.listRecipesByAuthorId(usuarioId);

    return recipes.map(mapRecipeSummary);
  }

  async buscarReceitaPorId(
    id: string,
    usuarioId: string,
  ): Promise<RecipeDetailsDto> {
    await this.ensureInfrastructure();
    await this.ensureUserExists(usuarioId);

    const recipe = await recipeRepository.findRecipeByIdAndAuthorId(id, usuarioId);

    if (!recipe) {
      throw new AppError('Receita nao encontrada.', 404);
    }

    return mapRecipeAggregate(recipe);
  }

  async atualizarReceita(
    id: string,
    dto: Partial<UpdateRecipeDto>,
    usuarioId: string,
  ): Promise<RecipeDetailsDto> {
    await this.ensureInfrastructure();
    await this.ensureUserExists(usuarioId);

    const existingRecipe = await recipeRepository.findRecipeByIdAndAuthorId(
      id,
      usuarioId,
    );

    if (!existingRecipe) {
      throw new AppError('Receita nao encontrada.', 404);
    }

    const normalizedDto = validateUpdateRecipeDto(
      mergeRecipeUpdatePayload(existingRecipe, dto),
    );
    const connection = await database.getConnection();

    try {
      await connection.beginTransaction();

      await recipeRepository.updateRecipe(
        id,
        usuarioId,
        {
          nome: normalizedDto.nome,
          tempoPreparoMinutos: normalizedDto.tempoPreparoMinutos,
          rendimentoPorcoes: normalizedDto.rendimentoPorcoes,
          dificuldade: normalizedDto.dificuldade,
          isColaborativa: normalizedDto.isColaborativa ?? false,
          status: normalizedDto.status ?? 'RASCUNHO',
        },
        connection,
      );

      await recipeRepository.replaceRecipeIngredients(
        id,
        normalizedDto.ingredientes ?? [],
        connection,
      );
      await recipeRepository.replaceRecipePreparationSteps(
        id,
        normalizedDto.modoPreparo ?? [],
        connection,
      );
      await recipeRepository.replaceRecipeNutrition(
        id,
        normalizedDto.informacaoNutricional ?? null,
        connection,
      );

      await connection.commit();

      const updatedRecipe = await recipeRepository.findRecipeByIdAndAuthorId(
        id,
        usuarioId,
      );

      if (!updatedRecipe) {
        throw new AppError('Falha ao buscar receita atualizada.', 500);
      }

      return mapRecipeAggregate(updatedRecipe);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async removerReceita(id: string, usuarioId: string): Promise<void> {
    await this.ensureInfrastructure();
    await this.ensureUserExists(usuarioId);

    const deleted = await recipeRepository.deleteRecipeByIdAndAuthorId(id, usuarioId);

    if (!deleted) {
      throw new AppError('Receita nao encontrada.', 404);
    }
  }

  private async ensureInfrastructure(): Promise<void> {
    await userRepository.ensureUsersTable();
    await recipeRepository.ensureTables();
  }

  private async ensureUserExists(usuarioId: string): Promise<void> {
    const user = await userRepository.findById(usuarioId);

    if (!user) {
      throw new AppError('Usuario autor nao encontrado.', 404);
    }
  }
}

function mapRecipeSummary(recipe: RecipeAggregate): RecipeSummaryDto {
  return {
    id: recipe.id,
    nome: recipe.name,
    tempoPreparoMinutos: recipe.preparationTimeMinutes,
    rendimentoPorcoes: recipe.yieldPortions,
    dificuldade: recipe.difficulty,
    isColaborativa: recipe.isCollaborative,
    status: recipe.status,
    avaliacaoMedia: recipe.averageRating,
    midiaPrincipal: recipe.media[0] ? mapRecipeMedia(recipe.media[0]) : null,
    autorId: recipe.authorId,
    createdAt: recipe.createdAt,
    updatedAt: recipe.updatedAt,
  };
}

function mapRecipeAggregate(recipe: RecipeAggregate): RecipeDetailsDto {
  return {
    ...mapRecipeSummary(recipe),
    ingredientes: recipe.ingredients.map((ingredient) => ({
      id: ingredient.id,
      nome: ingredient.name,
      quantidade: ingredient.quantity,
      unidade: ingredient.unit,
    })),
    informacaoNutricional: recipe.nutrition
      ? {
          id: recipe.nutrition.id,
          calorias: recipe.nutrition.calories,
          proteinas: recipe.nutrition.proteins,
          carboidratos: recipe.nutrition.carbohydrates,
          gorduras: recipe.nutrition.fats,
        }
      : null,
    modoPreparo: recipe.preparationSteps.map((step) => ({
      id: step.id,
      ordem: step.order,
      descricao: step.description,
    })),
    midias: recipe.media.map(mapRecipeMedia),
  };
}

function mergeRecipeUpdatePayload(
  currentRecipe: RecipeAggregate,
  input: Partial<UpdateRecipeDto>,
): UpdateRecipeDto {
  const hasOwnProperty = <Key extends keyof UpdateRecipeDto>(property: Key): boolean =>
    Object.prototype.hasOwnProperty.call(input, property);

  return {
    nome: hasOwnProperty('nome') ? input.nome ?? currentRecipe.name : currentRecipe.name,
    tempoPreparoMinutos: hasOwnProperty('tempoPreparoMinutos')
      ? input.tempoPreparoMinutos ?? undefined
      : currentRecipe.preparationTimeMinutes ?? undefined,
    rendimentoPorcoes: hasOwnProperty('rendimentoPorcoes')
      ? input.rendimentoPorcoes ?? undefined
      : currentRecipe.yieldPortions ?? undefined,
    dificuldade: hasOwnProperty('dificuldade')
      ? input.dificuldade ?? undefined
      : currentRecipe.difficulty ?? undefined,
    isColaborativa: input.isColaborativa ?? currentRecipe.isCollaborative,
    status: input.status ?? currentRecipe.status,
    ingredientes:
      hasOwnProperty('ingredientes')
        ? input.ingredientes
        : currentRecipe.ingredients.map((ingredient) => ({
            nome: ingredient.name,
            quantidade: ingredient.quantity,
            unidade: ingredient.unit,
          })),
    informacaoNutricional:
      hasOwnProperty('informacaoNutricional')
        ? input.informacaoNutricional
        : currentRecipe.nutrition
          ? {
              calorias: currentRecipe.nutrition.calories,
              proteinas: currentRecipe.nutrition.proteins,
              carboidratos: currentRecipe.nutrition.carbohydrates,
              gorduras: currentRecipe.nutrition.fats,
            }
          : null,
    modoPreparo:
      hasOwnProperty('modoPreparo')
        ? input.modoPreparo
        : currentRecipe.preparationSteps.map((step) => ({
            ordem: step.order,
            descricao: step.description,
          })),
  };
}

function mapRecipeMedia(media: RecipeAggregate['media'][number]) {
  return {
    id: media.id,
    url: media.url,
    tipo: media.type,
    nomeArquivo: media.fileName,
    mimeType: media.mimeType,
    tamanho: media.size,
    ordem: media.order,
    createdAt: media.createdAt,
  };
}
