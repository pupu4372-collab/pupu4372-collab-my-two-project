import {
  verifyDailyExtraPayPalCheckout,
  verifyDailyExtraPortOnePayment,
} from "@/lib/reports/human-premium/daily-extra-payment";
import { formatHumanPremiumError } from "@/lib/reports/human-premium/client-errors";
import { getUserIdFromRequest } from "@/lib/supabase/auth-server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const locale = body.locale === "en" ? "en" : "ko";
  // Anonymous sessions allowed (same pattern as human-premium cart verify).
  const userId = await getUserIdFromRequest(request);
  const paymentId = String(body.paymentId ?? body.payment_id ?? "").trim();
  const method = body.paymentMethod === "paypal_link" ? "paypal_link" : "portone";

  if (!userId) {
    return NextResponse.json({ error: "login_required" }, { status: 401 });
  }
  if (!paymentId) {
    return NextResponse.json({ error: "paymentId required." }, { status: 400 });
  }

  try {
    const order =
      method === "paypal_link"
        ? await verifyDailyExtraPayPalCheckout(userId, paymentId)
        : await verifyDailyExtraPortOnePayment(userId, paymentId, locale);

    return NextResponse.json({
      ok: true,
      paymentId: order.payment_order_id,
      status: order.status,
    });
  } catch (err) {
    const raw = err instanceof Error ? err.message : "Payment verify failed.";
    return NextResponse.json({ error: formatHumanPremiumError(raw, locale) }, { status: 400 });
  }
}
