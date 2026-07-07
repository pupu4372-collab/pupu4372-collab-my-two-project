import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, SajuResultInsert } from "@/lib/supabase/types";
import { computePetSajuBundle } from "./engine";
import type { PetMbtiPremiumInsight } from "./llm/pet-premium/types";
import { findOrCreatePet } from "./persist-pet";
import type { BirthCalendarType, Gender, Locale, Species } from "./types";

type DbClient = SupabaseClient<Database>;

const ELEMENT_TO_DB = {
  wood: "mok",
  fire: "hwa",
  earth: "to",
  metal: "geum",
  water: "su",
} as const;

export interface PersistMbtiInput {
  petName: string;
  species: Species;
  petGender?: Gender;
  birthDate: string;
  calendarType?: BirthCalendarType;
  birthTime: string | null;
  birthTimeUnknown: boolean;
  timezone: string;
  locale: Locale;
  mbtiAnswers?: Record<string, string>;
  insight: PetMbtiPremiumInsight;
}

export async function persistMbtiPremiumResult(
  supabase: DbClient,
  ownerId: string,
  input: PersistMbtiInput
) {
  const petId = await findOrCreatePet(supabase, {
    ownerId,
    name: input.petName,
    species: input.species,
    gender: input.petGender ?? null,
    birthDate: input.birthDate,
    birthTime: input.birthTime,
    birthTimeUnknown: input.birthTimeUnknown,
    timezone: input.timezone,
    locale: input.locale,
  });

  const { result: sajuResult, mapping } = computePetSajuBundle({
    petName: input.petName,
    species: input.species,
    petGender: input.petGender,
    birthDate: input.birthDate,
    calendarType: input.calendarType ?? "solar",
    birthTime: input.birthTime,
    birthTimeUnknown: input.birthTimeUnknown,
    timezone: input.timezone,
    locale: input.locale,
    privacyConsent: true,
  });

  const analysisMode = input.birthTimeUnknown ? "three_pillars" : "four_pillars";
  const title =
    input.locale === "ko"
      ? `${input.petName} · ${input.insight.mbtiType} 상세 MBTI`
      : `${input.petName} · ${input.insight.mbtiType} detailed MBTI`;

  const sajuPayload: SajuResultInsert = {
    pet_id: petId,
    owner_id: ownerId,
    saju_type: "mbti",
    analysis_mode: analysisMode,
    birth_basis: {
      birthDate: input.birthDate,
      calendarType: input.calendarType ?? "solar",
      birthTime: input.birthTime,
      birthTimeUnknown: input.birthTimeUnknown,
      timezone: input.timezone,
      locale: input.locale,
      petGender: input.petGender ?? null,
      mbtiType: input.insight.mbtiType,
      birthUtc: sajuResult.birthUtc,
    },
    pillars: sajuResult.pillars as Record<string, unknown>,
    five_elements: sajuResult.elements as unknown as Record<string, unknown>,
    dominant_element: ELEMENT_TO_DB[mapping.dominantElement],
    title,
    summary: input.insight.personalityBlend,
    storytelling_payload: {
      mbtiType: input.insight.mbtiType,
      axisPercents: input.insight.axisPercents,
      personalityBlend: input.insight.personalityBlend,
      sajuCombo: input.insight.sajuCombo,
      butlerFit: input.insight.butlerFit,
      health: input.insight.health,
      dailyCare: input.insight.dailyCare,
      narrativeSource: input.insight.narrativeSource ?? "template",
      mbtiAnswers: input.mbtiAnswers ?? null,
      dominantElement: mapping.dominantElement,
    },
    is_premium: true,
  };

  const { data: sajuRow, error } = await supabase
    .from("saju_results")
    .insert(sajuPayload as never)
    .select("id")
    .single();

  const saved = sajuRow as { id: string } | null;
  if (error || !saved) {
    throw new Error(error?.message ?? "Failed to save MBTI result.");
  }

  return { petId, sajuResultId: saved.id };
}
