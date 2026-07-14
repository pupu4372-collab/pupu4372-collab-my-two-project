"use client";

import { SaveStatusBanner } from "@/components/k-saju/SaveStatusBanner";
import { ELEMENT_ACCENT } from "@/components/k-saju/result-styles";
import { GlassCard } from "@/components/layout/StitchLayout";
import { Link } from "@/i18n/navigation";
import { ELEMENT_META, formatElementLabelForLocale } from "@/lib/saju/elements";
import type { ZodiacFortuneResponse } from "@/lib/saju/zodiac/engine";

interface ZodiacResultProps {
  result: ZodiacFortuneResponse;
  isGuest?: boolean;
  onBack?: () => void;
}

const LABELS = {
  en: {
    eyebrow: "Pet astrology",
    sign: "Zodiac sign",
    element: "K-Saju element vibe",
    deepReading: "Detailed reading",
    daily: "Today's fortune (KST)",
    keyword: "Keyword",
    today: "Today",
    snack: "Lucky snack",
    caution: "Caution",
    tip: "Butler tip",
    luck: "Luck",
    dateNote: "Fortune date (KST)",
    back: "Edit birth info",
    compatibility: "Check pet-parent bond",
    nextTitle: "Continue reading",
    nextSubtitle: "Use the same pet info to compare your bond with the parent.",
  },
  ko: {
    eyebrow: "펫 별자리 운세",
    sign: "별자리",
    element: "K-Saju 오행 바이브",
    deepReading: "상세 해석",
    daily: "오늘의 운세 (KST)",
    keyword: "키워드",
    today: "오늘",
    snack: "럭키 간식",
    caution: "주의",
    tip: "집사 팁",
    luck: "행운",
    dateNote: "운세 기준일 (KST)",
    back: "이전 입력으로",
    compatibility: "펫과 주인간 궁합보기",
    nextTitle: "다음으로 이어보기",
    nextSubtitle: "방금 입력한 반려동물 정보로 집사와의 궁합까지 이어서 볼 수 있어요.",
  },
};

const ZODIAC_DETAIL_SURFACES = [
  "rounded-xl border border-lavender/40 bg-lavender/30 px-4 py-4",
  "rounded-xl border border-mint/40 bg-mint/30 px-4 py-4",
  "rounded-xl border border-petal/40 bg-petal/30 px-4 py-4",
  "rounded-xl border border-channel-saju/30 bg-lavender/20 px-4 py-4",
] as const;

function LuckStars({ score }: { score: number }) {
  return (
    <span className="text-channel-saju" aria-label={`${score} / 5`}>
      {"★".repeat(score)}
      {"☆".repeat(5 - score)}
    </span>
  );
}

