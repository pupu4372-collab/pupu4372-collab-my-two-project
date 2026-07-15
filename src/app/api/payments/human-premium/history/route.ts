import { listHumanPremiumPaymentHistory } from "@/lib/reports/human-premium/payment-history";
import { formatHumanPremiumError } from "@/lib/reports/human-premium/client-errors";
import { getNonAnonymousUserIdFromRequest } from "@/lib/supabase/auth-server";
import { NextResponse } from "next/server";

/** Owner-only human premium payment history (Bearer, non-anonymous). */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") === "en" ? "en" : "ko";

  try {
    const userId = await getNonAnonymousUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const orders = await listHumanPremiumPaymentHistory({ userId });
    return NextResponse.json({ orders, hasPayments: orders.length > 0 });
  } catch (err) {
    const raw = err instanceof Error ? err.message : "Payment history lookup failed.";
    return NextResponse.json({ error: formatHumanPremiumError(raw, locale) }, { status: 500 });
  }
}
