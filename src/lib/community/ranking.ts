import type { PetShowRankingRow, PetShowSpecies, RankingPeriod } from "@/lib/supabase/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const TOP_LIMIT = 5;
const WEEK_DAYS = 7;
const MONTH_DAYS = 30;

/** SQL reference — weekly Top 5 (uses denormalized like_count + partial index). */
export const PET_SHOW_RANKING_WEEKLY_SQL = `
select
  id,
  author_id,
  pet_id,
  title,
  image_urls,
  like_count,
  comment_count,
  created_at
from public.community_posts
where post_type = 'photo_show'
  and is_hidden = false
  and created_at >= now() - interval '7 days'
order by like_count desc, created_at asc
limit ${TOP_LIMIT};
`;

/** Realtime = all-time Top 5 by like_count (fast path for hero widget). */
export const PET_SHOW_RANKING_REALTIME_SQL = `
select
  id,
  author_id,
  pet_id,
  title,
  image_urls,
  like_count,
  comment_count,
  created_at
from public.community_posts
where post_type = 'photo_show'
  and is_hidden = false
order by like_count desc, created_at desc
limit ${TOP_LIMIT};
`;

export async function fetchPetShowRanking(
  period: RankingPeriod = "week"
): Promise<{ rows: PetShowRankingRow[]; source: "supabase" | "mock" }> {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return { rows: getMockPetShowRanking(), source: "mock" };
  }

  const query = supabase
    .from("community_posts")
    .select("id, author_id, pet_id, title, image_urls, like_count, comment_count, country_code, created_at")
    .eq("post_type", "photo_show")
    .eq("is_hidden", false)
    .order("like_count", { ascending: false })
    .order("created_at", { ascending: period !== "realtime" })
    .limit(TOP_LIMIT);

  if (period === "week") {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - WEEK_DAYS);
    query.gte("created_at", weekAgo.toISOString());
  } else if (period === "month") {
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - MONTH_DAYS);
    query.gte("created_at", monthAgo.toISOString());
  }

  const { data, error } = await query;
  if (error) {
    return { rows: getMockPetShowRanking(), source: "mock" };
  }

  let rows = (data ?? []) as PetShowRankingRow[];

  if ((period === "week" || period === "month") && rows.length < TOP_LIMIT) {
    const { data: fallbackData, error: fallbackError } = await supabase
      .from("community_posts")
      .select("id, author_id, pet_id, title, image_urls, like_count, comment_count, country_code, created_at")
      .eq("post_type", "photo_show")
      .eq("is_hidden", false)
      .order("like_count", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(TOP_LIMIT * 4);

    if (!fallbackError && fallbackData?.length) {
      rows = mergeRankingRows(rows, fallbackData as PetShowRankingRow[]);
    }
  }

  if (!rows.length) {
    return { rows: [], source: "supabase" };
  }

  return { rows, source: "supabase" };
}

export interface PetShowSpeciesRankings {
  dog: PetShowRankingRow[];
  cat: PetShowRankingRow[];
  other: PetShowRankingRow[];
}

type RankingPostRow = Omit<PetShowRankingRow, "pet_species"> & {
  tags?: string[] | null;
  animal_type?: PetShowSpecies | null;
};

function isPetShowSpecies(value: string | null | undefined): value is PetShowSpecies {
  return value === "dog" || value === "cat" || value === "other";
}

function speciesFromPetShowTag(tags?: string[] | null): PetShowSpecies | undefined {
  const tag = tags?.find((item) => item.startsWith("pet-show:"));
  const species = tag?.replace("pet-show:", "");
  return isPetShowSpecies(species) ? species : undefined;
}

function speciesFromLegacyTags(tags?: string[] | null): PetShowSpecies | undefined {
  if (!tags?.length) return undefined;
  if (tags.includes("dog")) return "dog";
  if (tags.includes("cat")) return "cat";
  if (tags.includes("other")) return "other";
  return undefined;
}

function resolvePostSpecies(
  post: RankingPostRow,
  speciesByPetId: Map<string, PetShowSpecies>,
): PetShowSpecies | undefined {
  return (
    speciesFromPetShowTag(post.tags) ??
    (isPetShowSpecies(post.animal_type) ? post.animal_type : undefined) ??
    speciesFromLegacyTags(post.tags) ??
    (post.pet_id ? speciesByPetId.get(post.pet_id) : undefined)
  );
}

