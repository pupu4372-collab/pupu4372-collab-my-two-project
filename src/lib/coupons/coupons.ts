import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { COUPON_TYPE_DAILY_LUCKY_FREE } from "./constants";

export { COUPON_TYPE_DAILY_LUCKY_FREE } from "./constants";

export type CouponType = typeof COUPON_TYPE_DAILY_LUCKY_FREE | (string & {});

export type CouponRow = {
  id: string;
  user_id: string;
  coupon_type: string;
  granted_reason: string;
  used_at: string | null;
  used_for: string | null;
  created_at: string;
};

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

  const { data: existing, error: findError } = await supabase
    .from("coupons")
    .select("id")
    .eq("user_id", userId)
    .eq("coupon_type", type)
    .is("used_at", null)
    .limit(1)
    .maybeSingle();

  if (findError) {
    throw new Error(findError.message);
  }
  if (existing?.id) {
    return { granted: false, couponId: existing.id };
  }

  const { data, error } = await supabase
    .from("coupons")
    .insert({
      user_id: userId,
      coupon_type: type,
      granted_reason: reason,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return { granted: true, couponId: data?.id };
}

/** First unused coupon of the given type, or null. */
export async function findUsableCoupon(
  userId: string,
  type: CouponType
): Promise<CouponRow | null> {
  const supabase = getSupabaseServiceRoleClient();

  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("user_id", userId)
    .eq("coupon_type", type)
    .is("used_at", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as CouponRow | null) ?? null;
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

  const { data, error } = await supabase
    .from("coupons")
    .update({
      used_at: now,
      used_for: usedFor,
    })
    .eq("id", couponId)
    .is("used_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data?.id);
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
