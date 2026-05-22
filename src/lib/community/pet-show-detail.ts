import type { SupabaseClient } from "@supabase/supabase-js";
import { getMockPosts } from "@/lib/community/feed";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { CommunityPost, Database, PostComment } from "@/lib/supabase/types";

type Db = SupabaseClient<Database>;

const POST_SELECT =
  "id, author_id, pet_id, channel, post_type, title, content, image_urls, tags, language, like_count, comment_count, view_count, is_hidden, is_pinned, created_at, updated_at";
const COMMENT_SELECT =
  "id, post_id, author_id, parent_id, content, is_hidden, created_at, updated_at";

const MOCK_BY_ID = Object.fromEntries(getMockPosts().map((p) => [p.id, p]));

function getMockComments(postId: string): PostComment[] {
  const base = Date.now();
  return [
    {
      id: `${postId}-c1`,
      post_id: postId,
      author_id: "mock",
      parent_id: null,
      content: "너무 귀여워요! 햇살 각도가 완벽해요 ☀️",
      is_hidden: false,
      created_at: new Date(base - 900000).toISOString(),
      updated_at: new Date(base - 900000).toISOString(),
    },
    {
      id: `${postId}-c2`,
      post_id: postId,
      author_id: "mock",
      parent_id: null,
      content: "우리 아이도 창가 낮잠을 좋아해요. 담요 깔아주면 더 편해해요.",
      is_hidden: false,
      created_at: new Date(base - 300000).toISOString(),
      updated_at: new Date(base - 300000).toISOString(),
    },
  ];
}

export async function fetchPetShowPost(id: string): Promise<CommunityPost | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return MOCK_BY_ID[id] ?? null;

  const { data, error } = await supabase
    .from("community_posts")
    .select(POST_SELECT)
    .eq("id", id)
    .eq("post_type", "photo_show")
    .eq("is_hidden", false)
    .single();

  if (error || !data) return MOCK_BY_ID[id] ?? null;
  return data as CommunityPost;
}

export async function fetchPetShowComments(postId: string): Promise<PostComment[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return MOCK_BY_ID[postId] ? getMockComments(postId) : [];

  const { data, error } = await supabase
    .from("post_comments")
    .select(COMMENT_SELECT)
    .eq("post_id", postId)
    .eq("is_hidden", false)
    .order("created_at", { ascending: true });

  if (error) return MOCK_BY_ID[postId] ? getMockComments(postId) : [];
  return (data ?? []) as PostComment[];
}

export async function createPetShowComment(
  supabase: Db,
  input: { postId: string; authorId: string; content: string }
): Promise<PostComment> {
  const { data: post } = await supabase
    .from("community_posts")
    .select("id")
    .eq("id", input.postId)
    .eq("post_type", "photo_show")
    .eq("is_hidden", false)
    .single();

  if (!post) throw new Error("Pet Show post not found.");

  const { data, error } = await supabase
    .from("post_comments")
    .insert({
      post_id: input.postId,
      author_id: input.authorId,
      content: input.content.trim(),
    } as never)
    .select(COMMENT_SELECT)
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to create comment.");
  return data as PostComment;
}
