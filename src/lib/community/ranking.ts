import { loadSpeciesByPetId, resolvePostSpecies } from "@/lib/community/pet-show-species";
import { mergeReptileChannelRankingRows } from "@/lib/pets/species";
import { getKstWeekEndUtc, getKstWeekStartUtc } from "@/lib/time/kst-week";
import type { PetShowRankingRow, PetShowSpecies, RankingPeriod } from "@/lib/supabase/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const TOP_LIMIT = 5;
const MONTH_DAYS = 30;
const SPECIES_SCAN_LIMIT = 120;
const FUNNY_SCAN_LIMIT = 40;

export type PetShowPhotoCategory = "cute" | "funny";

/** Unused legacy view/SQL reference — actual weekly window is ranking.ts + getKstWeekStartUtc/EndUtc. */
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
  and (category is null or category = 'cute')
  and created_at >= now() - interval '7 days'
order by like_count desc, created_at desc
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
  and (category is null or category = 'cute')
order by like_count desc, created_at desc
limit ${TOP_LIMIT};
`;

function compareRankingRows(a: PetShowRankingRow, b: PetShowRankingRow): number {
  if (b.like_count !== a.like_count) return b.like_count - a.like_count;
  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
}

export function sortRankingRows(rows: PetShowRankingRow[]): PetShowRankingRow[] {
  return [...rows]
    .sort(compareRankingRows)
    .slice(0, TOP_LIMIT)
    .map((row, index) => ({ ...row, rank_position: index + 1 }));
}

function monthPeriodStartDate(): Date {
  const start = new Date();
  start.setDate(start.getDate() - MONTH_DAYS);
  return start;
}

function hasPetShowEntryTag(tags?: string[] | null): boolean {
  return Boolean(tags?.includes("pet-show"));
}

type RankingPostRow = Omit<PetShowRankingRow, "pet_species"> & {
  tags?: string[] | null;
  animal_type?: PetShowSpecies | null;
  category?: string | null;
};

function buildPhotoShowRankingQuery(
  supabase: NonNullable<ReturnType<typeof getSupabaseServerClient>>,
  options: {
    photoCategory: PetShowPhotoCategory;
    period?: Extract<RankingPeriod, "week" | "month">;
    weeksAgo?: number;
    limit: number;
  },
) {
  let query = supabase
    .from("community_posts")
    .select(
      "id, author_id, pet_id, title, image_urls, tags, animal_type, category, like_count, comment_count, country_code, created_at",
    )
    .eq("post_type", "photo_show")
    .eq("is_hidden", false)
    .order("like_count", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(options.limit);

  if (options.photoCategory === "funny") {
    query = query.eq("category", "funny");
  } else {
    query = query.or("category.eq.cute,category.is.null");
  }

  if (options.period === "week") {
    const weeksAgo = options.weeksAgo ?? 0;
    query = query
      .gte("created_at", getKstWeekStartUtc(new Date(), weeksAgo).toISOString())
      .lt("created_at", getKstWeekEndUtc(new Date(), weeksAgo).toISOString());
  } else if (options.period === "month") {
    query = query.gte("created_at", monthPeriodStartDate().toISOString());
  }

  return query;
}

export async function fetchPetShowRanking(
  period: RankingPeriod = "week",
): Promise<{ rows: PetShowRankingRow[]; source: "supabase" | "mock" }> {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return { rows: getMockPetShowRanking(), source: "mock" };
  }

  const query = buildPhotoShowRankingQuery(supabase, {
    photoCategory: "cute",
    period: period === "month" ? "month" : period === "week" ? "week" : undefined,
    limit: TOP_LIMIT,
  });

  const { data, error } = await query;
  if (error) {
    return { rows: getMockPetShowRanking(), source: "mock" };
  }

  const rows = sortRankingRows((data ?? []) as PetShowRankingRow[]);
  if (!rows.length) {
    return { rows: [], source: "supabase" };
  }

  return { rows, source: "supabase" };
}

export interface PetShowSpeciesRankings {
  dog: PetShowRankingRow[];
  cat: PetShowRankingRow[];
  reptile: PetShowRankingRow[];
  other: PetShowRankingRow[];
}

export interface PetShowRankingFallbackFlags {
  dog: boolean;
  cat: boolean;
  reptile: boolean;
  funny: boolean;
}

export const EMPTY_RANKING_FALLBACK_FLAGS: PetShowRankingFallbackFlags = {
  dog: false,
  cat: false,
  reptile: false,
  funny: false,
};

export interface PetShowRankingsBundle {
  rows: PetShowSpeciesRankings;
  funny: PetShowRankingRow[];
  source: "supabase" | "mock";
  lastWeekFallback: PetShowRankingFallbackFlags;
}

export function getPetShowSpeciesRankingRows(
  grouped: PetShowSpeciesRankings,
  species: PetShowSpecies,
): PetShowRankingRow[] {
  if (species === "dog") return grouped.dog;
  if (species === "cat") return grouped.cat;
  return mergeReptileChannelRankingRows(grouped.reptile, grouped.other);
}

function groupPostsBySpecies(
  posts: RankingPostRow[],
  speciesByPetId: Map<string, PetShowSpecies>,
): PetShowSpeciesRankings {
  const grouped: PetShowSpeciesRankings = { dog: [], cat: [], reptile: [], other: [] };
  const buckets: Record<PetShowSpecies, PetShowRankingRow[]> = {
    dog: [],
    cat: [],
    reptile: [],
    other: [],
  };

  for (const post of posts) {
    if (!hasPetShowEntryTag(post.tags)) continue;
    const species = resolvePostSpecies(post, speciesByPetId);
    if (!species) continue;
    buckets[species].push({
      ...post,
      pet_species: species,
      rank_position: 0,
    });
  }

  for (const species of Object.keys(buckets) as PetShowSpecies[]) {
    grouped[species] = sortRankingRows(buckets[species]);
  }

  return grouped;
}

function groupFunnyPosts(posts: RankingPostRow[]): PetShowRankingRow[] {
  const rows = posts
    .filter((post) => hasPetShowEntryTag(post.tags))
    .map((post) => ({ ...post, rank_position: 0 }));
  return sortRankingRows(rows);
}

async function fetchRankingsForWindow(
  supabase: NonNullable<ReturnType<typeof getSupabaseServerClient>>,
  period: Extract<RankingPeriod, "week" | "month">,
  weeksAgo = 0,
): Promise<{ grouped: PetShowSpeciesRankings; funny: PetShowRankingRow[] }> {
  const [cuteResult, funnyResult] = await Promise.all([
    buildPhotoShowRankingQuery(supabase, {
      photoCategory: "cute",
      period,
      weeksAgo,
      limit: SPECIES_SCAN_LIMIT,
    }),
    buildPhotoShowRankingQuery(supabase, {
      photoCategory: "funny",
      period,
      weeksAgo,
      limit: FUNNY_SCAN_LIMIT,
    }),
  ]);

  if (cuteResult.error || funnyResult.error) {
    throw cuteResult.error ?? funnyResult.error;
  }

  const cuteRows = (cuteResult.data ?? []) as unknown as RankingPostRow[];
  const funnyRows = (funnyResult.data ?? []) as unknown as RankingPostRow[];
  const speciesByPetId = await loadSpeciesByPetId(supabase, [...cuteRows, ...funnyRows]);

  return {
    grouped: groupPostsBySpecies(cuteRows, speciesByPetId),
    funny: groupFunnyPosts(funnyRows),
  };
}

function applyWeeklyLastWeekFallback(
  current: { grouped: PetShowSpeciesRankings; funny: PetShowRankingRow[] },
  previous: { grouped: PetShowSpeciesRankings; funny: PetShowRankingRow[] },
): { rows: PetShowSpeciesRankings; funny: PetShowRankingRow[]; lastWeekFallback: PetShowRankingFallbackFlags } {
  const lastWeekFallback: PetShowRankingFallbackFlags = { ...EMPTY_RANKING_FALLBACK_FLAGS };
  const rows: PetShowSpeciesRankings = { ...current.grouped };
  let funny = current.funny;

  if (rows.dog.length === 0 && previous.grouped.dog.length > 0) {
    rows.dog = previous.grouped.dog;
    lastWeekFallback.dog = true;
  }
  if (rows.cat.length === 0 && previous.grouped.cat.length > 0) {
    rows.cat = previous.grouped.cat;
    lastWeekFallback.cat = true;
  }

  const currentReptile = mergeReptileChannelRankingRows(rows.reptile, rows.other);
  const previousReptile = mergeReptileChannelRankingRows(
    previous.grouped.reptile,
    previous.grouped.other,
  );
  if (currentReptile.length === 0 && previousReptile.length > 0) {
    rows.reptile = previous.grouped.reptile;
    rows.other = previous.grouped.other;
    lastWeekFallback.reptile = true;
  }

  if (funny.length === 0 && previous.funny.length > 0) {
    funny = previous.funny;
    lastWeekFallback.funny = true;
  }

  return { rows, funny, lastWeekFallback };
}

export async function fetchPetShowSpeciesRankings(
  period: Extract<RankingPeriod, "week" | "month"> = "week",
): Promise<PetShowRankingsBundle> {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    const mock = getMockSpeciesRankings();
    return {
      rows: mock,
      funny: getMockFunnyRanking(),
      source: "mock",
      lastWeekFallback: EMPTY_RANKING_FALLBACK_FLAGS,
    };
  }

  try {
    const current = await fetchRankingsForWindow(supabase, period, 0);

    if (period === "week") {
      const needsFallback =
        current.grouped.dog.length === 0 ||
        current.grouped.cat.length === 0 ||
        mergeReptileChannelRankingRows(current.grouped.reptile, current.grouped.other).length === 0 ||
        current.funny.length === 0;

      if (needsFallback) {
        const previous = await fetchRankingsForWindow(supabase, period, 1);
        const { rows, funny, lastWeekFallback } = applyWeeklyLastWeekFallback(current, previous);
        return { rows, funny, source: "supabase", lastWeekFallback };
      }
    }

    return {
      rows: current.grouped,
      funny: current.funny,
      source: "supabase",
      lastWeekFallback: EMPTY_RANKING_FALLBACK_FLAGS,
    };
  } catch {
    const mock = getMockSpeciesRankings();
    return {
      rows: mock,
      funny: getMockFunnyRanking(),
      source: "mock",
      lastWeekFallback: EMPTY_RANKING_FALLBACK_FLAGS,
    };
  }
}

export function fetchWeeklyPetShowSpeciesRankings() {
  return fetchPetShowSpeciesRankings("week");
}

/** Dev/demo fallback when Supabase env is not set. */
function getMockPetShowRanking(): PetShowRankingRow[] {
  const now = Date.now();
  return sortRankingRows([
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
  ]);
}

function getMockSpeciesRankings(): PetShowSpeciesRankings {
  const [cat1, dog1, dog2] = getMockPetShowRanking();
  return {
    dog: [
      { ...dog1, pet_species: "dog", rank_position: 1 },
      { ...dog2, pet_species: "dog", rank_position: 2 },
    ],
    cat: [{ ...cat1, pet_species: "cat", rank_position: 1 }],
    reptile: [],
    other: [],
  };
}

function getMockFunnyRanking(): PetShowRankingRow[] {
  const now = Date.now();
  return sortRankingRows([
    {
      id: "mock-funny-1",
      author_id: "mock-user",
      pet_id: null,
      title: "흔들린 한 컷 🤪",
      image_urls: [],
      like_count: 52,
      comment_count: 4,
      country_code: "KR",
      created_at: new Date(now - 43200000).toISOString(),
    },
  ]);
}
