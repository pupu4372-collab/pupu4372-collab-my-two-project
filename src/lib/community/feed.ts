import { COMMUNITY_POST_SELECT } from "@/lib/community/post-select";
import { loadSpeciesByPetId, resolvePostSpecies } from "@/lib/community/pet-show-species";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { CommunityPost, PetShowSpecies } from "@/lib/supabase/types";

const PAGE_SIZE = 12;
const SCAN_BATCH_SIZE = 36;

export interface PetShowFeedPage {
  posts: CommunityPost[];
  nextCursor: string | null;
  source: "supabase" | "mock";
}

export interface PetShowFeedOptions {
  tags?: string[];
  species?: PetShowSpecies;
}

function mockFeed(cursor: string | null, options?: PetShowFeedOptions): PetShowFeedPage {
  const tags = options?.tags;
  const species = options?.species;
  let all = getMockPosts().filter((post) =>
    tags?.length ? tags.every((tag) => post.tags.includes(tag)) : true,
  );
  if (species) {
    all = all.filter((post) => resolvePostSpecies(post, new Map()) === species);
  }
  const start = cursor ? all.findIndex((p) => p.id === cursor) + 1 : 0;
  const slice = all.slice(start, start + PAGE_SIZE);
  const last = slice[slice.length - 1];
  return {
    posts: slice,
    nextCursor: slice.length === PAGE_SIZE && last ? last.id : null,
    source: "mock",
  };
}

async function fetchRawBatch(
  supabase: NonNullable<ReturnType<typeof getSupabaseServerClient>>,
  cursor: string | null | undefined,
  tags?: string[],
): Promise<CommunityPost[]> {
  let query = supabase
    .from("community_posts")
    .select(COMMUNITY_POST_SELECT)
    .eq("post_type", "photo_show")
    .eq("is_hidden", false)
    .order("created_at", { ascending: false })
    .limit(SCAN_BATCH_SIZE);

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
  if (error || !data?.length) return [];
  return data as CommunityPost[];
}

async function fetchPetShowFeedBySpecies(
  supabase: NonNullable<ReturnType<typeof getSupabaseServerClient>>,
  cursor: string | null | undefined,
  species: PetShowSpecies,
  tags?: string[],
): Promise<PetShowFeedPage> {
  const collected: CommunityPost[] = [];
  let scanCursor = cursor ?? null;
  let lastScannedId: string | null = null;
  let exhausted = false;

  while (collected.length < PAGE_SIZE && !exhausted) {
    const batch = await fetchRawBatch(supabase, scanCursor, tags);
    if (!batch.length) {
      exhausted = true;
      break;
    }

    const speciesByPetId = await loadSpeciesByPetId(supabase, batch);
    for (const post of batch) {
      lastScannedId = post.id;
      if (resolvePostSpecies(post, speciesByPetId) === species) {
        collected.push(post);
        if (collected.length >= PAGE_SIZE) break;
      }
    }

    if (batch.length < SCAN_BATCH_SIZE) {
      exhausted = true;
    } else {
      scanCursor = batch[batch.length - 1].id;
    }
  }

  const hasMore = !exhausted && lastScannedId !== null;
  return {
    posts: collected,
    nextCursor: hasMore ? lastScannedId : null,
    source: "supabase",
  };
}

export async function fetchPetShowFeed(
  cursor?: string | null,
  options?: PetShowFeedOptions,
): Promise<PetShowFeedPage> {
  const tags = options?.tags;
  const species = options?.species;
  const supabase = getSupabaseServerClient();
  if (!supabase) return mockFeed(cursor ?? null, options);

  if (species) {
    return fetchPetShowFeedBySpecies(supabase, cursor, species, tags);
  }

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
    return mockFeed(cursor ?? null, options);
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
      tags: ["pet-show:cat", "cat", "nap"],
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
      tags: ["pet-show:dog", "dog", "walk"],
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
      tags: ["pet-show:reptile", "saju", "hwa"],
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
