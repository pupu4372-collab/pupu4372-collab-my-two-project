import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, PetInsert, SajuResultInsert } from "@/lib/supabase/types";
import type { PremiumReport } from "./premium-report";
import type { SajuBasicRequest } from "./types";

const ELEMENT_TO_DB = {
  wood: "mok",
  fire: "hwa",
  earth: "to",
  metal: "geum",
  water: "su",
} as const;

type Db = SupabaseClient<Database>;

export async function persistPremiumReport(
  supabase: Db,
  ownerId: string,
  request: SajuBasicRequest,
  report: PremiumReport,
  payment: {
    orderId: string;
    captureId: string;
    amount: number;
    demo: boolean;
  }
) {
  const petPayload: PetInsert = {
    owner_id: ownerId,
    name: request.petName,
    species: request.species,
    birth_date: request.birthDate,
    birth_time: request.birthTimeUnknown ? null : request.birthTime,
    birth_time_unknown: request.birthTimeUnknown,
    birth_timezone: request.timezone,
  };

  const { data: pet } = await supabase
    .from("pets")
    .insert(petPayload as never)
    .select("id")
    .single();

  const savedPet = pet as { id: string } | null;
  if (!savedPet) throw new Error("Failed to save pet.");

  const analysisMode = request.birthTimeUnknown ? "three_pillars" : "four_pillars";
  const el = report.basic.dominantElement;

  const sajuPayload: SajuResultInsert = {
    pet_id: savedPet.id,
    owner_id: ownerId,
    saju_type: "premium",
    analysis_mode: analysisMode,
    birth_basis: {
      birthDate: request.birthDate,
      birthTime: request.birthTime,
      birthTimeUnknown: request.birthTimeUnknown,
      timezone: request.timezone,
      birthUtc: report.basic.birthUtc,
      locale: request.locale,
    },
    pillars: report.basic.pillars as Record<string, unknown>,
    five_elements: report.basic.elements as unknown as Record<string, unknown>,
    dominant_element: ELEMENT_TO_DB[el],
    title: report.lifetimeHeadline,
    summary: report.lifetimeStory,
    storytelling_payload: {
      yearlyThemes: report.yearlyThemes,
      careGuide: report.careGuide,
      luckyColors: report.luckyColors,
      characterTitle: report.characterTitle,
      traits: report.basic.traits,
      pillars: report.basic.pillars,
    },
    is_premium: true,
  };

  const { data: sajuRow } = await supabase
    .from("saju_results")
    .insert(sajuPayload as never)
    .select("id")
    .single();

  const savedSaju = sajuRow as { id: string } | null;
  if (!savedSaju) throw new Error("Failed to save premium saju.");

  await supabase.from("payments").insert({
    user_id: ownerId,
    pet_id: savedPet.id,
    saju_result_id: savedSaju.id,
    provider: payment.demo ? "demo" : "paypal",
    provider_order_id: payment.orderId,
    provider_capture_id: payment.captureId,
    product_type: "premium_saju_report",
    amount: payment.amount,
    currency: "USD",
    status: "captured",
    raw_payload: { demo: payment.demo },
  } as never);

  return { petId: savedPet.id, sajuResultId: savedSaju.id };
}
