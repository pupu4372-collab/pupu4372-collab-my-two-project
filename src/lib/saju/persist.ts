import type { ElementKey, SajuBasicRequest, SajuBasicResponse } from "./types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, SajuResultInsert } from "@/lib/supabase/types";
import { findOrCreatePet } from "./persist-pet";

type DbClient = SupabaseClient<Database>;

const ELEMENT_TO_DB: Record<ElementKey, "mok" | "hwa" | "to" | "geum" | "su"> = {
  wood: "mok",
  fire: "hwa",
  earth: "to",
  metal: "geum",
  water: "su",
};

export interface PersistSajuInput {
  request: SajuBasicRequest;
  result: SajuBasicResponse;
  ownerId: string;
}

export interface PersistSajuOutput {
  petId: string;
  sajuResultId: string;
}

export async function persistSajuResult(
  supabase: DbClient,
  input: PersistSajuInput
): Promise<PersistSajuOutput> {
  const { request, result, ownerId } = input;

  const petId = await findOrCreatePet(supabase, {
    ownerId,
    name: request.petName,
    species: request.species,
    gender: request.petGender ?? null,
    birthDate: request.birthDate,
    birthTime: request.birthTime,
    birthTimeUnknown: request.birthTimeUnknown,
    timezone: request.timezone,
  });

  const analysisMode = request.birthTimeUnknown ? "three_pillars" : "four_pillars";

  const sajuPayload: SajuResultInsert = {
    pet_id: petId,
    owner_id: ownerId,
    saju_type: "basic",
    analysis_mode: analysisMode,
    birth_basis: {
      birthDate: request.birthDate,
      petGender: request.petGender ?? null,
      birthTime: request.birthTime,
      birthTimeUnknown: request.birthTimeUnknown,
      timezone: request.timezone,
      birthUtc: result.birthUtc,
      locale: request.locale,
    },
    pillars: result.pillars as Record<string, unknown>,
    five_elements: result.elements as unknown as Record<string, unknown>,
    dominant_element: ELEMENT_TO_DB[result.dominantElement],
    title: result.headline,
    summary: result.story,
    storytelling_payload: {
      traits: result.traits,
      kstJiji: result.kstJiji,
      headline: result.headline,
      story: result.story,
      petGender: request.petGender ?? null,
      narrativeSource: result.narrativeSource ?? "template",
      narrativeError: result.narrativeError ?? null,
    },
    is_premium: false,
  };

  const { data: sajuRow, error: sajuError } = await supabase
    .from("saju_results")
    .insert(sajuPayload as never)
    .select("id")
    .single();

  const savedSaju = sajuRow as { id: string } | null;
  if (sajuError || !savedSaju) {
    throw new Error(sajuError?.message ?? "Failed to save saju result.");
  }

  return { petId, sajuResultId: savedSaju.id };
}
