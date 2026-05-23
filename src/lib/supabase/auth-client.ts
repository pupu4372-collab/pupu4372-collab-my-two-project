"use client";

import {
  clearSupabaseBrowserSession,
  getSupabaseAuthActionClient,
  getSupabaseBrowserClient,
} from "./client";

export type SupportedOAuthProvider = "google" | "facebook" | "naver";

export async function signInWithProvider(provider: SupportedOAuthProvider) {
  clearSupabaseBrowserSession();

  const client = getSupabaseAuthActionClient();
  if (!client) {
    throw new Error("Supabase is not configured.");
  }

  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback`
      : undefined;

  const { error } = await client.auth.signInWithOAuth({
    provider: provider as "google",
    options: { redirectTo },
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

async function persistSession(session: { access_token: string; refresh_token: string } | null) {
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
      ? `${window.location.origin}/auth/callback?next=${document.documentElement.lang === "en" ? "/en" : "/ko"}`
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
