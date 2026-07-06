import { isPetSpecies } from "@/lib/pets/species";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { PetShowSpecies } from "@/lib/supabase/types";

export type PetShowSpeciesPost = {
  pet_id?: string | null;
  tags?: string[] | null;
  animal_type?: PetShowSpecies | null;
};

function isPetShowSpecies(value: string | null | undefined): value is PetShowSpecies {
  return isPetSpecies(value);
}

export function speciesFromPetShowTag(tags?: string[] | null): PetShowSpecies | undefined {
  const tag = tags?.find((item) => item.startsWith("pet-show:"));
  const species = tag?.replace("pet-show:", "");
  return isPetShowSpecies(species) ? species : undefined;
}

export function speciesFromLegacyTags(tags?: string[] | null): PetShowSpecies | undefined {
  if (!tags?.length) return undefined;
  if (tags.includes("dog")) return "dog";
  if (tags.includes("cat")) return "cat";
  if (tags.includes("reptile")) return "reptile";
  if (tags.includes("other")) return "other";
  return undefined;
}

export function resolvePostSpecies(
  post: PetShowSpeciesPost,
  speciesByPetId: Map<string, PetShowSpecies>,
): PetShowSpecies | undefined {
  return (
    speciesFromPetShowTag(post.tags) ??
    (isPetShowSpecies(post.animal_type) ? post.animal_type : undefined) ??
    speciesFromLegacyTags(post.tags) ??
    (post.pet_id ? speciesByPetId.get(post.pet_id) : undefined)
  );
}

export async function loadSpeciesByPetId(
  supabase: NonNullable<ReturnType<typeof getSupabaseServerClient>>,
  posts: PetShowSpeciesPost[],
): Promise<Map<string, PetShowSpecies>> {
  const petIds = [...new Set(posts.map((row) => row.pet_id).filter(Boolean))] as string[];
  const speciesByPetId = new Map<string, PetShowSpecies>();
  if (petIds.length === 0) return speciesByPetId;

  const { data: petRows } = await supabase.from("pets").select("id, species").in("id", petIds);
  for (const pet of (petRows ?? []) as Array<{ id: string; species: PetShowSpecies }>) {
    if (isPetShowSpecies(pet.species)) {
      speciesByPetId.set(pet.id, pet.species);
    }
  }
  return speciesByPetId;
}

export async function resolveCommunityPostSpecies(post: PetShowSpeciesPost): Promise<PetShowSpecies | undefined> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return resolvePostSpecies(post, new Map());
  }
  const speciesByPetId = await loadSpeciesByPetId(supabase, [post]);
  return resolvePostSpecies(post, speciesByPetId);
}
