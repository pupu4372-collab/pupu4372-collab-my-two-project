import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { humanPremiumWebExpiresAt } from "@/lib/reports/human-premium/retention";
import {
  normalizeReportTypeKey,
  type ReportType,
} from "@/lib/reports/human-premium/types";
import { parseCartReportTypes } from "@/lib/reports/human-premium/cart";
import type { PetPremiumPaymentRecord } from "@/lib/payments/pet-premium-shared";

export type AdminHumanPaymentOrder = {
  orderId: string;
  amount: number;
  currency: string;
  items: ReportType[];
  itemCount: number;
  personName: string;
  locale: "ko" | "en";
  createdAt: string;
  expiresAt: string;
  generatedCount: number;
  email: string | null;
};

export type AdminPaymentHistoryEntry =
  | {
      kind: "human";
      createdAt: string;
      userId: string | null;
      userLabel: string;
      order: AdminHumanPaymentOrder;
    }
  | {
      kind: "pet";
      createdAt: string;
      userId: string | null;
      userLabel: string;
      order: PetPremiumPaymentRecord;
    };

export type AdminPaymentHistoryListParams = {
  /** YYYY-MM-DD inclusive start (Asia/Seoul day). */
  from: string;
  /** YYYY-MM-DD inclusive end (Asia/Seoul day). */
  to: string;
  /** Page size (default 50, max 100). */
  limit?: number;
  /** Opaque cursor from previous page (`created_at` + entry id). */
  cursor?: string | null;
};

export type AdminPaymentHistoryListResult = {
  entries: AdminPaymentHistoryEntry[];
  nextCursor: string | null;
  hasMore: boolean;
};

type UnlockAdminRow = {
  payment_id: string | null;
  product_code: string;
  price_krw: number | null;
  amount: number | null;
  currency: string | null;
  paid_at: string | null;
  created_at: string;
  expires_at: string | null;
  pet_id: string | null;
  user_id: string | null;
  pets: {
    name: string;
    species: string | null;
    gender: string | null;
    birth_date: string | null;
    birth_timezone: string | null;
  } | null;
};

type HumanAdminRow = {
  payment_order_id: string | null;
  user_id: string | null;
  email: string | null;
  person_name: string;
  amount_paid: number | null;
  currency: string | null;
  locale: string | null;
  created_at: string;
  report_type: string | null;
  birth_basis: {
    cart?: {
      cartOrder?: boolean;
      items?: unknown;
      generated?: Record<string, unknown>;
    };
  } | null;
};

type DecodedCursor = {
  createdAt: string;
  kind: "human" | "pet";
  id: string;
};

/** Max report rows per parent cart — over-fetch factor for grouping. */
const HUMAN_ROWS_PER_ORDER = 12;

/** Parent cart order ids only: hp_cart_ + 20 hex chars (exclude child item rows). */
const PARENT_CART_ORDER_RE = /^hp_cart_[a-f0-9]{20}$/;
const PARENT_CART_ORDER_MATCH = "^hp_cart_[a-f0-9]{20}$";

function isYmd(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/** Inclusive Seoul calendar-day bounds as timestamptz ISO strings. */
export function seoulDayRangeIso(from: string, to: string): { gte: string; lte: string } {
  return {
    gte: `${from}T00:00:00+09:00`,
    lte: `${to}T23:59:59.999+09:00`,
  };
}

export function clampAdminPaymentLimit(raw: unknown): number {
  const n = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(n) || n <= 0) return 50;
  return Math.min(100, Math.floor(n));
}

function entrySortKey(entry: AdminPaymentHistoryEntry): string {
  const id = entry.kind === "human" ? entry.order.orderId : entry.order.paymentId;
  return `${entry.kind}:${id}`;
}

function compareEntriesDesc(a: AdminPaymentHistoryEntry, b: AdminPaymentHistoryEntry): number {
  const tb = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  if (tb !== 0) return tb;
  return entrySortKey(b).localeCompare(entrySortKey(a));
}

/** True when `entry` is strictly older than cursor in (createdAt desc, kind:id desc) order. */
function isAfterCursor(entry: AdminPaymentHistoryEntry, cursor: DecodedCursor): boolean {
  const t = new Date(entry.createdAt).getTime();
  const ct = new Date(cursor.createdAt).getTime();
  if (t < ct) return true;
  if (t > ct) return false;
  const cursorKey = `${cursor.kind}:${cursor.id}`;
  return entrySortKey(entry).localeCompare(cursorKey) < 0;
}

