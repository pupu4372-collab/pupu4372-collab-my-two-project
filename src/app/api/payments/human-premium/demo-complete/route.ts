import { isHumanPremiumDemoCheckoutEnabled } from "@/lib/payments/human-premium-demo";
import {
  completeHumanPremiumPayment,
  parseHumanPremiumReportInput,
} from "@/lib/reports/human-premium/service";
import {
  createHumanPremiumReportDraft,
  getHumanPremiumReportById,
} from "@/lib/reports/human-premium/storage";
import {
  resolveCheckoutAmount,
  type HumanPremiumBundleKind,
} from "@/lib/reports/human-premium/pricing";
import { getUserIdFromRequest } from "@/lib/supabase/auth-server";
import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";

function parseBundle(value: unknown): HumanPremiumBundleKind | null {
  if (value === "all" || value === "themepack" || value === "timepack") return value;
  return null;
}

export async function POST(request: Request) {
  if (!isHumanPremiumDemoCheckoutEnabled()) {
    return NextResponse.json({ error: "Demo checkout is disabled." }, { status: 403 });
  }

  const userId = await getUserIdFromRequest(request);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  try {
    const reportId = String(body.reportId ?? "").trim();
    let report = reportId ? await getHumanPremiumReportById(reportId) : null;

    if (!report) {
      const input = parseHumanPremiumReportInput(body, userId);
      const bundle = parseBundle(body.bundle);
      const isBundle = Boolean(body.isBundle ?? body.isBunde);
      const amount = resolveCheckoutAmount({
        reportType: input.reportType,
        bundle,
        isBundle,
      });
      const paymentId = `hp_demo_${randomBytes(8).toString("hex")}`;
      const bundleMeta = bundle ?? (isBundle ? "all" : null);

      report = await createHumanPremiumReportDraft(input, {
        status: "payment_pending",
        paymentProvider: "demo",
        paymentOrderId: paymentId,
        checkoutSessionId: bundleMeta ? `bundle:${bundleMeta}` : null,
        amountPaid: amount,
        amountOriginal: amount,
        currency: "KRW",
      });
    }

    if (report.status !== "payment_pending" && report.status !== "draft") {
      if (report.report_payload) {
        return NextResponse.json({
          report,
          duplicate: true,
          webUrl: null,
        });
      }
      return NextResponse.json(
        { error: `Report status is ${report.status}, cannot demo-complete.` },
        { status: 400 }
      );
    }

    const orderId = report.payment_order_id ?? `demo-${report.id}`;
    const completed = await completeHumanPremiumPayment(
      report,
      {
        provider: "demo",
        orderId,
        captureId: `demo-cap-${report.id}`,
        amountPaid: 0,
      },
      { request }
    );

    return NextResponse.json({
      report: completed.row,
      webUrl: completed.webUrl,
      totals: completed.payload.totals,
      demo: true,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Demo checkout failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
