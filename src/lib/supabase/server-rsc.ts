import { createServerClient } from "@supabase/ssr";
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

/** Cookie-backed server client for RSC layouts, OAuth PKCE callback, and session refresh. */
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
