import { adoptQaAnswer } from "@/lib/community/qa-adopt";
import { isUuid } from "@/lib/community/slug";
import {
  createUserSupabaseClient,
  getBearerToken,
  getUserIdFromRequest,
} from "@/lib/supabase/auth-server";
import { NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteContext) {
  const { id: postId } = await params;
  const userId = await getUserIdFromRequest(request);
  const token = getBearerToken(request);

  if (!userId || !token) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  const supabase = createUserSupabaseClient(token);
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });
  }

  let body: { commentId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (!body.commentId) {
    return NextResponse.json({ error: "commentId is required." }, { status: 400 });
  }

  let resolvedPostId = postId;
  if (!isUuid(postId)) {
    const { data: row } = await supabase
      .from("community_posts")
      .select("id")
      .eq("seo_slug", postId)
      .eq("post_type", "qa")
      .maybeSingle();
    if (!row) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }
    resolvedPostId = (row as { id: string }).id;
  }

  try {
    const post = await adoptQaAnswer(supabase, resolvedPostId, body.commentId, userId);
    return NextResponse.json({ post });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to adopt answer.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
