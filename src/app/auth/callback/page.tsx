"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo } from "react";

function getSafeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  if (value === "/ko" || value === "/en") return "/";
  if (value.startsWith("/ko/")) return value.replace(/^\/ko/, "") || "/";
  if (value.startsWith("/en")) return "/";
  if (value === "/profile") return "/";
  return value;
}

function getLoginPath(next: string) {
  return "/login";
}

function AuthCallbackContent() {
  const searchParams = useSearchParams();

  const copy = useMemo(
    () => ({ loading: "로그인 처리 중...", configError: "로그인 서버 설정을 확인해 주세요." }),
    []
  );

  useEffect(() => {
    async function finishAuth() {
      const next = getSafeNext(searchParams.get("next"));
      const loginPath = getLoginPath(next);
      const errorDescription = searchParams.get("error_description");

      if (errorDescription) {
        window.location.replace(
          `${loginPath}?error=${encodeURIComponent(errorDescription)}`
        );
        return;
      }

      const code = searchParams.get("code");
      if (!code) {
        window.location.replace(`${loginPath}?error=missing_code`);
        return;
      }

      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        window.location.replace(`${loginPath}?error=supabase_not_configured`);
        return;
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        window.location.replace(`${loginPath}?error=${encodeURIComponent(error.message)}`);
        return;
      }

      window.location.replace(next);
    }

    void finishAuth();
  }, [copy.configError, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-dream-sky px-4">
      <p className="text-sm text-plum/70">{copy.loading}</p>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <AuthCallbackContent />
    </Suspense>
  );
}
