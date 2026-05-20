"use client";

import { formatJijiDisplay } from "@/lib/saju/jiji-hours";
import { ELEMENT_META } from "@/lib/saju/elements";
import type { SajuBasicResponse } from "@/lib/saju/types";
import { formatUtcForDisplay } from "@/lib/saju/timezone";

interface SajuResultProps {
  result: SajuBasicResponse;
}

const LABELS = {
  en: {
    pillars: "Four Pillars",
    year: "Year",
    month: "Month",
    day: "Day",
    hour: "Hour",
    unknown: "Unknown (excluded)",
    elements: "Element mix",
    traits: "Vibe check",
    stored: "Stored as UTC",
    kstHour: "KST double-hour (12 branches)",
    kstAt: "Birth time in KST",
    kstWindow: "KST window",
  },
  ko: {
    pillars: "사주 네 기둥",
    year: "년",
    month: "월",
    day: "일",
    hour: "시",
    unknown: "모름 (제외)",
    elements: "오행 밸런스",
    traits: "성향 키워드",
    stored: "UTC 저장",
    kstHour: "KST 12지지 (시간대)",
    kstAt: "한국 표준시 기준",
    kstWindow: "KST 구간",
  },
};

function PillarRow({
  label,
  pillar,
}: {
  label: string;
  pillar: SajuBasicResponse["pillars"]["year"];
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-sand/50 px-3 py-2 text-sm">
      <span className="text-ink/60">{label}</span>
      <div className="text-right">
        <span className="font-medium">{pillar.pillar}</span>
        <p className="text-xs text-ink/55">
          {pillar.stemLabel} · {pillar.branchLabel}
        </p>
      </div>
    </div>
  );
}

export function SajuResult({ result }: SajuResultProps) {
  const t = LABELS[result.locale];

  return (
    <div className="space-y-4">
      <article className="oriental-card overflow-hidden">
        <div className="bg-gradient-to-r from-blush/60 to-sage/50 px-5 py-4">
          <h2 className="text-xl font-semibold leading-snug">{result.headline}</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink/80">{result.story}</p>
        </div>
        <div className="flex flex-wrap gap-2 px-5 py-3">
          {result.traits.map((trait) => (
            <span
              key={trait}
              className="rounded-full bg-cream px-3 py-1 text-xs font-medium text-ink/75"
            >
              {trait}
            </span>
          ))}
        </div>
      </article>

      <section className="oriental-card space-y-2 p-4">
        <h3 className="text-sm font-semibold text-ink/70">{t.pillars}</h3>
        <PillarRow label={t.year} pillar={result.pillars.year} />
        <PillarRow label={t.month} pillar={result.pillars.month} />
        <PillarRow label={t.day} pillar={result.pillars.day} />
        {result.pillars.hour ? (
          <PillarRow label={t.hour} pillar={result.pillars.hour} />
        ) : (
          <p className="text-xs text-ink/50">{t.hour}: {t.unknown}</p>
        )}
        {result.kstJiji && (
          <div className="mt-2 rounded-xl border border-sage/40 bg-sage/15 px-3 py-3 text-sm">
            <p className="text-xs font-medium text-ink/55">{t.kstHour}</p>
            <p className="mt-1 font-medium">{formatJijiDisplay(result.kstJiji, result.locale)}</p>
            <p className="mt-1 text-xs text-ink/55">
              {t.kstAt}: {result.kstJiji.kstTime} (KST) · {t.kstWindow}: {result.kstJiji.kstRange}
            </p>
            <p className="mt-1 text-xs text-ink/50">
              {ELEMENT_META[result.kstJiji.element].hanja}{" "}
              {ELEMENT_META[result.kstJiji.element].romanized} ·{" "}
              {ELEMENT_META[result.kstJiji.element].hangul}
            </p>
          </div>
        )}
        <p className="pt-1 text-xs text-ink/45">
          {t.stored}: {formatUtcForDisplay(result.birthUtc, result.timezone)} ({result.timezone})
        </p>
      </section>

      <section className="oriental-card p-4">
        <h3 className="mb-3 text-sm font-semibold text-ink/70">{t.elements}</h3>
        <div className="flex flex-wrap gap-2">
          {result.elements.map((el) => (
            <div
              key={el.key}
              className="rounded-xl border border-white/80 bg-cream px-3 py-2 text-center"
            >
              <p className="text-lg font-semibold">
                {el.hanja}{" "}
                <span className="text-sm font-normal text-ink/60">
                  {el.romanized} · {el.hangul}
                </span>
              </p>
              <p className="text-xs text-ink/50">×{el.count}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
