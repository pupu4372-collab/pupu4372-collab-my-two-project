"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

const DISMISS_KEY = "pwa-install-dismissed";

const INAPP_UA_MARKERS = [
  "KAKAOTALK",
  "Instagram",
  "NAVER",
  "Line",
  "FBAV",
  "FBAN",
] as const;

type PromptMode = "native" | "ios" | "inapp" | null;

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

declare global {
  interface Window {
    __deferredInstallPrompt?: BeforeInstallPromptEvent;
  }
}

function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  const nav = navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true;
}

function detectInApp(ua: string): boolean {
  return INAPP_UA_MARKERS.some((marker) => ua.includes(marker));
}

function detectIos(ua: string): boolean {
  return /iPad|iPhone|iPod/i.test(ua);
}

function isKakaoTalk(ua: string): boolean {
  return ua.includes("KAKAOTALK");
}

function ShareUpIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M12 3v12"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M7 8l5-5 5 5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function InstallPrompt() {
  const t = useTranslations("pwa.install");
  const [mode, setMode] = useState<PromptMode>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [iosModalOpen, setIosModalOpen] = useState(false);
  const [ua, setUa] = useState("");

  useEffect(() => {
    if (isStandaloneDisplay()) return;
    try {
      if (localStorage.getItem(DISMISS_KEY)) return;
    } catch {
      // private mode — still allow prompt
    }

    const currentUa = navigator.userAgent || "";
    setUa(currentUa);

    if (detectInApp(currentUa)) {
      setMode("inapp");
      return;
    }

    if (detectIos(currentUa)) {
      setMode("ios");
      return;
    }

    const adoptDeferred = () => {
      const prompt = window.__deferredInstallPrompt;
      if (!prompt) return;
      setDeferredPrompt(prompt);
      setMode("native");
    };

    adoptDeferred();
    window.addEventListener("pwa-installable", adoptDeferred);
    return () => window.removeEventListener("pwa-installable", adoptDeferred);
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore
    }
    setMode(null);
    setIosModalOpen(false);
  }

  async function handleNativeInstall() {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
    } catch {
      // user dismissed or prompt failed
    }
    window.__deferredInstallPrompt = undefined;
    setDeferredPrompt(null);
    setMode(null);
  }

  function handleOpenExternal() {
    const url = window.location.href;
    window.location.href =
      "kakaotalk://web/openExternal?url=" + encodeURIComponent(url);
  }

  if (!mode) return null;

  return (
    <>
      <div
        className="fixed left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2"
        style={{ bottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
        role="region"
        aria-label={t("bannerLabel")}
      >
        <div className="flex items-start gap-3 rounded-2xl border border-white/15 bg-[#3d5a8c] px-4 py-3 text-cream shadow-lg">
          <div className="min-w-0 flex-1 space-y-2">
            {mode === "native" ? (
              <>
                <p className="text-sm font-bold leading-snug">{t("nativeMessage")}</p>
                <button
                  type="button"
                  onClick={() => void handleNativeInstall()}
                  className="inline-flex rounded-full bg-[#e6c15e] px-4 py-2 text-sm font-extrabold text-[#1a1a1a] transition hover:brightness-105"
                >
                  {t("nativeCta")}
                </button>
              </>
            ) : null}

            {mode === "ios" ? (
              <>
                <p className="text-sm font-bold leading-snug">{t("iosMessage")}</p>
                <button
                  type="button"
                  onClick={() => setIosModalOpen(true)}
                  className="inline-flex rounded-full bg-[#e6c15e] px-4 py-2 text-sm font-extrabold text-[#1a1a1a] transition hover:brightness-105"
                >
                  {t("iosCta")}
                </button>
              </>
            ) : null}

            {mode === "inapp" ? (
              <>
                <p className="text-sm font-bold leading-snug">{t("inappMessage")}</p>
                {isKakaoTalk(ua) ? (
                  <button
                    type="button"
                    onClick={handleOpenExternal}
                    className="inline-flex rounded-full bg-[#e6c15e] px-4 py-2 text-sm font-extrabold text-[#1a1a1a] transition hover:brightness-105"
                  >
                    {t("inappKakaoCta")}
                  </button>
                ) : (
                  <p className="text-xs font-semibold leading-relaxed text-cream/85">
                    {t("inappOtherHint")}
                  </p>
                )}
              </>
            ) : null}
          </div>

          <button
            type="button"
            onClick={dismiss}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-cream/80 transition hover:bg-white/10 hover:text-cream"
            aria-label={t("dismiss")}
          >
            <span aria-hidden className="text-lg leading-none">
              ×
            </span>
          </button>
        </div>
      </div>

      {iosModalOpen ? (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/45 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-ios-install-title"
          onClick={() => setIosModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#3d5a8c] p-5 text-cream shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="pwa-ios-install-title" className="text-lg font-extrabold">
              {t("iosModalTitle")}
            </h2>
            <ol className="mt-4 space-y-3 text-sm font-semibold leading-relaxed text-cream/90">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/15 text-[#e6c15e]">
                  <ShareUpIcon />
                </span>
                <span>{t("iosStep1")}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-extrabold text-[#e6c15e]">
                  2
                </span>
                <span>{t("iosStep2")}</span>
              </li>
            </ol>
            <button
              type="button"
              onClick={() => setIosModalOpen(false)}
              className="mt-5 w-full rounded-full bg-[#e6c15e] px-4 py-2.5 text-sm font-extrabold text-[#1a1a1a] transition hover:brightness-105"
            >
              {t("iosModalClose")}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
