import {
  createUserSupabaseClient,
  getBearerToken,
  getUserIdFromRequest,
} from "@/lib/supabase/auth-server";
import type { CommunityPost } from "@/lib/supabase/types";
import { NextResponse } from "next/server";

const POST_SELECT =
  "id, author_id, pet_id, channel, post_type, title, content, image_urls, tags, language, country_code, like_count, comment_count, view_count, is_hidden, is_pinned, created_at, updated_at";

export async function GET(request: Request) {
  const userId = await getUserIdFromRequest(request);
  const token = getBearerToken(request);

  if (!userId || !token) {
    return NextResponse.json({ error: "Login required.", posts: [] }, { status: 401 });
  }

  const supabase = createUserSupabaseClient(token);
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured.", posts: [] }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("community_posts")
    .select(POST_SELECT)
    .eq("author_id", userId)
    .eq("post_type", "photo_show")
    .eq("is_hidden", false)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    return NextResponse.json({ error: error.message, posts: [] }, { status: 500 });
  }

  return NextResponse.json({ posts: (data ?? []) as CommunityPost[] });
}
