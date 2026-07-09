"use client";

import type { PetMbtiPremiumInsight } from "@/lib/pet/mbti-inference";
import { ELEMENT_ACCENT } from "@/components/k-saju/result-styles";
import type { ElementKey } from "@/lib/saju/types";

const SECTIONS = {
  ko: [
    { key: "personalityBlend", title: "성격 융합", accent: "border-l-channel-saju" },
    { key: "sajuCombo", title: "사주 × MBTI", accent: "element" },
    { key: "butlerFit", title: "집사와의 궁합", accent: "border-l-hwa-red" },
    { key: "health", title: "건강·스트레스", accent: "border-l-mok-green" },
    { key: "dailyCare", title: "일상 케어", accent: "border-l-to-yellow" },
  ],
  en: [
    { key: "personalityBlend", title: "Personality blend", accent: "border-l-channel-saju" },
    { key: "sajuCombo", title: "Chart × MBTI", accent: "element" },
    { key: "butlerFit", title: "Bond with butler", accent: "border-l-hwa-red" },
    { key: "health", title: "Health & stress", accent: "border-l-mok-green" },
    { key: "dailyCare", title: "Daily care", accent: "border-l-to-yellow" },
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

const AXIS_COLORS = {
  EI: { left: "bg-channel-saju", right: "bg-lavender" },
  SN: { left: "bg-su-blue", right: "bg-mint" },
  TF: { left: "bg-geum-silver", right: "bg-petal" },
  JP: { left: "bg-to-yellow", right: "bg-hwa-red/80" },
} as const;

function splitBodyWithBoldLast(text: string) {
  const parts = text.split(/(?<=[.!?。])\s+/).filter(Boolean);
  if (parts.length <= 1) return <>{text}</>;
  const last = parts[parts.length - 1];
  const rest = parts.slice(0, -1).join(" ");
  return (
    <>
      {rest}{" "}
      <strong className="font-bold text-ink">{last}</strong>
    </>
  );
}

function AxisBar({
  axis,
  leftLabel,
  rightLabel,
  leftPct,
  rightPct,
}: {
  axis: keyof typeof AXIS_COLORS;
  leftLabel: string;
  rightLabel: string;
  leftPct: number;
  rightPct: number;
}) {
  const leftDominant = leftPct >= rightPct;
  const colors = AXIS_COLORS[axis];

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px] text-plum/80">
        <span className={leftDominant ? "font-extrabold text-primary" : "font-semibold"}>
          {leftLabel} {leftPct}%
        </span>
        <span className={!leftDominant ? "font-extrabold text-primary" : "font-semibold"}>
          {rightLabel} {rightPct}%
        </span>
      </div>
      <div className="flex h-2.5 overflow-hidden rounded-full bg-sand/80">
        <div
          className={`${leftDominant ? colors.left : `${colors.left}/50`} transition-all`}
          style={{ width: `${leftPct}%` }}
        />
        <div
          className={`${!leftDominant ? colors.right : `${colors.right}/50`} transition-all`}
          style={{ width: `${rightPct}%` }}
        />
      </div>
    </div>
  );
}

interface PremiumMbtiReportProps {
  insight: PetMbtiPremiumInsight;
  locale: "ko" | "en";
  dominantElement?: ElementKey;
}

export function PremiumMbtiReport({ insight, locale, dominantElement }: PremiumMbtiReportProps) {
  const sections = SECTIONS[locale];
  const labels = AXIS_LABELS[locale];
  const p = insight.axisPercents;
  const elementAccent = dominantElement ? ELEMENT_ACCENT[dominantElement] : null;

  return (
    <div className="space-y-4">
      <article className="rounded-[2rem] border border-channel-saju/20 border-l-4 border-l-channel-saju bg-white p-5 shadow-sm">
        <h4 className="font-semibold text-primary">
          {locale === "ko" ? "4축 성향 퍼센트" : "Four-axis tendency"}
        </h4>
        <div className="mt-3 space-y-3">
          <AxisBar axis="EI" leftLabel={labels.EI[0]} rightLabel={labels.EI[1]} leftPct={p.EI.E} rightPct={p.EI.I} />
          <AxisBar axis="SN" leftLabel={labels.SN[0]} rightLabel={labels.SN[1]} leftPct={p.SN.S} rightPct={p.SN.N} />
          <AxisBar axis="TF" leftLabel={labels.TF[0]} rightLabel={labels.TF[1]} leftPct={p.TF.T} rightPct={p.TF.F} />
          <AxisBar axis="JP" leftLabel={labels.JP[0]} rightLabel={labels.JP[1]} leftPct={p.JP.J} rightPct={p.JP.P} />
        </div>
      </article>

      {sections.map((section) => {
        const text = insight[section.key as keyof PetMbtiPremiumInsight];
        if (typeof text !== "string") return null;

        const accentClass =
          section.accent === "element" && elementAccent
            ? `border-l-4 ${elementAccent.cardBorder}`
            : `border-l-4 ${section.accent}`;

        return (
          <article
            key={section.key}
            className={`rounded-[2rem] border border-surface-container bg-white p-5 shadow-sm ${accentClass}`}
          >
            <h4 className="font-semibold text-primary">{section.title}</h4>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-on-surface-variant">
              {splitBodyWithBoldLast(text)}
            </p>
          </article>
        );
      })}
    </div>
  );
}
