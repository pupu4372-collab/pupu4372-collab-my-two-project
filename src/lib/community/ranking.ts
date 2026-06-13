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

  if (!data?.length) {
    return { rows: [], source: "supabase" };
  }

  return { rows: data as PetShowRankingRow[], source: "supabase" };
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

  let postRows = (periodPosts ?? []) as unknown as RankingPostRow[];
  if (postRows.length === 0) {
    const { data: latestPosts, error: latestError } = await buildRankingQuery(false);
    if (latestError || !latestPosts?.length) {
      return { rows: { dog: [], cat: [], other: [] }, source: "supabase" };
    }
    postRows = latestPosts as unknown as RankingPostRow[];
  }

  const petIds = [...new Set(postRows.map((row) => row.pet_id).filter(Boolean))] as string[];
  const speciesByPetId = new Map<string, PetShowSpecies>();
  if (petIds.length > 0) {
    const { data: petRows } = await supabase.from("pets").select("id, species").in("id", petIds);
    for (const pet of (petRows ?? []) as Array<{ id: string; species: PetShowSpecies }>) {
      if (isPetShowSpecies(pet.species)) {
        speciesByPetId.set(pet.id, pet.species);
      }
    }
  }

  const grouped: PetShowSpeciesRankings = { dog: [], cat: [], other: [] };
  for (const post of postRows) {
    const species = resolvePostSpecies(post, speciesByPetId);
    if (!species) continue;
    if (grouped[species].length >= TOP_LIMIT) continue;
    grouped[species].push({
      ...post,
      pet_species: species,
      rank_position: grouped[species].length + 1,
    });
  }

  if (!grouped.dog.length && !grouped.cat.length && !grouped.other.length) {
    // Posts exist but none have upload category tags — show empty rankings, not demo data.
    if (postRows.length > 0) {
      return { rows: grouped, source: "supabase" };
    }
    return { rows: getMockSpeciesRankings(), source: "mock" };
  }

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
