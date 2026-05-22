"use client";

import { Link } from "@/i18n/navigation";

const LABELS = {
  ko: {
    saved: "프로필에 저장됨",
    saveFailed: "저장 실패",
    guest: "로그인하면 결과를 프로필에 저장할 수 있어요.",
    login: "로그인하기",
  },
  en: {
    saved: "Saved to your profile",
    saveFailed: "Could not save",
    guest: "Sign in to save results to your profile.",
    login: "Sign in",
  },
};

interface SaveStatusBannerProps {
  locale: "ko" | "en";
  persisted?: boolean;
  persistError?: string | null;
  isGuest?: boolean;
}

export function SaveStatusBanner({
  locale,
  persisted,
  persistError,
  isGuest,
}: SaveStatusBannerProps) {
  const t = LABELS[locale];

  if (isGuest) {
    return (
      <p className="rounded-2xl bg-lavender/25 px-4 py-2.5 text-sm text-plum/75">
        {t.guest}{" "}
        <Link href="/login" className="font-semibold underline">
          {t.login}
        </Link>
      </p>
    );
  }

  if (persisted) {
    return (
      <p className="rounded-2xl bg-mint/30 px-4 py-2.5 text-sm font-medium text-plum" role="status">
        🐾 {t.saved}
      </p>
    );
  }

  if (persistError) {
    return (
      <p className="rounded-2xl bg-petal/40 px-4 py-2.5 text-sm text-plum/80" role="alert">
        {t.saveFailed}: {persistError}
      </p>
    );
  }

  return null;
}