async function loadSpeciesByPetId(
  supabase: NonNullable<ReturnType<typeof getSupabaseServerClient>>,
  posts: RankingPostRow[],
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

function groupPostsBySpecies(
  posts: RankingPostRow[],
  speciesByPetId: Map<string, PetShowSpecies>,
): PetShowSpeciesRankings {
  const grouped: PetShowSpeciesRankings = { dog: [], cat: [], other: [] };
  const usedIds = new Set<string>();

  for (const post of posts) {
    const species = resolvePostSpecies(post, speciesByPetId);
    if (!species || grouped[species].length >= TOP_LIMIT || usedIds.has(post.id)) continue;
    usedIds.add(post.id);
    grouped[species].push({
      ...post,
      pet_species: species,
      rank_position: grouped[species].length + 1,
    });
  }

  return grouped;
}

function mergeSpeciesRankings(
  primaryPosts: RankingPostRow[],
  backfillPosts: RankingPostRow[],
  speciesByPetId: Map<string, PetShowSpecies>,
): PetShowSpeciesRankings {
  const grouped = groupPostsBySpecies(primaryPosts, speciesByPetId);
  const usedIds = new Set(
    [...grouped.dog, ...grouped.cat, ...grouped.other].map((row) => row.id),
  );

  for (const post of backfillPosts) {
    if (usedIds.has(post.id)) continue;
    const species = resolvePostSpecies(post, speciesByPetId);
    if (!species || grouped[species].length >= TOP_LIMIT) continue;
    usedIds.add(post.id);
    grouped[species].push({
      ...post,
      pet_species: species,
      rank_position: grouped[species].length + 1,
    });
  }

  return grouped;
}

function mergeRankingRows(
  primaryRows: PetShowRankingRow[],
  backfillRows: PetShowRankingRow[],
): PetShowRankingRow[] {
  const usedIds = new Set(primaryRows.map((row) => row.id));
  const merged = [...primaryRows];
  for (const row of backfillRows) {
    if (merged.length >= TOP_LIMIT || usedIds.has(row.id)) continue;
    usedIds.add(row.id);
    merged.push({ ...row, rank_position: merged.length + 1 });
  }
  return merged;
}

export async function fetchPetShowSpeciesRankings(period: Extract<RankingPeriod, "week" | "month"> = "week"): Promise<{
  rows: PetShowSpeciesRankings;
  source: "supabase" | "mock";
}> {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return { rows: getMockSpeciesRankings(), source: "mock" };
  }

  const periodStart = new Date();
  periodStart.setDate(periodStart.getDate() - (period === "month" ? MONTH_DAYS : WEEK_DAYS));

  const buildRankingQuery = (withPeriod: boolean) => {
    let query = supabase
      .from("community_posts")
      .select(
        "id, author_id, pet_id, title, image_urls, tags, animal_type, like_count, comment_count, country_code, created_at",
      )
      .eq("post_type", "photo_show")
      .eq("is_hidden", false)
      .order("like_count", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(60);

    if (withPeriod) {
      query = query.gte("created_at", periodStart.toISOString());
    }

    return query;
  };

  const { data: periodPosts, error } = await buildRankingQuery(true);
  if (error) {
    return { rows: getMockSpeciesRankings(), source: "mock" };
  }

  const periodRows = (periodPosts ?? []) as unknown as RankingPostRow[];
  const { data: fallbackPosts, error: fallbackError } = await buildRankingQuery(false);
  if (fallbackError) {
    return { rows: getMockSpeciesRankings(), source: "mock" };
  }

  const fallbackRows = (fallbackPosts ?? []) as unknown as RankingPostRow[];
  if (periodRows.length === 0 && fallbackRows.length === 0) {
    return { rows: { dog: [], cat: [], other: [] }, source: "supabase" };
  }

  const speciesByPetId = await loadSpeciesByPetId(supabase, [...periodRows, ...fallbackRows]);
  const grouped = mergeSpeciesRankings(periodRows, fallbackRows, speciesByPetId);

  return { rows: grouped, source: "supabase" };
}

export function fetchWeeklyPetShowSpeciesRankings() {
  return fetchPetShowSpeciesRankings("week");
}

/** Dev/demo fallback when Supabase env is not set. */
function getMockPetShowRanking(): PetShowRankingRow[] {
  const now = Date.now();
  return [
    {
      id: "mock-1",
      author_id: "mock-user",
      pet_id: null,
      title: "햇살 냥이 ☀️",
      image_urls: [],
      like_count: 128,
      comment_count: 12,
      country_code: "KR",
      created_at: new Date(now - 86400000).toISOString(),
    },
    {
      id: "mock-2",
      author_id: "mock-user",
      pet_id: null,
      title: "공원 댕댕이 🐾",
      image_urls: [],
      like_count: 97,
      comment_count: 8,
      country_code: "US",
      created_at: new Date(now - 172800000).toISOString(),
    },
    {
      id: "mock-3",
      author_id: "mock-user",
      pet_id: null,
      title: "Mok(Tree) vibe pup 🌳",
      image_urls: [],
      like_count: 84,
      comment_count: 5,
      country_code: null,
      created_at: new Date(now - 259200000).toISOString(),
    },
  ];
}

function getMockSpeciesRankings(): PetShowSpeciesRankings {
  const [cat1, dog1, dog2] = getMockPetShowRanking();
  return {
    dog: [
      { ...dog1, pet_species: "dog", rank_position: 1 },
      { ...dog2, pet_species: "dog", rank_position: 2 },
    ],
    cat: [{ ...cat1, pet_species: "cat", rank_position: 1 }],
    other: [],
  };
}
