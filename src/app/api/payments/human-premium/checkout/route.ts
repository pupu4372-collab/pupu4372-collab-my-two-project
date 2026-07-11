import { randomBytes } from "node:crypto";
import { isHumanPremiumDemoCheckoutAllowed } from "@/lib/payments/human-premium-demo";
import {
  isPayPalLinkConfigured,
  resolvePayPalPaymentLink,
} from "@/lib/payments/paypal-links";
import { getPortOneShopId, isPortOneConfigured } from "@/lib/payments/portone/config";
import {
  REPORT_TYPE_LABELS,
  REPORT_TYPE_LABELS_EN,
} from "@/lib/reports/human-premium/types";
import { parseHumanPremiumReportInput } from "@/lib/reports/human-premium/service";
import { createHumanPremiumReportDraft } from "@/lib/reports/human-premium/storage";
import {
  getCheckoutCurrency,
  resolveCheckoutAmount,
  type HumanPremiumBundleKind,
} from "@/lib/reports/human-premium/pricing";
import { getUserIdFromRequest } from "@/lib/supabase/auth-server";
import { NextResponse } from "next/server";

function parseBundle(value: unknown): HumanPremiumBundleKind | null {
  if (value === "all" || value === "themepack" || value === "timepack") return value;
  return null;
}

function parsePaymentMethod(
  value: unknown
): "portone" | "paypal_link" {
  return value === "paypal_link" ? "paypal_link" : "portone";
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
    const paymentMethod = parsePaymentMethod(body.paymentMethod);
    const amount = resolveCheckoutAmount(
      {
        reportType: input.reportType,
        bundle,
        isBundle,
      },
      input.locale
    );
    const currency = getCheckoutCurrency(input.locale);

    const paymentId = `hp_${randomBytes(12).toString("hex")}`;
    const bundleMeta = bundle ?? (isBundle ? "all" : null);
    const portoneConfigured = isPortOneConfigured();
    const paypalLinkConfigured = isPayPalLinkConfigured();

    const paymentProvider =
      paymentMethod === "paypal_link"
        ? "paypal"
        : portoneConfigured
          ? "card_pg"
          : null;

    const report = await createHumanPremiumReportDraft(input, {
      status: "payment_pending",
      paymentProvider,
      pgProvider: paymentMethod === "portone" && portoneConfigured ? "portone" : null,
      paymentOrderId: paymentId,
      checkoutSessionId: paymentId,
      amountPaid: amount,
      amountOriginal: amount,
      currency,
    });

    const storeId = getPortOneShopId();
    const orderName =
      input.locale === "ko"
        ? REPORT_TYPE_LABELS[input.reportType ?? "lifetime"]
        : REPORT_TYPE_LABELS_EN[input.reportType ?? "lifetime"];

    const paypalLink = resolvePayPalPaymentLink({
      reportType: input.reportType,
      bundle,
      reportId: report.id,
      paymentId,
    });

    const configured =
      paymentMethod === "paypal_link" ? Boolean(paypalLink) : portoneConfigured;

    return NextResponse.json({
      configured,
      paymentMethod,
      reportId: report.id,
      paymentId,
      storeId,
      amount,
      currency,
      orderName: bundleMeta
        ? input.locale === "ko"
          ? "K-Saju 올인원 번들"
          : "K-Saju all-in-one bundle"
        : `K-Saju ${orderName}`,
      webAccessToken: report.web_access_token,
      portone: {
        configured: portoneConfigured,
        storeId,
      },
      paypal: {
        configured: paypalLinkConfigured,
        link: paypalLink,
        paymentReference: paymentId,
      },
      demoAllowed: isHumanPremiumDemoCheckoutAllowed(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
