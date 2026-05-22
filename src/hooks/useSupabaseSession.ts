"use client";

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

  const refresh = useCallback(async () => {
    const client = getSupabaseBrowserClient();
    if (!client) {
      setReady(true);
      return;
    }

    const { data: { session } } = await client.auth.getSession();
    if (!session) {
      const { error } = await client.auth.signInAnonymously();
      if (error) {
        console.warn("[auth] anonymous sign-in failed:", error.message);
      }
    }

    const { data: { session: next } } = await client.auth.getSession();
    applySession(next);
    setReady(true);
  }, [applySession]);

  useEffect(() => {
    void refresh();

    const client = getSupabaseBrowserClient();
    if (!client) return;

    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      applySession(session);
      setReady(true);
    });

    return () => subscription.unsubscribe();
  }, [refresh, applySession]);

  return { ready, accessToken, userId, email, isAnonymous, provider, configured, refresh };
}
