export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export function validateImageFile(f: File): string | null {
  if (!IMAGE_TYPES.includes(f.type)) return "Only JPG, PNG or WEBP images are allowed";
  if (f.size > MAX_IMAGE_BYTES) return "Image must be 10 MB or smaller";
  return null;
}