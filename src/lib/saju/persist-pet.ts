import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, PetInsert, PetSpecies } from "@/lib/supabase/types";
import type { Gender, Locale } from "./types";

type DbClient = SupabaseClient<Database>;
export const MAX_PETS_PER_OWNER = 5;

export interface PetProfileInput {
  ownerId: string;
  name: string;
  species: PetSpecies;
  birthDate: string;
  birthTime: string | null;
  birthTimeUnknown: boolean;
  timezone: string;
  gender?: Gender | null;
  locale?: Locale;
}

export function petLimitMessage(locale: Locale = "ko"): string {
  return locale === "en"
    ? `Pet registration is limited to ${MAX_PETS_PER_OWNER} pets per owner.`
    : `펫 등록은 집사 1명당 최대 ${MAX_PETS_PER_OWNER}마리까지 가능해요.`;
}

export async function findOrCreatePet(
  supabase: DbClient,
  input: PetProfileInput
): Promise<string> {
  const { data: existing } = await supabase
    .from("pets")
    .select("id")
    .eq("owner_id", input.ownerId)
    .eq("name", input.name)
    .eq("species", input.species)
    .eq("birth_date", input.birthDate)
    .maybeSingle();

  const row = existing as { id: string } | null;
  if (row?.id) return row.id;

  const { count, error: countError } = await supabase
    .from("pets")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", input.ownerId);

  if (countError) {
    throw new Error(countError.message);
  }

  if ((count ?? 0) >= MAX_PETS_PER_OWNER) {
    throw new Error(petLimitMessage(input.locale ?? "ko"));
  }

  const petPayload: PetInsert = {
    owner_id: input.ownerId,
    name: input.name,
    species: input.species,
    birth_date: input.birthDate,
    birth_time: input.birthTimeUnknown ? null : input.birthTime,
    birth_time_unknown: input.birthTimeUnknown,
    birth_timezone: input.timezone,
    gender: input.gender ?? null,
  };

  const { data: pet, error } = await supabase
    .from("pets")
    .insert(petPayload as never)
    .select("id")
    .single();

  const saved = pet as { id: string } | null;
  if (error || !saved) {
    throw new Error(error?.message ?? "Failed to save pet profile.");
  }

  return saved.id;
}
