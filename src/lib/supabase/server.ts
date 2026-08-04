import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * @deprecated Prefer {@link getSupabaseServiceRoleClient} for privileged server paths.
 * Still used by public-read helpers (feeds, notices) with service→anon fallback until
 * those callers move to a dedicated anon client. Do not use for auth.admin, private
 * tables, or RLS-bypassing writes — silent anon fallback hides misconfiguration.
 */
export function getSupabaseServerClient(): SupabaseClient<Database> | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Service-role only — no anon fallback.
 * Use for privileged reads/writes where silent RLS failure is unacceptable.
 */
export function getSupabaseServiceRoleClient(): SupabaseClient<Database> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    console.error(
      "[supabase] SUPABASE_SERVICE_ROLE_KEY is required (refusing anon fallback)"
    );
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required");
  }
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
