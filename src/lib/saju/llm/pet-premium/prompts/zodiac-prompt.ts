import type { ZodiacFortuneResponse } from "@/lib/saju/zodiac/engine";
import type { Locale } from "@/lib/saju/types";
import type { LlmPromptPair } from "../../types";
import { petPremiumSystemRules } from "../base-prompt";
import { mappingSummaryForLlm } from "./mbti-prompt";
import type { PetSajuMapping } from "@/lib/saju/pet-trait-mapping";

export function buildPetZodiacPremiumPrompts(options: {
  locale: Locale;
  fortune: ZodiacFortuneResponse;
  mappingSummary: string;
  part: "personality" | "daily";
}): LlmPromptPair {
  const { locale, fortune, mappingSummary, part } = options;
  const isKo = locale === "ko";
  const luck = fortune.daily.luckScore;

  const toneRule = isKo
    ? luck <= 2
      ? "행운 별점이 낮음(1~2): 주의·안정·회복 중심 톤. 과장된 낙관 금지."
      : luck >= 4
        ? "행운 별점이 높음(4~5): 기회·활동·교감 중심 톤."
        : "행운 별점 보통(3): 균형 잡힌 톤."
    : luck <= 2
      ? "Low luck (1–2): caution and recovery tone."
      : luck >= 4
        ? "High luck (4–5): opportunity and bonding tone."
        : "Medium luck (3): balanced tone.";

  const system = [
    petPremiumSystemRules(locale),
    toneRule,
    part === "personality"
      ? isKo
        ? 'JSON: personalityDetails 배열 4개 {title, body}. 각 body 4~5문장, 구체 케어 행동 포함. title은 입력 제목 유지.'
        : "JSON: personalityDetails array of 4 {title, body}. Each body 4–5 sentences with concrete care."
      : isKo
        ? "JSON: dailyToday (string) 하나. 오늘의 운세 본문 4~5문장, 날짜에 맞는 구체 행동 포함."
        : "JSON: dailyToday (string). 4–5 sentences for today's fortune with concrete actions.",
  ].join("\n");

  const user = isKo
    ? [
        `${fortune.petName}의 별자리 프리미엄 ${part === "personality" ? "상세 해석" : "오늘의 운세"} JSON.`,
        `- 별자리: ${fortune.sign.displayName}`,
        `- 운세 기준일(KST): ${fortune.fortuneDateKst}`,
        `- 행운 별점: ${luck}/5`,
        `- 키워드: ${fortune.daily.keyword}`,
        `- 사주 요약: ${mappingSummary}`,
        part === "personality"
          ? ["", "섹션 제목:", ...fortune.personality.details.map((d) => `- ${d.title}`)].join("\n")
          : "",
      ].join("\n")
    : [
        `Zodiac premium ${part} JSON for ${fortune.petName}.`,
        `- Sign: ${fortune.sign.displayName}`,
        `- Date (KST): ${fortune.fortuneDateKst}`,
        `- Luck: ${luck}/5`,
        `- Chart summary: ${mappingSummary}`,
        part === "personality"
          ? ["", "Section titles:", ...fortune.personality.details.map((d) => `- ${d.title}`)].join("\n")
          : "",
        "Output language: English.",
      ].join("\n");

  return { system, user };
}

export function buildZodiacMappingSummary(mapping: PetSajuMapping, locale: Locale): string {
  return mappingSummaryForLlm(mapping, locale);
}
