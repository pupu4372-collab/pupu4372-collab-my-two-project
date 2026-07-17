/** Shared coupon type codes (safe for client + server). */
export const COUPON_TYPE_DAILY_LUCKY_FREE = "daily_lucky_free" as const;

export type KnownCouponType = typeof COUPON_TYPE_DAILY_LUCKY_FREE;
