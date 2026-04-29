import { NextFunction, Request, Response } from 'express';
import { buildErrorResponse } from '../utils/api-response';
import { AppError } from '../utils/app-error';

export function errorHandler(
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction,
) {
  console.error(error);

  if (error instanceof AppError) {
    return response
      .status(error.statusCode)
      .json(buildErrorResponse(error.message, error.details));
  }

  return response.status(500).json(buildErrorResponse('Erro interno do servidor.'));
}
