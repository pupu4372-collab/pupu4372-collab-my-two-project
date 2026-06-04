import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { CommunityPost } from "@/lib/supabase/types";

const POST_SELECT =
  "id, author_id, pet_id, channel, post_type, title, content, image_urls, tags, language, country_code, like_count, comment_count, view_count, is_hidden, is_pinned, created_at, updated_at";

export interface AdminPostRow extends CommunityPost {
  author_name?: string;
}

export async function fetchAdminRecentPosts(limit = 30): Promise<{
  posts: AdminPostRow[];
  source: "supabase" | "mock";
}> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return { posts: [], source: "mock" };
  }

  const { data, error } = await supabase
    .from("community_posts")
    .select(POST_SELECT)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data?.length) {
    return { posts: [], source: "supabase" };
  }

  const posts = data as CommunityPost[];
  const authorIds = [...new Set(posts.map((p) => p.author_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("id", authorIds);

  const nameById = new Map(
    (profiles ?? []).map((p) => [(p as { id: string }).id, (p as { display_name: string }).display_name])
  );

  return {
    posts: posts.map((post) => ({
      ...post,
      author_name: nameById.get(post.author_id) ?? "집사",
    })),
    source: "supabase",
  };
}

export async function setPostHidden(postId: string, hidden: boolean): Promise<boolean> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from("community_posts")
    .update({ is_hidden: hidden } as never)
    .eq("id", postId);

  return !error;
}

export async function deletePostByAdmin(postId: string): Promise<boolean> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from("community_posts")
    .delete()
    .eq("id", postId);

  return !error;
}
