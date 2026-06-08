import { createPremiumOrder } from "@/lib/paypal/server";
import { createHumanPremiumReportDraft } from "@/lib/reports/human-premium/storage";
import { parseHumanPremiumReportInput } from "@/lib/reports/human-premium/service";
import { getUserIdFromRequest } from "@/lib/supabase/auth-server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const userId = await getUserIdFromRequest(request);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  try {
    const input = parseHumanPremiumReportInput(body, userId);
    const order = await createPremiumOrder({
      demo: Boolean(body.demo),
      locale: input.locale,
      request,
    });
    const report = await createHumanPremiumReportDraft(input, {
      status: "payment_pending",
      paymentProvider: order.demo ? "demo" : "paypal",
      paymentOrderId: order.orderId,
    });

    return NextResponse.json({
      ...order,
      reportId: report.id,
      webAccessToken: report.web_access_token,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Create order failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
