import { NextFunction, Request, Response } from 'express';
import {
  CreateRecipeDto,
  RecipeIngredientInputDto,
  RecipeNutritionInputDto,
  RecipePreparationStepInputDto,
  UpdateRecipeDto,
} from '../dtos/recipe.dto';
import {
  RecipeDifficulty,
  RecipeStatus,
} from '../models/recipe.model';
import { buildErrorResponse } from '../utils/api-response';
import { AppError } from '../utils/app-error';

export function validateCreateRecipeRequest(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    request.body = validateCreateRecipeDto(request.body as Partial<CreateRecipeDto>);
    return next();
  } catch (error) {
    return handleRecipeValidationError(error, response, next);
  }
}

export function validateUpdateRecipeRequest(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const payload = request.body as Partial<UpdateRecipeDto>;

    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return response
        .status(422)
        .json(buildErrorResponse('Dados de receita invalidos.', [
          'O corpo da requisicao deve ser um objeto JSON valido.',
        ]));
    }

    request.body = payload;
    return next();
  } catch (error) {
    return handleRecipeValidationError(error, response, next);
  }
}

export function validateRecipeIdParam(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  return validateStringRouteParam(
    request,
    response,
    next,
    'id',
    'Identificador da receita invalido.',
  );
}

export function validateRecipeMediaIdParam(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  return validateStringRouteParam(
    request,
    response,
    next,
    'midiaId',
    'Identificador da midia invalido.',
  );
}

export function validateCreateRecipeDto(
  input: Partial<CreateRecipeDto>,
): CreateRecipeDto {
  return normalizeRecipeDto(input);
}

export function validateUpdateRecipeDto(
  input: Partial<UpdateRecipeDto>,
): CreateRecipeDto {
  return normalizeRecipeDto(input);
}

function normalizeRecipeDto(
  input: Partial<CreateRecipeDto> | Partial<UpdateRecipeDto>,
): CreateRecipeDto {
  const normalizedName = input.nome?.trim();
  const errors: string[] = [];
  const normalizedStatus = normalizeStatus(input.status, errors);
  const isDraft = normalizedStatus === 'RASCUNHO';

  if (!normalizedName) {
    errors.push('Nome da receita e obrigatorio.');
  }

  const tempoPreparoMinutos = normalizePositiveNumber(
    input.tempoPreparoMinutos,
    'Tempo de preparo deve ser um numero positivo.',
    errors,
    !isDraft,
  );

  const rendimentoPorcoes = normalizePositiveNumber(
    input.rendimentoPorcoes,
    'Rendimento em porcoes deve ser um numero positivo.',
    errors,
    !isDraft,
  );

  const dificuldade = normalizeDifficulty(input.dificuldade, errors, !isDraft);
  const ingredientes = normalizeIngredients(input.ingredientes, errors);
  const modoPreparo = normalizePreparationSteps(input.modoPreparo, errors);
  const informacaoNutricional = normalizeNutrition(input.informacaoNutricional, errors);

  if (!isDraft && ingredientes.length === 0) {
    errors.push('Pelo menos 1 ingrediente e obrigatorio para publicar.');
  }

  if (!isDraft && modoPreparo.length === 0) {
    errors.push('Pelo menos 1 passo do modo de preparo e obrigatorio para publicar.');
  }

  if (errors.length > 0) {
    throw new AppError('Dados de receita invalidos.', 422, errors);
  }

  return {
    nome: normalizedName!,
    tempoPreparoMinutos,
    rendimentoPorcoes,
    dificuldade,
    isColaborativa: Boolean(input.isColaborativa),
    status: normalizedStatus,
    ingredientes,
    informacaoNutricional,
    modoPreparo,
  };
}

function normalizeIngredients(
  input: CreateRecipeDto['ingredientes'],
  errors: string[],
): RecipeIngredientInputDto[] {
  if (input === undefined || input === null) {
    return [];
  }

  if (!Array.isArray(input)) {
    errors.push('Ingredientes devem ser informados em uma lista.');
    return [];
  }

  return input.reduce<RecipeIngredientInputDto[]>((accumulator, ingredient, index) => {
    const nome = ingredient?.nome?.trim();
    const quantidade = normalizeOptionalString(ingredient?.quantidade);
    const unidade = normalizeOptionalString(ingredient?.unidade);

    if (!nome) {
      errors.push(`Ingrediente ${index + 1}: nome e obrigatorio.`);
      return accumulator;
    }

    accumulator.push({
      nome,
      quantidade,
      unidade,
    });

    return accumulator;
  }, []);
}

