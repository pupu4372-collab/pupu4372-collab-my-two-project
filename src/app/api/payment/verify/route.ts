import { getRegisteredUserIdFromRequest } from "@/lib/supabase/auth-server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  fetchPortOnePayment,
  isPortOnePaymentPaid,
  verifyPortOneAmount,
} from "@/lib/payments/portone/server";
import { NextRequest, NextResponse } from "next/server";

const PRODUCT_AMOUNT: Record<string, number> = {
  pet_premium_v1: 4500,
};

export async function POST(req: NextRequest) {
  try {
    const registeredUserId = await getRegisteredUserIdFromRequest(req);
    if (!registeredUserId) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { payment_id, product_code, pet_id } = await req.json();

    if (!payment_id || !product_code) {
      return NextResponse.json({ error: "missing params" }, { status: 400 });
    }

    const expectedAmount = PRODUCT_AMOUNT[product_code];
    if (!expectedAmount) {
      return NextResponse.json({ error: "unknown product" }, { status: 400 });
    }

    // 1. PortOne V2 서버에서 결제 정보 검증
    const payment = await fetchPortOnePayment(payment_id);
    if (!payment) {
      console.error(
        `[PET_PREMIUM_VERIFY_FAILED] paymentId=${payment_id} status=400 error=payment_not_found`
      );
      return NextResponse.json({ error: "payment not found" }, { status: 400 });
    }
    if (!isPortOnePaymentPaid(payment)) {
      console.error(
        `[PET_PREMIUM_VERIFY_FAILED] paymentId=${payment_id} status=400 error=not_paid`
      );
      return NextResponse.json({ error: "not paid" }, { status: 400 });
    }
    if (!verifyPortOneAmount(payment, expectedAmount)) {
      console.error(
        `[PET_PREMIUM_VERIFY_FAILED] paymentId=${payment_id} status=400 error=amount_mismatch`
      );
      return NextResponse.json({ error: "amount mismatch" }, { status: 400 });
    }

    // 2. Supabase 유저 확인
    let supabase: Awaited<ReturnType<typeof createSupabaseServerClient>> | null = null;
    try {
      supabase = await createSupabaseServerClient();
    } catch {
      return NextResponse.json({ error: "db unavailable" }, { status: 503 });
    }

    if (!supabase) {
      return NextResponse.json({ error: "db unavailable" }, { status: 503 });
    }

    const userId = registeredUserId;

    // 3. pet_premium_unlocks 저장
    const { error: dbError } = await supabase
      .from("pet_premium_unlocks")
      .upsert(
        {
          user_id: userId,
          product_code,
          payment_id,
          price_krw: expectedAmount,
          paid_at: new Date().toISOString(),
          ...(pet_id ? { pet_id } : {}),
        } as any,
        {
          onConflict: "payment_id",
        }
      );

    if (dbError) {
      console.error(
        `[PET_PREMIUM_VERIFY_FAILED] paymentId=${payment_id} status=500 error=unlock_save_failed`,
        dbError
      );
      return NextResponse.json({ error: "unlock_save_failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "internal error";
    console.error(`[PET_PREMIUM_VERIFY_FAILED] paymentId=unknown status=500 error=${message}`, err);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
