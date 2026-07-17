import type { HumanPremiumBundleKind } from "@/lib/reports/human-premium/pricing";
import type { ReportType } from "@/lib/reports/human-premium/types";

const REPORT_TYPE_ENV_KEYS: Record<ReportType, string> = {
  daily: "PAYPAL_LINK_DAILY",
  decade: "PAYPAL_LINK_DECADE",
  monthly: "PAYPAL_LINK_MONTHLY",
  yearly: "PAYPAL_LINK_YEARLY",
  mental: "PAYPAL_LINK_MENTAL",
  love: "PAYPAL_LINK_LOVE",
  career: "PAYPAL_LINK_CAREER",
  business: "PAYPAL_LINK_BUSINESS",
  wealth: "PAYPAL_LINK_WEALTH",
  lifetime: "PAYPAL_LINK_LIFETIME",
};

const BUNDLE_ENV_KEYS: Record<HumanPremiumBundleKind, string> = {
  all: "PAYPAL_LINK_BUNDLE_ALL",
  themepack: "PAYPAL_LINK_BUNDLE_THEMEPACK",
  timepack: "PAYPAL_LINK_BUNDLE_TIMEPACK",
};

function readPayPalLink(envKey: string): string | null {
  const value = process.env[envKey]?.trim();
  return value || null;
}

export function isPayPalLinkConfigured(): boolean {
  if (readPayPalLink("PAYPAL_LINK_DEFAULT")) return true;
  const reportKeys = Object.values(REPORT_TYPE_ENV_KEYS);
  const bundleKeys = Object.values(BUNDLE_ENV_KEYS);
  return [...reportKeys, ...bundleKeys].some((key) => readPayPalLink(key));
}

export function resolvePayPalPaymentLink(options: {
  reportType?: ReportType;
  bundle?: HumanPremiumBundleKind | null;
  reportId: string;
  paymentId: string;
}): string | null {
  let base: string | null = null;

  if (options.bundle) {
    base = readPayPalLink(BUNDLE_ENV_KEYS[options.bundle]);
  } else if (options.reportType) {
    base =
      readPayPalLink(REPORT_TYPE_ENV_KEYS[options.reportType]) ??
      (options.reportType === "decade" ? readPayPalLink("PAYPAL_LINK_WEEKLY") : null);
  }

  base ??= readPayPalLink("PAYPAL_LINK_DEFAULT");
  if (!base) return null;

  return augmentPayPalLink(base, options);
}

/** Daily Lucky Reading checkout — prefers PAYPAL_LINK_DAILY_EXTRA. */
export function resolveDailyExtraPayPalLink(paymentId: string): string | null {
  const base =
    readPayPalLink("PAYPAL_LINK_DAILY_EXTRA") ??
    readPayPalLink("PAYPAL_LINK_DAILY") ??
    readPayPalLink("PAYPAL_LINK_DEFAULT");
  if (!base) return null;
  return augmentPayPalLink(base, { reportId: paymentId, paymentId });
}

function augmentPayPalLink(
  base: string,
  context: { reportId: string; paymentId: string }
): string {
  try {
    const url = new URL(base);
    url.searchParams.set("invoice_id", context.paymentId);
    return url.toString();
  } catch {
    const separator = base.includes("?") ? "&" : "?";
    return `${base}${separator}invoice_id=${encodeURIComponent(context.paymentId)}`;
  }
}
