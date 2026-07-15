import { Webhook } from "@portone/server-sdk";
import {
  catalogAmountToPortOneTotal,
  fetchPortOnePayment,
  isPortOnePaymentPaid,
  verifyPortOneAmount,
} from "@/lib/payments/portone/server";
import { isPortOneConfigured } from "@/lib/payments/portone/config";
import {
  fulfillPaidCartOrder,
  isHumanPremiumCartOrderRow,
  pregenerateAllCartReports,
} from "@/lib/reports/human-premium/cart";
import { completeHumanPremiumPayment } from "@/lib/reports/human-premium/service";
import {
  getHumanPremiumReportByPaymentOrderId,
} from "@/lib/reports/human-premium/storage";
import { after, NextResponse } from "next/server";

interface PortOneWebhookBody {
  type?: string;
  paymentId?: string;
  tx_id?: string;
  payment?: { id?: string; status?: string };
  data?: { paymentId?: string };
}

function extractPaymentId(body: PortOneWebhookBody): string | null {
  return (
    body.paymentId ??
    body.payment?.id ??
    (typeof body.data?.paymentId === "string" ? body.data.paymentId : null) ??
    null
  );
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export async function POST(request: Request) {
  if (!isPortOneConfigured()) {
    return NextResponse.json({ error: "PortOne not configured." }, { status: 503 });
  }

  const secret = process.env.PORTONE_V2_WEBHOOK_SECRET?.trim();
  if (!secret) {
    console.error("[WEBHOOK_SECRET_MISSING_FALLBACK]", {
      ip: clientIp(request),
    });
    return NextResponse.json({ error: "webhook_secret_missing" }, { status: 500 });
  }

  const rawBody = await request.text();

  try {
    await Webhook.verify(secret, rawBody, {
      "webhook-id": request.headers.get("webhook-id") ?? undefined,
      "webhook-signature": request.headers.get("webhook-signature") ?? undefined,
      "webhook-timestamp": request.headers.get("webhook-timestamp") ?? undefined,
    });
  } catch (err) {
    console.error("[WEBHOOK_SIGNATURE_INVALID_FALLBACK]", {
      ip: clientIp(request),
      message: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "invalid_webhook_signature" }, { status: 401 });
  }

  let body: PortOneWebhookBody;
  try {
    body = JSON.parse(rawBody) as PortOneWebhookBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const paymentId = extractPaymentId(body);
  if (!paymentId) {
    return NextResponse.json({ error: "paymentId required." }, { status: 400 });
  }

  const payment = await fetchPortOnePayment(paymentId);
  if (!payment || !isPortOnePaymentPaid(payment)) {
    return NextResponse.json({ ok: true, skipped: "not_paid" });
  }

  const row = await getHumanPremiumReportByPaymentOrderId(paymentId);
  if (!row) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }

  const expectedCatalogAmount = Number(row.amount_paid) || Number(row.amount_original);
  const expectedPortOneAmount = catalogAmountToPortOneTotal(
    expectedCatalogAmount,
    row.currency ?? payment.currency
  );
  if (!verifyPortOneAmount(payment, expectedPortOneAmount)) {
    return NextResponse.json({ error: "Amount mismatch." }, { status: 400 });
  }

  // Multi-report cart parent (hp_cart_*) — fulfill shell only, then pregenerate children.
  if (isHumanPremiumCartOrderRow(row)) {
    try {
      const { orderId } = await fulfillPaidCartOrder({
        orderId: paymentId,
        captureId: body.tx_id ?? payment.id,
        provider: "card_pg",
      });
      after(() => {
        void pregenerateAllCartReports({ orderId, userId: row.user_id, request }).catch(
          () => undefined
        );
      });
      return NextResponse.json({ ok: true, cart: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Cart fulfillment failed.";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  if (row.status === "ready" || row.status === "email_sent" || row.report_payload) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  try {
    await completeHumanPremiumPayment(
      row,
      {
        provider: "card_pg",
        orderId: paymentId,
        captureId: body.tx_id ?? payment.id,
        amountPaid: expectedCatalogAmount,
      },
      { request }
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Fulfillment failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
