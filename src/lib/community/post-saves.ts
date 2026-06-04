import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type Db = SupabaseClient<Database>;

export async function togglePostSave(
  supabase: Db,
  postId: string,
  userId: string
): Promise<{ saved: boolean; save_count: number }> {
  const { data: existing } = await supabase
    .from("post_saves")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    await supabase.from("post_saves").delete().eq("id", (existing as { id: string }).id);
  } else {
    await supabase.from("post_saves").insert({ post_id: postId, user_id: userId } as never);
  }

  const { data: post } = await supabase
    .from("community_posts")
    .select("save_count")
    .eq("id", postId)
    .single();

  return {
    saved: !existing,
    save_count: (post as { save_count: number } | null)?.save_count ?? 0,
  };
}

export async function isPostSavedByUser(
  supabase: Db,
  postId: string,
  userId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("post_saves")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();
  return Boolean(data);
}
