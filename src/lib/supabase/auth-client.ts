"use client";

import {
  clearAuthSessionPolicy,
  commitLoginPolicy,
  prepareOAuthLogin,
} from "@/lib/supabase/auth-session-policy";
import {
  clearSupabaseBrowserSession,
  getSupabaseAuthActionClient,
  getSupabaseBrowserClient,
} from "./client";

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

  const { error } = await browserClient.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });
  if (error) throw error;

  const {
    data: { session: verified },
  } = await browserClient.auth.getSession();
  if (!verified?.access_token) {
    throw new Error("Session could not be saved.");
  }
}

export async function signUpWithEmail(params: {
  email: string;
  password: string;
  displayName: string;
  locale: string;
}) {
  await clearSupabaseBrowserSession();

  const client = getSupabaseAuthActionClient();
  if (!client) {
    throw new Error("Supabase is not configured.");
  }

  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback?next=/`
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
    commitLoginPolicy(false);
    if (params.displayName.trim()) {
      await saveDisplayNameAfterAuth(params.displayName.trim());
    }
  }
}

export async function signInWithEmail(
  email: string,
  password: string,
  rememberMe = false
) {
  await clearSupabaseBrowserSession();

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
  commitLoginPolicy(rememberMe);
}

function setOAuthNextCookie(path: string) {
  if (typeof document === "undefined") return;
  document.cookie = `auth_oauth_next=${encodeURIComponent(path)}; path=/; max-age=600; SameSite=Lax`;
}

async function signInWithOAuthProvider(
  provider: "google" | "kakao",
  rememberMe: boolean,
  queryParams?: Record<string, string>
) {
  const client = getSupabaseBrowserClient();
  if (!client) {
    throw new Error("Supabase is not configured.");
  }

  prepareOAuthLogin(rememberMe);
  setOAuthNextCookie("/");

  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback`
      : undefined;

  const { data, error } = await client.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      ...(queryParams ? { queryParams } : {}),
    },
  });

  if (error) throw error;
  if (data?.url) {
    window.location.assign(data.url);
  } else {
    throw new Error("OAuth URL was not returned.");
  }
}

export async function signInWithGoogle(rememberMe = false) {
  await signInWithOAuthProvider("google", rememberMe, { prompt: "select_account" });
}

export async function signInWithKakao(rememberMe = false) {
  await signInWithOAuthProvider("kakao", rememberMe);
}

export async function sendPasswordResetEmail(email: string, locale: string) {
  const client = getSupabaseBrowserClient();
  if (!client) {
    throw new Error("Supabase is not configured.");
  }

  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/reset-password?next=/login`
      : undefined;

  const { error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) throw error;
}

export async function checkSignupEmail(email: string) {
  const res = await fetch("/api/auth/check-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = (await res.json()) as {
    exists?: boolean;
    confirmed?: boolean;
    error?: string;
  };

  if (!res.ok) {
    throw new Error(data.error ?? "Could not check email.");
  }

  return {
    exists: Boolean(data.exists),
    confirmed: Boolean(data.confirmed),
  };
}

export async function signOut() {
  const client = getSupabaseBrowserClient();
  if (!client) {
    clearAuthSessionPolicy();
    return;
  }
  await client.auth.signOut();
  clearAuthSessionPolicy();
}

/** Sign out and return to guest session for continued browsing. */
export async function signOutToGuest() {
  const client = getSupabaseBrowserClient();
  if (!client) return;
  clearAuthSessionPolicy();
  await client.auth.signOut();
  await client.auth.signInAnonymously();
}
