import { listHumanPremiumVaultOrders } from "@/lib/reports/human-premium/cart";
import { formatHumanPremiumError } from "@/lib/reports/human-premium/client-errors";
import { getUserIdFromRequest } from "@/lib/supabase/auth-server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") === "en" ? "en" : "ko";
  // Legacy null-user_id rows + session splits: merge localStorage paid orderIds.
  const orderIds =
    searchParams.get("orderIds")?.split(",").map((id) => id.trim()).filter(Boolean) ?? [];

  try {
    // Any authenticated visitor (anonymous included) — same user_id lookup, no grade split.
    const userId = await getUserIdFromRequest(request);

    const orders = await listHumanPremiumVaultOrders({
      userId,
      orderIds: orderIds.length ? orderIds : undefined,
    });

    return NextResponse.json({ orders });
  } catch (err) {
    const raw = err instanceof Error ? err.message : "Vault lookup failed.";
    return NextResponse.json({ error: formatHumanPremiumError(raw, locale) }, { status: 500 });
  }
}
