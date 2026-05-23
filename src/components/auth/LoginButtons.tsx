"use client";

import { getHomePath } from "@/i18n/paths";
import {
  signInWithEmail,
  signInWithProvider,
  signUpWithEmail,
  type SupportedOAuthProvider,
} from "@/lib/supabase/auth-client";
import { useRouter } from "@/i18n/navigation";
import { clearSupabaseBrowserSession, isSupabaseConfigured } from "@/lib/supabase/client";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

type Mode = "signup" | "login";

const SOCIALS: Array<{
  provider: SupportedOAuthProvider;
  labelKey: "google" | "facebook" | "naver";
  icon: string;
  className: string;
}> = [
  {
    provider: "google",
    labelKey: "google",
    icon: "G",
    className: "border border-plum/15 bg-white text-plum hover:bg-sand/50",
  },
  {
    provider: "facebook",
    labelKey: "facebook",
    icon: "f",
    className: "border border-plum/15 bg-white text-plum hover:bg-sand/50",
  },
  {
    provider: "naver",
    labelKey: "naver",
    icon: "N",
    className: "border border-plum/15 bg-white text-plum hover:bg-sand/50",
  },
];

export function LoginButtons() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    // Do not wipe PKCE storage; it breaks social login return from Google.
    clearSupabaseBrowserSession({ preserveOAuthFlow: true });
  }, []);

  function formatAuthError(err: unknown) {
    const message = err instanceof Error ? err.message : t("genericError");
    if (message.includes("non ISO-8859-1 code point")) {
      return t("authStorageError");
    }
    if (message.includes("Invalid login credentials")) {
      return t("invalidCredentials");
    }
    return message;
  }

  async function handleOAuth(provider: SupportedOAuthProvider) {
    setError(null);
    setMessage(null);
    setLoading(provider);
    try {
      await signInWithProvider(provider);
    } catch (err) {
      setError(formatAuthError(err));
      setLoading(null);
    }
  }

  async function handleEmailSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const cleanEmail = email.trim();
    const cleanDisplayName = displayName.trim();

    if (password.length < 6) {
      setError(t("passwordMin"));
      return;
    }

    if (mode === "signup" && password !== passwordConfirm) {
      setError(t("passwordMismatch"));
      return;
    }

    setLoading(mode);
    try {
      if (mode === "signup") {
        await signUpWithEmail({
          email: cleanEmail,
          password,
          displayName: cleanDisplayName || cleanEmail.split("@")[0],
        });
        setMessage(t("signupSuccess"));
      } else {
        await signInWithEmail(cleanEmail, password);
        window.location.replace(getHomePath(locale === "en" ? "en" : "ko"));
      }
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setLoading(null);
    }
  }

  if (!configured) {
    return (
      <div className="mx-auto max-w-sm rounded-3xl bg-white/95 p-6 text-center shadow-sm">
        <p className="text-sm font-semibold text-plum">{t("supabaseTitle")}</p>
        <p className="text-sm leading-relaxed text-plum/70">
          {t.rich("supabaseRequired", {
            code: (chunks) => <code className="text-xs">{chunks}</code>,
          })}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm rounded-[2rem] bg-white/95 px-6 py-8 shadow-[0_24px_60px_rgba(92,61,110,0.12)]">
      <div className="text-center">
        <h2 className="text-2xl font-extrabold leading-tight text-ink">
          {mode === "signup" ? t("signupTitleLine1") : t("welcomeLine1")}
          <br />
          {mode === "signup" ? t("signupTitleLine2") : t("welcomeLine2")}
        </h2>
        <p className="mt-3 text-sm text-plum/60">
          {mode === "signup" ? t("signupSubtitle") : t("loginSubtitle")}
        </p>
      </div>

      <form onSubmit={handleEmailSubmit} className="mt-7 space-y-3">
        {mode === "signup" && (
          <label className="block">
            <span className="sr-only">{t("displayName")}</span>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-md border-0 bg-[#f2f7fa] px-4 py-3 text-sm text-plum outline-none placeholder:text-plum/35 focus:ring-2 focus:ring-channel-saju/30"
              placeholder={t("displayNamePlaceholder")}
              maxLength={32}
            />
          </label>
        )}

        <label className="block">
          <span className="sr-only">{t("email")}</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border-0 bg-[#f2f7fa] px-4 py-3 text-sm text-plum outline-none placeholder:text-plum/35 focus:ring-2 focus:ring-channel-saju/30"
            placeholder={t("emailPlaceholder")}
            autoComplete="email"
            required
          />
        </label>

        <label className="block">
          <span className="sr-only">{t("password")}</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border-0 bg-[#f2f7fa] px-4 py-3 text-sm text-plum outline-none placeholder:text-plum/35 focus:ring-2 focus:ring-channel-saju/30"
            placeholder={t("passwordPlaceholder")}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            required
            minLength={6}
          />
        </label>

        {mode === "signup" && (
          <label className="block">
            <span className="sr-only">{t("passwordConfirm")}</span>
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="w-full rounded-md border-0 bg-[#f2f7fa] px-4 py-3 text-sm text-plum outline-none placeholder:text-plum/35 focus:ring-2 focus:ring-channel-saju/30"
              placeholder={t("passwordConfirmPlaceholder")}
              autoComplete="new-password"
              required
              minLength={6}
            />
          </label>
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
          className="w-full rounded-md bg-[#13c4d4] py-3.5 text-sm font-bold text-white transition hover:brightness-105 disabled:opacity-60"
        >
          {loading === mode
            ? t("processing")
            : mode === "signup"
              ? t("emailSignup")
              : t("emailLoginSubmit")}
        </button>
      </form>

      <div className="mt-5 text-center text-sm text-plum/60">
        {mode === "login" ? (
          <p>
            {t("signupPrompt")}{" "}
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError(null);
                setMessage(null);
              }}
              className="font-bold text-plum underline underline-offset-4"
            >
              {t("signupLink")}
            </button>
          </p>
        ) : (
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
              setMessage(null);
            }}
            className="font-bold text-plum underline underline-offset-4"
          >
            {t("backToLogin")}
          </button>
        )}
      </div>

      <div className="my-6 flex items-center gap-4 text-xs font-medium text-plum/35">
        <span className="h-px flex-1 bg-plum/10" />
        <span>{t("socialSignupTitle")}</span>
        <span className="h-px flex-1 bg-plum/10" />
      </div>

      <div className="space-y-2.5">
        {SOCIALS.map((social) => (
          <button
            key={social.provider}
            type="button"
            disabled={!!loading}
            onClick={() => handleOAuth(social.provider)}
            className={`relative flex w-full items-center justify-center rounded-md px-4 py-3 text-sm font-semibold transition disabled:opacity-60 ${social.className}`}
          >
            <span
              className={`absolute left-4 flex h-5 w-5 items-center justify-center rounded-full text-sm font-extrabold ${
                social.provider === "google"
                  ? "text-[#4285F4]"
                  : social.provider === "facebook"
                    ? "bg-[#1877F2] text-white"
                    : "bg-[#03C75A] text-white"
              }`}
              aria-hidden
            >
              {social.icon}
            </span>
            {loading === social.provider ? t("connecting") : t(`social.${social.labelKey}`)}
          </button>
        ))}
      </div>

      <p className="mt-6 text-center text-xs leading-relaxed text-plum/45">
        {t("termsNotice")}
      </p>
    </div>
  );
}
