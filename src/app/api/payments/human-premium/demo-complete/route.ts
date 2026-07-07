import { isHumanPremiumDemoBackendReady, isHumanPremiumDemoCheckoutEnabled } from "@/lib/payments/human-premium-demo";
import { formatHumanPremiumError } from "@/lib/reports/human-premium/client-errors";
import { buildHumanPremiumReportUrl } from "@/lib/reports/human-premium/email";
import {
  completeHumanPremiumPayment,
  parseHumanPremiumReportInput,
} from "@/lib/reports/human-premium/service";
import {
  createHumanPremiumReportDraft,
  getHumanPremiumReportById,
} from "@/lib/reports/human-premium/storage";
import {
  getCheckoutCurrency,
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
    return NextResponse.json(
      { error: formatHumanPremiumError("Demo checkout is disabled.", "ko") },
      { status: 403 }
    );
  }

  if (!isHumanPremiumDemoBackendReady()) {
    return NextResponse.json(
      {
        error: formatHumanPremiumError("Supabase is not configured.", "ko"),
        code: "supabase_missing",
      },
      { status: 503 }
    );
  }

  const userId = await getUserIdFromRequest(request);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const resolvedLocale = body.locale === "en" ? "en" : "ko";

  try {
    const reportId = String(body.reportId ?? "").trim();
    let report = reportId ? await getHumanPremiumReportById(reportId) : null;

    if (!report) {
      const input = parseHumanPremiumReportInput(body, userId);
      const bundle = parseBundle(body.bundle);
      const isBundle = Boolean(body.isBundle ?? body.isBunde);
      const amount = resolveCheckoutAmount(
        {
          reportType: input.reportType,
          bundle,
          isBundle,
        },
        input.locale
      );
      const currency = getCheckoutCurrency(input.locale);
      const paymentId = `hp_demo_${randomBytes(8).toString("hex")}`;
      const bundleMeta = bundle ?? (isBundle ? "all" : null);

      report = await createHumanPremiumReportDraft(input, {
        status: "payment_pending",
        paymentProvider: "demo",
        paymentOrderId: paymentId,
        checkoutSessionId: paymentId,
        amountPaid: amount,
        amountOriginal: amount,
        currency,
      });
    }

    if (report.status !== "payment_pending" && report.status !== "draft") {
      if (report.report_payload) {
        return NextResponse.json({
          report,
          duplicate: true,
          webUrl: buildHumanPremiumReportUrl(report, request),
        });
      }
      return NextResponse.json(
        {
          error: formatHumanPremiumError(
            `Report status is ${report.status}, cannot demo-complete.`,
            resolvedLocale
          ),
        },
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
    const raw = err instanceof Error ? err.message : "Demo checkout failed.";
    return NextResponse.json(
      { error: formatHumanPremiumError(raw, resolvedLocale) },
      { status: 500 }
    );
  }
}
