"use client";

import type { PetMbtiPremiumInsight } from "@/lib/pet/mbti-inference";

const SECTIONS = {
  ko: [
    { key: "sajuCombo", title: "사주 × MBTI 조합" },
    { key: "butlerFit", title: "집사와의 궁합" },
    { key: "health", title: "건강 주의" },
    { key: "training", title: "행동 교정 팁" },
  ],
  en: [
    { key: "sajuCombo", title: "Saju × MBTI blend" },
    { key: "butlerFit", title: "Bond with butler" },
    { key: "health", title: "Health notes" },
    { key: "training", title: "Behavior tips" },
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
        const textKey = `${section.key}${locale === "ko" ? "Ko" : "En"}` as keyof PetMbtiPremiumInsight;
        return (
          <article key={section.key} className="rounded-[2rem] border border-surface-container bg-white p-5 shadow-sm">
            <h4 className="font-semibold text-primary">{section.title}</h4>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
              {insight[textKey]}
            </p>
          </article>
        );
      })}
    </div>
  );
}
