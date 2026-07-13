import type { ReportType } from "@/lib/reports/human-premium/types";
import { normalizeReportTypeKey } from "@/lib/reports/human-premium/types";

export type HumanPremiumProfile = {
  personName: string;
  email: string;
  birthDate: string;
  birthTimeSelect: string;
  timezone: string;
  calendarType: "solar" | "lunar";
  gender: "" | "male" | "female";
  privacyConsent: boolean;
};

export type HumanPremiumCartState = {
  items: ReportType[];
  orderId: string | null;
  paid: boolean;
};

const GUEST_STORAGE_USER_ID = "guest";

const PROFILE_KEY = "human_premium_profile";
const CART_KEY = "human_premium_cart";
const PAID_ORDERS_KEY = "human_premium_paid_orders";

const LEGACY_KEY_PREFIXES = [
  "human_premium_profile:",
  "human_premium_cart:",
  "human_premium_paid_orders:",
] as const;

let legacyCleanupDone = false;

function removePrefixedKeys(storage: Storage, prefixes: readonly string[]) {
  const toRemove: string[] = [];
  for (let i = 0; i < storage.length; i += 1) {
    const key = storage.key(i);
    if (!key) continue;
    if (prefixes.some((prefix) => key.startsWith(prefix))) {
      toRemove.push(key);
    }
  }
  for (const key of toRemove) {
    storage.removeItem(key);
  }
}

/** Drop pre-unified namespaced keys once per page load. No migration. */
function ensureLegacyStorageCleanup() {
  if (typeof window === "undefined" || legacyCleanupDone) return;
  legacyCleanupDone = true;
  try {
    removePrefixedKeys(sessionStorage, LEGACY_KEY_PREFIXES);
    removePrefixedKeys(localStorage, LEGACY_KEY_PREFIXES);
  } catch {
    // ignore quota / private-mode errors
  }
}

export function resolveHumanPremiumStorageUserId(
  userId: string | null,
  isAnonymous: boolean
): string {
  return userId && !isAnonymous ? userId : GUEST_STORAGE_USER_ID;
}

type SavedHumanPremiumOrder = {
  orderId: string;
  paidAt: string;
  items: ReportType[];
  personName?: string;
  birthDate?: string;
  birthTimeSelect?: string;
};

const DEFAULT_PROFILE: HumanPremiumProfile = {
  personName: "",
  email: "",
  birthDate: "",
  birthTimeSelect: "unknown",
  timezone: "Asia/Seoul",
  calendarType: "solar",
  gender: "",
  privacyConsent: false,
};

const DEFAULT_CART: HumanPremiumCartState = {
  items: [],
  orderId: null,
  paid: false,
};

function normalizeCalendarType(value: unknown): HumanPremiumProfile["calendarType"] {
  if (value === "lunar") return "lunar";
  return "solar";
}

function normalizeHumanPremiumProfile(
  profile: Partial<HumanPremiumProfile> & Record<string, unknown>
): HumanPremiumProfile {
  const calendarRaw =
    profile.calendarType ??
    (typeof profile.calendar_type === "string" ? profile.calendar_type : undefined);

  return {
    ...DEFAULT_PROFILE,
    ...profile,
    calendarType: normalizeCalendarType(calendarRaw),
    gender:
      profile.gender === "male" || profile.gender === "female" ? profile.gender : "",
    privacyConsent: Boolean(profile.privacyConsent),
  };
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) } as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(key, JSON.stringify(value));
}

function readLocalJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeLocalJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadHumanPremiumProfile(
  /** @deprecated key is now fixed */ userId: string
): HumanPremiumProfile {
  void userId;
  ensureLegacyStorageCleanup();
  return normalizeHumanPremiumProfile(readJson(PROFILE_KEY, DEFAULT_PROFILE));
}

export function saveHumanPremiumProfile(
  /** @deprecated key is now fixed */ userId: string,
  profile: HumanPremiumProfile
) {
  void userId;
  ensureLegacyStorageCleanup();
  writeJson(PROFILE_KEY, profile);
}

function normalizeCartItems(items: ReportType[]): ReportType[] {
  const next: ReportType[] = [];
  for (const item of items) {
    const type = normalizeReportTypeKey(String(item));
    if (!type || next.includes(type)) continue;
    next.push(type);
  }
  return next;
}

export function loadHumanPremiumCart(
  /** @deprecated key is now fixed */ userId: string
): HumanPremiumCartState {
  void userId;
  ensureLegacyStorageCleanup();
  const cart = readJson(CART_KEY, DEFAULT_CART);
  cart.items = normalizeCartItems(cart.items);
  return cart;
}

export function saveHumanPremiumCart(
  /** @deprecated key is now fixed */ userId: string,
  cart: HumanPremiumCartState
) {
  void userId;
  ensureLegacyStorageCleanup();
  writeJson(CART_KEY, cart);
}

/** Clears the active checkout cart so a new purchase can start. Paid orders stay in the vault list. */
export function resetHumanPremiumCart(
  /** @deprecated key is now fixed */ userId: string
): HumanPremiumCartState {
  saveHumanPremiumCart(userId, DEFAULT_CART);
  return { ...DEFAULT_CART };
}

function ensureWritableCart(cart: HumanPremiumCartState): HumanPremiumCartState {
  if (!cart.paid) return cart;
  return { items: [], orderId: null, paid: false };
}

