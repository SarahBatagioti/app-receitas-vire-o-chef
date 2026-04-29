export class AppError extends Error {
  statusCode: number;
  details?: string[];

  constructor(message: string, statusCode = 400, details?: string[]) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
  }
}
