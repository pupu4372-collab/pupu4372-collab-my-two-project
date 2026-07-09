"use client";

import { getSafeInternalReturnPath } from "@/lib/auth/safe-internal-return-path";
import { Link } from "@/i18n/navigation";
import {
  buildMbtiStandalonePaymentHref,
  type PetPremiumContinuation,
} from "@/lib/payments/pet-premium-unlock-client";
import type { Locale } from "@/lib/saju/types";

function hrefOrLoginGate(target: string, isGuest: boolean) {
  if (!isGuest) return target;
  return `/login?next=${encodeURIComponent(getSafeInternalReturnPath(target))}`;
}

const UI = {
  ko: {
    title: (name: string) => `${name}의 성향 유형은?`,
    subtitle: "행동 진단으로 우리 아이 성향 유형과 맞춤 케어 팁을 확인해 보세요",
    cta: "상세 MBTI 보러가기",
    viewResult: "MBTI 결과 보기",
  },
  en: {
    title: (name: string) => `What is ${name}'s personality type?`,
    subtitle: "Discover your pet's type and tailored care tips with a behavior check.",
    cta: "View detailed MBTI",
    viewResult: "View MBTI result",
  },
} as const;

interface MbtiLockTeaserCardProps {
  petName: string;
  locale: Locale;
  continuation: Omit<PetPremiumContinuation, "locale" | "returnTo" | "product">;
  mbtiUnlocked?: boolean;
  mbtiUnlockLoading?: boolean;
  isGuest?: boolean;
}

export function MbtiLockTeaserCard({
  petName,
  locale,
  continuation,
  mbtiUnlocked = false,
  mbtiUnlockLoading = false,
  isGuest = false,
}: MbtiLockTeaserCardProps) {
  const t = UI[locale];
  const paymentHref = buildMbtiStandalonePaymentHref({ ...continuation, locale });
  const resultHref = `/saju/mbti?${new URLSearchParams({
    petName: continuation.petName,
    species: continuation.species,
    birthDate: continuation.birthDate,
    locale,
    ...(continuation.petGender ? { petGender: continuation.petGender } : {}),
    ...(continuation.birthTime ? { birthTime: continuation.birthTime } : {}),
    ...(continuation.timezone ? { timezone: continuation.timezone } : {}),
    ...(continuation.petId ? { petId: continuation.petId } : {}),
    ...(continuation.sajuResultId ? { sajuResultId: continuation.sajuResultId } : {}),
  }).toString()}`;

  const ctaHref = mbtiUnlocked ? resultHref : hrefOrLoginGate(paymentHref, isGuest);
  const ctaLabel = mbtiUnlocked ? t.viewResult : t.cta;

  return (
    <section className="rounded-[2rem] border border-channel-saju/20 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="text-2xl" aria-hidden>
          {mbtiUnlocked ? "🧠" : "🔒"}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-extrabold text-primary">{t.title(petName)}</h3>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant">{t.subtitle}</p>
          {mbtiUnlockLoading ? (
            <div className="mt-4 h-10 w-40 animate-pulse rounded-full bg-sand/70" />
          ) : (
            <Link
              href={ctaHref}
              className="mt-4 inline-flex rounded-full bg-[#6f4b8b] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#6f4b8b]/25 transition hover:bg-[#5f3f78]"
            >
              {ctaLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
