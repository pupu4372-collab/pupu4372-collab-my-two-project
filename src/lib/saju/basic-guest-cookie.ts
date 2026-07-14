/** Guest identity for /api/saju/basic daily quota (independent of Supabase anon session). */
export const PET_BASIC_GUEST_COOKIE = "pet_basic_guest_id";
export const PET_BASIC_GUEST_COOKIE_MAX_AGE_SEC = 60 * 60 * 24;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type PetBasicGuestCookie = {
  id: string;
  /** True when this request minted a new cookie that must be Set-Cookie'd. */
  isNew: boolean;
};

export function readRequestCookie(request: Request, name: string): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    if (key !== name) continue;
    try {
      return decodeURIComponent(trimmed.slice(eq + 1).trim());
    } catch {
      return trimmed.slice(eq + 1).trim();
    }
  }
  return null;
}

function isValidGuestId(value: string): boolean {
  return UUID_RE.test(value);
}

/** Resolve guest cookie id; mint when missing or invalid. */
export function resolvePetBasicGuestCookie(request: Request): PetBasicGuestCookie {
  const existing = readRequestCookie(request, PET_BASIC_GUEST_COOKIE);
  if (existing && isValidGuestId(existing)) {
    return { id: existing, isNew: false };
  }
  return { id: crypto.randomUUID(), isNew: true };
}
