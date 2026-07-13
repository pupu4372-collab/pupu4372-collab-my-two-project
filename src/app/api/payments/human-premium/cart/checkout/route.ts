import { getPortOneShopId, isPortOneConfigured } from "@/lib/payments/portone/config";
import {
  cartOrderDisplayName,
  createPendingCartOrder,
} from "@/lib/reports/human-premium/cart";
import { formatHumanPremiumError } from "@/lib/reports/human-premium/client-errors";
import { getCheckoutCurrency } from "@/lib/reports/human-premium/pricing";
import { getRegisteredUserIdFromRequest } from "@/lib/supabase/auth-server";
import { NextResponse } from "next/server";

/**
 * Catalog/DB amounts: KRW = won, USD = whole dollars (REPORT_PRICING_USD).
 * PortOne V2 request/payment totals: KRW = won (1×), USD = cents (×100).
 * @see PortOne LoadPaymentUIRequest totalAmount (ISO 4217 minor units);
 * PayPal SPB docs: $17×2 + $23×3 → totalAmount 10300 with currency USD.
 */
function toPortOneTotalAmount(amount: number, currency: string): number {
  const code = currency.trim().toUpperCase();
  if (code === "USD" || code === "CURRENCY_USD") {
    return Math.round(amount * 100); // USD: cents
  }
  return Math.round(amount); // KRW: won
}

/**
 * Cart checkout payment-method branch:
 * - KO / EN → PortOne (this route; EN uses USD draft via getCheckoutCurrency)
 * - paypal_link → not supported on cart yet
 *   TODO(EN launch): paypal_link branch using d350855^ shop pattern if needed
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const locale = body.locale === "en" ? "en" : "ko";

  const paymentMethod = body.paymentMethod === "paypal_link" ? "paypal_link" : "portone";
  if (paymentMethod !== "portone") {
    return NextResponse.json(
      {
        error: "en_cart_checkout_unsupported",
        paymentMethod: "unsupported",
        // TODO(EN launch): paypal_link branch
      },
      { status: 501 }
    );
  }

  if (!isPortOneConfigured()) {
    return NextResponse.json(
      { error: "PortOne is not configured.", paymentMethod: "portone", configured: false },
      { status: 503 }
    );
  }

  try {
    const userId = await getRegisteredUserIdFromRequest(request);
    const { orderId, amount, items } = await createPendingCartOrder(body, userId);
    const currency = getCheckoutCurrency(locale);
    const storeId = getPortOneShopId();
    // `amount` stays catalog units (USD whole dollars) for DB/display.
    // `totalAmount` is the sole PortOne-facing amount (USD: cents). Client must not re-convert.
    const totalAmount = toPortOneTotalAmount(amount, currency);

    return NextResponse.json({
      configured: true,
      paymentMethod: "portone" as const,
      orderId,
      paymentId: orderId,
      storeId,
      amount,
      totalAmount,
      currency,
      orderName: cartOrderDisplayName(items, locale),
      portone: {
        configured: true,
        storeId,
      },
    });
  } catch (err) {
    const raw = err instanceof Error ? err.message : "Cart checkout failed.";
    return NextResponse.json({ error: formatHumanPremiumError(raw, locale) }, { status: 500 });
  }
}
