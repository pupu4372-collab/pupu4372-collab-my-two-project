"use client";

import { GlassCard } from "@/components/layout/StitchLayout";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/lib/saju/types";

const UI = {
  ko: {
    packageTitle: "프리미엄 패키지",
    packageSubtitle: "상세 MBTI · 별자리 운세 · 펫·집사 궁합을 한 번에",
    price: "₩4,500",
    priceNote: "1회 결제 · 해당 펫 영구 잠금 해제",
    payCta: "₩4,500 결제하기",
    included: "포함",
    mbtiCta: "상세 MBTI",
    mbtiBody: "15문항 성향 분석과 사주×MBTI 맞춤 육성·건강·훈련 팁을 확인해 보세요.",
    zodiacCta: "별자리 운세",
    zodiacBody: "서양 별자리와 오행이 만나는 오늘의 운세를 이어서 볼 수 있어요.",
    bondCta: "집사 궁합",
    bondBody: "집사와 펫의 오행 상생·상극으로 인연 지수를 확인해 보세요.",
  },
  en: {
    packageTitle: "Premium package",
    packageSubtitle: "Detailed MBTI, zodiac fortune, and pet–butler bond",
    price: "₩4,500",
    priceNote: "One-time payment · Permanent unlock for this pet",
    payCta: "Pay ₩4,500",
    included: "Included",
    mbtiCta: "Detailed MBTI",
    mbtiBody: "15-question temperament plus saju×MBTI care, health, and training tips.",
    zodiacCta: "Zodiac fortune",
    zodiacBody: "See how western zodiac meets your pet's elemental vibe.",
    bondCta: "Pet & butler bond",
    bondBody: "Compare elemental harmony with your birth chart.",
  },
} as const;

interface SajuPremiumPackagePanelProps {
  locale: Locale;
  paymentHref: string;
  premiumHubHref: string;
}

export function SajuPremiumPackagePanel({
  locale,
  paymentHref,
  premiumHubHref,
}: SajuPremiumPackagePanelProps) {
  const t = UI[locale];

  const sections = [
    {
      key: "mbti",
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

  return (
    <GlassCard className="overflow-hidden border-2 border-channel-saju/40 !bg-white p-0 shadow-xl shadow-channel-saju/10">
      <div className="border-b border-channel-saju/15 bg-gradient-to-br from-lavender/70 via-white to-mint/50 p-6 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-channel-saju/70">
          {t.packageTitle}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-plum/85">{t.packageSubtitle}</p>
        <p className="mt-4 text-3xl font-extrabold text-primary">{t.price}</p>
        <p className="mt-1 text-xs text-on-surface-variant">{t.priceNote}</p>
        <Link
          href={paymentHref}
          className="mt-5 inline-flex w-full justify-center rounded-full bg-[#6f4b8b] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#6f4b8b]/35 transition hover:bg-[#5f3f78] active:scale-[0.98]"
        >
          {t.payCta}
        </Link>
      </div>

      <div className="divide-y divide-channel-saju/10">
        {sections.map((section) => (
          <div
            key={section.key}
            className={`relative overflow-hidden border-t ${section.borderClass} bg-gradient-to-br ${section.gradient} p-6 text-center first:border-t-0`}
          >
            <div
              className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full ${section.blurClass} blur-3xl`}
            />
            <span
              className={`relative mb-2 inline-block rounded-full ${section.badgeClass} px-2.5 py-1 text-[10px] font-bold text-white`}
            >
              {t.included}
            </span>
            <h3 className={`relative text-base font-bold ${section.titleClass}`}>
              {section.title}
            </h3>
            <p className="relative mt-3 text-sm leading-relaxed text-plum/85">{section.body}</p>
            <Link
              href={section.href}
              className={`relative mt-5 inline-flex w-full justify-center rounded-full px-4 py-3.5 text-sm font-bold text-white shadow-lg transition ${section.buttonClass}`}
            >
              {section.title} →
            </Link>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
