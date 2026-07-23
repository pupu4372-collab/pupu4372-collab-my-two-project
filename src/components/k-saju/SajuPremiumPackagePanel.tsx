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
import {
  formatPetProductPrice,
  PET_MBTI_STANDALONE_CODE,
  PET_PREMIUM_PACKAGE_CODE,
} from "@/lib/payments/pet-product-catalog";
import type { Locale } from "@/lib/saju/types";

function hrefOrLoginGate(target: string, isGuest: boolean) {
  if (!isGuest) return target;
  return `/login?next=${encodeURIComponent(getSafeInternalReturnPath(target))}`;
}

const UI = {
  ko: {
    packageTitle: "프리미엄 패키지",
    packageSubtitle: "집사 궁합 · 별자리 케어 — 우리 아이 맞춤 케어 가이드 한 번에",
    priceNote: "1회 결제 · 해당 펫 영구 잠금 해제",
    payCta: (price: string) => `${price} 결제하기`,
    loginPayCta: "가입하고 구매하기",
    accountReason: "구매하신 리포트는 계정에 보관돼요. 다른 기기에서도 이어서 보실 수 있어요.",
    includedProducts: "포함 상품",
    included: "포함",
    viewBadge: "보기",
    viewCta: "보기",
    zodiacCta: "별자리 케어",
    zodiacBody: "별자리 성향에 맞는 오늘의 케어 행동을 이어서 볼 수 있어요.",
    bondCta: "집사 궁합",
    bondBody: "우리가 서로 맞춰가는 케어 방법을 알려드려요.",
    mbtiStandaloneEyebrow: (price: string) => `개별 상품 · ${price}`,
    mbtiStandaloneTitle: "상세 MBTI",
    mbtiStandaloneBody: "행동 진단으로 우리 아이 성향 유형과 맞춤 케어 팁",
    mbtiViewResult: "결과 보기",
    mbtiDiagnose: "진단하기",
  },
  en: {
    packageTitle: "Premium package",
    packageSubtitle: "You & your pet bond and zodiac care — personalized guides for your pet in one unlock",
    priceNote: "One-time payment · Permanent unlock for this pet",
    payCta: (price: string) => `Pay ${price}`,
    loginPayCta: "Sign up to purchase",
    accountReason: "Your report is saved to your account, so you can pick up where you left off on any device.",
    includedProducts: "Included",
    included: "Included",
    viewBadge: "View",
    viewCta: "View",
    zodiacCta: "Zodiac care",
    zodiacBody: "See today's care actions matched to your pet's zodiac traits.",
    bondCta: "You & your pet bond",
    bondBody: "Learn how you and your pet can care for each other better.",
    mbtiStandaloneEyebrow: (price: string) => `Standalone · ${price}`,
    mbtiStandaloneTitle: "Detailed MBTI",
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
  const priceLocale = locale === "en" ? "en" : "ko";
  const t = UI[priceLocale];
  const packagePrice = formatPetProductPrice(PET_PREMIUM_PACKAGE_CODE, priceLocale);
  const mbtiPrice = formatPetProductPrice(PET_MBTI_STANDALONE_CODE, priceLocale);
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
      titleClass: "text-[#8b3a3a]",
      buttonClass: "bg-[#6f4b8b] hover:bg-[#5f3f78]",
      title: t.bondCta,
      body: t.bondBody,
    },
    {
      key: "zodiac",
      returnTo: "zodiac" as PetPremiumReturnTo,
      href: `${premiumHubHref}&view=zodiac`,
      titleClass: "text-channel-saju",
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
    <div className="space-y-4">
      <GlassCard
        variant="solid"
        className="overflow-hidden !border-2 !border-channel-saju !bg-lavender p-0 !shadow-md"
      >
        <div className="border-b border-channel-saju/30 bg-lavender p-6 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-channel-saju">
            {t.packageTitle}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-plum">{t.packageSubtitle}</p>
          {!unlocked ? (
            <>
              <p className="mt-4 text-3xl font-extrabold text-primary">{packagePrice}</p>
              <p className="mt-1 text-xs text-on-surface-variant">{t.priceNote}</p>
              <Link
                href={hrefOrLoginGate(paymentHref, isGuest)}
                className="mt-5 inline-flex w-full justify-center rounded-full bg-[#6f4b8b] px-4 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#5f3f78] active:scale-[0.98]"
              >
                {isGuest ? t.loginPayCta : t.payCta(packagePrice)}
              </Link>
              {isGuest ? (
                <p className="mt-3 text-xs leading-relaxed text-plum/70">{t.accountReason}</p>
              ) : null}
            </>
          ) : null}
        </div>

        <div className="bg-lavender px-4 py-5 sm:px-5">
          <p className="px-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-channel-saju">
            {t.includedProducts}
          </p>
          <div className="mt-3 divide-y divide-channel-saju/25 overflow-hidden rounded-2xl border border-channel-saju/35 bg-cream">
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
                <div key={section.key} className="px-4 py-4 text-left sm:px-5">
                  <div className="flex flex-wrap items-center gap-2">
                    {unlockLoading ? (
                      <div className="h-5 w-12 animate-pulse rounded-full bg-sand" />
                    ) : (
                      <span className="rounded-full bg-channel-saju px-2 py-0.5 text-[10px] font-bold text-white">
                        {badgeLabel}
                      </span>
                    )}
                    <h3 className={`text-sm font-bold ${section.titleClass}`}>{section.title}</h3>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-plum">{section.body}</p>
                  {unlockLoading ? (
                    <div className="mt-3 h-10 w-full max-w-xs animate-pulse rounded-full bg-sand" />
                  ) : (
                    <Link
                      href={linkHref}
                      className={`mt-3 inline-flex rounded-full px-4 py-2.5 text-xs font-bold text-white shadow-sm transition ${section.buttonClass}`}
                    >
                      {isGuest && !unlocked ? t.loginPayCta : buttonLabel}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </GlassCard>

      <GlassCard
        variant="solid"
        className="overflow-hidden !border-2 !border-plum/40 !bg-sand p-0 !shadow-md"
      >
        <div className="bg-sand p-6 text-center">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-plum">
            {locale === "ko" ? "개별 상품" : "Standalone"}
          </p>
          <p className="mt-3 text-3xl font-extrabold text-primary">{mbtiPrice}</p>
          <p className="mt-2 text-lg font-extrabold text-primary">{t.mbtiStandaloneTitle}</p>
          <p className="mt-2 text-sm leading-relaxed text-plum">{t.mbtiStandaloneBody}</p>
          <p className="mt-2 text-xs leading-5 text-on-surface-variant">
            {locale === "ko"
              ? "결과 리포트는 현재 언어(한국어)로 생성됩니다."
              : "Your report will be generated in the current language (English)."}
          </p>
          {mbtiUnlockEnabled && mbtiUnlockLoading ? (
            <div className="mx-auto mt-5 h-12 w-full max-w-xs animate-pulse rounded-full bg-cream" />
          ) : (
            <>
              <Link
                href={mbtiCtaHref}
                className="mt-5 inline-flex w-full justify-center rounded-full bg-[#6f4b8b] px-4 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#5f3f78] active:scale-[0.98]"
              >
                {isGuest && !mbtiUnlocked ? t.loginPayCta : mbtiCtaLabel}
              </Link>
              {isGuest && !mbtiUnlocked ? (
                <p className="mt-3 text-xs leading-relaxed text-plum/70">{t.accountReason}</p>
              ) : null}
            </>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
