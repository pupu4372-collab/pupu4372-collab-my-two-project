/**
 * Browser keys that hold PII / account-bound drafts.
 * Cleared when session ownership changes (logout or account switch).
 * Auth policy / splash / Supabase sb-* keys are intentionally excluded.
 */

const SESSION_KEYS = [
  "human_premium_profile",
  "human_premium_cart",
  "saju_basic_result_session_v1",
  "human_premium_pending",
  "pet_premium_checkout_v1",
  "pet_premium_pending_payment_id",
] as const;

const LOCAL_KEYS = ["human_premium_paid_orders"] as const;

/** Tracks who last owned personal storage — not cleared with PII keys. */
const OWNER_KEY = "ksaju_personal_storage_owner";

type StorageOwner = {
  userId: string;
  isAnonymous: boolean;
};

function removeKey(storage: Storage, key: string) {
  try {
    storage.removeItem(key);
  } catch {
    // ignore quota / private mode
  }
}

export function clearPersonalClientStorage(): void {
  if (typeof window === "undefined") return;
  for (const key of SESSION_KEYS) {
    removeKey(window.sessionStorage, key);
  }
  for (const key of LOCAL_KEYS) {
    removeKey(window.localStorage, key);
  }
}

function readStorageOwner(): StorageOwner | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(OWNER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StorageOwner>;
    if (typeof parsed.userId !== "string" || !parsed.userId) return null;
    return {
      userId: parsed.userId,
      isAnonymous: parsed.isAnonymous === true,
    };
  } catch {
    return null;
  }
}

function writeStorageOwner(owner: StorageOwner | null): void {
  if (typeof window === "undefined") return;
  try {
    if (!owner) {
      window.sessionStorage.removeItem(OWNER_KEY);
      return;
    }
    window.sessionStorage.setItem(OWNER_KEY, JSON.stringify(owner));
  } catch {
    // ignore
  }
}

/** Reset owner marker after logout wipe (before anon re-issue). */
export function resetPersonalStorageOwner(): void {
  writeStorageOwner(null);
}

/**
 * Compare previous session owner to the new one.
 * - Same userId (token refresh): no clear
 * - Anonymous auto-issue / guest continuity: no clear
 * - Non-anonymous A → non-anonymous B: clear
 * - Guest → login: no clear (keeps cart/profile draft for checkout continuity)
 */
export function syncPersonalStorageOwner(user: {
  id: string;
  is_anonymous?: boolean;
} | null): void {
  if (typeof window === "undefined") return;
  if (!user?.id) return;

  const nextAnonymous = user.is_anonymous !== false;
  const next: StorageOwner = { userId: user.id, isAnonymous: nextAnonymous };
  const prev = readStorageOwner();

  if (nextAnonymous) {
    writeStorageOwner(next);
    return;
  }

  if (prev && prev.userId !== next.userId && !prev.isAnonymous) {
    clearPersonalClientStorage();
  }

  writeStorageOwner(next);
}
