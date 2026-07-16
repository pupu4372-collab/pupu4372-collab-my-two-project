import { listHumanPremiumVaultOrders } from "@/lib/reports/human-premium/cart";
import type { ReportType } from "@/lib/reports/human-premium/types";
import { getRegisteredUserIdFromRequest } from "@/lib/supabase/auth-server";
import { NextResponse } from "next/server";

/**
 * GET /api/premium/human/purchases
 * Registered (full_member) users: unique ReportType[] from fulfilled cart orders (user_id).
 * Guest / anonymous / email_linked: empty list + `guest: true` (client merges localStorage).
 */
export async function GET(request: Request) {
  const userId = await getRegisteredUserIdFromRequest(request);

  if (!userId) {
    // TODO: email-based purchase lookup for guests / anonymous sessions
    return NextResponse.json({
      purchasedReportTypes: [] as ReportType[],
      guest: true,
    });
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
      guest: false,
    });
  } catch {
    return NextResponse.json({
      purchasedReportTypes: [] as ReportType[],
      degraded: true,
      guest: false,
    });
  }
}
