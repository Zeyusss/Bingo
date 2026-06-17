const MAGIC_BYTES: Array<{ bytes: number[]; offset: number }> = [
  { bytes: [0xff, 0xd8, 0xff], offset: 0 },          // JPEG
  { bytes: [0x89, 0x50, 0x4e, 0x47], offset: 0 },     // PNG
  { bytes: [0x52, 0x49, 0x46, 0x46], offset: 0 },     // WEBP (RIFF header)
];

/** Strip optional data-URL prefix; return raw base64 payload. */
export function getBase64ImagePayload(file: string): string {
  const trimmed = file.trim();
  const dataUrlMatch = trimmed.match(/^data:image\/[\w+.=-]+;base64,(.+)$/i);
  return dataUrlMatch ? dataUrlMatch[1] : trimmed;
}

export function isValidImageBase64(file: string): boolean {
  if (!file || typeof file !== "string") return false;

  try {
    const payload = getBase64ImagePayload(file);
    const buffer = Buffer.from(payload, "base64");

    return MAGIC_BYTES.some(({ bytes, offset }) =>
      bytes.every((byte, i) => buffer[offset + i] === byte)
    );
  } catch {
    return false;
  }
}
