"use client";

import { getLoginPath, normalizePostAuthPath } from "@/i18n/paths";
import { persistSession } from "@/lib/supabase/auth-client";
import { getSupabaseAuthActionClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function loginRedirect(message: string) {
  window.location.replace(`${getLoginPath("ko")}?error=${encodeURIComponent(message)}`);
}

function AuthCallbackHandler() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("로그인 처리 중…");

  useEffect(() => {
    let cancelled = false;

    async function finish() {
      const oauthError = searchParams.get("error");
      const oauthDescription = searchParams.get("error_description");
      if (oauthError) {
        loginRedirect(oauthDescription ?? oauthError);
        return;
      }

      const code = searchParams.get("code");
      const requestedNext = searchParams.get("next");
      const next = normalizePostAuthPath(requestedNext);

      if (!code) {
        loginRedirect("missing_code");
        return;
      }

      const authClient = getSupabaseAuthActionClient();
      if (!authClient) {
        loginRedirect("supabase_not_configured");
        return;
      }

      try {
        const { data, error } = await authClient.auth.exchangeCodeForSession(code);
        if (cancelled) return;

        if (error) {
          loginRedirect(error.message);
          return;
        }

        await persistSession(data.session);
        window.location.replace(next);
      } catch (err) {
        if (cancelled) return;
        const text =
          err instanceof Error ? err.message : "auth_callback_failed";
        setMessage("로그인 처리에 실패했습니다. 로그인 화면으로 이동합니다…");
        loginRedirect(text);
      }
    }

    void finish();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-sand/30 p-6">
      <p className="text-sm font-medium text-plum">{message}</p>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-sand/30 p-6">
          <p className="text-sm font-medium text-plum">로그인 처리 중…</p>
        </main>
      }
    >
      <AuthCallbackHandler />
    </Suspense>
  );
}
