import { listHumanPremiumVaultOrders } from "@/lib/reports/human-premium/cart";
import { formatHumanPremiumError } from "@/lib/reports/human-premium/client-errors";
import { isDeliverableHumanPremiumEmail } from "@/lib/reports/human-premium/email-policy";
import { getRegisteredUserIdFromRequest } from "@/lib/supabase/auth-server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") === "en" ? "en" : "ko";
  const orderIds = searchParams.get("orderIds")?.split(",").map((id) => id.trim()).filter(Boolean) ?? [];
  const emailParam = searchParams.get("email")?.trim().toLowerCase() ?? "";

  try {
    // Registered login only — anon UUID must not query user_id rows.
    // Merges with orderIds/email via listHumanPremiumVaultOrders (dedupe by orderId).
    const userId = await getRegisteredUserIdFromRequest(request);
    const email = isDeliverableHumanPremiumEmail(emailParam) ? emailParam : undefined;

    const orders = await listHumanPremiumVaultOrders({
      userId,
      email,
      orderIds: orderIds.length ? orderIds : undefined,
    });

    return NextResponse.json({ orders });
  } catch (err) {
    const raw = err instanceof Error ? err.message : "Vault lookup failed.";
    return NextResponse.json({ error: formatHumanPremiumError(raw, locale) }, { status: 500 });
  }
}
