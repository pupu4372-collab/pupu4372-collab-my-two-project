import {
  cartOrderSnapshot,
  generateCartReportItem,
} from "@/lib/reports/human-premium/cart";
import { formatHumanPremiumError } from "@/lib/reports/human-premium/client-errors";
import { getHumanPremiumReportByPaymentOrderId } from "@/lib/reports/human-premium/storage";
import { parseReportType } from "@/lib/reports/human-premium/types";
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
  const reportType = parseReportType(body.reportType);

  if (!orderId) {
    return NextResponse.json({ error: "orderId required." }, { status: 400 });
  }

  try {
    const userId = await getUserIdFromRequest(request);
    const result = await generateCartReportItem({
      orderId,
      reportType,
      userId,
      request,
    });
    return NextResponse.json(result);
  } catch (err) {
    const raw = err instanceof Error ? err.message : "Report generation failed.";
    return NextResponse.json({ error: formatHumanPremiumError(raw, locale) }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = String(searchParams.get("orderId") ?? "").trim();
  if (!orderId) {
    return NextResponse.json({ error: "orderId required." }, { status: 400 });
  }

  const row = await getHumanPremiumReportByPaymentOrderId(orderId);
  if (!row) {
    return NextResponse.json({ error: "Cart order not found." }, { status: 404 });
  }

  const snapshot = cartOrderSnapshot(row);
  if (!snapshot) {
    return NextResponse.json({ error: "Invalid cart order." }, { status: 400 });
  }

  return NextResponse.json(snapshot);
}
