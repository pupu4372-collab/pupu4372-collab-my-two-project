import { listPetPremiumPaymentHistory } from "@/lib/payments/pet-premium-history";
import { getUserIdFromRequest } from "@/lib/supabase/auth-server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ orders: [], hasPayments: false });
    }

    const orders = await listPetPremiumPaymentHistory(userId);
    return NextResponse.json({ orders, hasPayments: orders.length > 0 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Payment history lookup failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
