import type { PetShowRankingRow, PetShowSpecies } from "@/lib/supabase/types";

export const PET_SPECIES_VALUES = ["dog", "cat", "reptile", "other"] as const;

export function isPetSpecies(value: unknown): value is PetShowSpecies {
  return value === "dog" || value === "cat" || value === "reptile" || value === "other";
}

/** Pet Show / channel UI: merge reptile + other friends into one Top 5 strip. */
export function mergeReptileChannelRankingRows(
  reptile: PetShowRankingRow[],
  other: PetShowRankingRow[],
): PetShowRankingRow[] {
  return [...reptile, ...other]
    .sort((a, b) => {
      if (b.like_count !== a.like_count) return b.like_count - a.like_count;
      return String(a.created_at ?? "").localeCompare(String(b.created_at ?? ""));
    })
    .slice(0, 5)
    .map((row, index) => ({ ...row, rank_position: index + 1 }));
}
