import {
  isAllowedPetProductCode,
  PET_PRODUCT_AMOUNT_KRW,
  PET_PRODUCT_AMOUNT_USD,
  type PetProductCode,
} from "@/lib/payments/pet-product-catalog";
import { getRegisteredUserIdFromRequest } from "@/lib/supabase/auth-server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import {
  fetchPortOnePayment,
  isPortOnePaymentPaid,
  verifyPortOneAmount,
} from "@/lib/payments/portone/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  let payment_id: string | undefined;
  let product_code: string | undefined;

  try {
    const registeredUserId = await getRegisteredUserIdFromRequest(req);
    if (!registeredUserId) {
      console.error(
        `[PET_PREMIUM_VERIFY_FAILED] paymentId=unknown product_code=unknown status=401 error=unauthorized`
      );
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      payment_id?: string;
      product_code?: string;
      pet_id?: string;
    };
    payment_id = body.payment_id;
    product_code = body.product_code;
    const pet_id = body.pet_id;

    if (!payment_id || !product_code) {
      console.error(
        `[PET_PREMIUM_VERIFY_FAILED] paymentId=${payment_id ?? "unknown"} product_code=${product_code ?? "unknown"} status=400 error=missing_params`
      );
      return NextResponse.json({ error: "missing params" }, { status: 400 });
    }

    if (!isAllowedPetProductCode(product_code)) {
      console.error(
        `[PET_PREMIUM_VERIFY_FAILED] paymentId=${payment_id} product_code=${product_code} status=400 error=unknown_product`
      );
      return NextResponse.json({ error: "unknown product" }, { status: 400 });
    }

    const code = product_code as PetProductCode;

    // 1. PortOne V2 서버에서 결제 정보 검증
    const payment = await fetchPortOnePayment(payment_id);
    if (!payment) {
      console.error(
        `[PET_PREMIUM_VERIFY_FAILED] paymentId=${payment_id} product_code=${product_code} status=400 error=payment_not_found`
      );
      return NextResponse.json({ error: "payment not found" }, { status: 400 });
    }
    if (!isPortOnePaymentPaid(payment)) {
      console.error(
        `[PET_PREMIUM_VERIFY_FAILED] paymentId=${payment_id} product_code=${product_code} status=400 error=not_paid`
      );
      return NextResponse.json({ error: "not paid" }, { status: 400 });
    }

    const paymentCurrency = String(payment.currency ?? "").trim().toUpperCase();
    const isUsd = paymentCurrency === "USD" || paymentCurrency === "CURRENCY_USD";

    if (isUsd && process.env.NEXT_PUBLIC_ENABLE_EN_CHECKOUT !== "true") {
      return NextResponse.json(
        { error: "en_checkout_unsupported", paymentMethod: "unsupported" },
        { status: 501 }
      );
    }

    const expectedAmount = isUsd
      ? Math.round(PET_PRODUCT_AMOUNT_USD[code] * 100)
      : PET_PRODUCT_AMOUNT_KRW[code];

    if (!verifyPortOneAmount(payment, expectedAmount)) {
      console.error(
        `[PET_PREMIUM_VERIFY_FAILED] paymentId=${payment_id} product_code=${product_code} status=400 error=amount_mismatch expected=${expectedAmount}`
      );
      return NextResponse.json({ error: "amount mismatch" }, { status: 400 });
    }

    // 2. Service-role client for unlock write (no anon fallback)
    let supabase: ReturnType<typeof getSupabaseServiceRoleClient>;
    try {
      supabase = getSupabaseServiceRoleClient();
    } catch {
      console.error(
        `[PET_PREMIUM_VERIFY_FAILED] paymentId=${payment_id} product_code=${product_code} status=503 error=db_unavailable`
      );
      return NextResponse.json({ error: "db unavailable" }, { status: 503 });
    }

    // user_id from Bearer-verified registered user only (never from request body)
    const userId = registeredUserId;
    const catalogAmount = isUsd
      ? PET_PRODUCT_AMOUNT_USD[code]
      : PET_PRODUCT_AMOUNT_KRW[code];

    // 3. pet_premium_unlocks 저장
    const { error: dbError } = await supabase
      .from("pet_premium_unlocks")
      .upsert(
        {
          user_id: userId,
          product_code,
          payment_id,
          currency: isUsd ? "USD" : "KRW",
          amount: catalogAmount,
          price_krw: isUsd ? null : catalogAmount,
          paid_at: new Date().toISOString(),
          ...(pet_id ? { pet_id } : {}),
        } as any,
        {
          onConflict: "payment_id",
        }
      );

    if (dbError) {
      console.error(
        `[PET_PREMIUM_VERIFY_FAILED] paymentId=${payment_id} product_code=${product_code} status=500 error=unlock_save_failed`,
        dbError
      );
      return NextResponse.json({ error: "unlock_save_failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "internal error";
    console.error(
      `[PET_PREMIUM_VERIFY_FAILED] paymentId=${payment_id ?? "unknown"} product_code=${product_code ?? "unknown"} status=500 error=${message}`,
      err
    );
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