export function ZodiacResult({
  result,
  isGuest,
  onBack,
}: ZodiacResultProps) {
  const t = LABELS[result.locale];
  const el = ELEMENT_META[result.elementAffinity];
  const accent = ELEMENT_ACCENT[result.elementAffinity];
  const compatibilityQuery = new URLSearchParams({
    petName: result.petName,
    species: result.species,
    birthDate: result.birthDate,
    locale: result.locale,
  }).toString();
  const compatibilityHref = isGuest ? "/login" : `/saju/compatibility?${compatibilityQuery}`;

  return (
    <div className="space-y-5">
      <SaveStatusBanner
        locale={result.locale}
        persisted={result.persisted}
        persistError={result.persistError}
        isGuest={isGuest && !result.persisted}
      />

      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-b from-primary via-primary/90 to-primary/75 px-6 py-10 text-center text-white shadow-lg">
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute left-1/4 top-8 h-2 w-2 rounded-full bg-white animate-pulse" />
          <div className="absolute right-1/4 top-16 h-1.5 w-1.5 rounded-full bg-white animate-pulse [animation-delay:1s]" />
          <div className="absolute bottom-12 left-1/3 h-2 w-2 rounded-full bg-white animate-pulse [animation-delay:1.5s]" />
        </div>
        <p className="relative text-xs font-extrabold uppercase tracking-[0.2em] text-primary-fixed">
          {t.eyebrow}
        </p>
        <p className="relative mt-4 text-5xl" aria-hidden>
          {result.sign.symbol}
        </p>
        <h2 className="relative mt-3 text-2xl font-extrabold md:text-3xl">{result.petName}</h2>
        <p className="relative mt-1 text-lg font-semibold text-primary-fixed-dim">
          {result.sign.displayName}
        </p>
        <p className="relative mt-2 text-sm text-white/75">
          {t.dateNote}: {result.fortuneDateKst}
        </p>
      </section>

      <GlassCard className="-mt-10 relative z-10 border-white/30 shadow-xl md:p-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-start">
          <div
            className={`mx-auto flex h-36 w-36 shrink-0 items-center justify-center rounded-[2rem] text-6xl ring-4 ring-white/80 ${accent.ring}`}
          >
            <span aria-hidden>{result.sign.symbol}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-0.5 w-8 bg-primary" />
              <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">
                {result.sign.dateRange}
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-primary md:text-2xl">
              {result.personality.headline}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-plum/80 md:text-base">
              {result.personality.story}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {result.personality.traits.map((trait) => (
                <span
                  key={trait}
                  className="rounded-lg border border-outline-variant/40 bg-cream px-3 py-1 text-xs font-medium text-plum"
                >
                  #{trait}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-lavender/40 bg-lavender/25 px-4 py-4">
            <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-plum/55">{t.sign}</p>
            <p className="mt-2 text-lg font-bold text-primary">{result.sign.displayName}</p>
            <p className="text-xs text-plum/60">{result.sign.dateRange}</p>
          </div>
          <div className={`rounded-2xl border px-4 py-4 ${accent.pill}`}>
            <p className="text-xs font-extrabold uppercase tracking-[0.12em] opacity-80">{t.element}</p>
            <p className="mt-2 text-lg font-bold">
              {result.locale === "ko"
                ? `${el.hanja} ${el.meaning} · ${el.hangul}`
                : formatElementLabelForLocale(result.elementAffinity, "en")}
            </p>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="border-l-4 border-channel-saju/40">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-plum/45">{t.deepReading}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {result.personality.details.map((detail, index) => (
            <section
              key={detail.title}
              className={ZODIAC_DETAIL_SURFACES[index % ZODIAC_DETAIL_SURFACES.length]}
            >
              <h4 className="text-sm font-bold text-primary">{detail.title}</h4>
              <p className="mt-1.5 text-sm leading-relaxed text-plum/75">{detail.body}</p>
            </section>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="border-2 border-channel-saju/20">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-extrabold text-channel-saju">{t.daily}</h3>
          <p className="text-sm font-medium text-plum/70">
            {t.luck} <LuckStars score={result.daily.luckScore} />
          </p>
        </div>

        <dl className="mt-5 space-y-4 text-sm">
          <div>
            <dt className="text-xs font-extrabold uppercase tracking-[0.12em] text-plum/55">{t.keyword}</dt>
            <dd className="mt-2 flex flex-wrap gap-1.5">
              {(result.daily.keywords ?? [result.daily.keyword]).map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-primary"
                >
                  #{keyword}
                </span>
              ))}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-extrabold uppercase tracking-[0.12em] text-plum/55">{t.today}</dt>
            <dd className="mt-2 leading-relaxed text-plum/85">{result.daily.today}</dd>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-mint/50 bg-mint/35 p-4">
              <dt className="text-xs font-extrabold uppercase tracking-[0.1em] text-plum/55">{t.snack}</dt>
              <dd className="mt-2 font-semibold text-primary">{result.daily.luckySnack}</dd>
            </div>
            <div className="rounded-xl border border-lavender/50 bg-lavender/35 p-4">
              <dt className="text-xs font-extrabold uppercase tracking-[0.1em] text-plum/55">{t.caution}</dt>
              <dd className="mt-2 font-semibold text-primary">{result.daily.caution}</dd>
            </div>
            <div className="rounded-xl border border-petal/50 bg-petal/40 p-4 sm:col-span-1">
              <dt className="text-xs font-extrabold uppercase tracking-[0.1em] text-plum/55">{t.tip}</dt>
              <dd className="mt-2 font-semibold text-primary">{result.daily.ownerTip}</dd>
            </div>
          </div>
        </dl>
      </GlassCard>

      <GlassCard>
        <h3 className="font-extrabold text-primary">{t.nextTitle}</h3>
        <p className="mt-2 text-sm leading-relaxed text-plum/65">{t.nextSubtitle}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onBack}
            className="rounded-full border border-primary/15 bg-white/80 px-4 py-3 text-center text-sm font-bold text-primary transition hover:bg-white"
          >
            {t.back}
          </button>
          <Link
            href={compatibilityHref}
            className="rounded-full bg-primary px-4 py-3 text-center text-sm font-bold text-white transition hover:brightness-105"
          >
            {t.compatibility}
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
