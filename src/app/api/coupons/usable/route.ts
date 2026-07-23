import {
  COUPON_TYPE_DAILY_LUCKY_FREE,
  findUsableCoupon,
  hasDailyLuckyFreeCouponHistory,
  type CouponType,
} from "@/lib/coupons/coupons";
import { getRegisteredUserIdFromRequest } from "@/lib/supabase/auth-server";
import { NextResponse } from "next/server";

const ALLOWED_TYPES = new Set<string>([COUPON_TYPE_DAILY_LUCKY_FREE]);

/**
 * GET /api/coupons/usable?type=daily_lucky_free
 * Bearer + full_member required.
 * Does not insert a coupon row — lifetime eligibility is derived from history.
 */
export async function GET(request: Request) {
  const userId = await getRegisteredUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "login_required" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = (searchParams.get("type") ?? "").trim();
  if (!type || !ALLOWED_TYPES.has(type)) {
    return NextResponse.json({ error: "Invalid coupon type." }, { status: 400 });
  }

  try {
    const coupon = await findUsableCoupon(userId, type as CouponType);
    if (coupon) {
      return NextResponse.json({
        usable: true,
        coupon: {
          id: coupon.id,
          coupon_type: coupon.coupon_type,
          granted_reason: coupon.granted_reason,
          created_at: coupon.created_at,
        },
      });
    }

    // No unused row: still eligible once if never claimed (lazy grant happens on generate).
    const alreadyClaimed =
      type === COUPON_TYPE_DAILY_LUCKY_FREE
        ? await hasDailyLuckyFreeCouponHistory(userId)
        : true;

    return NextResponse.json({
      usable: !alreadyClaimed,
      coupon: null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Coupon lookup failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
