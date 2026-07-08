import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Pet } from "@/lib/supabase/types";

type DbClient = SupabaseClient<Database>;

/** Returns the pet row only when petId belongs to ownerId (RLS + explicit filter). */
export async function getPetOwnedByUser(
  supabase: DbClient,
  ownerId: string,
  petId: string
): Promise<Pet | null> {
  const { data, error } = await supabase
    .from("pets")
    .select("*")
    .eq("id", petId)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error || !data) return null;
  return data as Pet;
}