export function encodeAdminPaymentCursor(entry: AdminPaymentHistoryEntry): string {
  const id = entry.kind === "human" ? entry.order.orderId : entry.order.paymentId;
  return Buffer.from(
    JSON.stringify({ createdAt: entry.createdAt, kind: entry.kind, id }),
    "utf8"
  ).toString("base64url");
}

export function decodeAdminPaymentCursor(raw: string | null | undefined): DecodedCursor | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as Partial<DecodedCursor>;
    if (
      typeof parsed.createdAt !== "string" ||
      (parsed.kind !== "human" && parsed.kind !== "pet") ||
      typeof parsed.id !== "string" ||
      !parsed.id
    ) {
      return null;
    }
    return { createdAt: parsed.createdAt, kind: parsed.kind, id: parsed.id };
  } catch {
    return null;
  }
}

/** Prefer birth_basis.cart (parent cart order); fall back to report_type. */
function resolveHumanCartItems(row: HumanAdminRow): {
  items: ReportType[];
  generatedCount: number;
} {
  const birthCart = row.birth_basis?.cart;
  if (birthCart && typeof birthCart === "object") {
    const items = parseCartReportTypes(birthCart.items);
    if (items.length > 0) {
      return {
        items,
        generatedCount: Object.keys(birthCart.generated ?? {}).length,
      };
    }
  }

  const fallback =
    typeof row.report_type === "string" ? normalizeReportTypeKey(row.report_type) : null;
  if (fallback) {
    return { items: [fallback], generatedCount: 0 };
  }

  return { items: [], generatedCount: 0 };
}

function isParentCartOrderId(orderId: string | null | undefined): boolean {
  return Boolean(orderId && PARENT_CART_ORDER_RE.test(orderId));
}

function mapPetEntries(
  petRows: UnlockAdminRow[],
  nameByUserId: Map<string, string>
): AdminPaymentHistoryEntry[] {
  return petRows.map((row) => {
    const currencyRaw = String(row.currency ?? "KRW").trim().toUpperCase();
    const currency: "KRW" | "USD" = currencyRaw === "USD" ? "USD" : "KRW";
    const userId = row.user_id;
    // Sort/cursor use DB created_at; order.createdAt keeps paid_at for record consumers.
    return {
      kind: "pet" as const,
      createdAt: row.created_at,
      userId,
      userLabel: userId
        ? nameByUserId.get(userId) || userId.slice(0, 8)
        : "—",
      order: {
        paymentId: row.payment_id as string,
        productCode: row.product_code,
        petId: row.pet_id,
        petName: row.pets?.name ?? "—",
        species: row.pets?.species ?? null,
        petGender: row.pets?.gender ?? null,
        birthDate: row.pets?.birth_date ?? null,
        timezone: row.pets?.birth_timezone ?? null,
        amount: row.amount ?? row.price_krw ?? 0,
        currency,
        createdAt: row.paid_at ?? row.created_at,
        expiresAt: row.expires_at,
        isLifetime: !row.expires_at,
      },
    };
  });
}

function mapHumanEntries(
  humanRows: HumanAdminRow[],
  nameByUserId: Map<string, string>
): AdminPaymentHistoryEntry[] {
  const parentRows = humanRows.filter((row) => isParentCartOrderId(row.payment_order_id));
  const humanByOrder = new Map<string, HumanAdminRow[]>();
  for (const row of parentRows) {
    const orderId = row.payment_order_id;
    if (!orderId) continue;
    const list = humanByOrder.get(orderId) ?? [];
    list.push(row);
    humanByOrder.set(orderId, list);
  }

  const humanEntries: AdminPaymentHistoryEntry[] = [];
  for (const [orderId, rows] of humanByOrder) {
    const first = rows[0];
    if (!first) continue;
    const { items, generatedCount } = resolveHumanCartItems(first);
    const email = first.email?.trim() || null;
    const userId = first.user_id;
    const displayName = userId ? nameByUserId.get(userId) : undefined;
    humanEntries.push({
      kind: "human",
      createdAt: first.created_at,
      userId,
      userLabel: displayName || email || (userId ? userId.slice(0, 8) : "—"),
      order: {
        orderId,
        amount: Number(first.amount_paid ?? 0),
        currency: first.currency ?? "KRW",
        items,
        itemCount: items.length || rows.length,
        personName: first.person_name,
        locale: first.locale === "en" ? "en" : "ko",
        createdAt: first.created_at,
        expiresAt: humanPremiumWebExpiresAt(new Date(first.created_at).getTime()),
        generatedCount,
        email,
      },
    });
  }
  return humanEntries;
}

