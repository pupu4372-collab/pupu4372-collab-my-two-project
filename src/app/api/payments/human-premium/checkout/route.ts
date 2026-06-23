import { randomBytes } from "node:crypto";
import { getPortOneShopId, isPortOneConfigured } from "@/lib/payments/portone/config";
import {
  REPORT_TYPE_LABELS,
  REPORT_TYPE_LABELS_EN,
} from "@/lib/reports/human-premium/types";
import {
  parseHumanPremiumReportInput,
} from "@/lib/reports/human-premium/service";
import { createHumanPremiumReportDraft } from "@/lib/reports/human-premium/storage";
import {
  resolveCheckoutAmount,
  type HumanPremiumBundleKind,
} from "@/lib/reports/human-premium/pricing";
import { getUserIdFromRequest } from "@/lib/supabase/auth-server";
import { NextResponse } from "next/server";

function parseBundle(value: unknown): HumanPremiumBundleKind | null {
  if (value === "all" || value === "themepack" || value === "timepack") return value;
  return null;
}

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
    const bundle = parseBundle(body.bundle);
    const isBundle = Boolean(body.isBundle ?? body.isBunde);
    const amount = resolveCheckoutAmount({
      reportType: input.reportType,
      bundle,
      isBundle,
    });

    const paymentId = `hp_${randomBytes(12).toString("hex")}`;
    const bundleMeta = bundle ?? (isBundle ? "all" : null);

    const report = await createHumanPremiumReportDraft(input, {
      status: "payment_pending",
      paymentProvider: isPortOneConfigured() ? "card_pg" : null,
      pgProvider: isPortOneConfigured() ? "portone" : null,
      paymentOrderId: paymentId,
      checkoutSessionId: bundleMeta ? `bundle:${bundleMeta}` : null,
      amountPaid: amount,
      amountOriginal: amount,
      currency: "KRW",
    });

    const configured = isPortOneConfigured();
    const storeId = getPortOneShopId();
    const orderName =
      input.locale === "ko"
        ? REPORT_TYPE_LABELS[input.reportType ?? "lifetime"]
        : REPORT_TYPE_LABELS_EN[input.reportType ?? "lifetime"];

    return NextResponse.json({
      configured,
      reportId: report.id,
      paymentId,
      storeId,
      amount,
      currency: "KRW",
      orderName: bundleMeta
        ? input.locale === "ko"
          ? `K-Saju 올인원 번들`
          : "K-Saju all-in-one bundle"
        : `K-Saju ${orderName}`,
      webAccessToken: report.web_access_token,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
