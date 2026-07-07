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

interface PremiumMbtiReportProps {
  insight: PetMbtiPremiumInsight;
  locale: "ko" | "en";
}

export function PremiumMbtiReport({ insight, locale }: PremiumMbtiReportProps) {
  const sections = SECTIONS[locale];

  return (
    <div className="space-y-4">
      {sections.map((section) => {
        const text = insight[section.key as keyof PetMbtiPremiumInsight];
        if (typeof text !== "string") return null;
        return (
          <article key={section.key} className="rounded-[2rem] border border-surface-container bg-white p-5 shadow-sm">
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
