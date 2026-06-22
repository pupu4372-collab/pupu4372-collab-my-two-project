import { COMMUNITY_POST_SELECT } from "@/lib/community/post-select";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { CommunityPost } from "@/lib/supabase/types";

const PAGE_SIZE = 12;

export interface PetShowFeedPage {
  posts: CommunityPost[];
  nextCursor: string | null;
  source: "supabase" | "mock";
}

function mockFeed(cursor: string | null, tags?: string[]): PetShowFeedPage {
  const all = getMockPosts().filter((post) =>
    tags?.length ? tags.every((tag) => post.tags.includes(tag)) : true
  );
  const start = cursor ? all.findIndex((p) => p.id === cursor) + 1 : 0;
  const slice = all.slice(start, start + PAGE_SIZE);
  const last = slice[slice.length - 1];
  return {
    posts: slice,
    nextCursor: slice.length === PAGE_SIZE && last ? last.id : null,
    source: "mock",
  };
}

export async function fetchPetShowFeed(
  cursor?: string | null,
  tags?: string[]
): Promise<PetShowFeedPage> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return mockFeed(cursor ?? null, tags);

  let query = supabase
    .from("community_posts")
    .select(COMMUNITY_POST_SELECT)
    .eq("post_type", "photo_show")
    .eq("is_hidden", false)
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE);

  if (tags?.length) {
    query = query.contains("tags", tags);
  }

  if (cursor) {
    const { data: cursorRow } = await supabase
      .from("community_posts")
      .select("created_at")
      .eq("id", cursor)
      .single();

    const cursorAt = (cursorRow as { created_at?: string } | null)?.created_at;
    if (cursorAt) {
      query = query.lt("created_at", cursorAt);
    }
  }

  const { data, error } = await query;
  if (error || !data?.length) {
    return mockFeed(cursor ?? null, tags);
  }

  const posts = data as CommunityPost[];
  return {
    posts,
    nextCursor: posts.length === PAGE_SIZE ? posts[posts.length - 1].id : null,
    source: "supabase",
  };
}

export function getMockPosts(): CommunityPost[] {
  const base = Date.now();
  return [
    {
      id: "mock-feed-1",
      author_id: "mock",
      pet_id: null,
      channel: "community",
      post_type: "photo_show",
      title: "햇살 냥이의 오후 ☀️",
      content: "창가에서 낮잠 자는 중",
      image_urls: [],
      tags: ["cat", "nap"],
      animal_type: null,
      category: null,
      language: "ko",
      country_code: "KR",
      like_count: 42,
      comment_count: 3,
      view_count: 120,
      is_hidden: false,
      is_pinned: false,
      is_answered: false,
      adopted_answer_id: null,
      seo_slug: null,
      difficulty: null,
      time_required: null,
      save_count: 0,
      share_count: 0,
      created_at: new Date(base - 3600000).toISOString(),
      updated_at: new Date(base - 3600000).toISOString(),
    },
    {
      id: "mock-feed-2",
      author_id: "mock",
      pet_id: null,
      channel: "community",
      post_type: "photo_show",
      title: "공원 댕댕이 🐾",
      content: "Mok(Tree) energy pup",
      image_urls: [],
      tags: ["dog", "walk"],
      animal_type: null,
      category: null,
      language: "en",
      country_code: "US",
      like_count: 28,
      comment_count: 1,
      view_count: 88,
      is_hidden: false,
      is_pinned: false,
      is_answered: false,
      adopted_answer_id: null,
      seo_slug: null,
      difficulty: null,
      time_required: null,
      save_count: 0,
      share_count: 0,
      created_at: new Date(base - 7200000).toISOString(),
      updated_at: new Date(base - 7200000).toISOString(),
    },
    {
      id: "mock-feed-3",
      author_id: "mock",
      pet_id: null,
      channel: "community",
      post_type: "photo_show",
      title: "Fire(Hwa) 에너자이저 🔥",
      content: null,
      image_urls: [],
      tags: ["saju", "hwa"],
      animal_type: null,
      category: null,
      language: "ko",
      country_code: null,
      like_count: 15,
      comment_count: 0,
      view_count: 45,
      is_hidden: false,
      is_pinned: false,
      is_answered: false,
      adopted_answer_id: null,
      seo_slug: null,
      difficulty: null,
      time_required: null,
      save_count: 0,
      share_count: 0,
      created_at: new Date(base - 10800000).toISOString(),
      updated_at: new Date(base - 10800000).toISOString(),
    },
  ];
}
