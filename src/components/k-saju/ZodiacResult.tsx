"use client";

import { AdSlot } from "@/components/ads/AdSlot";
import { SaveStatusBanner } from "@/components/k-saju/SaveStatusBanner";
import { Link } from "@/i18n/navigation";
import { ELEMENT_META } from "@/lib/saju/elements";
import type { ZodiacFortuneResponse } from "@/lib/saju/zodiac/engine";

interface ZodiacResultProps {
  result: ZodiacFortuneResponse;
  isGuest?: boolean;
  onBack?: () => void;
}

const LABELS = {
  en: {
    sign: "Zodiac sign",
    element: "K-Saju element vibe",
    personality: "Star personality",
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
    sign: "별자리",
    element: "K-Saju 오행 바이브",
    personality: "별자리 성향",
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

function LuckStars({ score }: { score: number }) {
  return (
    <span className="text-channel-saju" aria-label={`${score} / 5`}>
      {"★".repeat(score)}
      {"☆".repeat(5 - score)}
    </span>
  );
}

export function ZodiacResult({ result, isGuest, onBack }: ZodiacResultProps) {
  const t = LABELS[result.locale];
  const el = ELEMENT_META[result.elementAffinity];
  const compatibilityQuery = new URLSearchParams({
    petName: result.petName,
    species: result.species,
    birthDate: result.birthDate,
    locale: result.locale,
  }).toString();
  const compatibilityHref = isGuest ? "/login" : `/saju/compatibility?${compatibilityQuery}`;

  return (
    <div className="space-y-4">
      <SaveStatusBanner
        locale={result.locale}
        persisted={result.persisted}
        persistError={result.persistError}
        isGuest={isGuest && !result.persisted}
      />
      <article className="pastel-card overflow-hidden">
        <div className="bg-gradient-to-r from-lavender/50 via-petal/40 to-sky/30 px-6 py-5">
          <p className="text-xs text-plum/55">
            {t.dateNote}: {result.fortuneDateKst}
          </p>
          <h2 className="mt-1 text-xl font-bold text-plum">{result.personality.headline}</h2>
          <p className="mt-2 text-sm leading-relaxed text-plum/80">{result.personality.story}</p>
        </div>

        <div className="grid gap-3 px-6 py-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-lavender/25 px-4 py-3">
            <p className="text-xs font-medium text-plum/55">{t.sign}</p>
            <p className="mt-1 text-lg font-semibold text-plum">
              {result.sign.emoji} {result.sign.displayName}
            </p>
            <p className="text-xs text-plum/60">{result.sign.dateRange}</p>
          </div>
          <div className="rounded-2xl bg-mint/25 px-4 py-3">
            <p className="text-xs font-medium text-plum/55">{t.element}</p>
            <p className="mt-1 font-semibold text-plum">
              {el.meaning}({el.hangul}, {el.hanja})
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 px-6 pb-4">
          {result.personality.traits.map((trait) => (
            <span
              key={trait}
              className="rounded-full bg-petal/50 px-3 py-1 text-xs font-medium text-plum"
            >
              {trait}
            </span>
          ))}
        </div>

        <div className="border-t border-white/60 px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-plum/45">
            {t.deepReading}
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {result.personality.details.map((detail) => (
              <section key={detail.title} className="rounded-2xl bg-white/45 px-4 py-3">
                <h3 className="text-sm font-semibold text-plum">{detail.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-plum/75">{detail.body}</p>
              </section>
            ))}
          </div>
        </div>
      </article>

      <article className="pastel-card border-2 border-channel-saju/20 p-6">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-bold text-channel-saju">{t.daily}</h3>
          <div className="text-sm">
            {t.luck} <LuckStars score={result.daily.luckScore} />
          </div>
        </div>

        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="font-medium text-plum/70">{t.keyword}</dt>
            <dd className="mt-1 flex flex-wrap gap-1.5">
              {(result.daily.keywords ?? [result.daily.keyword]).map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-full bg-white/60 px-2.5 py-1 text-xs font-semibold text-plum"
                >
                  #{keyword}
                </span>
              ))}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-plum/70">{t.today}</dt>
            <dd className="leading-relaxed text-plum/85">{result.daily.today}</dd>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-channel-saju/10 px-3 py-2">
              <dt className="text-xs font-medium text-plum/60">{t.snack}</dt>
              <dd className="text-plum">{result.daily.luckySnack}</dd>
            </div>
            <div className="rounded-xl bg-petal/30 px-3 py-2">
              <dt className="text-xs font-medium text-plum/60">{t.caution}</dt>
              <dd className="text-plum">{result.daily.caution}</dd>
            </div>
          </div>
          <div className="rounded-xl bg-lavender/30 px-3 py-2">
            <dt className="text-xs font-medium text-plum/60">{t.tip}</dt>
            <dd className="text-plum">{result.daily.ownerTip}</dd>
          </div>
        </dl>
      </article>

      <AdSlot />

      <section className="pastel-card space-y-3 p-5">
        <div>
          <h3 className="font-semibold text-plum">{t.nextTitle}</h3>
          <p className="mt-1 text-sm leading-relaxed text-plum/65">{t.nextSubtitle}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onBack}
            className="rounded-2xl bg-white/65 px-4 py-3 text-center text-sm font-semibold text-plum transition hover:bg-white"
          >
            {t.back}
          </button>
          <Link
            href={compatibilityHref}
            className="rounded-2xl bg-channel-saju px-4 py-3 text-center text-sm font-semibold text-white transition hover:brightness-105"
          >
            {t.compatibility}
          </Link>
        </div>
      </section>
    </div>
  );
}
