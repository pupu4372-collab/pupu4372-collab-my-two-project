"use client";

import { AdSlot } from "@/components/ads/AdSlot";
import { SaveStatusBanner } from "@/components/k-saju/SaveStatusBanner";
import { SajuPremiumPackagePanel } from "@/components/k-saju/SajuPremiumPackagePanel";
import { usePetPremiumUnlock } from "@/hooks/usePetPremiumUnlock";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { SajuCopyHtml, SajuNarrativeBody } from "@/components/k-saju/SajuCopyHtml";
import { BasicSajuInstaShareRow } from "@/components/k-saju/BasicSajuInstaShareRow";
import { ELEMENT_ACCENT } from "@/components/k-saju/result-styles";
import { GlassCard } from "@/components/layout/StitchLayout";
import { Link } from "@/i18n/navigation";
import { buildPetPremiumPaymentHref } from "@/lib/payments/pet-premium-unlock-client";
import {
  formatPetProductPrice,
  PET_PREMIUM_PACKAGE_CODE,
} from "@/lib/payments/pet-product-catalog";
import { formatPetBirthDisplayLabel } from "@/lib/saju/pet-birth-display";
import { ELEMENT_META } from "@/lib/saju/elements";
import { buildCarePointText } from "@/lib/saju/care-point-copy";
import { buildPillarsSummaryLine } from "@/lib/saju/pillars-summary-line";
import { buildSajuNarrative } from "@/lib/saju/saju-narrative";
import { buildPetLuckyScores, dominantElementLabel } from "@/lib/saju/pet-lucky-scores";
import { buildPetSajuMappingFromBasicResponse } from "@/lib/saju/pet-saju-mapping-from-result";
import type { Locale, SajuBasicResponse } from "@/lib/saju/types";
import { formatUtcForDisplay } from "@/lib/saju/timezone";
import { kstJijiToBirthTimeSelectValue } from "@/lib/saju/birth-time-options";
import { clearSajuResultSession } from "@/lib/saju/saju-result-session";
import { useEffect, useMemo, useState } from "react";

interface SajuResultProps {
  result: SajuBasicResponse;
  variant?: "default" | "pastel";
  /** Vault/archive: render only stored snapshot fields — no mapping recompute. */
  snapshot?: boolean;
  mbtiType?: string | null;
  /** Birth-time dropdown value from the live form session (e.g. "11:30" | "unknown"). */
  birthTimeSelect?: string;
}

const LABELS = {
  en: {
    reading: "K-Saju Reading",
    birth: "Born",
    dominant: "Dominant",
    elements: "Five Elements",
    luckyTitle: "Today's pet lucky points",
    luckyNumber: "Lucky Routine",
    wealthLuck: "Treat Luck",
    healthLuck: "Condition Luck",
    personality: "Personality",
    sajuNarrative: "What your pet's saju says",
    carePoint: "Care point",
    detailedTraits: "Trait highlights",
    pillars: "Four Pillars",
    hour: "Hour",
    day: "Day",
    month: "Month",
    year: "Year",
    unknown: "Unknown (excluded)",
    stored: "Stored birth time",
    kstHour: "KST double-hour (12 branches)",
    kstAt: "Birth time in KST",
    kstWindow: "KST window",
    zodiacCta: "Zodiac care",
    zodiacCtaBadge: `Premium ${formatPetProductPrice(PET_PREMIUM_PACKAGE_CODE, "en")}`,
    zodiacBody: "See today's care actions matched to your pet's zodiac traits.",
    bondCta: "Pet-parent bond",
    bondCtaBadge: `Premium ${formatPetProductPrice(PET_PREMIUM_PACKAGE_CODE, "en")}`,
    bondBody: "Learn how you and your pet can care for each other better.",
    luckyColorTitle: "Today's lucky color",
    luckyColorBody: (name: string, color: string) =>
      `For ${name}, ${color} accessories may bring extra luck today.`,
    routineUnit: "times",
    home: "Back to home",
    another: "Another personalized care",
  },
  ko: {
    reading: "K-Saju 사주",
    birth: "출생",
    dominant: "대표 오행",
    elements: "오행 분석",
    luckyTitle: "오늘의 펫 행운 포인트",
    luckyNumber: "행운 루틴",
    wealthLuck: "간식운",
    healthLuck: "컨디션운",
    personality: "성격 분석",
    sajuNarrative: "사주가 말하는 우리 아이",
    carePoint: "케어 포인트",
    detailedTraits: "상세 특징",
    pillars: "사주팔자",
    hour: "시주",
    day: "일주",
    month: "월주",
    year: "연주",
    unknown: "모름 (제외)",
    stored: "저장된 출생 시간",
    kstHour: "KST 12지지 (시간대)",
    kstAt: "한국 표준시 기준",
    kstWindow: "KST 구간",
    zodiacCta: "별자리 케어",
    zodiacCtaBadge: `프리미엄 ${formatPetProductPrice(PET_PREMIUM_PACKAGE_CODE, "ko")}`,
    zodiacBody: "별자리 성향에 맞는 오늘의 케어 행동을 이어서 볼 수 있어요.",
    bondCta: "집사 궁합",
    bondCtaBadge: `프리미엄 ${formatPetProductPrice(PET_PREMIUM_PACKAGE_CODE, "ko")}`,
    bondBody: "우리가 서로 맞춰가는 케어 방법을 알려드려요.",
    luckyColorTitle: "오늘의 행운 컬러",
    luckyColorBody: (name: string, color: string) =>
      `${name}에게 오늘은 ${color} 액세서리가 행운을 가져다줄 거예요.`,
    routineUnit: "회",
    home: "홈으로",
    another: "다른 아이 맞춤 케어",
  },
} as const;

