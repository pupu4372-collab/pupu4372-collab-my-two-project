import {
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
}

function extractPaymentId(body: PortOneWebhookBody): string | null {
  return body.paymentId ?? body.payment?.id ?? null;
}

export async function POST(request: Request) {
  if (!isPortOneConfigured()) {
    return NextResponse.json({ error: "PortOne not configured." }, { status: 503 });
  }

  let body: PortOneWebhookBody;
  try {
    body = (await request.json()) as PortOneWebhookBody;
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

  const expectedAmount = Number(row.amount_paid) || Number(row.amount_original);
  if (!verifyPortOneAmount(payment, expectedAmount)) {
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
        amountPaid: expectedAmount,
      },
      { request }
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Fulfillment failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
