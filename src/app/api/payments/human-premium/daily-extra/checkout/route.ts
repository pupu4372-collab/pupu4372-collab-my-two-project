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
import { getRegisteredUserIdFromRequest } from "@/lib/supabase/auth-server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const locale = body.locale === "en" ? "en" : "ko";
  const userId = await getRegisteredUserIdFromRequest(request);

  if (!userId) {
    return NextResponse.json({ error: "login_required" }, { status: 401 });
  }

  try {
    const order = await createDailyExtraCheckoutOrder(userId, locale);
    const { amount, currency } = resolveDailyExtraCheckout(locale);
    const storeId = getPortOneShopId();
    const paypalLink = locale === "en" ? resolveDailyExtraPayPalLinkForOrder(order.payment_order_id) : null;

    return NextResponse.json({
      paymentId: order.payment_order_id,
      amount,
      currency,
      formattedPrice: formatPrice(getDailyExtraPrice(locale), locale),
      orderName:
        locale === "ko" ? "데일리 럭키 루틴 추가" : "Daily Lucky Routine — extra chart",
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
