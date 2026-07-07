import type { CompatibilityResponse } from "@/lib/saju/compatibility/engine";
import type { ZodiacFortuneResponse } from "@/lib/saju/zodiac/engine";
import type { PetMbtiResult } from "@/lib/pet/mbti-inference";
import { buildPetMbtiPremiumInsight } from "@/lib/pet/mbti-inference";
import type {
  PetCompatibilityLlmJson,
  PetMbtiPremiumInsight,
  PetMbtiPremiumLlmJson,
  PetZodiacLlmJson,
} from "./types";

export function applyMbtiPremiumLlm(
  llm: PetMbtiPremiumLlmJson,
  locale: "ko" | "en"
): PetMbtiPremiumInsight {
  return {
    personalityBlend: llm.personalityBlend.trim(),
    sajuCombo: llm.sajuCombo.trim(),
    butlerFit: llm.butlerFit.trim(),
    health: llm.health.trim(),
    dailyCare: llm.dailyCare.trim(),
    narrativeSource: "llm",
  };
}

export function templateMbtiPremiumInsight(
  mbti: PetMbtiResult,
  petName: string,
  locale: "ko" | "en"
): PetMbtiPremiumInsight {
  return buildPetMbtiPremiumInsight(mbti, petName, locale);
}

export function applyCompatibilityPremiumLlm(
  base: CompatibilityResponse,
  llm: PetCompatibilityLlmJson
): CompatibilityResponse {
  return {
    ...base,
    story: llm.story.trim(),
    relationDescription: llm.relationDescription.trim(),
    petElementNote: llm.petElementNote.trim(),
    ownerElementNote: llm.ownerElementNote.trim(),
    details: llm.details.map((d) => ({
      title: d.title.trim(),
      body: d.body.trim(),
    })),
    careTips: llm.careTips.map((t) => t.trim()).slice(0, 4),
    narrativeSource: "llm",
  };
}

export function applyZodiacPersonalityLlm(
  base: ZodiacFortuneResponse,
  llm: Pick<PetZodiacLlmJson, "personalityDetails">
): ZodiacFortuneResponse {
  return {
    ...base,
    personality: {
      ...base.personality,
      details: llm.personalityDetails.map((d, i) => ({
        title: d.title.trim() || base.personality.details[i]?.title || d.title,
        body: d.body.trim(),
      })),
    },
    narrativeSource: "llm",
  };
}

export function applyZodiacDailyLlm(
  base: ZodiacFortuneResponse,
  dailyToday: string
): ZodiacFortuneResponse {
  return {
    ...base,
    daily: {
      ...base.daily,
      today: dailyToday.trim(),
    },
    narrativeSource: "llm",
  };
}
