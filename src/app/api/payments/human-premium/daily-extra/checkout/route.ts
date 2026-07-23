import { catalogAmountToPortOneTotal } from "@/lib/payments/portone/amount";
import { getPortOneShopId, isPortOneConfigured } from "@/lib/payments/portone/config";
import {
  createDailyExtraCheckoutOrder,
  resolveDailyExtraPayPalLinkForOrder,
} from "@/lib/reports/human-premium/daily-extra-payment";
import { formatHumanPremiumError } from "@/lib/reports/human-premium/client-errors";
import {
  formatPrice,
  getDailyExtraPrice,
  resolveDailyExtraCheckout,
} from "@/lib/reports/human-premium/pricing";
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
  // Anonymous sessions allowed (same pattern as human-premium cart checkout).
  const userId = await getUserIdFromRequest(request);

  if (!userId) {
    return NextResponse.json({ error: "login_required" }, { status: 401 });
  }

  try {
    const order = await createDailyExtraCheckoutOrder(userId, locale);
    const { amount, currency } = resolveDailyExtraCheckout(locale);
    // `amount` = catalog units (USD whole dollars). `totalAmount` = PortOne units (USD cents).
    const totalAmount = catalogAmountToPortOneTotal(amount, currency);
    const storeId = getPortOneShopId();
    const paypalLink = locale === "en" ? resolveDailyExtraPayPalLinkForOrder(order.payment_order_id) : null;

    return NextResponse.json({
      paymentId: order.payment_order_id,
      amount,
      totalAmount,
      currency,
      formattedPrice: formatPrice(getDailyExtraPrice(locale), locale),
      orderName:
        locale === "ko" ? "데일리 럭키 운세" : "Daily Lucky Reading",
      portone: {
        configured: isPortOneConfigured(),
        storeId,
      },
      paypal: {
        link: paypalLink,
      },
    });
  } catch (err) {
    const raw = err instanceof Error ? err.message : "Checkout failed.";
    return NextResponse.json({ error: formatHumanPremiumError(raw, locale) }, { status: 500 });
  }
}
