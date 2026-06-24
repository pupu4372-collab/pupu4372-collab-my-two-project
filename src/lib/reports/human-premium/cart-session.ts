import type { ReportType } from "@/lib/reports/human-premium/types";

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

const PROFILE_KEY = "human_premium_profile";
const CART_KEY = "human_premium_cart";
const PAID_ORDERS_KEY = "human_premium_paid_orders";

export type SavedHumanPremiumOrder = {
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

export function loadHumanPremiumProfile(): HumanPremiumProfile {
  return readJson(PROFILE_KEY, DEFAULT_PROFILE);
}

export function saveHumanPremiumProfile(profile: HumanPremiumProfile) {
  writeJson(PROFILE_KEY, profile);
}

export function loadHumanPremiumCart(): HumanPremiumCartState {
  return readJson(CART_KEY, DEFAULT_CART);
}

export function saveHumanPremiumCart(cart: HumanPremiumCartState) {
  writeJson(CART_KEY, cart);
}

/** Clears the active checkout cart so a new purchase can start. Paid orders stay in the vault list. */
export function resetHumanPremiumCart(): HumanPremiumCartState {
  saveHumanPremiumCart(DEFAULT_CART);
  return { ...DEFAULT_CART };
}

function ensureWritableCart(cart: HumanPremiumCartState): HumanPremiumCartState {
  if (!cart.paid) return cart;
  return { items: [], orderId: null, paid: false };
}

export function addToHumanPremiumCart(
  reportType: ReportType,
  profile: HumanPremiumProfile = loadHumanPremiumProfile()
): HumanPremiumCartState {
  if (isHumanPremiumReportPurchased(reportType, profile)) {
    return ensureWritableCart(loadHumanPremiumCart());
  }
  const cart = ensureWritableCart(loadHumanPremiumCart());
  if (!cart.items.includes(reportType)) {
    cart.items = [...cart.items, reportType];
    saveHumanPremiumCart(cart);
  }
  return cart;
}

export function removeFromHumanPremiumCart(reportType: ReportType): HumanPremiumCartState {
  const cart = loadHumanPremiumCart();
  cart.items = cart.items.filter((item) => item !== reportType);
  saveHumanPremiumCart(cart);
  return cart;
}

export function addManyToHumanPremiumCart(
  reportTypes: ReportType[],
  profile: HumanPremiumProfile = loadHumanPremiumProfile()
): HumanPremiumCartState {
  const cart = ensureWritableCart(loadHumanPremiumCart());
  const purchased = new Set(getPurchasedReportTypes(profile));
  const next = new Set(cart.items);
  for (const type of reportTypes) {
    if (!purchased.has(type)) next.add(type);
  }
  cart.items = [...next];
  saveHumanPremiumCart(cart);
  return cart;
}

export function markHumanPremiumCartPaid(
  orderId: string,
  profile: HumanPremiumProfile = loadHumanPremiumProfile()
): HumanPremiumCartState {
  const cart = loadHumanPremiumCart();
  cart.orderId = orderId;
  cart.paid = true;
  saveHumanPremiumCart(cart);
  savePaidHumanPremiumOrder({
    orderId,
    paidAt: new Date().toISOString(),
    items: cart.items,
    personName: profile.personName.trim(),
    birthDate: profile.birthDate,
    birthTimeSelect: profile.birthTimeSelect,
  });
  return cart;
}

export function getPaidHumanPremiumOrderIds(): string[] {
  return loadPaidHumanPremiumOrders().map((order) => order.orderId);
}

export function loadPaidHumanPremiumOrders(): SavedHumanPremiumOrder[] {
  return readLocalJson<SavedHumanPremiumOrder[]>(PAID_ORDERS_KEY, []);
}

export function savePaidHumanPremiumOrder(order: SavedHumanPremiumOrder) {
  const existing = loadPaidHumanPremiumOrders();
  if (existing.some((entry) => entry.orderId === order.orderId)) return;
  writeLocalJson(PAID_ORDERS_KEY, [order, ...existing].slice(0, 30));
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
  profile: HumanPremiumProfile = loadHumanPremiumProfile()
): ReportType[] {
  const types = new Set<ReportType>();
  for (const order of loadPaidHumanPremiumOrders()) {
    if (!orderMatchesProfile(order, profile)) continue;
    for (const item of order.items) types.add(item);
  }
  return [...types];
}

export function isHumanPremiumReportPurchased(
  reportType: ReportType,
  profile: HumanPremiumProfile = loadHumanPremiumProfile()
): boolean {
  return getPurchasedReportTypes(profile).includes(reportType);
}

export function syncPaidOrdersFromVault(
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
    savePaidHumanPremiumOrder({
      orderId: order.orderId,
      paidAt: order.createdAt ?? new Date().toISOString(),
      items: order.items,
      personName: order.personName,
      birthDate: order.birthDate,
      birthTimeSelect: order.birthTimeUnknown ? "unknown" : order.birthTime ?? "unknown",
    });
  }
}

export function profileHasBirthData(profile: HumanPremiumProfile): boolean {
  return Boolean(profile.personName.trim() && profile.birthDate && profile.privacyConsent);
}
