import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { CommunityPost, PetAnimalType } from "@/lib/supabase/types";
import { MOCK_QA_POSTS } from "@/lib/community/qa-mock-data";
import { isPetAnimalType, resolvePostAnimalType, subcategoryTag } from "@/lib/community/board-categories";
import { COMMUNITY_POST_SELECT } from "@/lib/community/post-select";
import { uniquePostSlug } from "@/lib/community/slug";
import type { TipsDifficulty } from "@/lib/supabase/types";

const PAGE_SIZE = 15;

export interface QaFeedQuery {
  cursor?: string | null;
  q?: string | null;
  /** Animal filter (dog | cat | other) or legacy tag id */
  tag?: string | null;
  /** Major category slug */
  category?: string | null;
  /** Tips subcategory slug */
  subCategory?: string | null;
}

export type CommunityBoardKind = "qa" | "free" | "tips" | "experience";

export interface QaFeedPage {
  posts: CommunityPost[];
  nextCursor: string | null;
  source: "supabase" | "mock";
  total?: number;
}

function boardTag(board: CommunityBoardKind) {
  return board === "qa" ? "qa" : board;
}

function matchesQuery(
  post: CommunityPost,
  q?: string | null,
  tag?: string | null,
  category?: string | null,
  subCategory?: string | null
) {
  if (tag && tag !== "all") {
    if (isPetAnimalType(tag)) {
      const animal = resolvePostAnimalType(post.animal_type, post.tags);
      if (animal !== tag) return false;
    } else if (!post.tags.includes(tag)) {
      return false;
    }
  }
  if (category && category !== "all") {
    if (post.category !== category) return false;
  }
  if (subCategory && subCategory !== "all") {
    if (!post.tags.includes(subcategoryTag(subCategory))) return false;
  }
  if (!q?.trim()) return true;
  const needle = q.trim().toLowerCase();
  const hay = `${post.title ?? ""} ${post.content ?? ""}`.toLowerCase();
  return hay.includes(needle);
}

function mockQaFeed(query: QaFeedQuery, board: CommunityBoardKind): QaFeedPage {
  const filtered = MOCK_QA_POSTS.filter((p) =>
    matchesQuery(p, query.q, query.tag, query.category, query.subCategory)
  );
  const start = query.cursor ? filtered.findIndex((p) => p.id === query.cursor) + 1 : 0;
  const slice = filtered.slice(start, start + PAGE_SIZE);
  const last = slice[slice.length - 1];
  return {
    posts: slice,
    nextCursor: slice.length === PAGE_SIZE && last ? last.id : null,
    source: "mock",
    total: filtered.length,
  };
}

function emptyBoardFeed(): QaFeedPage {
  return { posts: [], nextCursor: null, source: "supabase", total: 0 };
}

export async function fetchQaFeed(
  query: QaFeedQuery = {},
  board: CommunityBoardKind = "qa"
): Promise<QaFeedPage> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return board === "qa" ? mockQaFeed(query, board) : emptyBoardFeed();
  const tag = boardTag(board);

  let dbQuery = supabase
    .from("community_posts")
    .select(COMMUNITY_POST_SELECT, { count: "exact" })
    .eq("post_type", board === "qa" ? "qa" : "free")
    .eq("is_hidden", false)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE);

  if (board !== "qa") {
    dbQuery = dbQuery.contains("tags", [tag]);
  }
  if (query.tag && query.tag !== "all") {
    if (isPetAnimalType(query.tag)) {
      dbQuery = dbQuery.eq("animal_type", query.tag);
    } else {
      dbQuery = dbQuery.contains("tags", [query.tag]);
    }
  }
  if (query.category && query.category !== "all") {
    dbQuery = dbQuery.eq("category", query.category);
  }
  if (query.subCategory && query.subCategory !== "all") {
    dbQuery = dbQuery.contains("tags", [subcategoryTag(query.subCategory)]);
  }
  if (query.q?.trim()) {
    const escaped = query.q.trim().replace(/[%_]/g, "");
    const term = `%${escaped}%`;
    dbQuery = dbQuery.or(`title.ilike.${term},content.ilike.${term}`);
  }
  if (query.cursor) {
    const { data: cursorRow } = await supabase
      .from("community_posts")
      .select("created_at")
      .eq("id", query.cursor)
      .single();
    const cursorAt = (cursorRow as { created_at?: string } | null)?.created_at;
    if (cursorAt) dbQuery = dbQuery.lt("created_at", cursorAt);
  }

  const { data, error, count } = await dbQuery;
  if (error) return board === "qa" ? mockQaFeed(query, board) : emptyBoardFeed();
  if (!data?.length) {
    const hasFilter = Boolean(
      query.q?.trim() ||
        (query.tag && query.tag !== "all") ||
        (query.category && query.category !== "all") ||
        (query.subCategory && query.subCategory !== "all")
    );
    if (hasFilter) {
      return { posts: [], nextCursor: null, source: "supabase", total: 0 };
    }
    return board === "qa" ? mockQaFeed(query, board) : emptyBoardFeed();
  }

  const posts = data as CommunityPost[];
  return {
    posts,
    nextCursor: posts.length === PAGE_SIZE ? posts[posts.length - 1].id : null,
    source: "supabase",
    total: count ?? posts.length,
  };
}

export async function createQaPost(
  supabase: import("@supabase/supabase-js").SupabaseClient<import("@/lib/supabase/types").Database>,
  input: {
    authorId: string;
    title: string;
    content: string;
    language?: string;
    board?: CommunityBoardKind;
    animalType?: PetAnimalType;
    category?: string;
    tags?: string[];
    difficulty?: TipsDifficulty;
  }
): Promise<CommunityPost> {
  const board = input.board ?? "qa";
  const tag = boardTag(board);
  const subTags = (input.tags ?? []).filter(
    (item) => item && item !== tag && !isPetAnimalType(item)
  );
  const tags = [
    ...new Set([
      tag,
      ...(input.animalType ? [input.animalType] : []),
      ...subTags,
    ]),
  ];
  const { data: profile } = await supabase
    .from("profiles")
    .select("country_code, show_country")
    .eq("id", input.authorId)
    .maybeSingle();
  const countryCode =
    (profile as { country_code?: string | null; show_country?: boolean | null } | null)?.show_country ===
    false
      ? null
      : (profile as { country_code?: string | null } | null)?.country_code ?? null;
  const seoSlug = await uniquePostSlug(supabase, input.title);
  const { data, error } = await supabase
    .from("community_posts")
    .insert({
      author_id: input.authorId,
      channel: "community",
      post_type: board === "qa" ? "qa" : "free",
      title: input.title.trim(),
      content: input.content.trim(),
      image_urls: [],
      tags,
      animal_type: input.animalType ?? null,
      category: input.category ?? null,
      language: input.language ?? "ko",
      country_code: countryCode,
      seo_slug: seoSlug,
      difficulty: board === "tips" ? input.difficulty ?? null : null,
      time_required: null,
    } as never)
    .select(COMMUNITY_POST_SELECT)
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to create post.");
  return data as CommunityPost;
}