export function addToHumanPremiumCart(
  /** @deprecated key is now fixed */ userId: string,
  reportType: ReportType,
  profile?: HumanPremiumProfile
): HumanPremiumCartState {
  const resolvedProfile = profile ?? loadHumanPremiumProfile(userId);
  if (isHumanPremiumReportPurchased(userId, reportType, resolvedProfile)) {
    return ensureWritableCart(loadHumanPremiumCart(userId));
  }
  const cart = ensureWritableCart(loadHumanPremiumCart(userId));
  if (!cart.items.includes(reportType)) {
    cart.items = [...cart.items, reportType];
    saveHumanPremiumCart(userId, cart);
  }
  return cart;
}

export function removeFromHumanPremiumCart(
  /** @deprecated key is now fixed */ userId: string,
  reportType: ReportType
): HumanPremiumCartState {
  const cart = loadHumanPremiumCart(userId);
  cart.items = cart.items.filter((item) => item !== reportType);
  saveHumanPremiumCart(userId, cart);
  return cart;
}

export function addManyToHumanPremiumCart(
  /** @deprecated key is now fixed */ userId: string,
  reportTypes: ReportType[],
  profile?: HumanPremiumProfile
): HumanPremiumCartState {
  const resolvedProfile = profile ?? loadHumanPremiumProfile(userId);
  const cart = ensureWritableCart(loadHumanPremiumCart(userId));
  const purchased = new Set(getPurchasedReportTypes(userId, resolvedProfile));
  const next = new Set(cart.items);
  for (const type of reportTypes) {
    if (!purchased.has(type)) next.add(type);
  }
  cart.items = [...next];
  saveHumanPremiumCart(userId, cart);
  return cart;
}

export function markHumanPremiumCartPaid(
  /** @deprecated key is now fixed */ userId: string,
  orderId: string,
  profile?: HumanPremiumProfile
): HumanPremiumCartState {
  const resolvedProfile = profile ?? loadHumanPremiumProfile(userId);
  const cart = loadHumanPremiumCart(userId);
  cart.orderId = orderId;
  cart.paid = true;
  saveHumanPremiumCart(userId, cart);
  savePaidHumanPremiumOrder(userId, {
    orderId,
    paidAt: new Date().toISOString(),
    items: cart.items,
    personName: resolvedProfile.personName.trim(),
    birthDate: resolvedProfile.birthDate,
    birthTimeSelect: resolvedProfile.birthTimeSelect,
  });
  return cart;
}

export function getPaidHumanPremiumOrderIds(
  /** @deprecated key is now fixed */ userId: string
): string[] {
  return loadPaidHumanPremiumOrders(userId).map((order) => order.orderId);
}

function loadPaidHumanPremiumOrders(
  /** @deprecated key is now fixed */ userId: string
): SavedHumanPremiumOrder[] {
  void userId;
  ensureLegacyStorageCleanup();
  return readLocalJson<SavedHumanPremiumOrder[]>(PAID_ORDERS_KEY, []);
}

function savePaidHumanPremiumOrder(
  /** @deprecated key is now fixed */ userId: string,
  order: SavedHumanPremiumOrder
) {
  const existing = loadPaidHumanPremiumOrders(userId);
  if (existing.some((entry) => entry.orderId === order.orderId)) return;
  writeLocalJson(PAID_ORDERS_KEY, [order, ...existing].slice(0, 30));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("human-premium-paid"));
  }
}

function orderMatchesProfile(order: SavedHumanPremiumOrder, profile: HumanPremiumProfile): boolean {
  if (!order.personName && !order.birthDate) return true;
  const name = profile.personName.trim();
  if (order.personName && order.personName !== name) return false;
  if (order.birthDate && order.birthDate !== profile.birthDate) return false;
  if (order.birthTimeSelect && order.birthTimeSelect !== profile.birthTimeSelect) return false;
  return true;
}

export function getPurchasedReportTypes(
  /** @deprecated key is now fixed */ userId: string,
  profile?: HumanPremiumProfile
): ReportType[] {
  const resolvedProfile = profile ?? loadHumanPremiumProfile(userId);
  const types = new Set<ReportType>();
  for (const order of loadPaidHumanPremiumOrders(userId)) {
    if (!orderMatchesProfile(order, resolvedProfile)) continue;
    for (const item of normalizeCartItems(order.items)) types.add(item);
  }
  return [...types];
}

function isHumanPremiumReportPurchased(
  /** @deprecated key is now fixed */ userId: string,
  reportType: ReportType,
  profile?: HumanPremiumProfile
): boolean {
  return getPurchasedReportTypes(userId, profile).includes(reportType);
}

export function syncPaidOrdersFromVault(
  /** @deprecated key is now fixed */ userId: string,
  orders: Array<{
    orderId: string;
    items: ReportType[];
    createdAt?: string;
    personName?: string;
    birthDate?: string;
    birthTimeUnknown?: boolean;
    birthTime?: string | null;
  }>
) {
  for (const order of orders) {
    savePaidHumanPremiumOrder(userId, {
      orderId: order.orderId,
      paidAt: order.createdAt ?? new Date().toISOString(),
      items: normalizeCartItems(order.items),
      personName: order.personName,
      birthDate: order.birthDate,
      birthTimeSelect: order.birthTimeUnknown ? "unknown" : order.birthTime ?? "unknown",
    });
  }
}

export function profileHasBirthData(profile: HumanPremiumProfile): boolean {
  return Boolean(profile.personName.trim() && profile.birthDate && profile.privacyConsent);
}
