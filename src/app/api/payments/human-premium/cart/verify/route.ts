import {
  fetchPortOnePayment,
  isPortOnePaymentPaid,
  verifyPortOneAmount,
} from "@/lib/payments/portone/server";
import { isPortOneConfigured } from "@/lib/payments/portone/config";
import {
  fulfillPaidCartOrder,
  isHumanPremiumCartOrderRow,
  pregenerateAllCartReports,
} from "@/lib/reports/human-premium/cart";
import { formatHumanPremiumError } from "@/lib/reports/human-premium/client-errors";
import { getHumanPremiumReportByPaymentOrderId } from "@/lib/reports/human-premium/storage";
import { getUserIdFromRequest } from "@/lib/supabase/auth-server";
import { after, NextResponse } from "next/server";

export async function POST(request: Request) {
  if (!isPortOneConfigured()) {
    return NextResponse.json({ error: "PortOne is not configured." }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const locale = body.locale === "en" ? "en" : "ko";
  const paymentId = typeof body.paymentId === "string" ? body.paymentId.trim() : "";
  if (!paymentId) {
    return NextResponse.json({ error: "paymentId required." }, { status: 400 });
  }

  // paypal_link remains unsupported on cart verify; PortOne (ko/en) is allowed.
  // TODO(EN launch): add paypal_link verify branch (d350855^ shop success polling).
  if (body.paymentMethod === "paypal_link") {
    return NextResponse.json(
      { error: "en_cart_checkout_unsupported", paymentMethod: "unsupported" },
      { status: 501 }
    );
  }

  try {
    const row = await getHumanPremiumReportByPaymentOrderId(paymentId);
    if (!row || !isHumanPremiumCartOrderRow(row)) {
      return NextResponse.json({ error: "Cart order not found." }, { status: 404 });
    }

    const payment = await fetchPortOnePayment(paymentId);
    if (!payment || !isPortOnePaymentPaid(payment)) {
      return NextResponse.json({ error: "not_paid" }, { status: 400 });
    }

    const rowCurrency = String(row.currency ?? "").trim().toUpperCase();
    const paymentCurrency = String(payment.currency ?? "").trim().toUpperCase();
    if (rowCurrency && paymentCurrency && rowCurrency !== paymentCurrency) {
      console.error("[HUMAN_CART_CURRENCY_MISMATCH]", {
        paymentId,
        rowCurrency,
        paymentCurrency,
        locale,
      });
      return NextResponse.json({ error: "currency_mismatch" }, { status: 400 });
    }

    const expectedCatalogAmount = Number(row.amount_paid) || Number(row.amount_original);
    // Row stores catalog units (USD = whole dollars). PortOne payment.amount.total uses
    // ISO minor units (USD = cents). Match PortOne before compare — same rule as checkout totalAmount.
    const expectedPortOneAmount =
      rowCurrency === "USD" || rowCurrency === "CURRENCY_USD"
        ? Math.round(expectedCatalogAmount * 100) // USD: cents
        : Math.round(expectedCatalogAmount);
    if (!verifyPortOneAmount(payment, expectedPortOneAmount)) {
      return NextResponse.json({ error: "amount_mismatch" }, { status: 400 });
    }

    const { orderId, amount } = await fulfillPaidCartOrder({
      orderId: paymentId,
      captureId: payment.id,
      provider: "card_pg",
    });

    const userId = await getUserIdFromRequest(request);
    after(() => {
      void pregenerateAllCartReports({ orderId, userId, request }).catch(() => undefined);
    });

    return NextResponse.json({ orderId, amount, paid: true });
  } catch (err) {
    const raw = err instanceof Error ? err.message : "Cart verify failed.";
    return NextResponse.json({ error: formatHumanPremiumError(raw, locale) }, { status: 500 });
  }
}
