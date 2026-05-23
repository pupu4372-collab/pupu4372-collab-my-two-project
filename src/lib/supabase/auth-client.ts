"use client";

import { getHomePath, localeFromDocument } from "@/i18n/paths";
import type { Provider } from "@supabase/supabase-js";
import {
  clearSupabaseBrowserSession,
  getSupabaseAuthActionClient,
  getSupabaseBrowserClient,
} from "./client";

export type SupportedOAuthProvider = "google" | "facebook" | "naver";

/** Maps UI provider to Supabase Auth provider id (Naver uses Custom OAuth2). */
function resolveOAuthProviderId(provider: SupportedOAuthProvider): Provider {
  switch (provider) {
    case "google":
    case "facebook":
      return provider;
    case "naver":
      return "custom:naver" as Provider;
  }
}

function getAuthCallbackUrl() {
  if (typeof window === "undefined") return undefined;

  const locale = localeFromDocument();
  const nextPath = getHomePath(locale);
  const params = new URLSearchParams({ next: nextPath });

  return `${window.location.origin}/auth/callback?${params.toString()}`;
}

export async function signInWithProvider(provider: SupportedOAuthProvider) {
  // Keep PKCE verifier storage so Google redirect can finish on /auth/callback.
  clearSupabaseBrowserSession({ preserveOAuthFlow: true });

  const client = getSupabaseAuthActionClient();
  if (!client) {
    throw new Error("Supabase is not configured.");
  }

  const redirectTo = getAuthCallbackUrl();

  const { error } = await client.auth.signInWithOAuth({
    provider: resolveOAuthProviderId(provider),
    options: {
      redirectTo,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) throw error;
}

async function saveDisplayNameAfterAuth(displayName: string) {
  const client = getSupabaseBrowserClient();
  if (!client) return;

  const {
    data: { session },
  } = await client.auth.getSession();
  if (!session?.access_token) return;

  await fetch("/api/profile", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      displayName,
      locale: document.documentElement.lang === "en" ? "en" : "ko",
      timezone: "Asia/Seoul",
    }),
  });
}

export async function persistSession(session: { access_token: string; refresh_token: string } | null) {
  const browserClient = getSupabaseBrowserClient();
  if (!browserClient || !session) return;

  await browserClient.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });
}

export async function signUpWithEmail(params: {
  email: string;
  password: string;
  displayName: string;
}) {
  clearSupabaseBrowserSession();

  const client = getSupabaseAuthActionClient();
  if (!client) {
    throw new Error("Supabase is not configured.");
  }

  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback?next=${getHomePath(localeFromDocument())}`
      : undefined;

  const { data, error } = await client.auth.signUp({
    email: params.email,
    password: params.password,
    options: {
      emailRedirectTo: redirectTo,
    },
  });

  if (error) throw error;

  if (data.session) {
    await persistSession(data.session);
    if (params.displayName.trim()) {
      await saveDisplayNameAfterAuth(params.displayName.trim());
    }
  }
}

export async function signInWithEmail(email: string, password: string) {
  clearSupabaseBrowserSession();

  const client = getSupabaseAuthActionClient();
  if (!client) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  await persistSession(data.session);
}

export async function signOut() {
  const client = getSupabaseBrowserClient();
  if (!client) return;
  await client.auth.signOut();
}

/** Sign out and return to guest session for continued browsing. */
export async function signOutToGuest() {
  const client = getSupabaseBrowserClient();
  if (!client) return;
  await client.auth.signOut();
  await client.auth.signInAnonymously();
}
