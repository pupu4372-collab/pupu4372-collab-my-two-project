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
      return NextResponse.json({ error: "payment not found" }, { status: 400 });
    }
    if (!isPortOnePaymentPaid(payment)) {
      return NextResponse.json({ error: "not paid" }, { status: 400 });
    }
    if (!verifyPortOneAmount(payment, expectedAmount)) {
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

    // Bearer 토큰 우선, 없으면 쿠키 세션 fallback
    const authHeader = req.headers.get("authorization");
    let user = null;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const { data } = await supabase.auth.getUser(token);
      user = data.user;
    }
    if (!user) {
      const { data } = await supabase.auth.getUser();
      user = data.user;
    }

    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // 3. pet_premium_unlocks 저장
    const { error: dbError } = await supabase
      .from("pet_premium_unlocks")
      .upsert(
        {
          user_id: user.id,
          product_code,
          payment_id,
          price_krw: expectedAmount,
          ...(pet_id ? { pet_id } : {}),
        } as any,
        {
          onConflict: "payment_id",
        }
      );

    if (dbError) {
      console.error("pet_premium_unlocks upsert error:", dbError);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("payment verify error:", err);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
