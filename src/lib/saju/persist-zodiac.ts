import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, SajuResultInsert } from "@/lib/supabase/types";
import type { ElementKey } from "./types";
import type { ZodiacFortuneRequest, ZodiacFortuneResponse } from "./zodiac/engine";
import { ELEMENT_META } from "./elements";
import { findOrCreatePet } from "./persist-pet";

type DbClient = SupabaseClient<Database>;

const ELEMENT_TO_DB: Record<ElementKey, "mok" | "hwa" | "to" | "geum" | "su"> = {
  wood: "mok",
  fire: "hwa",
  earth: "to",
  metal: "geum",
  water: "su",
};

export async function persistZodiacFortune(
  supabase: DbClient,
  ownerId: string,
  request: ZodiacFortuneRequest,
  result: ZodiacFortuneResponse
) {
  const petId = await findOrCreatePet(supabase, {
    ownerId,
    name: request.petName,
    species: request.species,
    birthDate: request.birthDate,
    birthTime: null,
    birthTimeUnknown: true,
    timezone: "Asia/Seoul",
  });

  const el = result.elementAffinity;

  const sajuPayload: SajuResultInsert = {
    pet_id: petId,
    owner_id: ownerId,
    saju_type: "zodiac",
    analysis_mode: "three_pillars",
    birth_basis: {
      birthDate: request.birthDate,
      locale: request.locale,
      fortuneDateKst: result.fortuneDateKst,
      signKey: result.sign.key,
    },
    pillars: { sign: result.sign.key, displayName: result.sign.displayName },
    five_elements: { affinity: el, label: result.elementLabel },
    dominant_element: ELEMENT_TO_DB[el],
    title: result.personality.headline,
    summary: result.personality.story,
    storytelling_payload: {
      sign: result.sign,
      personality: result.personality,
      daily: result.daily,
      elementMeta: ELEMENT_META[el],
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
    throw new Error(error?.message ?? "Failed to save zodiac result.");
  }

  return { petId, sajuResultId: saved.id };
}