function traitCards(traits: string[], locale: Locale) {
  const icons = ["🛡️", "🧠", "📚", "💗"];
  return traits.slice(0, 4).map((trait, index) => ({
    icon: icons[index] ?? "✨",
    title: trait,
    body:
      locale === "ko"
        ? `${trait} 기운이 일상에서 자주 드러나는 편이에요.`
        : `The "${trait}" vibe shows up often in daily life.`,
  }));
}

export function SajuResult({ result, snapshot = false, mbtiType, birthTimeSelect }: SajuResultProps) {
  const t = LABELS[result.locale];
  const isKo = result.locale === "ko";
  const meta = ELEMENT_META[result.dominantElement];
  const accent = ELEMENT_ACCENT[result.dominantElement];
  const [barsReady, setBarsReady] = useState(false);

  const sortedElements = useMemo(() => {
    const dominant = result.dominantElement;
    return [...result.elements].sort((a, b) => {
      if (a.key === dominant) return -1;
      if (b.key === dominant) return 1;
      return b.count - a.count;
    });
  }, [result.elements, result.dominantElement]);

  const lucky = useMemo(
    () => buildPetLuckyScores(result.petName, result.birthUtc, result.dominantElement, result.locale),
    [result.petName, result.birthUtc, result.dominantElement, result.locale]
  );

  const { ready, accessToken, configured, isAnonymous } = useSupabaseSession();
  const unlockCheckEnabled = configured && ready && !isAnonymous;
  const { unlocked, loading: unlockLoading } = usePetPremiumUnlock(
    result.petId,
    accessToken,
    unlockCheckEnabled
  );

  const birthDateLabel = formatPetBirthDisplayLabel({
    birthUtc: result.birthUtc,
    timezone: result.timezone,
    locale: result.locale,
    birthTimeUnknown: result.birthTimeUnknown,
    kstJiji: result.kstJiji,
  });
  const resolvedBirthTimeSelect =
    birthTimeSelect ??
    (result.birthTimeUnknown ? "unknown" : kstJijiToBirthTimeSelectValue(result.kstJiji));
  const continuationBase = {
    petName: result.petName,
    species: result.species,
    petGender: result.petGender ?? "female",
    birthDate: result.birthDate,
    birthTime: resolvedBirthTimeSelect,
    timezone: result.timezone,
    locale: result.locale,
    petId: result.petId,
    sajuResultId: result.sajuResultId,
  };
  const continuationQuery = new URLSearchParams({
    petName: continuationBase.petName,
    species: continuationBase.species,
    petGender: continuationBase.petGender,
    birthDate: continuationBase.birthDate,
    birthTime: continuationBase.birthTime,
    timezone: continuationBase.timezone,
    locale: continuationBase.locale,
    ...(continuationBase.petId ? { petId: continuationBase.petId } : {}),
    ...(continuationBase.sajuResultId ? { sajuResultId: continuationBase.sajuResultId } : {}),
    ...(mbtiType ? { mbtiType } : {}),
  }).toString();
  const premiumPaymentHref = buildPetPremiumPaymentHref({
    ...continuationBase,
    mbtiType: mbtiType ?? undefined,
    returnTo: "basic",
  });
  const premiumHubHref = `/saju/premium?${continuationQuery}`;

  // TODO: 배포 후 제거 가능(구 sessionStorage 세션 소멸 후) — 라이브 경로 매핑 폴백
  const petMapping = useMemo(
    () => (snapshot ? null : buildPetSajuMappingFromBasicResponse(result)),
    [result, snapshot]
  );
  const sajuNarrativeText = useMemo(() => {
    if (snapshot) return result.sajuNarrative ?? null;
    if (result.sajuNarrative) return result.sajuNarrative;
    return petMapping ? buildSajuNarrative(result, petMapping) : null;
  }, [result, petMapping, snapshot]);
  const carePointText = useMemo(() => {
    if (snapshot) return result.carePointText ?? null;
    if (result.carePointText) return result.carePointText;
    return petMapping ? buildCarePointText(petMapping, result.locale) : null;
  }, [result, petMapping, snapshot]);
  const personalityTraits = useMemo(
    () => result.traits.map((trait) => trait.trim()).filter(Boolean).slice(0, 5),
    [result.traits]
  );
  const pillarsSummaryLine = useMemo(() => {
    if (snapshot) return result.pillarsSummaryLine ?? null;
    if (result.pillarsSummaryLine) return result.pillarsSummaryLine;
    return buildPillarsSummaryLine(result);
  }, [result, snapshot]);
  const detailTraits = traitCards(personalityTraits, result.locale);

  useEffect(() => {
    const id = requestAnimationFrame(() => setBarsReady(true));
    return () => cancelAnimationFrame(id);
  }, [result.petName, result.birthUtc]);

  return (
    <div className="space-y-6 pb-8 max-lg:pb-4">
      <SaveStatusBanner locale={result.locale} persisted={result.persisted} persistError={result.persistError} />

      <section className="pastel-card flex flex-col items-center gap-6 p-6 md:flex-row md:items-center md:p-8">
        <div className="relative">
          <div className="absolute inset-0 scale-110 rounded-full bg-primary/10 blur-2xl" aria-hidden />
          <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-lavender/50 to-mint/40 text-6xl shadow-xl md:h-44 md:w-44">
            <span aria-hidden>{result.species === "cat" ? "🐱" : result.species === "other" ? "🐾" : "🐶"}</span>
          </div>
          <span
            className={`absolute -bottom-1 -right-1 flex h-12 w-12 items-center justify-center rounded-full border-2 border-white text-lg font-bold text-white shadow-lg ${accent.bar}`}
          >
            {meta.hanja}
          </span>
        </div>
        <div className="text-center md:text-left">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary/60">{t.reading}</p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-primary md:text-3xl">{result.headline}</h2>
          <div className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
            <span className="rounded-full bg-primary/10 px-4 py-2 text-xs font-bold text-primary">
              {t.birth} {birthDateLabel}
            </span>
            <span className={`rounded-full px-4 py-2 text-xs font-bold ${accent.pill}`}>
              {t.dominant}: {dominantElementLabel(result.dominantElement, result.locale)}
            </span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <GlassCard className="p-6 md:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-lg font-bold text-primary">
                <span aria-hidden>☯️</span>
                {t.elements}
              </h3>
              <span className="text-sm text-on-surface-variant">
                {t.dominant}: {dominantElementLabel(result.dominantElement, result.locale)}
              </span>
            </div>
            <div className="space-y-6">
              {sortedElements.map((el) => {
                const percent = el.percent;
                const elAccent = ELEMENT_ACCENT[el.key];
                const isDominant = el.key === result.dominantElement;
                const width = barsReady ? `${Math.max(isDominant ? 8 : 4, percent)}%` : "0%";

                if (isDominant) {
                  return (
                    <div key={el.key}>
                      <div className="mb-2 flex items-end justify-between gap-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${elAccent.pill}`}>
                          {el.romanized.toUpperCase()} ({el.hanja}) {isKo ? el.hangul : el.meaning}
                        </span>
                        <span className="text-sm font-bold text-primary">{percent}%</span>
                      </div>
                      <div className="h-4 overflow-hidden rounded-full bg-surface-container">
                        <div className={`chart-bar h-full rounded-full ${elAccent.bar}`} style={{ width }} />
                      </div>
                    </div>
                  );
                }

                return null;
              })}
              <div className="grid gap-6 md:grid-cols-2">
                {sortedElements
                  .filter((el) => el.key !== result.dominantElement)
                  .map((el) => {
                    const percent = el.percent;
                    const elAccent = ELEMENT_ACCENT[el.key];
                    const width = barsReady ? `${Math.max(4, percent)}%` : "0%";

                    return (
                      <div key={el.key}>
                        <div className="mb-2 flex items-end justify-between gap-3">
                          <span className={`rounded-full px-3 py-1 text-xs font-bold ${elAccent.pill}`}>
                            {el.romanized.toUpperCase()} ({el.hanja}) {isKo ? el.hangul : el.meaning}
                          </span>
                          <span className="text-xs font-bold text-primary">{percent}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-surface-container">
                          <div className={`chart-bar h-full rounded-full ${elAccent.bar}`} style={{ width }} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 md:p-8">
            <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-primary">
              <span aria-hidden>✨</span>
              {t.luckyTitle}
            </h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex flex-col items-center rounded-[2rem] border border-lavender/40 bg-lavender/30 p-6 text-center">
                <span className="mb-3 text-3xl" aria-hidden>
                  🐾
                </span>
                <p className="text-xs font-extrabold uppercase tracking-wide text-primary">{t.luckyNumber}</p>
                <p className="mt-2 text-4xl font-extrabold text-primary">
                  {lucky.luckyNumber}
                  <span className="ml-1 text-base">{t.routineUnit}</span>
                </p>
              </div>
              <div className="flex flex-col rounded-[2rem] border border-mint/40 bg-mint/30 p-6">
                <div className="text-center">
                  <span className="mb-3 block text-3xl" aria-hidden>
                  🦴
                  </span>
                  <p className="text-xs font-extrabold uppercase tracking-wide text-primary">{t.wealthLuck}</p>
                  <p className="mt-2 text-2xl font-bold text-primary">
                    {lucky.wealthScore} / 100
                  </p>
                </div>
                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/50">
                  <div
                    className="chart-bar h-full rounded-full bg-to-yellow"
                    style={{ width: barsReady ? `${lucky.wealthScore}%` : "0%" }}
                  />
                </div>
              </div>
              <div className="flex flex-col rounded-[2rem] border border-petal/40 bg-petal/30 p-6">
                <div className="text-center">
                  <span className="mb-3 block text-3xl" aria-hidden>
                    💚
                  </span>
                  <p className="text-xs font-extrabold uppercase tracking-wide text-primary">{t.healthLuck}</p>
                  <p className="mt-2 text-2xl font-bold text-primary">
                    {lucky.healthScore} / 100
                  </p>
                </div>
                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/50">
                  <div
                    className="chart-bar h-full rounded-full bg-mok-green"
                    style={{ width: barsReady ? `${lucky.healthScore}%` : "0%" }}
                  />
                </div>
              </div>
            </div>
          </GlassCard>

          {sajuNarrativeText ? (
            <GlassCard className={`border-l-8 p-6 md:p-8 ${accent.cardBorder}`}>
              <h3 className="text-lg font-bold text-primary">{t.sajuNarrative}</h3>
              <SajuNarrativeBody html={sajuNarrativeText} />
            </GlassCard>
          ) : null}

          <GlassCard className={`border-l-8 p-6 md:p-8 ${accent.cardBorder}`}>
            <h3 className="text-lg font-bold text-primary">{t.personality}</h3>
            <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-primary/90">{result.story}</p>
            {carePointText ? (
              <div className="mt-6 rounded-xl border border-mok-green/25 bg-mint/20 p-4">
                <h4 className="text-sm font-bold text-primary">{t.carePoint}</h4>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{carePointText}</p>
              </div>
            ) : null}
            {detailTraits.length > 0 && (
              <div className="mt-8 border-t border-outline-variant/30 pt-6">
                <h4 className="mb-4 text-base font-bold text-secondary">{t.detailedTraits}</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  {detailTraits.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-xl border border-outline-variant/20 bg-cream/50 p-4"
                    >
                      <div className="mb-1 flex items-center gap-2">
                        <span aria-hidden>{item.icon}</span>
                        <span className="text-sm font-bold text-primary">{item.title}</span>
                      </div>
                      <p className="text-sm text-on-surface-variant">{item.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-6 flex flex-wrap gap-2">
              {personalityTraits.map((trait) => (
                <span
                  key={trait}
                  className="rounded-lg border border-outline-variant/30 bg-cream px-3 py-1 text-sm text-primary"
                >
                  #{trait}
                </span>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6 md:p-8">
            <h3 className="mb-6 text-lg font-bold text-primary">{t.pillars}</h3>
            <div className="rounded-2xl border-2 border-mok-green/40 bg-mint/20 px-4 py-4 text-sm">
              {pillarsSummaryLine ? (
                <SajuCopyHtml
                  html={pillarsSummaryLine}
                  className="text-base font-semibold leading-relaxed text-primary break-words [&_strong]:font-extrabold [&_strong]:text-primary"
                />
              ) : null}
              {result.kstJiji ? (
                <>
                  <p className="mt-3 text-sm font-semibold text-primary">
                    {isKo ? result.kstJiji.siNameKo : result.kstJiji.siNameEn} · {result.kstJiji.kstRange} ·{" "}
                    {ELEMENT_META[result.kstJiji.element].hangul}({ELEMENT_META[result.kstJiji.element].hanja})
                  </p>
                  <p className="mt-2 text-xs text-plum/75">
                    {t.kstAt}: {result.kstJiji.kstTime} (KST) · {t.kstWindow}: {result.kstJiji.kstRange}
                  </p>
                </>
              ) : (
                <p className="mt-3 text-xs text-plum/65">
                  {t.hour}: {t.unknown}
                </p>
              )}
              <p className="mt-3 text-xs text-plum/65">
                {t.stored}: {formatUtcForDisplay(result.birthUtc, result.timezone)} ({result.timezone})
              </p>
            </div>
          </GlassCard>

          <GlassCard className="border-2 border-mok-green/35 !bg-gradient-to-br !from-white !to-element-wood p-5 md:p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-mok-green/15 p-3 text-xl" aria-hidden>
                💡
              </div>
              <div>
                <h4 className="text-sm font-bold text-primary">{t.luckyColorTitle}</h4>
                <p className="mt-1 text-sm text-on-surface-variant">
                  {t.luckyColorBody(result.petName, lucky.luckyColor)}
                </p>
              </div>
            </div>
          </GlassCard>

          <BasicSajuInstaShareRow result={result} mbtiType={mbtiType} />
        </div>

        <aside className="pb-6 max-lg:pb-28 lg:col-span-4">
          <SajuPremiumPackagePanel
            locale={result.locale}
            paymentHref={premiumPaymentHref}
            premiumHubHref={premiumHubHref}
            petId={result.petId}
            unlocked={unlocked}
            unlockLoading={unlockCheckEnabled && unlockLoading}
            continuation={{
              petName: result.petName,
              species: result.species,
              petGender: result.petGender ?? "female",
              birthDate: result.birthDate,
              birthTime: resolvedBirthTimeSelect,
              timezone: result.timezone,
              sajuResultId: result.sajuResultId,
            }}
          />
        </aside>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        <div className="space-y-3 lg:col-span-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-start">
            <Link
              href="/"
              className="pastel-card inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary/10 px-8 py-4 text-sm font-bold text-primary transition hover:scale-[1.02]"
            >
              <span aria-hidden>🏠</span>
              {t.home}
            </Link>
            <Link
              href="/saju?new=1"
              onClick={() => clearSajuResultSession()}
              className="pastel-card inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary/10 px-8 py-4 text-sm font-bold text-primary transition hover:scale-[1.02]"
            >
              <span aria-hidden>🐾</span>
              {t.another}
            </Link>
          </div>
          <AdSlot />
        </div>
      </div>
    </div>
  );
}
