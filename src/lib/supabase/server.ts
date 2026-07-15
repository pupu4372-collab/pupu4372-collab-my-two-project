import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "./types";

function readSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  return { url, key };
}

function hasInvalidEnvChars(value: string) {
  return [...value].some((ch) => ch.charCodeAt(0) > 255);
}

function isValidSupabaseAnonEnv(url: string, key: string) {
  return Boolean(
    url &&
      key &&
      /^https:\/\/[^.]+\.supabase\.co$/.test(url) &&
      key.startsWith("sb_") &&
      !hasInvalidEnvChars(url) &&
      !hasInvalidEnvChars(key)
  );
}

/** Service-role (or anon fallback) client for public feeds and admin APIs. */
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
 * Use for privileged writes (e.g. payment unlocks) where silent RLS failure is unacceptable.
 */
export function getSupabaseServiceRoleClient(): SupabaseClient<Database> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required");
  }
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Cookie-backed server client for OAuth PKCE callback and session refresh. */
export async function createSupabaseServerClient() {
  const { url, key } = readSupabaseEnv();
  if (!isValidSupabaseAnonEnv(url, key)) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Component read-only context; route handlers can set cookies.
        }
      },
    },
  });
}
