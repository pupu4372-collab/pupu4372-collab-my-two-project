"use client";

import { AdSlot } from "@/components/ads/AdSlot";
import { COMMUNITY_SOLID_SURFACE_CLASS } from "@/components/community/CommunityDetailSurface";
import { BondScoreRing } from "@/components/k-saju/BondScoreRing";
import { SaveStatusBanner } from "@/components/k-saju/SaveStatusBanner";
import { SajuResultShareRow } from "@/components/k-saju/SajuResultShareRow";
import { GlassCard } from "@/components/layout/StitchLayout";
import type { CompatibilityResponse } from "@/lib/saju/compatibility/engine";
import type { ElementKey } from "@/lib/saju/types";

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
    tipsIntro: "오늘부터 바로 써볼 수 있는 실천 팁이에요.",
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
    tipsIntro: "Practical tips you can try starting today.",
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
  note,
}: {
  title: string;
  name: string;
  elementLabel: CompatibilityResponse["petElementLabel"];
  dayPillarLabel: string;
  dayPillar: string;
  genderLabel: string;
  genderValue: string;
  elementKey: ElementKey;
  note?: string;
}) {
  return (
    <div className={`element-compatibility-card element-compatibility-card--${elementKey}`}>
      <p className="element-compatibility-card__label">{title}</p>
      <p className="element-compatibility-card__name">{name}</p>
      <p className="element-compatibility-card__element">
        {elementLabel.hanja} {elementLabel.meaning} · {elementLabel.hangul}
      </p>
      <p className="element-compatibility-card__meta">
        {genderLabel}: {genderValue}
      </p>
      <p className="element-compatibility-card__meta">
        {dayPillarLabel}: {dayPillar}
      </p>
      {note && <p className="element-compatibility-card__note">{note}</p>}
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
  const details = result.details ?? [];
  const relationBody =
    result.relationDescription ?? details.find((d) => d.title)?.body ?? result.story;

  return (
    <div className={`${COMMUNITY_SOLID_SURFACE_CLASS} space-y-5 p-6 md:p-8`}>
      <SaveStatusBanner
        locale={result.locale}
        persisted={result.persisted}
        persistError={result.persistError}
        isGuest={isGuest && !result.persisted}
      />

      <GlassCard variant="solid" className="relative overflow-hidden text-center">
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

      <GlassCard variant="solid">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-plum/45">{t.details}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {result.details.map((detail) => (
            <section
              key={detail.title}
              className="rounded-xl border border-white/35 bg-sand/45 px-4 py-3"
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
          note={result.petElementNote || undefined}
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
          note={result.ownerElementNote || undefined}
        />
      </div>

      <GlassCard
        variant="solid"
        className="border border-channel-saju/25 bg-gradient-to-br from-sand/70 via-white to-lavender/30 text-center"
      >
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary/80">{t.relation}</p>
        <p className="mt-2 text-2xl font-extrabold text-primary">{rel}</p>
        <p className="mx-auto mt-4 max-w-xl text-sm font-semibold leading-relaxed text-ink">{relationBody}</p>
      </GlassCard>

      <GlassCard variant="solid">
        <h3 className="font-extrabold text-primary">{t.tips}</h3>
        <p className="mt-1 text-sm text-on-surface-variant">{t.tipsIntro}</p>
        <ul className="mt-4 space-y-3">
          {result.careTips.map((tip, index) => (
            <li
              key={tip}
              className="rounded-xl border border-mint/35 bg-white px-4 py-3 text-sm leading-relaxed text-ink"
            >
              <span className="mr-2 font-extrabold text-channel-saju">{index + 1}.</span>
              {tip}
            </li>
          ))}
        </ul>
      </GlassCard>

      <SajuResultShareRow kind="compatibility" result={result} />

      <AdSlot />
    </div>
  );
}
