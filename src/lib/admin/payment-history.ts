import { getSupabaseServerClient } from "@/lib/supabase/server";
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

type UnlockAdminRow = {
  payment_id: string | null;
  product_code: string;
  price_krw: number | null;
  amount: number | null;
  currency: string | null;
  paid_at: string | null;
  created_at: string;
  expires_at: string | null;
  pet_id: string;
  user_id: string;
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

/** Parent cart order ids only: hp_cart_ + 20 hex chars (exclude child item rows). */
function isParentCartOrderId(orderId: string | null | undefined): boolean {
  return Boolean(orderId && /^hp_cart_[a-f0-9]{20}$/.test(orderId));
}

/** Service-role admin listing — newest first. */
export async function listAllPaymentHistoryForAdmin(): Promise<AdminPaymentHistoryEntry[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];

  const [petRes, humanRes] = await Promise.all([
    supabase
      .from("pet_premium_unlocks")
      .select(
        "payment_id, product_code, price_krw, amount, currency, paid_at, created_at, expires_at, pet_id, user_id, pets ( name, species, gender, birth_date, birth_timezone )"
      )
      .not("payment_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("human_premium_reports")
      .select(
        "payment_order_id, user_id, email, person_name, amount_paid, currency, locale, created_at, report_type, birth_basis"
      )
      .like("payment_order_id", "hp_cart_%")
      .gt("amount_paid", 0)
      .order("created_at", { ascending: false })
      .limit(400),
  ]);

  const petRows = (petRes.data ?? []) as UnlockAdminRow[];
  const humanRows = ((humanRes.data ?? []) as HumanAdminRow[]).filter((row) =>
    isParentCartOrderId(row.payment_order_id)
  );

  const userIds = [
    ...new Set([
      ...petRows.map((r) => r.user_id),
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

  const petEntries: AdminPaymentHistoryEntry[] = petRows.map((row) => {
    const currencyRaw = String(row.currency ?? "KRW").trim().toUpperCase();
    const currency: "KRW" | "USD" = currencyRaw === "USD" ? "USD" : "KRW";
    return {
      kind: "pet",
      createdAt: row.paid_at ?? row.created_at,
      userId: row.user_id,
      userLabel: nameByUserId.get(row.user_id) || row.user_id.slice(0, 8),
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

  const humanByOrder = new Map<string, HumanAdminRow[]>();
  for (const row of humanRows) {
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

  return [...petEntries, ...humanEntries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
