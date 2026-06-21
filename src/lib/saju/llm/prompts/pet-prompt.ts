import type { PetSajuMapping } from "@/lib/saju/pet-trait-mapping";
import { dominantElementLabel } from "@/lib/saju/pet-lucky-scores";
import type { Locale } from "@/lib/saju/types";
import type { LlmPromptPair } from "../types";

const ANIMAL_LABEL: Record<PetSajuMapping["animalGroup"], { ko: string; en: string }> = {
  dog: { ko: "강아지", en: "dog" },
  cat: { ko: "고양이", en: "cat" },
  reptile: { ko: "파충류", en: "reptile" },
};

export function buildPetInterpretationPrompts(options: {
  mapping: PetSajuMapping;
  locale: Locale;
  petName?: string;
}): LlmPromptPair {
  const { mapping, locale, petName } = options;
  const isKo = locale === "ko";
  const animal = ANIMAL_LABEL[mapping.animalGroup][locale === "ko" ? "ko" : "en"];
  const dominantEl = dominantElementLabel(mapping.dominantElement, locale);
  const weakEl = dominantElementLabel(mapping.weakElement, locale);

  const system = isKo
    ? [
        "당신은 반려동물 K-사주 해석 작가입니다.",
        "입력 JSON의 사실만 사용하고, 의학적 진단·치료 단정·미래 확정 예언은 금지합니다.",
        "건강은 '주의 포인트' 수준까지만, 따뜻하고 친근한 보호자 톤으로 작성합니다.",
        '반드시 JSON만 출력하세요. 키: characterIntro, personality, healthNote, compatibility (모두 string).',
      ].join("\n")
    : [
        "You write K-Saju pet fortune copy for guardians.",
        "Use only the provided mapping facts. No medical diagnoses, treatment claims, or guaranteed predictions.",
        "Health notes stay at 'care watchpoints' level with a warm, friendly tone.",
        'Return JSON only with keys: characterIntro, personality, healthNote, compatibility (all strings).',
      ].join("\n");

  const user = isKo
    ? [
        "다음은 반려동물의 사주 분석 결과입니다. 보호자가 읽기 좋은 펫 사주 리포트 JSON을 작성해주세요.",
        petName ? `- 이름: ${petName}` : null,
        `- 동물 종류: ${animal}`,
        `- 일간 캐릭터: [${mapping.dayMasterArchetype.keyword}] ${mapping.dayMasterArchetype.description}`,
        `- 주도 오행: ${dominantEl} (${mapping.dominantTraits.personality.join(", ")})`,
        `- 결핍 오행: ${weakEl} (보완: ${mapping.weakTraits.healthFocus.join(", ")})`,
        `- 오행 균형 점수: ${mapping.balanceScore}/100`,
        `- 보호자 궁합: ${mapping.dominantTraits.compatibilityTag}`,
        "",
        "characterIntro: 한 줄 캐릭터 소개",
        "personality: 2~3문장 성격",
        "healthNote: 1~2문장 건강 주의(단정 금지)",
        "compatibility: 1~2문장 보호자에게 한마디",
        "",
        "구조화 입력:",
        JSON.stringify(mapping, null, 2),
      ]
        .filter(Boolean)
        .join("\n")
    : [
        "Below is a structured pet saju mapping. Write guardian-friendly JSON copy.",
        petName ? `- Name: ${petName}` : null,
        `- Species group: ${animal}`,
        `- Day master archetype: [${mapping.dayMasterArchetype.keyword}] ${mapping.dayMasterArchetype.description}`,
        `- Dominant element: ${dominantEl} (${mapping.dominantTraits.personality.join(", ")})`,
        `- Weak element: ${weakEl} (care: ${mapping.weakTraits.healthFocus.join(", ")})`,
        `- Balance score: ${mapping.balanceScore}/100`,
        `- Guardian compatibility: ${mapping.dominantTraits.compatibilityTag}`,
        "",
        "Structured input:",
        JSON.stringify(mapping, null, 2),
      ]
        .filter(Boolean)
        .join("\n");

  return { system, user };
}
