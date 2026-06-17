import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, SajuResultInsert } from "@/lib/supabase/types";
import { computeBasicSaju } from "./engine";
import type { CompatibilityRequest, CompatibilityResponse } from "./compatibility/engine";
import { findOrCreatePet } from "./persist-pet";

type DbClient = SupabaseClient<Database>;

const ELEMENT_TO_DB = {
  wood: "mok",
  fire: "hwa",
  earth: "to",
  metal: "geum",
  water: "su",
} as const;

export async function persistCompatibilityResult(
  supabase: DbClient,
  ownerId: string,
  request: CompatibilityRequest,
  result: CompatibilityResponse
) {
  const petId = await findOrCreatePet(supabase, {
    ownerId,
    name: request.petName,
    species: request.species,
    birthDate: request.petBirthDate,
    birthTime: request.petBirthTime,
    birthTimeUnknown: request.petBirthTimeUnknown,
    timezone: request.timezone,
    gender: request.petGender,
    locale: request.locale,
  });

  const petSaju = computeBasicSaju({
    petName: request.petName,
    species: request.species,
    birthDate: request.petBirthDate,
    birthTime: request.petBirthTime,
    birthTimeUnknown: request.petBirthTimeUnknown,
    timezone: request.timezone,
    locale: request.locale,
    privacyConsent: true,
  });

  const analysisMode = request.petBirthTimeUnknown ? "three_pillars" : "four_pillars";

  const sajuPayload: SajuResultInsert = {
    pet_id: petId,
    owner_id: ownerId,
    saju_type: "compatibility",
    analysis_mode: analysisMode,
    birth_basis: {
      petBirthDate: request.petBirthDate,
      petBirthTime: request.petBirthTime,
      petBirthTimeUnknown: request.petBirthTimeUnknown,
      petGender: request.petGender,
      ownerBirthDate: request.ownerBirthDate,
      ownerBirthTime: request.ownerBirthTime,
      ownerBirthTimeUnknown: request.ownerBirthTimeUnknown,
      ownerName: request.ownerName,
      ownerGender: request.ownerGender,
      timezone: request.timezone,
      locale: request.locale,
    },
    pillars: {
      pet: petSaju.pillars,
      petDay: result.petDayPillar,
      ownerDay: result.ownerDayPillar,
    },
    five_elements: {
      pet: result.petElement,
      owner: result.ownerElement,
      relation: result.relation,
    },
    dominant_element: ELEMENT_TO_DB[result.petElement],
    title: result.headline,
    summary: result.story,
    storytelling_payload: {
      bondScore: result.bondScore,
      bondLabel: result.bondLabel,
      bondEmoji: result.bondEmoji,
      relation: result.relation,
      details: result.details,
      careTips: result.careTips,
      relationDescription: result.relationDescription,
      petElementNote: result.petElementNote,
      ownerElementNote: result.ownerElementNote,
      ownerName: request.ownerName,
      petGender: request.petGender,
      ownerGender: request.ownerGender,
      petElementLabel: result.petElementLabel,
      ownerElementLabel: result.ownerElementLabel,
    },
    is_premium: false,
  };

  const { data: sajuRow, error } = await supabase
    .from("saju_results")
    .insert(sajuPayload as never)
    .select("id")
    .single();

  const saved = sajuRow as { id: string } | null;
  if (error || !saved) {
    throw new Error(error?.message ?? "Failed to save compatibility result.");
  }

  return { petId, sajuResultId: saved.id };
}
