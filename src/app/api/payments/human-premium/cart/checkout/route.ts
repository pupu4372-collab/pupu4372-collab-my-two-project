import { getPortOneShopId, isPortOneConfigured } from "@/lib/payments/portone/config";
import { catalogAmountToPortOneTotal } from "@/lib/payments/portone/amount";
import {
  cartOrderDisplayName,
  createPendingCartOrder,
} from "@/lib/reports/human-premium/cart";
import { formatHumanPremiumError } from "@/lib/reports/human-premium/client-errors";
import { resolveHumanPremiumEmail } from "@/lib/reports/human-premium/email-policy";
import { getCheckoutCurrency } from "@/lib/reports/human-premium/pricing";
import { getUserIdFromRequest } from "@/lib/supabase/auth-server";
import { NextResponse } from "next/server";

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

  // EN live cart checkout gated by feature flag (Vercel unset = OFF).
  if (locale === "en" && process.env.NEXT_PUBLIC_ENABLE_EN_CHECKOUT !== "true") {
    return NextResponse.json(
      {
        error: "en_cart_checkout_unsupported",
        paymentMethod: "unsupported",
      },
      { status: 501 }
    );
  }

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

  // EN guest checkout: refuse placeholder (noemail) emails before drafting a pending row.
  if (locale === "en") {
    const { deliverEmail } = resolveHumanPremiumEmail(body.email);
    if (!deliverEmail) {
      return NextResponse.json({ error: "email_required_for_en" }, { status: 400 });
    }
  }

  try {
    // Attribute cart orders to any authenticated visitor (anonymous included).
    // New orders must always have user_id — no Bearer / no session → reject.
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "login_required" }, { status: 400 });
    }
    const { orderId, amount, items } = await createPendingCartOrder(body, userId);
    const currency = getCheckoutCurrency(locale);
    const storeId = getPortOneShopId();
    // `amount` stays catalog units (USD whole dollars) for DB/display.
    // `totalAmount` is the sole PortOne-facing amount (USD: cents). Client must not re-convert.
    const totalAmount = catalogAmountToPortOneTotal(amount, currency);

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
