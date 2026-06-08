import { PREMIUM_PRICE_USD } from "@/lib/paypal/config";
import { capturePremiumOrder } from "@/lib/paypal/server";
import {
  getHumanPremiumReportById,
  getHumanPremiumReportByPaymentOrderId,
} from "@/lib/reports/human-premium/storage";
import { completeHumanPremiumPayment } from "@/lib/reports/human-premium/service";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const orderId = String(body.orderId ?? "");
  if (!orderId) {
    return NextResponse.json({ error: "orderId required." }, { status: 400 });
  }

  try {
    const reportId = String(body.reportId ?? "").trim();
    const report = reportId
      ? await getHumanPremiumReportById(reportId)
      : await getHumanPremiumReportByPaymentOrderId(orderId);

    if (!report) {
      return NextResponse.json({ error: "Report not found." }, { status: 404 });
    }

    if (report.payment_order_id && report.payment_order_id !== orderId) {
      return NextResponse.json(
        { error: "Payment order mismatch." },
        { status: 400 }
      );
    }

    const capture = await capturePremiumOrder(orderId);

    if (capture.status !== "COMPLETED") {
      return NextResponse.json(
        { error: `PayPal capture status: ${capture.status}` },
        { status: 502 }
      );
    }

    if (
      !capture.demo &&
      (capture.currency !== "USD" || capture.amount !== PREMIUM_PRICE_USD)
    ) {
      return NextResponse.json(
        { error: "PayPal amount verification failed." },
        { status: 400 }
      );
    }

    const completed = await completeHumanPremiumPayment(
      report,
      {
        provider: capture.demo ? "demo" : "paypal",
        orderId,
        captureId: capture.captureId,
        amountPaid: capture.amount,
      },
      { request }
    );

    return NextResponse.json({
      capture,
      report: completed.row,
      webUrl: completed.webUrl,
      totals: completed.payload.totals,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Capture failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
