"use client";

import { COMMUNITY_SOLID_SURFACE_CLASS } from "@/components/community/CommunityDetailSurface";
import { Link } from "@/i18n/navigation";
import {
  buildPetPremiumPaymentHref,
  type PetPremiumContinuation,
  type PetPremiumReturnTo,
} from "@/lib/payments/pet-premium-unlock-client";
import type { Locale } from "@/lib/saju/types";

const UI = {
  ko: {
    title: "프리미엄 패키지",
    subtitle: "상세 MBTI · 별자리 · 집사 궁합까지 — 우리 아이 맞춤 케어 가이드 한 번에",
    notice: "결제 후 바로 이용할 수 있어요",
    price: "₩4,500",
    priceNote: "1회 결제 · 해당 펫 영구 잠금 해제",
    payCta: "₩4,500 결제하기",
    loginRequired: "프리미엄을 이용하려면 로그인이 필요해요.",
    login: "로그인하기",
  },
  en: {
    title: "Premium package",
    subtitle: "Detailed MBTI, zodiac, and pet–butler bond care guides in one",
    notice: "Available right after payment",
    price: "₩4,500",
    priceNote: "One-time payment · Permanent unlock for this pet",
    payCta: "Pay ₩4,500",
    loginRequired: "Please log in to unlock premium.",
    login: "Log in",
  },
} as const;

type Props = {
  locale: Locale;
  continuation: Omit<PetPremiumContinuation, "returnTo">;
  returnTo?: PetPremiumReturnTo;
  loginRequired?: boolean;
};

export function PetPremiumPaywall({ locale, continuation, returnTo, loginRequired }: Props) {
  const t = UI[locale];
  const paymentHref = buildPetPremiumPaymentHref({ ...continuation, returnTo });

  if (loginRequired) {
    return (
      <div className={`${COMMUNITY_SOLID_SURFACE_CLASS} space-y-4 p-6 text-center md:p-8`}>
        <p className="text-sm text-plum/80">{t.loginRequired}</p>
        <Link
          href="/login"
          className="inline-flex rounded-full bg-channel-saju px-6 py-3 text-sm font-semibold text-white transition hover:brightness-105"
        >
          {t.login}
        </Link>
      </div>
    );
  }

  return (
    <div className={`${COMMUNITY_SOLID_SURFACE_CLASS} space-y-5 p-6 text-center md:p-8`}>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-channel-saju/70">{t.title}</p>
        <p className="mt-2 text-sm leading-relaxed text-plum/85">{t.subtitle}</p>
        <p className="mt-3 text-sm font-semibold text-primary">{t.notice}</p>
      </div>
      <div className="rounded-2xl bg-sand/50 px-6 py-4">
        <p className="text-3xl font-extrabold text-primary">{t.price}</p>
        <p className="mt-1 text-xs text-on-surface-variant">{t.priceNote}</p>
      </div>
      <Link
        href={paymentHref}
        className="inline-flex w-full justify-center rounded-full bg-[#6f4b8b] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#6f4b8b]/35 transition hover:bg-[#5f3f78] active:scale-[0.98]"
      >
        {t.payCta}
      </Link>
    </div>
  );
}
