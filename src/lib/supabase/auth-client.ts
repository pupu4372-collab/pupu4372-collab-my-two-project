"use client";

import {
  clearAuthSessionPolicy,
  commitLoginPolicy,
  prepareOAuthLogin,
} from "@/lib/supabase/auth-session-policy";
import { getSafeInternalReturnPath } from "@/lib/auth/safe-internal-return-path";
import { migrateGuestCartAfterPromotion } from "@/lib/reports/human-premium/cart-session";
import {
  clearPersonalClientStorage,
  resetPersonalStorageOwner,
} from "@/lib/storage/clear-personal-storage";
import {
  EmailAlreadyRegisteredError,
  setAccountPromotionInProgress,
} from "@/lib/supabase/account-promotion";
import {
  clearSupabaseBrowserSession,
  getSupabaseAuthActionClient,
  getSupabaseBrowserClient,
} from "./client";

export { EmailAlreadyRegisteredError } from "@/lib/supabase/account-promotion";

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

async function recordHasPasswordFlag(accessToken: string, password: string) {
  const flagRes = await fetch("/api/auth/confirm-password-set", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ password }),
  });
  const flagData = (await flagRes.json()) as { error?: string };
  if (!flagRes.ok) {
    throw new Error(
      typeof flagData.error === "string"
        ? flagData.error
        : "Could not finalize membership."
    );
  }
}

/** Login-time self-heal: email/password user missing app_metadata.has_password. */
function shouldRepairHasPassword(user: {
  is_anonymous?: boolean;
  email?: string | null;
  app_metadata?: Record<string, unknown> | null;
} | null | undefined): boolean {
  if (!user) return false;
  if (user.is_anonymous) return false;
  if (!user.email) return false;
  if (user.app_metadata?.has_password === true) return false;
  return true;
}

/**
 * Best-effort has_password repair after a successful password login.
 * Must never throw — login already succeeded.
 */
async function tryRepairHasPasswordAfterLogin(
  accessToken: string,
  password: string,
  user: {
    is_anonymous?: boolean;
    email?: string | null;
    app_metadata?: Record<string, unknown> | null;
  } | null | undefined
) {
  if (!shouldRepairHasPassword(user)) return;
  try {
    await recordHasPasswordFlag(accessToken, password);
    const browser = getSupabaseBrowserClient();
    await browser?.auth.refreshSession();
  } catch (err) {
    console.warn(
      "[auth] has_password repair after login failed:",
      err instanceof Error ? err.message : err
    );
  }
}

export type SignUpWithEmailResult = {
  /** True when an existing anonymous session was upgraded in place. */
  promoted: boolean;
};

export async function signUpWithEmail(params: {
  email: string;
  password: string;
  displayName: string;
  locale: string;
}): Promise<SignUpWithEmailResult> {
  const emailStatus = await checkSignupEmail(params.email);
  if (emailStatus.exists) {
    throw new EmailAlreadyRegisteredError();
  }

  const browserClient = getSupabaseBrowserClient();
  if (!browserClient) {
    throw new Error("Supabase is not configured.");
  }

  const {
    data: { session: existingSession },
  } = await browserClient.auth.getSession();

  // Same anon check as useSupabaseSession readUser: is_anonymous !== false
  const isAnonymousSession = Boolean(
    existingSession?.user && existingSession.user.is_anonymous !== false
  );

  if (isAnonymousSession) {
    setAccountPromotionInProgress(true);
    try {
      const { data, error } = await browserClient.auth.updateUser({
        email: params.email,
        password: params.password,
      });
      if (error) throw error;

      const user = data.user;
      if (!user || user.is_anonymous) {
        throw new Error(
          "Account promotion did not complete. Please try again."
        );
      }
      // Secure email change / confirm-email would leave email unset — stop, do not fall back.
      if (!user.email) {
        throw new Error(
          "EMAIL_CONFIRMATION_REQUIRED_FOR_PROMOTION"
        );
      }

      const { data: refreshed, error: refreshError } =
        await browserClient.auth.refreshSession();
      if (refreshError) throw refreshError;

      const accessToken =
        refreshed.session?.access_token ?? existingSession!.access_token;
      await recordHasPasswordFlag(accessToken, params.password);

      const { data: afterFlag, error: afterFlagError } =
        await browserClient.auth.refreshSession();
      if (afterFlagError) throw afterFlagError;

      const finalUser = afterFlag.session?.user ?? user;
      if (finalUser.is_anonymous) {
        throw new Error(
          "Account promotion did not complete. Please try again."
        );
      }

      migrateGuestCartAfterPromotion(finalUser.id);
      commitLoginPolicy(false);
      if (params.displayName.trim()) {
        await saveDisplayNameAfterAuth(params.displayName.trim());
      }

      return { promoted: true };
    } finally {
      setAccountPromotionInProgress(false);
    }
  }

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

  return { promoted: false };
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

  // Self-heal email_linked accounts stuck without has_password (e.g. promotion
  // updateUser succeeded but confirm-password-set failed). Never blocks login.
  if (data.session?.access_token) {
    await tryRepairHasPasswordAfterLogin(
      data.session.access_token,
      password,
      data.session.user ?? data.user
    );
  }
}

function setOAuthNextCookie(path: string) {
  if (typeof document === "undefined") return;
  document.cookie = `auth_oauth_next=${encodeURIComponent(path)}; path=/; max-age=600; SameSite=Lax`;
}

export function saveAuthReturnPath(path: string) {
  setOAuthNextCookie(getSafeInternalReturnPath(path));
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
  clearPersonalClientStorage();
  resetPersonalStorageOwner();
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
  clearPersonalClientStorage();
  resetPersonalStorageOwner();
  const client = getSupabaseBrowserClient();
  if (!client) return;
  clearAuthSessionPolicy();
  await client.auth.signOut();
  await client.auth.signInAnonymously();
}
