import { NextFunction, Request, Response } from 'express';
import {
  CreatePublicationCommentDto,
  CreatePublicationDto,
  UpdatePublicationDto,
} from '../dtos/publication.dto';
import { buildErrorResponse } from '../utils/api-response';
import { AppError } from '../utils/app-error';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 20;

export function validateCreatePublicationRequest(request: Request, response: Response, next: NextFunction) {
  try {
    const normalizedFields = request.publicationMediaUpload?.campos ?? {};
    request.body = validateCreatePublicationDto({
      legenda: normalizedFields.legenda?.[0],
      recipeId: normalizedFields.recipeId?.[0],
    });
    return next();
  } catch (error) {
    return handlePublicationValidationError(error, response, next);
  }
}

export function validateUpdatePublicationRequest(request: Request, response: Response, next: NextFunction) {
  try {
    request.body = validateUpdatePublicationDto(request.body as Partial<UpdatePublicationDto>);
    return next();
  } catch (error) {
    return handlePublicationValidationError(error, response, next);
  }
}

export function validateCreateCommentRequest(request: Request, response: Response, next: NextFunction) {
  try {
    request.body = validateCreatePublicationCommentDto(
      request.body as Partial<CreatePublicationCommentDto>,
    );
    return next();
  } catch (error) {
    return handlePublicationValidationError(error, response, next);
  }
}

export function validatePublicationIdParam(request: Request, response: Response, next: NextFunction) {
  return validateStringRouteParam(request, response, next, 'id', 'Identificador da publicacao invalido.');
}

export function validatePublicationCommentIdParam(request: Request, response: Response, next: NextFunction) {
  return validateStringRouteParam(
    request,
    response,
    next,
    'comentarioId',
    'Identificador do comentario invalido.',
  );
}

export function validateCursorPaginationQuery(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const { cursor, limit, username } = request.query;
  const normalizedLimit = typeof limit === 'string' ? Number(limit) : DEFAULT_LIMIT;

  if (!Number.isFinite(normalizedLimit) || normalizedLimit <= 0 || normalizedLimit > MAX_LIMIT) {
    return response.status(422).json(buildErrorResponse('Limite de paginacao invalido.', [
      `Informe um limite entre 1 e ${MAX_LIMIT}.`,
    ]));
  }

  request.query = {
    ...request.query,
    cursor: typeof cursor === 'string' && cursor.trim() ? cursor.trim() : '',
    limit: String(Math.trunc(normalizedLimit)),
    username: typeof username === 'string' && username.trim() ? username.trim() : '',
  };

  return next();
}

export function validateCreatePublicationDto(input: Partial<CreatePublicationDto>): CreatePublicationDto {
  return normalizePublicationDto(input);
}

export function validateUpdatePublicationDto(input: Partial<UpdatePublicationDto>): UpdatePublicationDto {
  return normalizePublicationDto(input);
}

export function validateCreatePublicationCommentDto(
  input: Partial<CreatePublicationCommentDto>,
): CreatePublicationCommentDto {
  const conteudo = input.conteudo?.trim();

  if (!conteudo) {
    throw new AppError('Dados de comentario invalidos.', 422, ['Comentario nao pode ser vazio.']);
  }

  if (conteudo.length > 500) {
    throw new AppError('Dados de comentario invalidos.', 422, [
      'Comentario deve ter no maximo 500 caracteres.',
    ]);
  }

  return { conteudo };
}

function normalizePublicationDto(
  input: Partial<CreatePublicationDto> | Partial<UpdatePublicationDto>,
): CreatePublicationDto {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new AppError('Dados de publicacao invalidos.', 422, [
      'O corpo da requisicao deve ser um objeto JSON valido.',
    ]);
  }

  const legenda = input.legenda?.trim() ?? '';
  const recipeId = normalizeOptionalString(input.recipeId);

  if (legenda.length > 500) {
    throw new AppError('Dados de publicacao invalidos.', 422, [
      'Legenda deve ter no maximo 500 caracteres.',
    ]);
  }

  return {
    legenda,
    recipeId,
  };
}

function normalizeOptionalString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function validateStringRouteParam(
  request: Request,
  response: Response,
  next: NextFunction,
  paramName: string,
  invalidMessage: string,
) {
  const value = request.params[paramName];

  if (typeof value !== 'string' || !value.trim()) {
    return response.status(422).json(buildErrorResponse(invalidMessage, [
      `Informe um parametro ${paramName} valido.`,
    ]));
  }

  request.params[paramName] = value.trim();
  return next();
}

function handlePublicationValidationError(error: unknown, response: Response, next: NextFunction) {
  if (error instanceof AppError) {
    return response.status(error.statusCode).json(buildErrorResponse(error.message, error.details));
  }

  return next(error);
}
