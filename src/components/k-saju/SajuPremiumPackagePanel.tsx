"use client";

import { GlassCard } from "@/components/layout/StitchLayout";
import { Link } from "@/i18n/navigation";
import {
  buildPetPremiumPaymentHref,
  type PetPremiumReturnTo,
} from "@/lib/payments/pet-premium-unlock-client";
import type { Locale } from "@/lib/saju/types";

const UI = {
  ko: {
    packageTitle: "프리미엄 패키지",
    packageSubtitle: "상세 MBTI · 별자리 · 집사 궁합까지 — 우리 아이 맞춤 케어 가이드 한 번에",
    price: "₩4,500",
    priceNote: "1회 결제 · 해당 펫 영구 잠금 해제",
    payCta: "₩4,500 결제하기",
    included: "포함",
    viewBadge: "보기",
    viewCta: "보기",
    mbtiCta: "상세 MBTI",
    mbtiBody: "15문항 성향 분석과 사주×MBTI 맞춤 케어 팁을 확인해 보세요.",
    zodiacCta: "별자리 케어",
    zodiacBody: "별자리 성향에 맞는 오늘의 케어 행동을 이어서 볼 수 있어요.",
    bondCta: "집사 궁합",
    bondBody: "우리가 서로 맞춰가는 케어 방법을 알려드려요.",
  },
  en: {
    packageTitle: "Premium package",
    packageSubtitle: "Detailed MBTI, zodiac, and pet–butler bond care guides in one",
    price: "₩4,500",
    priceNote: "One-time payment · Permanent unlock for this pet",
    payCta: "Pay ₩4,500",
    included: "Included",
    viewBadge: "View",
    viewCta: "View",
    mbtiCta: "Detailed MBTI",
    mbtiBody: "15-question temperament plus saju×MBTI personalized care tips.",
    zodiacCta: "Zodiac care",
    zodiacBody: "See today's care actions matched to your pet's zodiac traits.",
    bondCta: "Pet & butler bond",
    bondBody: "Learn how you and your pet can care for each other better.",
  },
} as const;

interface SajuPremiumPackagePanelProps {
  locale: Locale;
  paymentHref: string;
  premiumHubHref: string;
  petId?: string | null;
  unlocked?: boolean;
  unlockLoading?: boolean;
  continuation: {
    petName: string;
    species: string;
    petGender?: string;
    birthDate: string;
    birthTime?: string;
    timezone?: string;
  };
}

export function SajuPremiumPackagePanel({
  locale,
  paymentHref,
  premiumHubHref,
  petId,
  unlocked = false,
  unlockLoading = false,
  continuation,
}: SajuPremiumPackagePanelProps) {
  const t = UI[locale];

  const sections = [
    {
      key: "mbti",
      returnTo: "mbti" as PetPremiumReturnTo,
      href: `${premiumHubHref}&view=mbti`,
      badgeClass: "bg-plum",
      titleClass: "text-plum",
      gradient: "from-lavender/80 via-white to-petal/40",
      borderClass: "border-plum/25",
      blurClass: "bg-plum/20",
      buttonClass: "bg-plum hover:brightness-110",
      title: t.mbtiCta,
      body: t.mbtiBody,
    },
    {
      key: "zodiac",
      returnTo: "zodiac" as PetPremiumReturnTo,
      href: `${premiumHubHref}&view=zodiac`,
      badgeClass: "bg-channel-saju",
      titleClass: "text-channel-saju",
      gradient: "from-lavender via-white to-mint/60",
      borderClass: "border-channel-saju/35",
      blurClass: "bg-channel-saju/25",
      buttonClass: "bg-channel-saju hover:brightness-110",
      title: t.zodiacCta,
      body: t.zodiacBody,
    },
    {
      key: "compatibility",
      returnTo: "compatibility" as PetPremiumReturnTo,
      href: `${premiumHubHref}&view=compatibility`,
      badgeClass: "bg-hwa-red",
      titleClass: "text-[#8b3a3a]",
      gradient: "from-petal via-white to-element-fire",
      borderClass: "border-hwa-red/35",
      blurClass: "bg-hwa-red/20",
      buttonClass: "bg-[#6f4b8b] hover:bg-[#5f3f78]",
      title: t.bondCta,
      body: t.bondBody,
    },
  ] as const;

  const payBase = {
    ...continuation,
    locale,
    petId,
  };

  return (
    <GlassCard className="overflow-hidden border-2 border-channel-saju/40 !bg-white p-0 shadow-xl shadow-channel-saju/10">
      <div className="border-b border-channel-saju/15 bg-gradient-to-br from-lavender/70 via-white to-mint/50 p-6 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-channel-saju/70">
          {t.packageTitle}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-plum/85">{t.packageSubtitle}</p>
        {!unlocked ? (
          <>
            <p className="mt-4 text-3xl font-extrabold text-primary">{t.price}</p>
            <p className="mt-1 text-xs text-on-surface-variant">{t.priceNote}</p>
            <Link
              href={paymentHref}
              className="mt-5 inline-flex w-full justify-center rounded-full bg-[#6f4b8b] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#6f4b8b]/35 transition hover:bg-[#5f3f78] active:scale-[0.98]"
            >
              {t.payCta}
            </Link>
          </>
        ) : null}
      </div>

      <div className="divide-y divide-channel-saju/10">
        {sections.map((section) => {
          const sectionHref = unlocked
            ? section.href
            : buildPetPremiumPaymentHref({
                ...payBase,
                returnTo: section.returnTo,
              });
          const badgeLabel = unlocked ? t.viewBadge : t.included;
          const buttonLabel = unlocked ? `${t.viewCta} →` : `${section.title} →`;

          return (
            <div
              key={section.key}
              className={`relative overflow-hidden border-t ${section.borderClass} bg-gradient-to-br ${section.gradient} p-6 text-center first:border-t-0`}
            >
              <div
                className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full ${section.blurClass} blur-3xl`}
              />
              {unlockLoading ? (
                <div className="relative mx-auto mb-2 h-5 w-12 animate-pulse rounded-full bg-sand/70" />
              ) : (
                <span
                  className={`relative mb-2 inline-block rounded-full ${section.badgeClass} px-2.5 py-1 text-[10px] font-bold text-white`}
                >
                  {badgeLabel}
                </span>
              )}
              <h3 className={`relative text-base font-bold ${section.titleClass}`}>
                {section.title}
              </h3>
              <p className="relative mt-3 text-sm leading-relaxed text-plum/85">{section.body}</p>
              {unlockLoading ? (
                <div className="relative mx-auto mt-5 h-12 w-full max-w-xs animate-pulse rounded-full bg-sand/70" />
              ) : (
                <Link
                  href={sectionHref}
                  className={`relative mt-5 inline-flex w-full justify-center rounded-full px-4 py-3.5 text-sm font-bold text-white shadow-lg transition ${section.buttonClass}`}
                >
                  {buttonLabel}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
