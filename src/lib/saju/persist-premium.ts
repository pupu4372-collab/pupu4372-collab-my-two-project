import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, SajuResultInsert } from "@/lib/supabase/types";
import type { PremiumReport } from "./premium-report";
import type { SajuBasicRequest } from "./types";
import { findOrCreatePet } from "./persist-pet";

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
  const petId = await findOrCreatePet(supabase, {
    ownerId,
    name: request.petName,
    species: request.species,
    birthDate: request.birthDate,
    birthTime: request.birthTime,
    birthTimeUnknown: request.birthTimeUnknown,
    timezone: request.timezone,
    gender: request.petGender ?? null,
  });

  const analysisMode = request.birthTimeUnknown ? "three_pillars" : "four_pillars";
  const el = report.basic.dominantElement;

  const sajuPayload: SajuResultInsert = {
    pet_id: petId,
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
    pet_id: petId,
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

  return { petId, sajuResultId: savedSaju.id };
}
