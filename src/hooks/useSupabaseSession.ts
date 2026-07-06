"use client";

import {
  ensurePolicyInitialized,
  finalizeOAuthLoginPolicy,
  markSessionAlive,
  shouldInvalidateSession,
} from "@/lib/supabase/auth-session-policy";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Session } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";

export interface SessionInfo {
  ready: boolean;
  accessToken: string | null;
  userId: string | null;
  email: string | null;
  isAnonymous: boolean;
  provider: string | null;
  configured: boolean;
  refresh: () => Promise<void>;
}

function readUser(session: Session | null) {
  const user = session?.user;
  if (!user) {
    return { userId: null, email: null, isAnonymous: true, provider: null };
  }

  const provider =
    (user.app_metadata?.provider as string | undefined) ??
    user.identities?.[0]?.provider ??
    null;

  return {
    userId: user.id,
    email: user.email ?? null,
    isAnonymous: user.is_anonymous ?? false,
    provider,
  };
}

export function useSupabaseSession(): SessionInfo {
  const [ready, setReady] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [provider, setProvider] = useState<string | null>(null);
  const configured = isSupabaseConfigured();

  const applySession = useCallback((session: Session | null) => {
    if (!session) {
      setAccessToken(null);
      setUserId(null);
      setEmail(null);
      setIsAnonymous(true);
      setProvider(null);
      return;
    }

    const info = readUser(session);
    setAccessToken(session.access_token);
    setUserId(info.userId);
    setEmail(info.email);
    setIsAnonymous(info.isAnonymous);
    setProvider(info.provider);
  }, []);

  const enforceSessionPolicy = useCallback(async () => {
    const client = getSupabaseBrowserClient();
    if (!client) return null;

    let { data: { session } } = await client.auth.getSession();

    if (session && !session.user.is_anonymous) {
      const { error: userError } = await client.auth.getUser();
      if (userError) {
        const { data: refreshed } = await client.auth.refreshSession();
        session = refreshed.session ?? session;
      }

      finalizeOAuthLoginPolicy();
      ensurePolicyInitialized(session.user.is_anonymous ?? false);

      if (shouldInvalidateSession()) {
        await client.auth.signOut();
        const { data: { session: afterSignOut } } = await client.auth.getSession();
        if (!afterSignOut) {
          const { error } = await client.auth.signInAnonymously();
          if (error) {
            console.warn("[auth] anonymous sign-in failed:", error.message);
          }
        }
        const { data: { session: refreshed } } = await client.auth.getSession();
        session = refreshed;
      } else {
        markSessionAlive();
      }
    }

    if (!session) {
      const { error } = await client.auth.signInAnonymously();
      if (error) {
        console.warn("[auth] anonymous sign-in failed:", error.message);
      }
      const { data: { session: guest } } = await client.auth.getSession();
      session = guest;
    }

    return session;
  }, []);

  const refresh = useCallback(async () => {
    const client = getSupabaseBrowserClient();
    if (!client) {
      setReady(true);
      return;
    }

    const session = await enforceSessionPolicy();
    applySession(session);
    setReady(true);
  }, [applySession, enforceSessionPolicy]);

  useEffect(() => {
    void refresh();

    const client = getSupabaseBrowserClient();
    if (!client) return;

    const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session && !session.user.is_anonymous) {
        finalizeOAuthLoginPolicy();
        markSessionAlive();
      }
      applySession(session);
      setReady(true);
    });

    return () => subscription.unsubscribe();
  }, [refresh, applySession]);

  return { ready, accessToken, userId, email, isAnonymous, provider, configured, refresh };
}
