import { computeCompatibility } from "@/lib/saju/compatibility/engine";
import { computePetSajuBundle } from "@/lib/saju/engine";
import { dominantElementLabel as formatDominantElementLabel } from "@/lib/saju/pet-lucky-scores";
import {
  enrichCompatibilityWithPremiumLlm,
  enrichZodiacWithPremiumLlm,
} from "@/lib/saju/llm/pet-premium/orchestrator";
import { getTodayKstDateString } from "@/lib/saju/zodiac/fortunes";
import { computeZodiacFortune } from "@/lib/saju/zodiac/engine";
import type { Locale, Species } from "@/lib/saju/types";
import type { PetPremiumPdfPayload, PetPremiumPdfRequest } from "./types";

const SPECIES_LABEL: Record<Species, { ko: string; en: string }> = {
  dog: { ko: "강아지", en: "Dog" },
  cat: { ko: "고양이", en: "Cat" },
  reptile: { ko: "렙타일", en: "Reptile" },
  other: { ko: "기타", en: "Other" },
};

export async function buildPetPremiumPdfPayload(
  input: PetPremiumPdfRequest
): Promise<PetPremiumPdfPayload> {
  const locale: Locale = input.locale === "en" ? "en" : "ko";
  const isKo = locale === "ko";
  const petName = input.petName.trim();
  const birthTime = input.birthTime ?? null;
  const birthTimeUnknown = Boolean(input.birthTimeUnknown ?? !birthTime);
  const timezone = input.timezone || "Asia/Seoul";
  const issuedDateKst = getTodayKstDateString();

  const { mapping } = computePetSajuBundle({
    petName,
    species: input.species,
    petGender: input.petGender,
    birthDate: input.birthDate,
    calendarType: input.calendarType ?? "solar",
    birthTime,
    birthTimeUnknown,
    timezone,
    locale,
    privacyConsent: true,
  });

  const dominantElement = mapping.dominantElement as import("@/lib/saju/types").ElementKey;
  const dominantElementLabelStr = formatDominantElementLabel(dominantElement, locale);
  const speciesLabel = SPECIES_LABEL[input.species][isKo ? "ko" : "en"];

  let compatibility: PetPremiumPdfPayload["compatibility"] = null;
  if (
    input.privacyConsent &&
    input.ownerName?.trim() &&
    input.ownerBirthDate &&
    input.petGender &&
    input.ownerGender
  ) {
    const base = computeCompatibility({
      petName,
      ownerName: input.ownerName.trim(),
      species: input.species,
      petGender: input.petGender,
      ownerGender: input.ownerGender,
      petBirthDate: input.birthDate,
      petCalendarType: input.calendarType ?? "solar",
      petBirthTime: birthTime,
      petBirthTimeUnknown: birthTimeUnknown,
      ownerBirthDate: input.ownerBirthDate,
      ownerCalendarType: input.ownerCalendarType ?? "solar",
      ownerBirthTime: input.ownerBirthTime ?? null,
      ownerBirthTimeUnknown: Boolean(input.ownerBirthTimeUnknown ?? !input.ownerBirthTime),
      timezone,
      locale,
    });
    compatibility = await enrichCompatibilityWithPremiumLlm(base, {
      petBirthDate: input.birthDate,
      petBirthTime: birthTime,
      petBirthTimeUnknown: birthTimeUnknown,
      ownerBirthDate: input.ownerBirthDate,
      ownerBirthTime: input.ownerBirthTime ?? null,
      ownerBirthTimeUnknown: Boolean(input.ownerBirthTimeUnknown ?? !input.ownerBirthTime),
      timezone,
      petId: input.petId ?? null,
    });
  }

  const zodiacBase = computeZodiacFortune({
    petName,
    species: input.species,
    birthDate: input.birthDate,
    calendarType: input.calendarType ?? "solar",
    locale,
  });
  const zodiac = await enrichZodiacWithPremiumLlm(zodiacBase, {
    birthDate: input.birthDate,
    birthTime,
    birthTimeUnknown,
    timezone,
    petId: input.petId ?? null,
  });

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    issuedDateKst,
    locale,
    petName,
    species: input.species,
    speciesLabel,
    dominantElement,
    dominantElementLabel: dominantElementLabelStr,
    mbti: null,
    compatibility,
    zodiac,
  };
}
