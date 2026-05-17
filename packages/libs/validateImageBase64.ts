const IMAGE_BASE64_MAGIC_PREFIXES = ["/9j/", "iVBOR", "UklG"] as const;

/** Strip optional data-URL prefix; return raw base64 payload. */
export function getBase64ImagePayload(file: string): string {
  const trimmed = file.trim();
  const dataUrlMatch = trimmed.match(/^data:image\/[\w+.=-]+;base64,(.+)$/i);
  return dataUrlMatch ? dataUrlMatch[1] : trimmed;
}

export function isValidImageBase64(file: string): boolean {
  if (!file || typeof file !== "string") {
    return false;
  }
  const payload = getBase64ImagePayload(file);
  return IMAGE_BASE64_MAGIC_PREFIXES.some((prefix) =>
    payload.startsWith(prefix),
  );
}
