import type { Locale } from "@/lib/saju/types";
import type { PetMbtiAxisPercents, PetMbtiType } from "@/lib/pet/mbti-inference";

export type PetPremiumNarrativeSource = "template" | "llm";

export interface PetMbtiPremiumLlmJson {
  personalityBlend: string;
  sajuCombo: string;
  butlerFit: string;
  health: string;
  dailyCare: string;
}

export interface PetCompatibilityDetailLlmJson {
  title: string;
  body: string;
}

export interface PetCompatibilityLlmJson {
  story: string;
  relationDescription: string;
  petElementNote: string;
  ownerElementNote: string;
  details: PetCompatibilityDetailLlmJson[];
  careTips: string[];
}

export interface PetZodiacLlmJson {
  personalityDetails: { title: string; body: string }[];
  dailyToday: string;
}

export interface PetMbtiPremiumInsight {
  personalityBlend: string;
  sajuCombo: string;
  butlerFit: string;
  health: string;
  dailyCare: string;
  mbtiType: PetMbtiType;
  axisPercents: PetMbtiAxisPercents;
  narrativeSource?: PetPremiumNarrativeSource;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function isPetMbtiPremiumLlmJson(value: unknown): value is PetMbtiPremiumLlmJson {
  if (!value || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  return (
    isNonEmptyString(o.personalityBlend) &&
    isNonEmptyString(o.sajuCombo) &&
    isNonEmptyString(o.butlerFit) &&
    isNonEmptyString(o.health) &&
    isNonEmptyString(o.dailyCare)
  );
}

export function isPetCompatibilityLlmJson(value: unknown): value is PetCompatibilityLlmJson {
  if (!value || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  if (!Array.isArray(o.details) || o.details.length !== 3) return false;
  if (!Array.isArray(o.careTips) || o.careTips.length < 1) return false;
  const detailsOk = o.details.every(
    (d) =>
      d &&
      typeof d === "object" &&
      isNonEmptyString((d as { title?: unknown }).title) &&
      isNonEmptyString((d as { body?: unknown }).body)
  );
  return (
    detailsOk &&
    isNonEmptyString(o.story) &&
    isNonEmptyString(o.relationDescription) &&
    isNonEmptyString(o.petElementNote) &&
    isNonEmptyString(o.ownerElementNote)
  );
}

export function isPetZodiacPersonalityLlmJson(
  value: unknown
): value is Pick<PetZodiacLlmJson, "personalityDetails"> {
  if (!value || typeof value !== "object") return false;
  const details = (value as { personalityDetails?: unknown }).personalityDetails;
  if (!Array.isArray(details) || details.length < 4) return false;
  return details.every(
    (d) =>
      d &&
      typeof d === "object" &&
      isNonEmptyString((d as { title?: unknown }).title) &&
      isNonEmptyString((d as { body?: unknown }).body)
  );
}

export function isPetZodiacDailyLlmJson(value: unknown): value is Pick<PetZodiacLlmJson, "dailyToday"> {
  if (!value || typeof value !== "object") return false;
  return isNonEmptyString((value as { dailyToday?: unknown }).dailyToday);
}

export type PetPremiumFeature = "mbti" | "compatibility" | "zodiac_personality" | "zodiac_daily";

export type PetPremiumCachePayload = {
  feature: PetPremiumFeature;
  locale: Locale;
  data: PetMbtiPremiumLlmJson | PetCompatibilityLlmJson | PetZodiacLlmJson;
  provider: string;
};
