import type { PetMbtiResult } from "@/lib/pet/mbti-inference";
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

function axisPercents(scores: PetMbtiResult["scores"]) {
  const pct = (a: number, b: number) => {
    const total = a + b;
    if (total <= 0) return 50;
    return Math.round((a / total) * 100);
  };
  return {
    EI: { E: pct(scores.E, scores.I), I: pct(scores.I, scores.E) },
    SN: { S: pct(scores.S, scores.N), N: pct(scores.N, scores.S) },
    TF: { T: pct(scores.T, scores.F), F: pct(scores.F, scores.T) },
    JP: { J: pct(scores.J, scores.P), P: pct(scores.P, scores.J) },
  };
}

export function buildPetMbtiPremiumPrompts(options: {
  locale: Locale;
  petName: string;
  species: Species;
  mbti: PetMbtiResult;
  mapping: PetSajuMapping;
}): LlmPromptPair {
  const { locale, petName, species, mbti, mapping } = options;
  const isKo = locale === "ko";
  const speciesLabel = SPECIES_LABEL[species][isKo ? "ko" : "en"];
  const percents = axisPercents(mbti.scores);

  const system = [
    petPremiumSystemRules(locale),
    isKo
      ? 'JSON 키: personalityBlend, sajuCombo, butlerFit, health, dailyCare (모두 string). 각 섹션 3~5문장. 케어 팁은 오늘 바로 실행 가능한 구체 행동으로.'
      : "JSON keys: personalityBlend, sajuCombo, butlerFit, health, dailyCare (all strings). 3–5 sentences each. End with concrete care actions for today.",
  ].join("\n");

  const user = isKo
    ? [
        `${petName}(${speciesLabel})의 상세 MBTI 프리미엄 리포트 JSON을 작성하세요.`,
        `- MBTI: ${mbti.type} (${mbti.titleKo})`,
        `- 4축 퍼센트: E${percents.EI.E}%/I${percents.EI.I}%, S${percents.SN.S}%/N${percents.SN.N}%, T${percents.TF.T}%/F${percents.TF.F}%, J${percents.JP.J}%/P${percents.JP.P}%`,
        `- 사주 캐릭터 키워드: ${mapping.dayMasterArchetype.keyword} — ${mapping.dayMasterArchetype.description}`,
        `- 주도 성향: ${mapping.dominantTraits.personality.join(", ")}`,
        `- 보완 케어: ${mapping.weakTraits.healthFocus.join(", ")}`,
        `- 균형 점수: ${mapping.balanceScore}/100`,
        "",
        "personalityBlend: MBTI와 사주 성향을 융합한 '이 아이는 이런 아이' 소개 + 케어 결론",
        "sajuCombo: 사주 기질이 MBTI 표현에 어떻게 스며드는지 + 맞춤 케어",
        "butlerFit: 집사와 잘 맞는 교감 방식 + 오늘 실천 행동",
        "health: 컨디션·스트레스 주의 + 구체 케어",
        "dailyCare: 행동·루틴 교정 팁 + 바로 해볼 행동",
        "",
        "구조화 입력:",
        JSON.stringify(
          {
            dayMasterArchetype: mapping.dayMasterArchetype,
            dominantTraits: mapping.dominantTraits,
            weakTraits: mapping.weakTraits,
            balanceScore: mapping.balanceScore,
            animalGroup: mapping.animalGroup,
          },
          null,
          2
        ),
      ].join("\n")
    : [
        `Write premium MBTI JSON for ${petName} (${speciesLabel}).`,
        `- MBTI: ${mbti.type} (${mbti.titleEn})`,
        `- Axis %: E${percents.EI.E}/I${percents.EI.I}, S${percents.SN.S}/N${percents.SN.N}, T${percents.TF.T}/F${percents.TF.F}, J${percents.JP.J}/P${percents.JP.P}`,
        `- Chart character: ${mapping.dayMasterArchetype.keyword} — ${mapping.dayMasterArchetype.description}`,
        `- Dominant traits: ${mapping.dominantTraits.personality.join(", ")}`,
        `- Care focus: ${mapping.weakTraits.healthFocus.join(", ")}`,
        `- Balance: ${mapping.balanceScore}/100`,
        "",
        "Structured input:",
        JSON.stringify(
          {
            dayMasterArchetype: mapping.dayMasterArchetype,
            dominantTraits: mapping.dominantTraits,
            weakTraits: mapping.weakTraits,
            balanceScore: mapping.balanceScore,
          },
          null,
          2
        ),
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
