import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, PetInsert, PetSpecies } from "@/lib/supabase/types";
import type { Gender, Locale } from "./types";

type DbClient = SupabaseClient<Database>;

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
