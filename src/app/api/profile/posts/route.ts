import { COMMUNITY_POST_SELECT } from "@/lib/community/post-select";
import {
  createUserSupabaseClient,
  getBearerToken,
  getUserIdFromRequest,
} from "@/lib/supabase/auth-server";
import type { CommunityPost } from "@/lib/supabase/types";
import { NextResponse } from "next/server";

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
    .select(COMMUNITY_POST_SELECT)
    .eq("author_id", userId)
    .eq("is_hidden", false)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message, posts: [] }, { status: 500 });
  }

  return NextResponse.json({ posts: (data ?? []) as CommunityPost[] });
}

export async function PATCH(request: Request) {
  const userId = await getUserIdFromRequest(request);
  const token = getBearerToken(request);

  if (!userId || !token) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  let body: { id?: string; title?: string; content?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const id = body.id?.trim();
  const title = body.title?.trim();
  const content = body.content?.trim();

  if (!id) return NextResponse.json({ error: "Post id is required." }, { status: 400 });
  if (!title) return NextResponse.json({ error: "Title is required." }, { status: 400 });
  if (!content || content.length < 10) {
    return NextResponse.json({ error: "Content must be at least 10 characters." }, { status: 400 });
  }

  const supabase = createUserSupabaseClient(token);
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("community_posts")
    .update({ title, content } as never)
    .eq("id", id)
    .eq("author_id", userId)
    .eq("is_hidden", false)
    .select(COMMUNITY_POST_SELECT)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Failed to update post." }, { status: 500 });
  }

  return NextResponse.json({ post: data as CommunityPost });
}
