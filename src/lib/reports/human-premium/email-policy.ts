const STORAGE_EMAIL_DOMAIN = "@ksajupet.local";

export function isValidEmailFormat(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** User opted in to email delivery (not a storage-only placeholder). */
export function isDeliverableHumanPremiumEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !isValidEmailFormat(normalized)) return false;
  if (normalized.endsWith(STORAGE_EMAIL_DOMAIN)) return false;
  if (normalized.startsWith("noemail+")) return false;
  return true;
}

export function resolveHumanPremiumEmail(raw: unknown): {
  email: string;
  deliverEmail: boolean;
} {
  const trimmed = String(raw ?? "").trim().toLowerCase();
  if (trimmed && isDeliverableHumanPremiumEmail(trimmed)) {
    return { email: trimmed, deliverEmail: true };
  }
  const token = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().slice(0, 12)
    : `${Date.now()}`;
  return {
    email: `noemail+${token}${STORAGE_EMAIL_DOMAIN}`,
    deliverEmail: false,
  };
}
