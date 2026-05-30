"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

function isStrongPassword(value: string) {
  return value.length >= 10 && /[A-Za-z]/.test(value) && /\d/.test(value);
}

function getSafeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/ko/login";
  return value;
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const next = getSafeNext(searchParams.get("next"));
  const isEnglish = next.startsWith("/en");
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const copy = useMemo(
    () =>
      isEnglish
        ? {
        title: "Reset password",
        subtitle: "Enter a new password for your account.",
        password: "New password",
        passwordConfirm: "Confirm new password",
        rule: "Use at least 10 characters with both letters and numbers.",
        mismatch: "Password confirmation does not match.",
        weak: "Password must be at least 10 characters and include both letters and numbers.",
        invalid: "Password reset link is invalid or expired. Please request a new link.",
        configError: "Please check the login server configuration.",
        success: "Password changed. Please log in again.",
        submit: "Change password",
        processing: "Processing...",
          }
        : {
        title: "비밀번호 변경",
        subtitle: "계정에 사용할 새 비밀번호를 입력해 주세요.",
        password: "새 비밀번호",
        passwordConfirm: "새 비밀번호 확인",
        rule: "비밀번호는 10자 이상, 영문과 숫자를 함께 사용해 주세요.",
        mismatch: "비밀번호 확인이 일치하지 않아요.",
        weak: "비밀번호는 10자 이상이며 영문과 숫자를 모두 포함해야 해요.",
        invalid: "비밀번호 변경 링크가 만료됐거나 올바르지 않아요. 다시 요청해 주세요.",
        configError: "로그인 서버 설정을 확인해 주세요.",
        success: "비밀번호를 변경했어요. 다시 로그인해 주세요.",
        submit: "비밀번호 변경",
        processing: "처리 중...",
          },
    [isEnglish]
  );

  useEffect(() => {
    async function prepareSession() {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setError(copy.configError);
        return;
      }

      const code = searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setError(copy.invalid);
          return;
        }
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError(copy.invalid);
        return;
      }

      setReady(true);
    }

    void prepareSession();
  }, [copy.configError, copy.invalid, searchParams]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!isStrongPassword(password)) {
      setError(copy.weak);
      return;
    }

    if (password !== passwordConfirm) {
      setError(copy.mismatch);
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError(copy.configError);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setMessage(copy.success);
    await supabase.auth.signOut();
    window.setTimeout(() => window.location.replace(next), 1200);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-dream-sky px-4">
      <div className="w-full max-w-sm rounded-[2rem] bg-white/95 px-6 py-8 shadow-[0_24px_60px_rgba(92,61,110,0.12)]">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-ink">{copy.title}</h1>
          <p className="mt-3 text-sm text-plum/60">{copy.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-7 space-y-3">
          <label className="block">
            <span className="sr-only">{copy.password}</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border-0 bg-[#f2f7fa] px-4 py-3 text-sm text-plum outline-none placeholder:text-plum/35 focus:ring-2 focus:ring-channel-saju/30"
              placeholder={copy.password}
              autoComplete="new-password"
              required
              minLength={10}
              disabled={!ready || loading}
            />
            <span className="mt-1 block px-1 text-left text-[11px] leading-relaxed text-plum/45">
              {copy.rule}
            </span>
          </label>

          <label className="block">
            <span className="sr-only">{copy.passwordConfirm}</span>
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="w-full rounded-md border-0 bg-[#f2f7fa] px-4 py-3 text-sm text-plum outline-none placeholder:text-plum/35 focus:ring-2 focus:ring-channel-saju/30"
              placeholder={copy.passwordConfirm}
              autoComplete="new-password"
              required
              minLength={10}
              disabled={!ready || loading}
            />
          </label>

          {error && (
            <p className="rounded-2xl bg-petal/45 px-4 py-2 text-sm text-red-700/85" role="alert">
              {error}
            </p>
          )}

          {message && (
            <p className="rounded-2xl bg-mint/30 px-4 py-2 text-sm text-plum" role="status">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={!ready || loading}
            className="w-full rounded-md bg-[#13c4d4] py-3.5 text-sm font-bold text-white transition hover:brightness-105 disabled:opacity-60"
          >
            {loading ? copy.processing : copy.submit}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
