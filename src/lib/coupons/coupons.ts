import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import type { Coupon, CouponInsert } from "@/lib/supabase/types";
import { COUPON_TYPE_DAILY_LUCKY_FREE } from "./constants";

export { COUPON_TYPE_DAILY_LUCKY_FREE } from "./constants";

export type CouponType = typeof COUPON_TYPE_DAILY_LUCKY_FREE | (string & {});

export type CouponRow = Coupon;

type CouponIdRow = Pick<Coupon, "id">;

/**
 * Grant one coupon if the user has no unused coupon of this type.
 * Idempotent skip when an unused row already exists (does not stack duplicates).
 */
export async function grantCoupon(
  userId: string,
  type: CouponType,
  reason: string
): Promise<{ granted: boolean; couponId?: string }> {
  const supabase = getSupabaseServiceRoleClient();

  const findResult = await supabase
    .from("coupons")
    .select("id")
    .eq("user_id", userId)
    .eq("coupon_type", type)
    .is("used_at", null)
    .limit(1)
    .maybeSingle();

  if (findResult.error) {
    throw new Error(findResult.error.message);
  }

  // Client Select inference is `never` while Database Row interfaces lack index signatures
  // for GenericTable; pin the known shape explicitly (not `any`).
  const existing = findResult.data as CouponIdRow | null;
  if (existing?.id) {
    return { granted: false, couponId: existing.id };
  }

  const insertRow: CouponInsert = {
    user_id: userId,
    coupon_type: type,
    granted_reason: reason,
  };

  const insertResult = await supabase
    .from("coupons")
    .insert(insertRow as never)
    .select("id")
    .single();

  if (insertResult.error) {
    throw new Error(insertResult.error.message);
  }

  const created = insertResult.data as CouponIdRow;
  return { granted: true, couponId: created.id };
}

/** First unused coupon of the given type, or null. */
export async function findUsableCoupon(
  userId: string,
  type: CouponType
): Promise<CouponRow | null> {
  const supabase = getSupabaseServiceRoleClient();

  const result = await supabase
    .from("coupons")
    .select("*")
    .eq("user_id", userId)
    .eq("coupon_type", type)
    .is("used_at", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data as CouponRow | null;
}

/**
 * Atomically mark coupon used. Returns false if already consumed (race-safe).
 */
export async function consumeCoupon(
  couponId: string,
  usedFor: string
): Promise<boolean> {
  const supabase = getSupabaseServiceRoleClient();
  const now = new Date().toISOString();
  const patch: Pick<Coupon, "used_at" | "used_for"> = {
    used_at: now,
    used_for: usedFor,
  };

  const result = await supabase
    .from("coupons")
    .update(patch as never)
    .eq("id", couponId)
    .is("used_at", null)
    .select("id")
    .maybeSingle();

  if (result.error) {
    throw new Error(result.error.message);
  }

  const updated = result.data as CouponIdRow | null;
  return Boolean(updated?.id);
}

/** Best-effort launch promo grant — never throws to callers. */
export async function tryGrantLaunchDailyLuckyCoupon(userId: string): Promise<void> {
  try {
    await grantCoupon(userId, COUPON_TYPE_DAILY_LUCKY_FREE, "launch_promo");
  } catch (err) {
    console.error("COUPON_GRANT_FALLBACK", {
      userId,
      couponType: COUPON_TYPE_DAILY_LUCKY_FREE,
      message: err instanceof Error ? err.message : String(err),
    });
  }
}
