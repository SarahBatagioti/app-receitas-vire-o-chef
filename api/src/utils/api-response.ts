export function buildSuccessResponse<T>(data: T) {
  return {
    success: true,
    data,
  };
}

export function buildErrorResponse(message: string, details?: string[]) {
  return {
    success: false,
    message,
    ...(details ? { details } : {}),
  };
}
