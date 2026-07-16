import { listHumanPremiumVaultOrders } from "@/lib/reports/human-premium/cart";
import type { ReportType } from "@/lib/reports/human-premium/types";
import {
  getRegisteredUserIdFromRequest,
  getUserIdFromRequest,
} from "@/lib/supabase/auth-server";
import { NextResponse } from "next/server";

/**
 * GET /api/premium/human/purchases
 * Any authenticated user (anonymous included): ReportType[] by user_id.
 * `guest: true` when not full_member — client merges localStorage for legacy
 * null-user_id orders (pre–stage-2) that never got a user_id attribution.
 */
export async function GET(request: Request) {
  const userId = await getUserIdFromRequest(request);
  const fullMemberId = await getRegisteredUserIdFromRequest(request);
  const guest = !fullMemberId;

  if (!userId) {
    return NextResponse.json({
      purchasedReportTypes: [] as ReportType[],
      // No session: treat as guest so client may still use localStorage fallback.
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
      guest,
    });
  } catch {
    return NextResponse.json({
      purchasedReportTypes: [] as ReportType[],
      degraded: true,
      guest,
    });
  }
}
