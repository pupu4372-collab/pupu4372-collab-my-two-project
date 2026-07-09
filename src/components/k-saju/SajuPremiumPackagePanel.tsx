"use client";

import { GlassCard } from "@/components/layout/StitchLayout";
import { usePetPremiumUnlock } from "@/hooks/usePetPremiumUnlock";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { getSafeInternalReturnPath } from "@/lib/auth/safe-internal-return-path";
import { Link } from "@/i18n/navigation";
import {
  buildMbtiStandalonePaymentHref,
  buildPetPremiumPaymentHref,
  type PetPremiumReturnTo,
} from "@/lib/payments/pet-premium-unlock-client";
import type { Locale } from "@/lib/saju/types";

function hrefOrLoginGate(target: string, isGuest: boolean) {
  if (!isGuest) return target;
  return `/login?next=${encodeURIComponent(getSafeInternalReturnPath(target))}`;
}

const UI = {
  ko: {
    packageTitle: "프리미엄 패키지",
    packageSubtitle: "집사 궁합 · 별자리 케어 — 우리 아이 맞춤 케어 가이드 한 번에",
    price: "₩4,500",
    priceNote: "1회 결제 · 해당 펫 영구 잠금 해제",
    payCta: "₩4,500 결제하기",
    loginPayCta: "로그인하고 결제하기",
    included: "포함",
    viewBadge: "보기",
    viewCta: "보기",
    zodiacCta: "별자리 케어",
    zodiacBody: "별자리 성향에 맞는 오늘의 케어 행동을 이어서 볼 수 있어요.",
    bondCta: "집사 궁합",
    bondBody: "우리가 서로 맞춰가는 케어 방법을 알려드려요.",
    mbtiStandaloneTitle: "상세 MBTI · ₩1,900",
    mbtiStandaloneBody: "행동 진단으로 우리 아이 성향 유형과 맞춤 케어 팁",
    mbtiViewResult: "결과 보기",
    mbtiDiagnose: "진단하기",
  },
  en: {
    packageTitle: "Premium package",
    packageSubtitle: "Pet–butler bond and zodiac care — personalized guides for your pet in one unlock",
    price: "₩4,500",
    priceNote: "One-time payment · Permanent unlock for this pet",
    payCta: "Pay ₩4,500",
    loginPayCta: "Log in to pay",
    included: "Included",
    viewBadge: "View",
    viewCta: "View",
    zodiacCta: "Zodiac care",
    zodiacBody: "See today's care actions matched to your pet's zodiac traits.",
    bondCta: "Pet & butler bond",
    bondBody: "Learn how you and your pet can care for each other better.",
    mbtiStandaloneTitle: "Detailed MBTI · $2.00",
    mbtiStandaloneBody: "Discover your pet's type and tailored care tips with a behavior check",
    mbtiViewResult: "View result",
    mbtiDiagnose: "Start diagnosis",
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
    sajuResultId?: string | null;
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
  const { ready, configured, isAnonymous, accessToken } = useSupabaseSession();
  const isGuest = configured && ready && isAnonymous;
  const mbtiUnlockEnabled = configured && ready && !isAnonymous && Boolean(petId);
  const { unlocked: mbtiUnlocked, loading: mbtiUnlockLoading } = usePetPremiumUnlock(
    petId,
    accessToken,
    mbtiUnlockEnabled,
    "mbti"
  );

  const sections = [
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
  ] as const;

  const payBase = {
    ...continuation,
    locale,
    petId,
    sajuResultId: continuation.sajuResultId ?? undefined,
  };

  const mbtiPaymentHref = buildMbtiStandalonePaymentHref(payBase);
  const mbtiResultHref = `/saju/mbti?${new URLSearchParams({
    petName: continuation.petName,
    species: continuation.species,
    birthDate: continuation.birthDate,
    locale,
    ...(continuation.petGender ? { petGender: continuation.petGender } : {}),
    ...(continuation.birthTime ? { birthTime: continuation.birthTime } : {}),
    ...(continuation.timezone ? { timezone: continuation.timezone } : {}),
    ...(petId ? { petId } : {}),
    ...(continuation.sajuResultId ? { sajuResultId: continuation.sajuResultId } : {}),
  }).toString()}`;
  const mbtiCtaHref = mbtiUnlocked
    ? mbtiResultHref
    : hrefOrLoginGate(mbtiPaymentHref, isGuest);
  const mbtiCtaLabel = mbtiUnlocked ? t.mbtiViewResult : t.mbtiDiagnose;

  return (
    <GlassCard className="overflow-hidden border-2 border-channel-saju/40 !bg-white p-0 shadow-xl shadow-channel-saju/10">
      <div className="border-b border-channel-saju/15 bg-lavender/40 p-6 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-channel-saju/70">
          {t.packageTitle}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-plum/85">{t.packageSubtitle}</p>
        {!unlocked ? (
          <>
            <p className="mt-4 text-3xl font-extrabold text-primary">{t.price}</p>
            <p className="mt-1 text-xs text-on-surface-variant">{t.priceNote}</p>
            <Link
              href={hrefOrLoginGate(paymentHref, isGuest)}
              className="mt-5 inline-flex w-full justify-center rounded-full bg-[#6f4b8b] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#6f4b8b]/35 transition hover:bg-[#5f3f78] active:scale-[0.98]"
            >
              {isGuest ? t.loginPayCta : t.payCta}
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
          const linkHref = hrefOrLoginGate(sectionHref, isGuest && !unlocked);
          const badgeLabel = unlocked ? t.viewBadge : t.included;
          const buttonLabel = unlocked ? `${t.viewCta} →` : `${section.title} →`;

          return (
            <div
              key={section.key}
              className={`relative overflow-hidden border-t ${section.borderClass} bg-white p-6 text-center first:border-t-0`}
            >
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
                  href={linkHref}
                  className={`relative mt-5 inline-flex w-full justify-center rounded-full px-4 py-3.5 text-sm font-bold text-white shadow-lg transition ${section.buttonClass}`}
                >
                  {isGuest && !unlocked ? t.loginPayCta : buttonLabel}
                </Link>
              )}
            </div>
          );
        })}
      </div>

      <div className="border-t border-channel-saju/15 bg-sand/30 p-6 text-center">
        <p className="text-sm font-extrabold text-primary">{t.mbtiStandaloneTitle}</p>
        <p className="mt-2 text-sm leading-relaxed text-plum/85">{t.mbtiStandaloneBody}</p>
        {mbtiUnlockEnabled && mbtiUnlockLoading ? (
          <div className="mx-auto mt-5 h-12 w-full max-w-xs animate-pulse rounded-full bg-sand/70" />
        ) : (
          <Link
            href={mbtiCtaHref}
            className="mt-5 inline-flex w-full justify-center rounded-full border-2 border-plum/25 bg-white px-4 py-3.5 text-sm font-bold text-plum shadow-sm transition hover:bg-petal/30"
          >
            {mbtiCtaLabel}
          </Link>
        )}
      </div>
    </GlassCard>
  );
}
