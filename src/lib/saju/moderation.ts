/** Lightweight input checks for MVP (full report flow comes with Pet Show). */

const BLOCKED_TERMS = [
  "fuck",
  "shit",
  "bitch",
  "씨발",
  "시발",
  "병신",
  "개새",
];

export function sanitizePetName(name: string): string {
  return name.trim().slice(0, 32);
}

export function validatePetName(name: string): string | null {
  const trimmed = sanitizePetName(name);
  if (trimmed.length < 1) return "Pet name is required.";
  if (trimmed.length > 32) return "Pet name must be 32 characters or less.";
  const lower = trimmed.toLowerCase();
  if (BLOCKED_TERMS.some((t) => lower.includes(t))) {
    return "Please choose a friendlier pet name.";
  }
  return null;
}
