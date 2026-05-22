"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function AuthCallbackHandler() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("로그인 처리 중…");

  useEffect(() => {
    let cancelled = false;

    async function finish() {
      const code = searchParams.get("code");
      const requestedNext = searchParams.get("next");
      const next =
        requestedNext && requestedNext !== "/profile" ? requestedNext : "/ko";

      if (!code) {
        window.location.replace("/ko/login?error=missing_code");
        return;
      }

      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        window.location.replace("/ko/login?error=supabase_not_configured");
        return;
      }

      try {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (cancelled) return;

        if (error) {
          window.location.replace(
            `/ko/login?error=${encodeURIComponent(error.message)}`
          );
          return;
        }

        window.location.replace(next);
      } catch (err) {
        if (cancelled) return;
        const text =
          err instanceof Error ? err.message : "auth_callback_failed";
        setMessage("로그인 처리에 실패했습니다. 로그인 화면으로 이동합니다…");
        window.location.replace(`/ko/login?error=${encodeURIComponent(text)}`);
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
