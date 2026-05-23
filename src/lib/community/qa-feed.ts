import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { CommunityPost } from "@/lib/supabase/types";
import { MOCK_QA_POSTS } from "@/lib/community/qa-mock-data";

const PAGE_SIZE = 15;

export interface QaFeedQuery {
  cursor?: string | null;
  q?: string | null;
  tag?: string | null;
}

export type CommunityBoardKind = "qa" | "free" | "tips";

export interface QaFeedPage {
  posts: CommunityPost[];
  nextCursor: string | null;
  source: "supabase" | "mock";
  total?: number;
}

function boardTag(board: CommunityBoardKind) {
  return board === "qa" ? "qa" : board === "tips" ? "tips" : "free";
}

function matchesQuery(post: CommunityPost, q?: string | null, tag?: string | null) {
  if (tag && tag !== "all" && !post.tags.includes(tag)) return false;
  if (!q?.trim()) return true;
  const needle = q.trim().toLowerCase();
  const hay = `${post.title ?? ""} ${post.content ?? ""}`.toLowerCase();
  return hay.includes(needle);
}

function mockQaFeed(query: QaFeedQuery): QaFeedPage {
  const filtered = MOCK_QA_POSTS.filter((p) => matchesQuery(p, query.q, query.tag));
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

export async function fetchQaFeed(query: QaFeedQuery = {}, board: CommunityBoardKind = "qa"): Promise<QaFeedPage> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return mockQaFeed(query);
  const tag = boardTag(board);

  let dbQuery = supabase
    .from("community_posts")
    .select(
      "id, author_id, pet_id, channel, post_type, title, content, image_urls, tags, language, like_count, comment_count, view_count, is_hidden, is_pinned, created_at, updated_at",
      { count: "exact" }
    )
    .eq("post_type", board === "qa" ? "qa" : "free")
    .eq("is_hidden", false)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE);

  if (board !== "qa") {
    dbQuery = dbQuery.contains("tags", [tag]);
  } else if (query.tag && query.tag !== "all") {
    dbQuery = dbQuery.contains("tags", [query.tag]);
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
  if (error) return mockQaFeed(query);
  if (!data?.length) {
    const hasFilter = Boolean(query.q?.trim() || (query.tag && query.tag !== "all"));
    if (hasFilter) {
      return { posts: [], nextCursor: null, source: "supabase", total: 0 };
    }
    return mockQaFeed(query);
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
  input: { authorId: string; title: string; content: string; language?: string; board?: CommunityBoardKind }
): Promise<CommunityPost> {
  const board = input.board ?? "qa";
  const tag = boardTag(board);
  const { data, error } = await supabase
    .from("community_posts")
    .insert({
      author_id: input.authorId,
      channel: "community",
      post_type: board === "qa" ? "qa" : "free",
      title: input.title.trim(),
      content: input.content.trim(),
      image_urls: [],
      tags: [tag],
      language: input.language ?? "ko",
    } as never)
    .select(
      "id, author_id, pet_id, channel, post_type, title, content, image_urls, tags, language, like_count, comment_count, view_count, is_hidden, is_pinned, created_at, updated_at"
    )
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to create post.");
  return data as CommunityPost;
}
