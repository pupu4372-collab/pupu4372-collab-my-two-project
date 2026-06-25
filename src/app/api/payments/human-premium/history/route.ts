import { formatHumanPremiumError } from "@/lib/reports/human-premium/client-errors";
import { isDeliverableHumanPremiumEmail } from "@/lib/reports/human-premium/email-policy";
import { listHumanPremiumPaymentHistory } from "@/lib/reports/human-premium/payment-history";
import { getUserIdFromRequest } from "@/lib/supabase/auth-server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") === "en" ? "en" : "ko";
  const orderIds = searchParams.get("orderIds")?.split(",").map((id) => id.trim()).filter(Boolean) ?? [];
  const emailParam = searchParams.get("email")?.trim().toLowerCase() ?? "";

  try {
    const userId = await getUserIdFromRequest(request);
    const email = isDeliverableHumanPremiumEmail(emailParam) ? emailParam : undefined;

    const orders = await listHumanPremiumPaymentHistory({
      userId,
      email,
      orderIds: orderIds.length ? orderIds : undefined,
    });

    return NextResponse.json({ orders, hasPayments: orders.length > 0 });
  } catch (err) {
    const raw = err instanceof Error ? err.message : "Payment history lookup failed.";
    return NextResponse.json({ error: formatHumanPremiumError(raw, locale) }, { status: 500 });
  }
}
