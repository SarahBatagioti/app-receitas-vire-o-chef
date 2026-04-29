import { NextFunction, Request, Response } from 'express';

export function validateAuthBootstrapRequest(
  _request: Request,
  _response: Response,
  next: NextFunction,
) {
  next();
}
