import type { SupabaseClient } from "@supabase/supabase-js";
import { MOCK_QA_POSTS } from "@/lib/community/qa-mock-data";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { CommunityPost, Database, PostComment } from "@/lib/supabase/types";
import { isUuid } from "@/lib/community/slug";
import type { CommunityBoardKind } from "./qa-feed";

type Db = SupabaseClient<Database>;

import { COMMUNITY_POST_SELECT } from "@/lib/community/post-select";

const POST_SELECT = COMMUNITY_POST_SELECT;
const COMMENT_SELECT =
  "id, post_id, author_id, parent_id, content, is_hidden, created_at, updated_at";

const MOCK_BY_ID = Object.fromEntries(MOCK_QA_POSTS.map((p) => [p.id, p]));

function postTypeForBoard(board: CommunityBoardKind) {
  return board === "qa" ? "qa" : "free";
}

function tagForBoard(board: CommunityBoardKind) {
  return board === "qa" ? "qa" : board;
}

function normalizePostIdentifier(value: string): string {
  let normalized = value.trim();
  for (let attempt = 0; attempt < 2; attempt += 1) {
    if (!normalized.includes("%")) break;
    try {
      normalized = decodeURIComponent(normalized);
    } catch {
      break;
    }
  }
  return normalized;
}

async function queryBoardPost(
  supabase: Db,
  board: CommunityBoardKind,
  column: "id" | "seo_slug",
  value: string
): Promise<CommunityPost | null> {
  let query = supabase
    .from("community_posts")
    .select(POST_SELECT)
    .eq(column, value)
    .eq("post_type", postTypeForBoard(board))
    .eq("is_hidden", false);

  if (board !== "qa") {
    query = query.contains("tags", [tagForBoard(board)]);
  }

  const { data, error } = await query.maybeSingle();
  if (error || !data) return null;
  return data as CommunityPost;
}

/** Fallback when PostgREST slug filters fail for non-ASCII slugs. */
async function findBoardPostBySlug(
  supabase: Db,
  board: CommunityBoardKind,
  slug: string
): Promise<CommunityPost | null> {
  let query = supabase
    .from("community_posts")
    .select(POST_SELECT)
    .eq("post_type", postTypeForBoard(board))
    .eq("is_hidden", false)
    .not("seo_slug", "is", null)
    .order("created_at", { ascending: false })
    .limit(200);

  if (board !== "qa") {
    query = query.contains("tags", [tagForBoard(board)]);
  }

  const { data, error } = await query;
  const posts = (data ?? []) as CommunityPost[];
  if (error || !posts.length) return null;
  return posts.find((post) => post.seo_slug === slug) ?? null;
}

function getMockComments(postId: string): PostComment[] {
  const base = Date.now();
  return [
    {
      id: `${postId}-comment-1`,
      post_id: postId,
      author_id: "mock",
      parent_id: null,
      content: "먼저 병원 이슈가 아닌지 확인하고, 루틴은 한 번에 크게 바꾸지 않는 쪽이 좋아 보여요.",
      is_hidden: false,
      created_at: new Date(base - 1200000).toISOString(),
      updated_at: new Date(base - 1200000).toISOString(),
    },
    {
      id: `${postId}-comment-2`,
      post_id: postId,
      author_id: "mock",
      parent_id: null,
      content: "저희 집은 짧게 성공하는 상황을 반복해서 칭찬했더니 반응이 훨씬 좋아졌어요.",
      is_hidden: false,
      created_at: new Date(base - 600000).toISOString(),
      updated_at: new Date(base - 600000).toISOString(),
    },
  ];
}

export async function fetchQaPostDetail(
  identifier: string,
  board: CommunityBoardKind = "qa"
): Promise<CommunityPost | null> {
  const normalized = normalizePostIdentifier(identifier);
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    if (board !== "qa") return null;
    if (isUuid(normalized)) return MOCK_BY_ID[normalized] ?? null;
    return Object.values(MOCK_BY_ID).find((p) => p.seo_slug === normalized) ?? null;
  }

  if (isUuid(normalized)) {
    const byId = await queryBoardPost(supabase, board, "id", normalized);
    if (byId) return byId;
  } else {
    const bySlug = await queryBoardPost(supabase, board, "seo_slug", normalized);
    if (bySlug) return bySlug;
    const bySlugFallback = await findBoardPostBySlug(supabase, board, normalized);
    if (bySlugFallback) return bySlugFallback;
  }

  if (board !== "qa") return null;
  if (isUuid(normalized)) return MOCK_BY_ID[normalized] ?? null;
  return Object.values(MOCK_BY_ID).find((p) => p.seo_slug === normalized) ?? null;
}

export async function fetchQaComments(postId: string): Promise<PostComment[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return getMockComments(postId);

  const { data, error } = await supabase
    .from("post_comments")
    .select(COMMENT_SELECT)
    .eq("post_id", postId)
    .eq("is_hidden", false)
    .order("created_at", { ascending: true });

  if (error) return MOCK_BY_ID[postId] ? getMockComments(postId) : [];
  return (data ?? []) as PostComment[];
}

export async function createQaComment(
  supabase: Db,
  input: { postId: string; authorId: string; content: string; parentId?: string | null; board?: CommunityBoardKind }
): Promise<PostComment> {
  const board = input.board ?? "qa";
  let postQuery = supabase
    .from("community_posts")
    .select("id")
    .eq("id", input.postId)
    .eq("post_type", postTypeForBoard(board))
    .eq("is_hidden", false);

  if (board !== "qa") {
    postQuery = postQuery.contains("tags", [tagForBoard(board)]);
  }

  const { data: post } = await postQuery
    .single();

  if (!post) throw new Error("Post not found.");

  const { data, error } = await supabase
    .from("post_comments")
    .insert({
      post_id: input.postId,
      author_id: input.authorId,
      parent_id: input.parentId ?? null,
      content: input.content.trim(),
    } as never)
    .select(COMMENT_SELECT)
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to create comment.");
  return data as PostComment;
}
