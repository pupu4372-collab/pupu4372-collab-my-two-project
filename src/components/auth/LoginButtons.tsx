"use client";

import {
  checkSignupEmail,
  sendPasswordResetEmail,
  signInWithEmail,
  signUpWithEmail,
} from "@/lib/supabase/auth-client";
import { clearSupabaseBrowserSession, isSupabaseConfigured } from "@/lib/supabase/client";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

type Mode = "signup" | "login" | "forgot" | "confirm";

function isStrongPassword(value: string) {
  return value.length >= 10 && /[A-Za-z]/.test(value) && /\d/.test(value);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function LoginButtons() {
  const t = useTranslations("auth");
  const locale = useLocale();
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
    clearSupabaseBrowserSession();
  }, []);

  function formatAuthError(err: unknown) {
    const message = err instanceof Error ? err.message : t("genericError");
    const normalized = message.toLowerCase();
    if (message.includes("non ISO-8859-1 code point")) {
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

    setLoading(mode);
    try {
      if (mode === "signup") {
        await signUpWithEmail({
          email: cleanEmail,
          password,
          displayName: cleanDisplayName || cleanEmail.split("@")[0],
        });
        setMessage(t("signupSuccess", { email: cleanEmail }));
      } else {
        await signInWithEmail(cleanEmail, password);
        window.location.replace(locale === "en" ? "/en" : "/ko");
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
          {mode === "forgot" || mode === "confirm" ? (
            t(mode === "forgot" ? "forgotTitle" : "confirmTitle")
          ) : (
            <>
              {mode === "signup" ? t("signupTitleLine1") : t("welcomeLine1")}
              <br />
              {mode === "signup" ? t("signupTitleLine2") : t("welcomeLine2")}
            </>
          )}
        </h2>
        <p className="mt-3 text-sm text-plum/60">
          {mode === "forgot" || mode === "confirm"
            ? t(mode === "forgot" ? "forgotSubtitle" : "confirmSubtitle")
            : mode === "signup"
              ? t("signupSubtitle")
              : t("loginSubtitle")}
        </p>
      </div>

      <form onSubmit={handleEmailSubmit} className="mt-7 space-y-3" noValidate>
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

        {mode !== "forgot" && mode !== "confirm" && (
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
              minLength={mode === "signup" ? 10 : undefined}
            />
            {mode === "signup" && (
              <span className="mt-1 block px-1 text-left text-[11px] leading-relaxed text-plum/45">
                {t("passwordRule")}
              </span>
            )}
          </label>
        )}

        {mode === "signup" && (
          <>
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
                minLength={10}
              />
            </label>
            <p className="px-1 text-left text-[11px] leading-relaxed text-plum/45">
              {t("signupEmailConfirmHelp")}
            </p>
          </>
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
            : mode === "forgot"
              ? t("sendResetEmail")
              : mode === "confirm"
                ? t("checkSignupEmail")
              : mode === "signup"
              ? t("emailSignup")
              : t("emailLoginSubmit")}
        </button>
      </form>

      <div className="mt-5 text-center text-sm text-plum/60">
        {mode === "login" ? (
          <div className="space-y-2">
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
                className="font-bold text-plum underline underline-offset-4"
              >
                {t("signupLink")}
              </button>
            </p>
            <div className="flex items-center justify-center gap-2 text-[8px]">
              <button
                type="button"
                onClick={() => {
                  setMode("forgot");
                  setPassword("");
                  setPasswordConfirm("");
                  setError(null);
                  setMessage(null);
                }}
                className="font-bold text-plum underline underline-offset-2"
              >
                {t("forgotPassword")}
              </button>
              <span className="text-plum/25" aria-hidden>
                |
              </span>
              <button
                type="button"
                onClick={() => {
                  setMode("confirm");
                  setPassword("");
                  setPasswordConfirm("");
                  setError(null);
                  setMessage(null);
                }}
                className="font-bold text-plum underline underline-offset-2"
              >
                {t("signupConfirm")}
              </button>
            </div>
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
            className="font-bold text-plum underline underline-offset-4"
          >
            {t("backToLogin")}
          </button>
        )}
      </div>

      <p className="mt-6 text-center text-xs leading-relaxed text-plum/45">
        {t("termsNotice")}
      </p>
    </div>
  );
}
