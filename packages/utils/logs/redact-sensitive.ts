const SENSITIVE_KEY_SUBSTRINGS = [
  "password",
  "newpassword",
  "otp",
  "token",
  "imagedata",
  "filename",
  "base64",
] as const;

const REDACTED = "[REDACTED]";

function isSensitiveKey(key: string): boolean {
  const lower = key.toLowerCase();
  return SENSITIVE_KEY_SUBSTRINGS.some((part) => lower.includes(part));
}

/** Recursively redact sensitive keys; preserves object/array shape. */
export function deepRedactSensitive<T>(value: T): T {
  if (value === null || value === undefined) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => deepRedactSensitive(item)) as T;
  }

  if (typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      result[key] = isSensitiveKey(key) ? REDACTED : deepRedactSensitive(val);
    }
    return result as T;
  }

  return value;
}
