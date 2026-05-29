"use client";

import { AdSlot } from "@/components/ads/AdSlot";
import { SaveStatusBanner } from "@/components/k-saju/SaveStatusBanner";
import type { CompatibilityResponse } from "@/lib/saju/compatibility/engine";

const RELATION_LABEL: Record<
  CompatibilityResponse["relation"],
  { ko: string; en: string }
> = {
  same: { ko: "동기(同氣)", en: "Same element" },
  owner_nourishes_pet: { ko: "집사 → 펫 상생", en: "Butler nourishes pet" },
  pet_nourishes_owner: { ko: "펫 → 집사 상생", en: "Pet nourishes butler" },
  owner_controls_pet: { ko: "집사 극 펫", en: "Butler shapes pet" },
  pet_controls_owner: { ko: "펫 극 집사", en: "Pet leads butler" },
  neutral: { ko: "중립 조화", en: "Neutral harmony" },
};

const LABELS = {
  ko: {
    score: "인연 지수",
    relation: "오행 관계",
    petEl: "펫 오행",
    ownerEl: "집사 오행",
    petGender: "펫 성별",
    ownerGender: "집사 성별",
    malePet: "수",
    femalePet: "암",
    maleOwner: "남성",
    femaleOwner: "여성",
    dayPillar: "일주(日柱)",
    details: "상세 궁합 해석",
    tips: "케어 팁",
  },
  en: {
    score: "Bond score",
    relation: "Element relation",
    petEl: "Pet element",
    ownerEl: "Butler element",
    petGender: "Pet gender",
    ownerGender: "Butler gender",
    malePet: "Male",
    femalePet: "Female",
    maleOwner: "Male",
    femaleOwner: "Female",
    dayPillar: "Day pillar",
    details: "Detailed bond reading",
    tips: "Care tips",
  },
};

export function CompatibilityResult({
  result,
  isGuest,
}: {
  result: CompatibilityResponse;
  isGuest?: boolean;
}) {
  const t = LABELS[result.locale];
  const rel = RELATION_LABEL[result.relation][result.locale];

  return (
    <div className="space-y-4">
      <SaveStatusBanner
        locale={result.locale}
        persisted={result.persisted}
        persistError={result.persistError}
        isGuest={isGuest && !result.persisted}
      />
      <article className="pastel-card overflow-hidden">
        <div className="bg-gradient-to-r from-petal/50 via-lavender/40 to-mint/30 px-6 py-6 text-center">
          <p className="text-4xl" aria-hidden>
            {result.bondEmoji}
          </p>
          <p className="mt-2 text-sm text-plum/60">{t.score}</p>
          <p className="text-4xl font-bold text-channel-saju">{result.bondScore}</p>
          <p className="mt-1 text-lg font-semibold text-plum">{result.bondLabel}</p>
        </div>

        <div className="space-y-3 px-6 py-5">
          <h2 className="text-lg font-bold text-plum">{result.headline}</h2>
          <p className="text-sm leading-relaxed text-plum/80">{result.story}</p>
        </div>
      </article>

      <article className="pastel-card p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-plum/45">
          {t.details}
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {result.details.map((detail) => (
            <section key={detail.title} className="rounded-2xl bg-white/45 px-4 py-3">
              <h3 className="text-sm font-semibold text-plum">{detail.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-plum/75">{detail.body}</p>
            </section>
          ))}
        </div>
      </article>

      <article className="pastel-card grid gap-3 p-5 sm:grid-cols-2">
        <div className="rounded-2xl bg-lavender/25 px-4 py-3">
          <p className="text-xs text-plum/55">{t.petEl}</p>
          <p className="font-semibold text-plum">
            {result.petElementLabel.meaning}({result.petElementLabel.hangul},{" "}
            {result.petElementLabel.hanja})
          </p>
          <p className="mt-1 text-xs text-plum/50">
            {t.dayPillar}: {result.petDayPillar}
          </p>
          <p className="mt-1 text-xs text-plum/50">
            {t.petGender}: {result.petGender === "male" ? t.malePet : t.femalePet}
          </p>
        </div>
        <div className="rounded-2xl bg-mint/25 px-4 py-3">
          <p className="text-xs text-plum/55">{t.ownerEl}</p>
          <p className="font-semibold text-plum">
            {result.ownerElementLabel.meaning}({result.ownerElementLabel.hangul},{" "}
            {result.ownerElementLabel.hanja})
          </p>
          <p className="mt-1 text-xs text-plum/50">
            {t.dayPillar}: {result.ownerDayPillar}
          </p>
          <p className="mt-1 text-xs text-plum/50">
            {t.ownerGender}: {result.ownerGender === "male" ? t.maleOwner : t.femaleOwner}
          </p>
        </div>
        <div className="rounded-2xl bg-channel-saju/10 px-4 py-3 sm:col-span-2">
          <p className="text-xs text-plum/55">{t.relation}</p>
          <p className="font-medium text-channel-saju">{rel}</p>
        </div>
      </article>

      <article className="pastel-card p-5">
        <h3 className="font-bold text-plum">{t.tips}</h3>
        <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-plum/80">
          {result.careTips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </article>

      <AdSlot />
    </div>
  );
}
