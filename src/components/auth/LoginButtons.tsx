"use client";

import {
  checkSignupEmail,
  sendPasswordResetEmail,
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
} from "@/lib/supabase/auth-client";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

type Mode = "signup" | "login" | "forgot" | "confirm";

function isStrongPassword(value: string) {
  return value.length >= 10 && /[A-Za-z]/.test(value) && /\d/.test(value);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function AuthInput({
  label,
  icon,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
  minLength,
  maxLength,
  helper,
}: {
  label: string;
  icon: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  helper?: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="ml-2 text-xs font-bold uppercase tracking-wide text-on-surface-variant">
        {label}
      </span>
      <div className="relative group">
        <span
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-lg text-outline/45 transition-colors group-focus-within:text-primary/50"
          aria-hidden
        >
          {icon}
        </span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pastel-input w-full rounded-[1.25rem] border-0 bg-sand/70 py-4 pl-4 pr-12 text-sm text-on-surface placeholder:text-on-surface-variant/40 transition-all focus:ring-2 focus:ring-primary/20"
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          maxLength={maxLength}
        />
      </div>
      {helper && <span className="block px-2 text-left text-[11px] leading-relaxed text-plum/50">{helper}</span>}
    </label>
  );
}

export function LoginButtons({
  homeHref = "/",
  initialMode = "login",
}: {
  homeHref?: string;
  initialMode?: Mode;
}) {
  const t = useTranslations("auth");
  const locale = useLocale();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const configured = isSupabaseConfigured();
  const isKo = locale === "ko";
  const isSignup = mode === "signup";

  function formatAuthError(err: unknown) {
    const message = err instanceof Error ? err.message : t("genericError");
    const normalized = message.toLowerCase();
    if (message.includes("non ISO-8859-1 code point")) {
      return t("authStorageError");
    }
    if (message.includes("Session could not be saved")) {
      return t("authStorageError");
    }
    if (message.includes("Invalid login credentials")) {
      return t("invalidCredentials");
    }
    if (normalized.includes("supabase") && normalized.includes("not configured")) {
      return t("supabaseRuntimeError");
    }
    if (normalized.includes("valid email is required")) {
      return t("emailRequired");
    }
    if (
      normalized.includes("invalid json body") ||
      normalized.includes("could not check email")
    ) {
      return t("genericError");
    }
    if (locale === "ko" && /^[\x00-\x7F\s.,'":;!?()[\]{}@/_-]+$/.test(message)) {
      return t("genericError");
    }
    return message;
  }

  async function handleEmailSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const cleanEmail = email.trim();
    const cleanDisplayName = displayName.trim();

    if (!isValidEmail(cleanEmail)) {
      setError(t("emailRequired"));
      return;
    }

    if (mode === "forgot") {
      setLoading(mode);
      try {
        await sendPasswordResetEmail(cleanEmail, locale);
        setMessage(t("passwordResetSent"));
      } catch (err) {
        setError(formatAuthError(err));
      } finally {
        setLoading(null);
      }
      return;
    }

    if (mode === "confirm") {
      setLoading(mode);
      try {
        const result = await checkSignupEmail(cleanEmail);
        if (!result.exists) {
          setMessage(t("signupEmailMissing"));
        } else if (result.confirmed) {
          setMessage(t("signupEmailConfirmed"));
        } else {
          setMessage(t("signupEmailUnconfirmed"));
        }
      } catch (err) {
        setError(formatAuthError(err));
      } finally {
        setLoading(null);
      }
      return;
    }

    if (!password) {
      setError(t("passwordRequired"));
      return;
    }

    if (mode === "signup" && !isStrongPassword(password)) {
      setError(t("passwordRuleError"));
      return;
    }

    if (mode === "signup" && password !== passwordConfirm) {
      setError(t("passwordMismatch"));
      return;
    }

    if (mode === "signup" && !termsAccepted) {
      setError(
        isKo
          ? "이용약관 및 개인정보 처리방침에 동의해 주세요."
          : "Please agree to the Terms and Privacy Policy."
      );
      return;
    }

    setLoading(mode);
    try {
      if (mode === "signup") {
        await signUpWithEmail({
          email: cleanEmail,
          password,
          displayName: cleanDisplayName || cleanEmail.split("@")[0],
          locale,
        });
        setMessage(t("signupSuccess", { email: cleanEmail }));
      } else {
        await signInWithEmail(cleanEmail, password, rememberMe);
        const target = homeHref === "/ko" ? "/" : homeHref;
        window.location.replace(target);
      }
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setLoading(null);
    }
  }

  async function handleGoogleLogin() {
    setError(null);
    setMessage(null);
    setLoading("google");

    try {
      await signInWithGoogle(rememberMe);
    } catch (err) {
      setError(formatAuthError(err));
      setLoading(null);
    }
  }

  if (!configured) {
    return (
      <div className="glass-card mx-auto max-w-sm rounded-[2rem] border border-white/40 p-7 text-center shadow-sm shadow-primary/5">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
          <span aria-hidden>✨</span>
        </div>
        <p className="text-sm font-bold text-primary">{t("supabaseTitle")}</p>
        <p className="text-sm leading-relaxed text-plum/70">
          {t.rich("supabaseRequired", {
            code: (chunks) => <code className="text-xs">{chunks}</code>,
          })}
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="glass-card relative overflow-hidden rounded-[2rem] border border-white/40 px-6 py-8 shadow-sm shadow-primary/5 md:px-10 md:py-10">
        <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-mint/40 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-lavender/40 blur-3xl" aria-hidden />

        <div className="relative z-10 text-center">
          <a
            href={homeHref}
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-outline-variant/10 bg-white text-3xl shadow-sm transition hover:scale-105"
            aria-label="K-Saju Pet"
          >
            <span aria-hidden>✨</span>
          </a>
          <a href={homeHref} className="text-2xl font-extrabold tracking-tight text-primary">
            K-Saju Pet
          </a>
          <h2 className="mt-3 text-xl font-bold leading-tight text-primary">
            {mode === "forgot" || mode === "confirm" ? (
              t(mode === "forgot" ? "forgotTitle" : "confirmTitle")
            ) : isSignup ? (
              <>
                {t("signupTitleLine1")}
                <br />
                {t("signupTitleLine2")}
              </>
            ) : (
              <>
                {t("welcomeLine1")}
                <br />
                {t("welcomeLine2")}
              </>
            )}
          </h2>
          <p className="mt-2 text-sm text-on-surface-variant">
            {mode === "forgot" || mode === "confirm"
              ? t(mode === "forgot" ? "forgotSubtitle" : "confirmSubtitle")
              : isSignup
                ? t("signupSubtitle")
                : t("loginSubtitle")}
          </p>
        </div>

        {mode === "login" && (
          <div className="relative z-10 mt-8 space-y-4">
            <label className="flex cursor-pointer items-start gap-3 rounded-[1.25rem] bg-white/45 px-4 py-3 text-left text-sm text-on-surface">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="mt-0.5 h-5 w-5 rounded border-outline text-primary focus:ring-primary/20"
              />
              <span>
                <span className="font-semibold">{t("rememberMe")}</span>
                <span className="mt-1 block text-xs leading-relaxed text-on-surface-variant">
                  {t("rememberMeHint")}
                </span>
              </span>
            </label>
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={!!loading}
              className="flex w-full items-center justify-center gap-3 rounded-full border border-outline-variant/20 bg-white px-6 py-4 text-sm font-extrabold text-on-surface shadow-sm transition hover:-translate-y-0.5 hover:bg-white/90 active:scale-[0.98] disabled:opacity-60"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-base font-black text-[#4285F4] shadow-sm" aria-hidden>
                G
              </span>
              {loading === "google" ? t("googleLoginProcessing") : t("googleLogin")}
            </button>
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-full bg-[#FEE500]/55 px-6 py-4 text-sm font-extrabold text-[#191919]/55 shadow-sm"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#191919] text-xs font-black text-[#FEE500]" aria-hidden>
                K
              </span>
              {t("kakaoLogin")}
            </button>
            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-plum/35">
              <span className="h-px flex-1 bg-outline-variant/15" />
              <span>{t("or")}</span>
              <span className="h-px flex-1 bg-outline-variant/15" />
            </div>
          </div>
        )}

        <form onSubmit={handleEmailSubmit} className={`relative z-10 space-y-5 ${mode === "login" ? "mt-5" : "mt-8"}`} noValidate>
          {isSignup && (
            <AuthInput
              label={t("displayName")}
              icon="👤"
              type="text"
              value={displayName}
              onChange={setDisplayName}
              placeholder={t("displayNamePlaceholder")}
              autoComplete="nickname"
              maxLength={32}
            />
          )}

          <AuthInput
            label={t("email")}
            icon="✉️"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder={t("emailPlaceholder")}
            autoComplete="email"
            required
          />

          {mode !== "forgot" && mode !== "confirm" && (
            <AuthInput
              label={t("password")}
              icon="🔒"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder={t("passwordPlaceholder")}
              autoComplete={isSignup ? "new-password" : "current-password"}
              required
              minLength={isSignup ? 10 : undefined}
              helper={isSignup ? t("passwordRule") : undefined}
            />
          )}

          {isSignup && (
            <>
              <AuthInput
                label={t("passwordConfirm")}
                icon="✅"
                type="password"
                value={passwordConfirm}
                onChange={setPasswordConfirm}
                placeholder={t("passwordConfirmPlaceholder")}
                autoComplete="new-password"
                required
                minLength={10}
              />
              <p className="px-1 text-left text-[11px] leading-relaxed text-plum/50">
                {t("signupEmailConfirmHelp")}
              </p>
              <div className="space-y-3 rounded-[1.25rem] bg-white/45 px-4 py-4 text-left">
                <label className="flex cursor-pointer items-start gap-3 text-sm text-on-surface">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(event) => setTermsAccepted(event.target.checked)}
                    className="mt-0.5 h-5 w-5 rounded border-outline text-primary focus:ring-primary/20"
                  />
                  <span>
                    {isKo ? "이용약관 및 개인정보 처리방침에 동의합니다" : "I agree to the Terms and Privacy Policy"}{" "}
                    <span className="font-bold text-primary">{isKo ? "(필수)" : "(required)"}</span>
                  </span>
                </label>
                <label className="flex cursor-pointer items-start gap-3 text-sm text-on-surface">
                  <input
                    type="checkbox"
                    checked={marketingConsent}
                    onChange={(event) => setMarketingConsent(event.target.checked)}
                    className="mt-0.5 h-5 w-5 rounded border-outline text-primary focus:ring-primary/20"
                  />
                  <span>{isKo ? "마케팅 정보 수신 동의 (선택)" : "Receive marketing updates (optional)"}</span>
                </label>
              </div>
            </>
          )}

          {!isSignup && mode === "login" && (
            <div className="flex items-center justify-end px-2 text-sm">
              <button
                type="button"
                onClick={() => {
                  setMode("forgot");
                  setPassword("");
                  setPasswordConfirm("");
                  setError(null);
                  setMessage(null);
                }}
                className="font-semibold text-primary hover:underline"
              >
                {t("forgotPassword")}
              </button>
            </div>
          )}

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
            disabled={!!loading}
            className="w-full rounded-full bg-primary px-6 py-4 text-sm font-bold text-white shadow-md shadow-primary/20 transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
          >
            {loading === mode
              ? t("processing")
              : mode === "forgot"
                ? t("sendResetEmail")
                : mode === "confirm"
                  ? t("checkSignupEmail")
                  : isSignup
                    ? t("emailSignup")
                    : t("emailLoginSubmit")}
          </button>
        </form>

        <div className="relative z-10 mt-7 border-t border-outline-variant/10 pt-6 text-center text-sm text-plum/60">
          {mode === "login" ? (
            <div className="space-y-4">
              <p>
                {t("signupPrompt")}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setPassword("");
                    setPasswordConfirm("");
                    setError(null);
                    setMessage(null);
                  }}
                  className="font-bold text-primary hover:underline"
                >
                  {t("signupLink")}
                </button>
              </p>
              <button
                type="button"
                onClick={() => {
                  setMode("confirm");
                  setPassword("");
                  setPasswordConfirm("");
                  setError(null);
                  setMessage(null);
                }}
                className="text-xs font-bold text-plum/60 underline underline-offset-2 hover:text-primary"
              >
                {t("signupConfirm")}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setPassword("");
                setPasswordConfirm("");
                setError(null);
                setMessage(null);
              }}
              className="font-bold text-primary hover:underline"
            >
              {t("backToLogin")}
            </button>
          )}
        </div>

        <p className="relative z-10 mt-6 text-center text-xs leading-relaxed text-plum/45">
          {t("termsNotice")}
        </p>
      </div>

      <div className="mt-8 flex justify-center gap-6 opacity-45">
        {["🐾", "⭐", "💞"].map((icon) => (
          <div key={icon} className="glass-card flex h-12 w-12 items-center justify-center rounded-full text-xl">
            <span aria-hidden>{icon}</span>
          </div>
        ))}
      </div>

      <p className="mt-5 text-center text-xs text-plum/45">
        <Link href="/terms" className="underline hover:text-plum">
          {t("terms")}
        </Link>
        {" · "}
        <Link href="/privacy" className="underline hover:text-plum">
          {t("privacy")}
        </Link>
      </p>
    </div>
  );
}