function normalizePreparationSteps(
  input: CreateRecipeDto['modoPreparo'],
  errors: string[],
): RecipePreparationStepInputDto[] {
  if (input === undefined || input === null) {
    return [];
  }

  if (!Array.isArray(input)) {
    errors.push('Modo de preparo deve ser informado em uma lista.');
    return [];
  }

  const normalizedSteps = input.reduce<RecipePreparationStepInputDto[]>(
    (accumulator, step, index) => {
      const ordem = normalizePositiveNumber(
        step?.ordem,
        `Passo ${index + 1}: ordem deve ser um numero positivo.`,
        errors,
        true,
      );
      const descricao = step?.descricao?.trim();

      if (!descricao) {
        errors.push(`Passo ${index + 1}: descricao e obrigatoria.`);
        return accumulator;
      }

      accumulator.push({
        ordem: ordem!,
        descricao,
      });

      return accumulator;
    },
    [],
  );

  const uniqueOrders = new Set(normalizedSteps.map((step) => step.ordem));

  if (uniqueOrders.size !== normalizedSteps.length) {
    errors.push('Os passos do modo de preparo devem possuir ordem unica.');
  }

  normalizedSteps.sort((left, right) => left.ordem - right.ordem);

  return normalizedSteps;
}

function normalizeNutrition(
  input: RecipeNutritionInputDto | null | undefined,
  errors: string[],
): RecipeNutritionInputDto | null {
  if (input === undefined || input === null) {
    return null;
  }

  const calorias = normalizeOptionalNonNegativeNumber(
    input.calorias,
    'Calorias devem ser um numero maior ou igual a zero.',
    errors,
  );
  const proteinas = normalizeOptionalNonNegativeNumber(
    input.proteinas,
    'Proteinas devem ser um numero maior ou igual a zero.',
    errors,
  );
  const carboidratos = normalizeOptionalNonNegativeNumber(
    input.carboidratos,
    'Carboidratos devem ser um numero maior ou igual a zero.',
    errors,
  );
  const gorduras = normalizeOptionalNonNegativeNumber(
    input.gorduras,
    'Gorduras devem ser um numero maior ou igual a zero.',
    errors,
  );

  if (
    calorias === null &&
    proteinas === null &&
    carboidratos === null &&
    gorduras === null
  ) {
    return null;
  }

  return {
    calorias,
    proteinas,
    carboidratos,
    gorduras,
  };
}

function normalizeDifficulty(
  difficulty: string | null | undefined,
  errors: string[],
  required: boolean,
): RecipeDifficulty | undefined {
  if (!difficulty) {
    if (required) {
      errors.push('Dificuldade e obrigatoria.');
    }

    return undefined;
  }

  if (
    difficulty !== 'FACIL' &&
    difficulty !== 'INTERMEDIARIO' &&
    difficulty !== 'DIFICIL'
  ) {
    errors.push('Dificuldade deve ser FACIL, INTERMEDIARIO ou DIFICIL.');
    return undefined;
  }

  return difficulty;
}

function normalizePositiveNumber(
  value: number | null | undefined,
  errorMessage: string,
  errors: string[],
  required: boolean,
): number | undefined {
  if (value === undefined || value === null) {
    if (required) {
      errors.push(errorMessage);
    }

    return undefined;
  }

  if (!Number.isFinite(value) || value <= 0) {
    errors.push(errorMessage);
    return undefined;
  }

  return value;
}

function normalizeOptionalNonNegativeNumber(
  value: number | undefined | null,
  errorMessage: string,
  errors: string[],
): number | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (!Number.isFinite(value) || value < 0) {
    errors.push(errorMessage);
    return null;
  }

  return value;
}

function normalizeOptionalString(value: string | null | undefined): string | null {
  const normalizedValue = value?.trim();
  return normalizedValue ? normalizedValue : null;
}

function normalizeStatus(
  status: string | null | undefined,
  errors: string[],
): RecipeStatus {
  if (!status) {
    return 'RASCUNHO';
  }

  if (status !== 'PUBLICADA' && status !== 'RASCUNHO') {
    errors.push('Status deve ser PUBLICADA ou RASCUNHO.');
    return 'RASCUNHO';
  }

  return status;
}

function handleRecipeValidationError(
  error: unknown,
  response: Response,
  next: NextFunction,
) {
  if (error instanceof AppError) {
    return response
      .status(error.statusCode)
      .json(buildErrorResponse(error.message, error.details));
  }

  return next(error);
}

function validateStringRouteParam(
  request: Request,
  response: Response,
  next: NextFunction,
  parameterName: 'id' | 'midiaId',
  message: string,
) {
  const parameterValue = request.params[parameterName];

  if (typeof parameterValue !== 'string' || !parameterValue.trim()) {
    return response
      .status(422)
      .json(buildErrorResponse(message, [
        `Informe um ${parameterName} valido.`,
      ]));
  }

  request.params[parameterName] = parameterValue.trim();
  return next();
}
