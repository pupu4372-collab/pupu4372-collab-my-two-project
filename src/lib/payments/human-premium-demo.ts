import { getSupabaseServerClient } from "@/lib/supabase/server";

export function isHumanPremiumDemoCheckoutEnabled(): boolean {
  const flag = process.env.HUMAN_PREMIUM_DEMO_CHECKOUT?.trim();
  if (flag === "0" || flag === "false") return false;
  if (flag === "1" || flag === "true") return true;
  return true;
}

/** Demo checkout needs Supabase (service role) to create reports. */
export function isHumanPremiumDemoBackendReady(): boolean {
  if (!isHumanPremiumDemoCheckoutEnabled()) return false;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return Boolean(url && serviceKey && getSupabaseServerClient());
}
