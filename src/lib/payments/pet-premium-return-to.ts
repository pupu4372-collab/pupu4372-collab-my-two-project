export type PetPremiumReturnTo =
  | "basic"
  | "mbti"
  | "zodiac"
  | "compatibility"
  | "zodiac-page"
  | "compatibility-page";

const ALLOWED_RETURN_TO = new Set<PetPremiumReturnTo>([
  "basic",
  "mbti",
  "zodiac",
  "compatibility",
  "zodiac-page",
  "compatibility-page",
]);

function isUnsafeReturnToToken(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (trimmed.startsWith("//")) return true;
  if (trimmed.includes("\\")) return true;
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed)) return true;
  if (trimmed.startsWith("/")) return true;
  return false;
}

/** Whitelist-only returnTo normalization. Invalid values fall back to null (premium hub). */
export function normalizePetPremiumReturnTo(
  value: string | null | undefined
): PetPremiumReturnTo | null {
  if (!value) return null;
  if (isUnsafeReturnToToken(value)) return null;
  if (!ALLOWED_RETURN_TO.has(value as PetPremiumReturnTo)) return null;
  return value as PetPremiumReturnTo;
}
