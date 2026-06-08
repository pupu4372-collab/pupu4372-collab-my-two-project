export const PREMIUM_PRICE_USD = 10;

export function isPayPalConfigured(): boolean {
  return Boolean(
    process.env.PAYPAL_CLIENT_ID &&
      process.env.PAYPAL_CLIENT_SECRET
  );
}

export function getPayPalApiBase(): string {
  const mode = process.env.PAYPAL_MODE ?? "sandbox";
  return mode === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

export { getAppBaseUrl, getConfiguredAppBaseUrl, resolveAppBaseUrl } from "@/lib/app-url";
