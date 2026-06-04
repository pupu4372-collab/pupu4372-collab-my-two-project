import type { SupabaseClient } from "@supabase/supabase-js";
import { COMMUNITY_POST_SELECT } from "@/lib/community/post-select";
import type { CommunityPost, Database } from "@/lib/supabase/types";

type Db = SupabaseClient<Database>;

export async function adoptQaAnswer(
  supabase: Db,
  postId: string,
  commentId: string,
  authorId: string
): Promise<CommunityPost> {
  const { data: post } = await supabase
    .from("community_posts")
    .select("id, author_id, post_type")
    .eq("id", postId)
    .eq("post_type", "qa")
    .eq("is_hidden", false)
    .maybeSingle();

  if (!post) throw new Error("Post not found.");
  if ((post as { author_id: string }).author_id !== authorId) {
    throw new Error("Only the question author can adopt an answer.");
  }

  const { data: comment } = await supabase
    .from("post_comments")
    .select("id")
    .eq("id", commentId)
    .eq("post_id", postId)
    .eq("is_hidden", false)
    .maybeSingle();

  if (!comment) throw new Error("Comment not found.");

  const { data, error } = await supabase
    .from("community_posts")
    .update({
      is_answered: true,
      adopted_answer_id: commentId,
    } as never)
    .eq("id", postId)
    .select(COMMUNITY_POST_SELECT)
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to adopt answer.");
  return data as CommunityPost;
}
