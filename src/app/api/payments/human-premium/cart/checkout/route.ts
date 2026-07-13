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
 * Cart checkout payment-method branch:
 * - KO → PortOne (this route)
 * - EN → not supported yet
 *   TODO(EN launch): port original shop PayPal pattern from commit d350855^
 *   (HumanPremiumShop prepareCheckout("paypal_link") + PAYPAL_LINK_* env).
 *   Add a `paymentMethod: "paypal_link"` branch here without rewriting KO PortOne.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const locale = body.locale === "en" ? "en" : "ko";

  // Payment-method fork — extend here for EN PayPal later; do not collapse into PortOne.
  if (locale === "en") {
    return NextResponse.json(
      {
        error: "en_cart_checkout_unsupported",
        paymentMethod: "unsupported",
        // TODO(EN launch): implement paypal_link using d350855^ shop pattern
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

  try {
    const userId = await getRegisteredUserIdFromRequest(request);
    const { orderId, amount, items } = await createPendingCartOrder(body, userId);
    const currency = getCheckoutCurrency(locale);
    const storeId = getPortOneShopId();

    return NextResponse.json({
      configured: true,
      paymentMethod: "portone" as const,
      orderId,
      paymentId: orderId,
      storeId,
      amount,
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
