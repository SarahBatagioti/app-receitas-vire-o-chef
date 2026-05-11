import { database } from '../config/database';
import {
  CreateRecipeDto,
  RecipeDetailsDto,
  RecipeMediaDto,
  RecipeMediaUploadDto,
  RecipeSummaryDto,
  UpdateRecipeDto,
} from '../dtos/recipe.dto';
import { RecipeMediaType } from '../models/recipe-media.model';
import { UserRepository } from '../repositories/user.repository';
import {
  RecipeAggregate,
  RecipeRepository,
} from '../repositories/recipe.repository';
import { AppError } from '../utils/app-error';
import {
  deleteRecipeMediaFiles,
  removeRecipeMediaDirectoryIfEmpty,
  resolveRecipeMediaAbsolutePath,
} from '../utils/recipe-media-storage';
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

  async listarReceitasPublicadas(): Promise<RecipeSummaryDto[]> {
    await this.ensureInfrastructure();

    const recipes = await recipeRepository.listPublishedRecipes();

    return recipes.map(mapRecipeSummary);
  }

  async listarIdsReceitasFavoritas(usuarioId: string): Promise<string[]> {
    await this.ensureInfrastructure();
    await this.ensureUserExists(usuarioId);

    return recipeRepository.listFavoriteRecipeIdsByUserId(usuarioId);
  }

  async buscarReceitaPorId(
    id: string,
    usuarioId: string,
  ): Promise<RecipeDetailsDto> {
    await this.ensureInfrastructure();
    await this.ensureUserExists(usuarioId);

    const recipe =
      (await recipeRepository.findRecipeByIdAndAuthorId(id, usuarioId)) ??
      (await recipeRepository.findPublishedRecipeById(id));

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

  async favoritarReceita(
    receitaId: string,
    usuarioId: string,
  ): Promise<void> {
    await this.ensureInfrastructure();
    await this.ensureUserExists(usuarioId);
    await this.getAccessibleRecipe(receitaId, usuarioId);

    await recipeRepository.createFavoriteRecipe(usuarioId, receitaId);
  }

  async desfavoritarReceita(
    receitaId: string,
    usuarioId: string,
  ): Promise<void> {
    await this.ensureInfrastructure();
    await this.ensureUserExists(usuarioId);

    await recipeRepository.deleteFavoriteRecipe(usuarioId, receitaId);
  }

  async removerReceita(id: string, usuarioId: string): Promise<void> {
    await this.ensureInfrastructure();
    await this.ensureUserExists(usuarioId);

    const recipe = await recipeRepository.findRecipeByIdAndAuthorId(id, usuarioId);

    if (!recipe) {
      throw new AppError('Receita nao encontrada.', 404);
    }

    const deleted = await recipeRepository.deleteRecipeByIdAndAuthorId(id, usuarioId);

    if (!deleted) {
      throw new AppError('Receita nao encontrada.', 404);
    }

    await cleanupPersistedRecipeMedia(recipe.id, recipe.media);
  }

  async adicionarMidiasReceita(
    receitaId: string,
    upload: RecipeMediaUploadDto,
    usuarioId: string,
  ): Promise<RecipeMediaDto[]> {
    await this.ensureInfrastructure();
    await this.ensureUserExists(usuarioId);

    let mediaPersisted = false;

    try {
      const recipe = await this.getOwnedRecipe(receitaId, usuarioId);
      const mediaToCreate = buildRecipeMediaCreatePayload(recipe, upload);
      const connection = await database.getConnection();

      try {
        await connection.beginTransaction();
        await recipeRepository.createRecipeMedia(receitaId, mediaToCreate, connection);
        await connection.commit();
        mediaPersisted = true;
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }

      const updatedRecipe = await this.getOwnedRecipe(receitaId, usuarioId);
      const createdUrls = new Set(mediaToCreate.map((media) => media.url));

      return updatedRecipe.media
        .filter((media) => createdUrls.has(media.url))
        .map(mapRecipeMedia);
    } catch (error) {
      if (!mediaPersisted) {
        await cleanupUploadedRecipeMedia(upload);
      }

      throw error;
    }
  }

  async listarMidiasReceita(
    receitaId: string,
    usuarioId: string,
  ): Promise<RecipeMediaDto[]> {
    await this.ensureInfrastructure();
    await this.ensureUserExists(usuarioId);

    const recipe = await this.getOwnedRecipe(receitaId, usuarioId);
    return recipe.media.map(mapRecipeMedia);
  }

  async removerMidiaReceita(
    receitaId: string,
    midiaId: string,
    usuarioId: string,
  ): Promise<void> {
    await this.ensureInfrastructure();
    await this.ensureUserExists(usuarioId);

    const recipe = await this.getOwnedRecipe(receitaId, usuarioId);
    const media = recipe.media.find((item) => item.id === midiaId);

    if (!media) {
      throw new AppError('Midia nao encontrada.', 404);
    }

    const deleted = await recipeRepository.deleteRecipeMediaByIdAndRecipeId(
      midiaId,
      receitaId,
    );

    if (!deleted) {
      throw new AppError('Midia nao encontrada.', 404);
    }

    await cleanupPersistedRecipeMedia(recipe.id, [media]);
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

  private async getOwnedRecipe(
    receitaId: string,
    usuarioId: string,
  ): Promise<RecipeAggregate> {
    const recipe = await recipeRepository.findRecipeByIdAndAuthorId(receitaId, usuarioId);

    if (!recipe) {
      throw new AppError('Receita nao encontrada.', 404);
    }

    return recipe;
  }

  private async getAccessibleRecipe(
    receitaId: string,
    usuarioId: string,
  ): Promise<RecipeAggregate> {
    const recipe =
      (await recipeRepository.findRecipeByIdAndAuthorId(receitaId, usuarioId)) ??
      (await recipeRepository.findPublishedRecipeById(receitaId));

    if (!recipe) {
      throw new AppError('Receita nao encontrada.', 404);
    }

    return recipe;
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
    autorNome: recipe.authorName,
    autorUsername: recipe.authorUsername,
    informacaoNutricional: recipe.nutrition
      ? {
          id: recipe.nutrition.id,
          calorias: recipe.nutrition.calories,
          proteinas: recipe.nutrition.proteins,
          carboidratos: recipe.nutrition.carbohydrates,
          gorduras: recipe.nutrition.fats,
        }
      : null,
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

function buildRecipeMediaCreatePayload(
  recipe: RecipeAggregate,
  upload: RecipeMediaUploadDto,
) {
  const requestedTypes = getRequestedRecipeMediaTypes(upload.campos);
  const requestedOrders = getRequestedRecipeMediaOrders(upload.campos);
  const existingOrders = new Set(recipe.media.map((media) => media.order));
  const nextOrder = recipe.media.reduce(
    (highestOrder, media) => Math.max(highestOrder, media.order),
    0,
  ) + 1;

  validateRequestedTypes(upload, requestedTypes);
  validateRequestedOrders(upload, requestedOrders, existingOrders);

  return upload.arquivos.map((file, index) => ({
    url: file.publicUrl,
    tipo: resolveRecipeMediaType(file.inferredType, requestedTypes[index]),
    nomeArquivo: file.fileName,
    mimeType: file.mimeType,
    tamanho: file.size,
    ordem: requestedOrders[index] ?? (nextOrder + index),
  }));
}

function validateRequestedTypes(
  upload: RecipeMediaUploadDto,
  requestedTypes: Array<RecipeMediaType | undefined>,
) {
  if (requestedTypes.length === 0) {
    return;
  }

  if (requestedTypes.length !== upload.arquivos.length) {
    throw new AppError('Quantidade de tipos de midia invalida.', 422, [
      'Informe um tipo para cada arquivo enviado ou omita o campo para usar deteccao automatica.',
    ]);
  }

  for (const [index, requestedType] of requestedTypes.entries()) {
    if (!requestedType) {
      throw new AppError('Tipo de midia invalido.', 422, [
        `Arquivo ${index + 1}: tipo deve ser IMAGEM ou VIDEO.`,
      ]);
    }

    if (requestedType !== upload.arquivos[index].inferredType) {
      throw new AppError('Tipo de midia nao corresponde ao arquivo enviado.', 422, [
        `Arquivo ${index + 1}: o mimeType enviado corresponde a ${upload.arquivos[index].inferredType}.`,
      ]);
    }
  }
}

function validateRequestedOrders(
  upload: RecipeMediaUploadDto,
  requestedOrders: Array<number | undefined>,
  existingOrders: Set<number>,
) {
  if (requestedOrders.length === 0) {
    return;
  }

  if (requestedOrders.length !== upload.arquivos.length) {
    throw new AppError('Quantidade de ordens invalida.', 422, [
      'Informe uma ordem para cada arquivo enviado ou omita o campo para usar ordenacao automatica.',
    ]);
  }

  const receivedOrders = new Set<number>();

  for (const [index, order] of requestedOrders.entries()) {
    if (!order) {
      throw new AppError('Ordem de midia invalida.', 422, [
        `Arquivo ${index + 1}: ordem deve ser um numero positivo.`,
      ]);
    }

    if (receivedOrders.has(order) || existingOrders.has(order)) {
      throw new AppError('Ordem de midia duplicada.', 422, [
        `Arquivo ${index + 1}: ordem ${order} ja esta em uso para esta receita.`,
      ]);
    }

    receivedOrders.add(order);
  }
}

function getIndexedFieldValues(
  fields: Record<string, string[]>,
  supportedNames: string[],
): string[] {
  for (const name of supportedNames) {
    if (fields[name]?.length) {
      return fields[name];
    }
  }

  return [];
}

function getRequestedRecipeMediaTypes(
  fields: Record<string, string[]>,
): Array<RecipeMediaType | undefined> {
  return getIndexedFieldValues(fields, ['tipo', 'tipos', 'tipos[]']).map((value) => {
    if (value === 'IMAGEM' || value === 'VIDEO') {
      return value;
    }

    return undefined;
  });
}

function getRequestedRecipeMediaOrders(
  fields: Record<string, string[]>,
): Array<number | undefined> {
  return getIndexedFieldValues(fields, ['ordem', 'ordens', 'ordens[]']).map((value) => {
    const parsed = Number(value);

    if (!Number.isInteger(parsed) || parsed <= 0) {
      return undefined;
    }

    return parsed;
  });
}

function resolveRecipeMediaType(
  inferredType: RecipeMediaType,
  requestedType?: string,
): RecipeMediaType {
  if (!requestedType) {
    return inferredType;
  }

  if (requestedType !== 'IMAGEM' && requestedType !== 'VIDEO') {
    throw new AppError('Tipo de midia invalido.', 422, [
      'Tipo deve ser IMAGEM ou VIDEO.',
    ]);
  }

  return requestedType;
}

async function cleanupUploadedRecipeMedia(upload: RecipeMediaUploadDto): Promise<void> {
  if (upload.arquivos.length === 0) {
    return;
  }

  const recipeId = getRecipeIdFromMediaUrl(upload.arquivos[0].publicUrl);

  await deleteRecipeMediaFiles(upload.arquivos);

  if (recipeId) {
    await removeRecipeMediaDirectoryIfEmpty(recipeId);
  }
}

async function cleanupPersistedRecipeMedia(
  recipeId: string,
  media: RecipeAggregate['media'],
): Promise<void> {
  await deleteRecipeMediaFiles(
    media.map((item) => ({
      absolutePath: resolveRecipeMediaAbsolutePath(recipeId, item.fileName, item.url),
    })),
  );
  await removeRecipeMediaDirectoryIfEmpty(recipeId);
}

function getRecipeIdFromMediaUrl(url: string): string | null {
  const parts = url.split('/').filter(Boolean);
  return parts.length >= 3 ? parts[2] : null;
}
