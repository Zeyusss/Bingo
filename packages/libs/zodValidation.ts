import { Response } from "express";
import { ZodError } from "zod";

export function formatZodFieldErrors(
  error: ZodError,
): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.length ? issue.path.join(".") : "_root";
    if (!errors[key]) errors[key] = [];
    errors[key].push(issue.message);
  }
  return errors;
}

export function sendZodValidationError(res: Response, error: ZodError) {
  return res.status(400).json({
    success: false,
    message: "Validation failed",
    errors: formatZodFieldErrors(error),
  });
}
