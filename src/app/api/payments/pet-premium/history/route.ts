import { listPetPremiumPaymentHistory } from "@/lib/payments/pet-premium-history";
import { getNonAnonymousUserIdFromRequest } from "@/lib/supabase/auth-server";
import { NextResponse } from "next/server";

/** Owner-only pet premium payment history (Bearer, non-anonymous). */
export async function GET(request: Request) {
  try {
    const userId = await getNonAnonymousUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const orders = await listPetPremiumPaymentHistory(userId);
    return NextResponse.json({ orders, hasPayments: orders.length > 0 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Payment history lookup failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
