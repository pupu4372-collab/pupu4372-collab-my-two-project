"use client";

import type { PetMbtiPremiumInsight } from "@/lib/pet/mbti-inference";

const SECTIONS = {
  ko: [
    { key: "personalityBlend", title: "성격 융합" },
    { key: "sajuCombo", title: "사주 × MBTI" },
    { key: "butlerFit", title: "집사와의 궁합" },
    { key: "health", title: "건강·스트레스" },
    { key: "dailyCare", title: "일상 케어" },
  ],
  en: [
    { key: "personalityBlend", title: "Personality blend" },
    { key: "sajuCombo", title: "Chart × MBTI" },
    { key: "butlerFit", title: "Bond with butler" },
    { key: "health", title: "Health & stress" },
    { key: "dailyCare", title: "Daily care" },
  ],
} as const;

const AXIS_LABELS = {
  ko: {
    EI: ["E 외향", "I 내향"],
    SN: ["S 감각", "N 직관"],
    TF: ["T 사고", "F 감정"],
    JP: ["J 판단", "P 인식"],
  },
  en: {
    EI: ["E Extraversion", "I Introversion"],
    SN: ["S Sensing", "N Intuition"],
    TF: ["T Thinking", "F Feeling"],
    JP: ["J Judging", "P Perceiving"],
  },
} as const;

function AxisBar({
  leftLabel,
  rightLabel,
  leftPct,
  rightPct,
}: {
  leftLabel: string;
  rightLabel: string;
  leftPct: number;
  rightPct: number;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px] font-semibold text-plum/80">
        <span>
          {leftLabel} {leftPct}%
        </span>
        <span>
          {rightLabel} {rightPct}%
        </span>
      </div>
      <div className="flex h-2 overflow-hidden rounded-full bg-sand/80">
        <div className="bg-channel-saju/70 transition-all" style={{ width: `${leftPct}%` }} />
        <div className="bg-plum/40 transition-all" style={{ width: `${rightPct}%` }} />
      </div>
    </div>
  );
}

interface PremiumMbtiReportProps {
  insight: PetMbtiPremiumInsight;
  locale: "ko" | "en";
}

export function PremiumMbtiReport({ insight, locale }: PremiumMbtiReportProps) {
  const sections = SECTIONS[locale];
  const labels = AXIS_LABELS[locale];
  const p = insight.axisPercents;

  return (
    <div className="space-y-4">
      <article className="rounded-[2rem] border border-channel-saju/20 bg-white p-5 shadow-sm">
        <h4 className="font-semibold text-primary">
          {locale === "ko" ? "4축 성향 퍼센트" : "Four-axis tendency"}
        </h4>
        <div className="mt-3 space-y-3">
          <AxisBar
            leftLabel={labels.EI[0]}
            rightLabel={labels.EI[1]}
            leftPct={p.EI.E}
            rightPct={p.EI.I}
          />
          <AxisBar
            leftLabel={labels.SN[0]}
            rightLabel={labels.SN[1]}
            leftPct={p.SN.S}
            rightPct={p.SN.N}
          />
          <AxisBar
            leftLabel={labels.TF[0]}
            rightLabel={labels.TF[1]}
            leftPct={p.TF.T}
            rightPct={p.TF.F}
          />
          <AxisBar
            leftLabel={labels.JP[0]}
            rightLabel={labels.JP[1]}
            leftPct={p.JP.J}
            rightPct={p.JP.P}
          />
        </div>
      </article>

      {sections.map((section) => {
        const text = insight[section.key as keyof PetMbtiPremiumInsight];
        if (typeof text !== "string") return null;
        return (
          <article
            key={section.key}
            className="rounded-[2rem] border border-surface-container bg-white p-5 shadow-sm"
          >
            <h4 className="font-semibold text-primary">{section.title}</h4>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-on-surface-variant">
              {text}
            </p>
          </article>
        );
      })}
    </div>
  );
}