/**
 * Paginated admin payment history (pet unlocks + human parent cart orders).
 * Date range + order + limit are applied in Supabase queries (not full-table load).
 * Cursor: created_at + kind + id (base64url JSON).
 */
export async function listPaymentHistoryForAdmin(
  params: AdminPaymentHistoryListParams
): Promise<AdminPaymentHistoryListResult> {
  if (!isYmd(params.from) || !isYmd(params.to)) {
    throw new Error("Invalid from/to date (expected YYYY-MM-DD).");
  }
  if (params.from > params.to) {
    throw new Error("from must be on or before to.");
  }

  const limit = clampAdminPaymentLimit(params.limit);
  const cursor = decodeAdminPaymentCursor(params.cursor);
  if (params.cursor && !cursor) {
    throw new Error("Invalid cursor.");
  }

  const { gte, lte } = seoulDayRangeIso(params.from, params.to);
  const supabase = getSupabaseServiceRoleClient();
  const fetchNeed = limit + 1;

  let petQuery = supabase
    .from("pet_premium_unlocks")
    .select(
      "payment_id, product_code, price_krw, amount, currency, paid_at, created_at, expires_at, pet_id, user_id, pets ( name, species, gender, birth_date, birth_timezone )"
    )
    .not("payment_id", "is", null)
    .gte("created_at", gte)
    .lte("created_at", lte)
    .order("created_at", { ascending: false })
    .order("payment_id", { ascending: false })
    .limit(fetchNeed);

  let humanQuery = supabase
    .from("human_premium_reports")
    .select(
      "payment_order_id, user_id, email, person_name, amount_paid, currency, locale, created_at, report_type, birth_basis"
    )
    .filter("payment_order_id", "match", PARENT_CART_ORDER_MATCH)
    .gt("amount_paid", 0)
    .gte("created_at", gte)
    .lte("created_at", lte)
    .order("created_at", { ascending: false })
    .order("payment_order_id", { ascending: false })
    .limit(fetchNeed * HUMAN_ROWS_PER_ORDER);

  if (cursor) {
    // Quote filter values — ISO timestamps contain `:` / `+`.
    const t = `"${cursor.createdAt.replace(/"/g, "")}"`;
    const id = `"${cursor.id.replace(/"/g, "")}"`;
    if (cursor.kind === "pet") {
      // Pets older than cursor; humans at same timestamp sort after all pets (kind:id key).
      petQuery = petQuery.or(`created_at.lt.${t},and(created_at.eq.${t},payment_id.lt.${id})`);
      humanQuery = humanQuery.lte("created_at", cursor.createdAt);
    } else {
      petQuery = petQuery.lt("created_at", cursor.createdAt);
      humanQuery = humanQuery.or(
        `created_at.lt.${t},and(created_at.eq.${t},payment_order_id.lt.${id})`
      );
    }
  }

  const [petRes, humanRes] = await Promise.all([petQuery, humanQuery]);

  if (petRes.error) {
    throw new Error(petRes.error.message || "Failed to load pet payments.");
  }
  if (humanRes.error) {
    throw new Error(humanRes.error.message || "Failed to load human payments.");
  }

  const petRows = (petRes.data ?? []) as UnlockAdminRow[];
  const humanRows = (humanRes.data ?? []) as HumanAdminRow[];

  const userIds = [
    ...new Set([
      ...petRows.map((r) => r.user_id).filter((id): id is string => Boolean(id)),
      ...humanRows.map((r) => r.user_id).filter((id): id is string => Boolean(id)),
    ]),
  ];

  const nameByUserId = new Map<string, string>();
  if (userIds.length) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", userIds);
    for (const profile of profiles ?? []) {
      const name = (profile as { id: string; display_name: string | null }).display_name?.trim();
      if (name) nameByUserId.set((profile as { id: string }).id, name);
    }
  }

  let petEntries = mapPetEntries(petRows, nameByUserId);
  let humanEntries = mapHumanEntries(humanRows, nameByUserId);

  if (cursor) {
    petEntries = petEntries.filter((e) => isAfterCursor(e, cursor));
    humanEntries = humanEntries.filter((e) => isAfterCursor(e, cursor));
  }

  const merged = [...petEntries, ...humanEntries].sort(compareEntriesDesc);
  const page = merged.slice(0, limit);
  const hasMore = merged.length > limit;
  const nextCursor =
    hasMore && page.length > 0 ? encodeAdminPaymentCursor(page[page.length - 1]!) : null;

  return { entries: page, nextCursor, hasMore };
}
