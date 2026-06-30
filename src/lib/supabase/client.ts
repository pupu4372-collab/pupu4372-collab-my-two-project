import { clearAuthSessionPolicy } from "@/lib/supabase/auth-session-policy";
import { createBrowserClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

function readSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  return { url, key };
}

function hasInvalidEnvChars(value: string) {
  return [...value].some((ch) => ch.charCodeAt(0) > 255);
}

function isValidSupabaseEnv(url: string, key: string) {
  return Boolean(
    url &&
      key &&
      /^https:\/\/[^.]+\.supabase\.co$/.test(url) &&
      key.startsWith("sb_") &&
      !hasInvalidEnvChars(url) &&
      !hasInvalidEnvChars(key)
  );
}

function collectSupabaseStorageKeys() {
  if (typeof window === "undefined") return [] as string[];

  const { url } = readSupabaseEnv();
  const projectRef = url.match(/^https:\/\/([^.]+)\.supabase\.co/)?.[1];
  const storageKeys = new Set<string>();

  if (projectRef) storageKeys.add(`sb-${projectRef}-auth-token`);
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (key?.startsWith("sb-")) storageKeys.add(key);
  }

  return [...storageKeys];
}

/** Cookie-backed browser client (PKCE + session). Use for OAuth and session reads. */
let browserClient: SupabaseClient<Database> | null | undefined;

export function getSupabaseBrowserClient(): SupabaseClient<Database> | null {
  const { url, key } = readSupabaseEnv();
  if (!isValidSupabaseEnv(url, key)) return null;

  if (!browserClient) {
    browserClient = createBrowserClient(url, key) as SupabaseClient<Database>;
  }
  return browserClient;
}

export async function clearSupabaseBrowserSession() {
  if (typeof window === "undefined") return;

  const client = getSupabaseBrowserClient();
  if (client) {
    try {
      await client.auth.signOut({ scope: "local" });
    } catch {
      // Storage wipe below still runs if signOut fails.
    }
  }

  for (const key of collectSupabaseStorageKeys()) {
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  }

  const expires = "Max-Age=0; path=/";
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0]?.trim();
    if (name?.startsWith("sb-") || name === "auth_oauth_next" || name === "auth_remember_me") {
      document.cookie = `${name}=; ${expires}`;
    }
  }

  clearAuthSessionPolicy();
}

/** Ephemeral client for email login/signup — avoids corrupted browser auth storage. */
export function getSupabaseAuthActionClient(): SupabaseClient<Database> | null {
  const { url, key } = readSupabaseEnv();
  if (!isValidSupabaseEnv(url, key)) return null;

  return createClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export function isSupabaseConfigured(): boolean {
  const { url, key } = readSupabaseEnv();
  return isValidSupabaseEnv(url, key);
}
