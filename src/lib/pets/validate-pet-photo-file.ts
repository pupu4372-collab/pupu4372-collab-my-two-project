const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 10 * 1024 * 1024;

export function validatePetPhotoFile(file: File, isKo: boolean): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return isKo
      ? "JPG, PNG, WebP 형식만 등록할 수 있어요."
      : "Only JPG, PNG, and WebP images are allowed.";
  }
  if (file.size > MAX_BYTES) {
    return isKo ? "사진은 10MB 이하만 등록할 수 있어요." : "Images must be 10MB or smaller.";
  }
  return null;
}
