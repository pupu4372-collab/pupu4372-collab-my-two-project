import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Env flag for human-premium demo checkout.
 * Prefer {@link isHumanPremiumDemoCheckoutAllowed} at call sites — production must never demo-pay.
 */
export function isHumanPremiumDemoCheckoutEnabled(): boolean {
  const flag = process.env.HUMAN_PREMIUM_DEMO_CHECKOUT?.trim();
  if (flag === "0" || flag === "false") return false;
  if (flag === "1" || flag === "true") return true;
  return true;
}

/**
 * Demo cart/single checkout is allowed only outside production (same idea as pet unlock bypass)
 * and when HUMAN_PREMIUM_DEMO_CHECKOUT is not explicitly disabled.
 */
export function isHumanPremiumDemoCheckoutAllowed(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  return isHumanPremiumDemoCheckoutEnabled();
}

/** Demo checkout needs Supabase (service role) to create reports. */
export function isHumanPremiumDemoBackendReady(): boolean {
  if (!isHumanPremiumDemoCheckoutAllowed()) return false;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return Boolean(url && serviceKey && getSupabaseServerClient());
}
