/** Browser-only image preparation. No credentials or upload permissions live here. */
export const ARTICLE_IMAGE_BUCKET = "article-images";
export const MAX_SOURCE_BYTES = 20 * 1024 * 1024;
export const MAX_UPLOAD_BYTES = 6 * 1024 * 1024;
export const MAX_IMAGE_EDGE = 2400;
export type ImageFormat = { mime: "image/jpeg" | "image/png" | "image/webp"; extension: "jpg" | "png" | "webp" };

export function imageFormat(bytes: Uint8Array): ImageFormat | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { mime: "image/jpeg", extension: "jpg" };
  if ([137, 80, 78, 71, 13, 10, 26, 10].every((byte, i) => bytes[i] === byte)) return { mime: "image/png", extension: "png" };
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP") return { mime: "image/webp", extension: "webp" };
  return null;
}

export function imageDimensions(width: number, height: number) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0 || width * height > 60_000_000) {
    throw new Error("Deze afbeelding is te groot of beschadigd. Kies een kleinere afbeelding.");
  }
  const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

export async function prepareArticleImage(file: File): Promise<{ blob: Blob; format: ImageFormat }> {
  if (!file.size || file.size > MAX_SOURCE_BYTES) throw new Error("Kies een afbeelding van maximaal 20 MB.");
  const format = imageFormat(new Uint8Array(await file.slice(0, 12).arrayBuffer()));
  if (!format) throw new Error("Kies een JPG-, JPEG-, PNG- of WebP-afbeelding. Dit bestand is geen ondersteunde afbeelding.");
  // Decode the actual bytes rather than trusting a filename or a supplied MIME type.
  const objectUrl = URL.createObjectURL(new Blob([file], { type: format.mime }));
  const image = new Image();
  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("De afbeelding kan niet worden geopend. Kies een ander bestand."));
      image.src = objectUrl;
    });
    const { width, height } = imageDimensions(image.naturalWidth, image.naturalHeight);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Je browser kan de afbeelding niet verwerken. Probeer een andere browser.");
    context.drawImage(image, 0, 0, width, height);
    // Re-encoding removes camera metadata and avoids uploading the original full-resolution file.
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(
      value => value ? resolve(value) : reject(new Error("De afbeelding kon niet worden verwerkt.")), format.mime, 0.86,
    ));
    if (blob.size > MAX_UPLOAD_BYTES) throw new Error("De afbeelding blijft te groot. Bewaar hem als kleinere JPG en probeer opnieuw.");
    const outputFormat = imageFormat(new Uint8Array(await blob.slice(0, 12).arrayBuffer()));
    if (!outputFormat) throw new Error("De afbeelding kon niet worden verwerkt.");
    return { blob, format: outputFormat };
  } finally {
    image.onload = null;
    image.onerror = null;
    URL.revokeObjectURL(objectUrl);
  }
}
