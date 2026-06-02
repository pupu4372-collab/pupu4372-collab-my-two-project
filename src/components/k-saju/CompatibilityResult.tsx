"use client";

import { AdSlot } from "@/components/ads/AdSlot";
import { BondScoreRing } from "@/components/k-saju/BondScoreRing";
import { SaveStatusBanner } from "@/components/k-saju/SaveStatusBanner";
import { ELEMENT_ACCENT } from "@/components/k-saju/result-styles";
import { GlassCard } from "@/components/layout/StitchLayout";
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
    eyebrow: "집사 궁합",
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
    eyebrow: "Pet-parent bond",
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

function ElementCard({
  title,
  name,
  elementLabel,
  dayPillarLabel,
  dayPillar,
  genderLabel,
  genderValue,
  elementKey,
}: {
  title: string;
  name: string;
  elementLabel: CompatibilityResponse["petElementLabel"];
  dayPillarLabel: string;
  dayPillar: string;
  genderLabel: string;
  genderValue: string;
  elementKey: CompatibilityResponse["petElement"];
}) {
  const accent = ELEMENT_ACCENT[elementKey];

  return (
    <div className={`rounded-2xl border px-4 py-4 ${accent.pill}`}>
      <p className="text-xs font-extrabold uppercase tracking-[0.12em] opacity-80">{title}</p>
      <p className="mt-1 text-base font-bold text-primary">{name}</p>
      <p className="mt-2 text-lg font-extrabold">
        {elementLabel.hanja} {elementLabel.meaning} · {elementLabel.hangul}
      </p>
      <p className="mt-2 text-xs text-plum/60">
        {genderLabel}: {genderValue}
      </p>
      <p className="text-xs text-plum/60">
        {dayPillarLabel}: {dayPillar}
      </p>
    </div>
  );
}

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
    <div className="space-y-5">
      <SaveStatusBanner
        locale={result.locale}
        persisted={result.persisted}
        persistError={result.persistError}
        isGuest={isGuest && !result.persisted}
      />

      <GlassCard className="relative overflow-hidden text-center">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-plum/50">{t.eyebrow}</p>
        <p className="mt-2 text-4xl" aria-hidden>
          {result.bondEmoji}
        </p>
        <div className="mt-4 flex justify-center">
          <BondScoreRing score={result.bondScore} />
        </div>
        <p className="mt-3 text-sm font-medium text-plum/60">{t.score}</p>
        <p className="mt-1 text-xl font-extrabold text-primary">{result.bondLabel}</p>
        <h2 className="mt-4 text-lg font-bold text-plum">{result.headline}</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-plum/80">{result.story}</p>
      </GlassCard>

      <GlassCard>
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-plum/45">{t.details}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {result.details.map((detail) => (
            <section
              key={detail.title}
              className="rounded-xl border border-outline-variant/25 bg-cream/60 px-4 py-3"
            >
              <h3 className="text-sm font-bold text-primary">{detail.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-plum/75">{detail.body}</p>
            </section>
          ))}
        </div>
      </GlassCard>

      <div className="grid gap-4 sm:grid-cols-2">
        <ElementCard
          title={t.petEl}
          name={result.petName}
          elementLabel={result.petElementLabel}
          dayPillarLabel={t.dayPillar}
          dayPillar={result.petDayPillar}
          genderLabel={t.petGender}
          genderValue={result.petGender === "male" ? t.malePet : t.femalePet}
          elementKey={result.petElement}
        />
        <ElementCard
          title={t.ownerEl}
          name={result.ownerName}
          elementLabel={result.ownerElementLabel}
          dayPillarLabel={t.dayPillar}
          dayPillar={result.ownerDayPillar}
          genderLabel={t.ownerGender}
          genderValue={result.ownerGender === "male" ? t.maleOwner : t.femaleOwner}
          elementKey={result.ownerElement}
        />
      </div>

      <GlassCard className="border-l-4 border-channel-saju/50 bg-channel-saju/5 text-center">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-plum/55">{t.relation}</p>
        <p className="mt-2 text-lg font-extrabold text-channel-saju">{rel}</p>
      </GlassCard>

      <GlassCard>
        <h3 className="font-extrabold text-primary">{t.tips}</h3>
        <ul className="mt-4 space-y-3">
          {result.careTips.map((tip) => (
            <li
              key={tip}
              className="rounded-xl border border-mint/30 bg-mint/20 px-4 py-3 text-sm leading-relaxed text-plum/85"
            >
              {tip}
            </li>
          ))}
        </ul>
      </GlassCard>

      <AdSlot />
    </div>
  );
}
