import { NextFunction, Request, Response } from 'express';

export function errorHandler(
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction,
) {
  console.error(error);

  return response.status(500).json({
    success: false,
    message: 'Erro interno do servidor.',
  });
}
