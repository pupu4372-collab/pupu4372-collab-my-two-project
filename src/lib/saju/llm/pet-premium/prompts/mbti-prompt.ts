import type {
  PetMbtiExtremeResponse,
  PetMbtiResult,
} from "@/lib/pet/mbti-inference";
import {
  computePetMbtiAxisPercents,
  type PetMbtiAxisPercents,
} from "@/lib/pet/mbti-inference";
import type { PetSajuMapping } from "@/lib/saju/pet-trait-mapping";
import { dominantElementLabel } from "@/lib/saju/pet-lucky-scores";
import type { Locale, Species } from "@/lib/saju/types";
import type { LlmPromptPair } from "../../types";
import { petPremiumSystemRules } from "../base-prompt";

const SPECIES_LABEL: Record<Species, { ko: string; en: string }> = {
  dog: { ko: "강아지", en: "dog" },
  cat: { ko: "고양이", en: "cat" },
  reptile: { ko: "렙타일", en: "reptile" },
  other: { ko: "그외친구", en: "other pet" },
};

function ambivalenceNotes(percents: PetMbtiAxisPercents, isKo: boolean): string {
  const lines: string[] = [];
  const axes = [
    { key: "EI" as const, a: "E", b: "I" },
    { key: "SN" as const, a: "S", b: "N" },
    { key: "TF" as const, a: "T", b: "F" },
    { key: "JP" as const, a: "J", b: "P" },
  ];
  for (const { key, a, b } of axes) {
    const p = percents[key];
    const max = Math.max(p[a as keyof typeof p], p[b as keyof typeof p]);
    if (max < 55) {
      lines.push(
        isKo
          ? `${key} 축은 ${p[a as keyof typeof p]}%/${p[b as keyof typeof p]}%로 양면성이 있음 — 한쪽으로 단정하지 말 것`
          : `${key} axis is balanced (${p[a as keyof typeof p]}%/${p[b as keyof typeof p]}%) — mention dual-sided tendencies`
      );
    }
  }
  return lines.length ? lines.join("\n") : isKo ? "(모든 축이 55% 이상으로 비교적 선명함)" : "(All axes ≥55% — relatively clear lean)";
}

function formatExtremeResponses(responses: PetMbtiExtremeResponse[], isKo: boolean): string {
  if (!responses.length) {
    return isKo ? "(극단 응답 없음)" : "(No extreme survey picks)";
  }
  return responses
    .map((r, i) => `${i + 1}. [${r.axis}] Q: ${r.question} → A: ${r.answer}`)
    .join("\n");
}

export function buildPetMbtiPremiumPrompts(options: {
  locale: Locale;
  petName: string;
  species: Species;
  mbti: PetMbtiResult;
  mapping: PetSajuMapping;
  extremeResponses?: PetMbtiExtremeResponse[];
}): LlmPromptPair {
  const { locale, petName, species, mbti, mapping, extremeResponses = [] } = options;
  const isKo = locale === "ko";
  const speciesLabel = SPECIES_LABEL[species][isKo ? "ko" : "en"];
  const percents = computePetMbtiAxisPercents(mbti.scores);
  const dominant = dominantElementLabel(mapping.dominantElement, locale);
  const weak = dominantElementLabel(mapping.weakElement, locale);

  const system = [
    petPremiumSystemRules(locale),
    isKo
      ? [
          'JSON 키: personalityBlend, sajuCombo, butlerFit, health, dailyCare (모두 string).',
          "각 섹션 3~5문장. 마지막 문장은 오늘~이번 주 실행 가능한 구체 케어 행동.",
          "일반론 금지 — 입력된 이 펫의 MBTI·사주·설문 근거만 일상 언어로 번역해 인용.",
        ].join("\n")
      : [
          "JSON keys: personalityBlend, sajuCombo, butlerFit, health, dailyCare (all strings).",
          "3–5 sentences each; end with a concrete care action for today or this week.",
          "No generic pet advice — cite only this pet's MBTI, chart, and survey data in plain language.",
        ].join("\n"),
  ].join("\n");

  const user = isKo
    ? [
        `${petName}(${speciesLabel})의 상세 MBTI 프리미엄 리포트 JSON을 작성하세요.`,
        `- MBTI: ${mbti.type} (${mbti.titleKo})`,
        `- 4축 퍼센트: E${percents.EI.E}%/I${percents.EI.I}%, S${percents.SN.S}%/N${percents.SN.N}%, T${percents.TF.T}%/F${percents.TF.F}%, J${percents.JP.J}%/P${percents.JP.P}%`,
        `- 양면성 주의: ${ambivalenceNotes(percents, true)}`,
        `- 사주 일간 캐릭터: ${mapping.dayMasterArchetype.keyword} — ${mapping.dayMasterArchetype.description}`,
        `- 대표 오행: ${dominant}, 결핍·보완 오행: ${weak}`,
        `- 주도 성향 키워드: ${mapping.dominantTraits.personality.join(", ")}`,
        `- 보완 케어 포인트: ${mapping.weakTraits.healthFocus.join(", ")}`,
        `- 균형 점수: ${mapping.balanceScore}/100`,
        "",
        "설문에서 가장 극단적으로 나온 응답 (행동 근거로 인용):",
        formatExtremeResponses(extremeResponses, true),
        "",
        "personalityBlend: MBTI+사주 융합 '이런 아이' 소개 → 그래서 이렇게 케어",
        "sajuCombo: 사주 기질이 MBTI 표현에 스며드는 방식 + 맞춤 케어",
        "butlerFit: 집사와 잘 맞는 교감 + 오늘 실천 행동",
        "health: 이 아이 체질·스트레스 주의 + 구체 케어",
        "dailyCare: 행동·루틴 교정 + 바로 해볼 행동",
      ].join("\n")
    : [
        `Write premium MBTI JSON for ${petName} (${speciesLabel}).`,
        `- MBTI: ${mbti.type} (${mbti.titleEn})`,
        `- Axis %: E${percents.EI.E}/I${percents.EI.I}, S${percents.SN.S}/N${percents.SN.N}, T${percents.TF.T}/F${percents.TF.F}, J${percents.JP.J}/P${percents.JP.P}`,
        `- Ambivalence: ${ambivalenceNotes(percents, false)}`,
        `- Day-master character: ${mapping.dayMasterArchetype.keyword} — ${mapping.dayMasterArchetype.description}`,
        `- Dominant element: ${dominant}; weak element: ${weak}`,
        `- Trait keywords: ${mapping.dominantTraits.personality.join(", ")}`,
        `- Care focus: ${mapping.weakTraits.healthFocus.join(", ")}`,
        "",
        "Strongest survey responses (cite as behavior evidence):",
        formatExtremeResponses(extremeResponses, false),
        "",
        "Sections: personalityBlend, sajuCombo, butlerFit, health, dailyCare — each ends with concrete care.",
      ].join("\n");

  return { system, user };
}

export function mappingSummaryForLlm(mapping: PetSajuMapping, locale: Locale): string {
  const dominant = dominantElementLabel(mapping.dominantElement, locale);
  const weak = dominantElementLabel(mapping.weakElement, locale);
  return locale === "ko"
    ? `캐릭터 ${mapping.dayMasterArchetype.keyword}, 주도 에너지 ${dominant}, 보완 포인트 ${weak}, 성격 키워드 ${mapping.dominantTraits.personality.join(", ")}`
    : `Character ${mapping.dayMasterArchetype.keyword}, dominant ${dominant}, care gap ${weak}, traits ${mapping.dominantTraits.personality.join(", ")}`;
}
