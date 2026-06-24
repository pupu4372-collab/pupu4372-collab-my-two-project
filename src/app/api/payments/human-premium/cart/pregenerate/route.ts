import { pregenerateAllCartReports } from "@/lib/reports/human-premium/cart";
import { formatHumanPremiumError } from "@/lib/reports/human-premium/client-errors";
import { getUserIdFromRequest } from "@/lib/supabase/auth-server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const locale = body.locale === "en" ? "en" : "ko";
  const orderId = String(body.orderId ?? "").trim();
  if (!orderId) {
    return NextResponse.json({ error: "orderId required." }, { status: 400 });
  }

  try {
    const userId = await getUserIdFromRequest(request);
    const result = await pregenerateAllCartReports({ orderId, userId, request });
    return NextResponse.json({ orderId, ...result, started: true });
  } catch (err) {
    const raw = err instanceof Error ? err.message : "Pregenerate failed.";
    return NextResponse.json({ error: formatHumanPremiumError(raw, locale) }, { status: 500 });
  }
}
