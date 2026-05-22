import type { RankingPeriod, PetShowRankingRow } from "@/lib/supabase/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const TOP_LIMIT = 5;

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
    .select("id, author_id, pet_id, title, image_urls, like_count, comment_count, created_at")
    .eq("post_type", "photo_show")
    .eq("is_hidden", false)
    .order("like_count", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(TOP_LIMIT);

  if (period === "week") {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    query.gte("created_at", weekAgo.toISOString());
  }

  const { data, error } = await query;
  if (error || !data?.length) {
    return { rows: getMockPetShowRanking(), source: "mock" };
  }

  return { rows: data as PetShowRankingRow[], source: "supabase" };
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
      created_at: new Date(now - 259200000).toISOString(),
    },
  ];
}
