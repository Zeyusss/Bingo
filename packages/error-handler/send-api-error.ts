import { Response } from 'express';

export const sendApiError = (
  res: Response,
  status: number,
  message: string,
  details?: Record<string, unknown>
): Response => {
  return res.status(status).json({
    status: 'error',
    message,
    ...(details && { details }),
  });
};
