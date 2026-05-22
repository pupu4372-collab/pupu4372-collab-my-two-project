import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

let browserClient: SupabaseClient<Database> | null = null;

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

function isPkceFlowStorageKey(key: string) {
  return key.includes("code-verifier") || key.includes("code_verifier");
}

export function clearSupabaseBrowserSession(options?: { preserveOAuthFlow?: boolean }) {
  if (typeof window === "undefined") return;

  const preserveOAuthFlow = options?.preserveOAuthFlow ?? false;
  const { url } = readSupabaseEnv();
  const projectRef = url.match(/^https:\/\/([^.]+)\.supabase\.co/)?.[1];
  const storageKeys = new Set<string>();

  if (projectRef) storageKeys.add(`sb-${projectRef}-auth-token`);
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (key?.startsWith("sb-")) storageKeys.add(key);
  }

  for (const key of storageKeys) {
    if (preserveOAuthFlow && isPkceFlowStorageKey(key)) continue;
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  }

  browserClient = null;
}

/** Ephemeral client for login/signup — avoids corrupted browser auth storage. */
export function getSupabaseAuthActionClient(): SupabaseClient<Database> | null {
  const { url, key } = readSupabaseEnv();
  if (!isValidSupabaseEnv(url, key)) return null;

  return createClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      flowType: "pkce",
      storage:
        typeof window !== "undefined" ? window.localStorage : undefined,
    },
  });
}

export function getSupabaseBrowserClient(): SupabaseClient<Database> | null {
  const { url, key } = readSupabaseEnv();
  if (!isValidSupabaseEnv(url, key)) return null;

  if (!browserClient) {
    browserClient = createClient<Database>(url, key);
  }
  return browserClient;
}

export function isSupabaseConfigured(): boolean {
  const { url, key } = readSupabaseEnv();
  return isValidSupabaseEnv(url, key);
}
