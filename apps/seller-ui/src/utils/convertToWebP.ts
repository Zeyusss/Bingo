/**
 * Converts a File to a WebP data URL.
 * - Resizes to max 1500px on longest side (no upscaling)
 * - Preserves aspect ratio and transparency
 * - Quality: 0.85 (visually lossless for product photos)
 */
export function convertToWebP(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const MAX = 1500;
      let { width, height } = img;

      if (width > MAX || height > MAX) {
        if (width > height) {
          height = Math.round((height * MAX) / width);
          width = MAX;
        } else {
          width = Math.round((width * MAX) / height);
          height = MAX;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context unavailable"));
        return;
      }

      // Leave background transparent to preserve PNG alpha
      ctx.drawImage(img, 0, 0, width, height);

      const dataUrl = canvas.toDataURL("image/webp", 0.85);
      resolve(dataUrl);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image"));
    };

    img.src = objectUrl;
  });
}
