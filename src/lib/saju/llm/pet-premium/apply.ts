import type { CompatibilityResponse } from "@/lib/saju/compatibility/engine";
import type { ZodiacFortuneResponse } from "@/lib/saju/zodiac/engine";
import type { PetMbtiResult } from "@/lib/pet/mbti-inference";
import { buildPetMbtiPremiumInsight, computePetMbtiAxisPercents } from "@/lib/pet/mbti-inference";
import {
  sanitizePetCompatibilityLlmJson,
  sanitizePetMbtiPremiumLlmJson,
  sanitizePetZodiacDailyText,
  sanitizePetZodiacPersonalityLlmJson,
} from "@/lib/saju/llm/pet-output-sanitize";
import type {
  PetCompatibilityLlmJson,
  PetMbtiPremiumInsight,
  PetMbtiPremiumLlmJson,
  PetZodiacLlmJson,
} from "./types";

export function applyMbtiPremiumLlm(
  llm: PetMbtiPremiumLlmJson,
  mbti: PetMbtiResult,
  locale: "ko" | "en"
): PetMbtiPremiumInsight {
  const clean = sanitizePetMbtiPremiumLlmJson(llm);
  return {
    personalityBlend: clean.personalityBlend.trim(),
    sajuCombo: clean.sajuCombo.trim(),
    butlerFit: clean.butlerFit.trim(),
    health: clean.health.trim(),
    dailyCare: clean.dailyCare.trim(),
    mbtiType: mbti.type,
    axisPercents: computePetMbtiAxisPercents(mbti.scores),
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
  const clean = sanitizePetCompatibilityLlmJson(llm);
  return {
    ...base,
    story: clean.story.trim(),
    relationDescription: clean.relationDescription.trim(),
    petElementNote: clean.petElementNote.trim(),
    ownerElementNote: clean.ownerElementNote.trim(),
    details: clean.details.slice(0, 3).map((d) => ({
      title: d.title.trim(),
      body: d.body.trim(),
    })),
    careTips: clean.careTips.map((t) => t.trim()).slice(0, 4),
    narrativeSource: "llm",
  };
}

export function applyZodiacPersonalityLlm(
  base: ZodiacFortuneResponse,
  llm: Pick<PetZodiacLlmJson, "personalityDetails">
): ZodiacFortuneResponse {
  const clean = sanitizePetZodiacPersonalityLlmJson(llm);
  return {
    ...base,
    personality: {
      ...base.personality,
      details: clean.personalityDetails.map((d, i) => ({
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
      today: sanitizePetZodiacDailyText(dailyToday).trim(),
    },
    narrativeSource: "llm",
  };
}
