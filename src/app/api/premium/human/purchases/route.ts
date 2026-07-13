import { listHumanPremiumVaultOrders } from "@/lib/reports/human-premium/cart";
import type { ReportType } from "@/lib/reports/human-premium/types";
import { getRegisteredUserIdFromRequest } from "@/lib/supabase/auth-server";
import { NextResponse } from "next/server";

/**
 * GET /api/premium/human/purchases
 * Registered users: unique ReportType[] from fulfilled cart orders (user_id).
 * Guest / anonymous: empty list (email lookup deferred).
 */
export async function GET(request: Request) {
  const userId = await getRegisteredUserIdFromRequest(request);

  if (!userId) {
    // TODO: email-based purchase lookup for guests / anonymous sessions
    return NextResponse.json({ purchasedReportTypes: [] as ReportType[] });
  }

  try {
    const orders = await listHumanPremiumVaultOrders({ userId });
    const types = new Set<ReportType>();
    for (const order of orders) {
      for (const item of order.items) {
        types.add(item);
      }
    }
    return NextResponse.json({
      purchasedReportTypes: [...types],
    });
  } catch {
    return NextResponse.json({
      purchasedReportTypes: [] as ReportType[],
      degraded: true,
    });
  }
}
