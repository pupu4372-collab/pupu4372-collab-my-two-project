import type { SupabaseClient } from "@supabase/supabase-js";
import { MOCK_QA_POSTS } from "@/lib/community/qa-mock-data";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { CommunityPost, Database, PostComment } from "@/lib/supabase/types";

type Db = SupabaseClient<Database>;

const POST_SELECT =
  "id, author_id, pet_id, channel, post_type, title, content, image_urls, tags, language, like_count, comment_count, view_count, is_hidden, is_pinned, created_at, updated_at";
const COMMENT_SELECT =
  "id, post_id, author_id, parent_id, content, is_hidden, created_at, updated_at";

const MOCK_BY_ID = Object.fromEntries(MOCK_QA_POSTS.map((p) => [p.id, p]));

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

export async function fetchQaPostDetail(id: string): Promise<CommunityPost | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return MOCK_BY_ID[id] ?? null;

  const { data, error } = await supabase
    .from("community_posts")
    .select(POST_SELECT)
    .eq("id", id)
    .eq("post_type", "qa")
    .eq("is_hidden", false)
    .single();

  if (error || !data) return MOCK_BY_ID[id] ?? null;
  return data as CommunityPost;
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
  input: { postId: string; authorId: string; content: string; parentId?: string | null }
): Promise<PostComment> {
  const { data: post } = await supabase
    .from("community_posts")
    .select("id")
    .eq("id", input.postId)
    .eq("post_type", "qa")
    .eq("is_hidden", false)
    .single();

  if (!post) throw new Error("Q&A post not found.");

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
