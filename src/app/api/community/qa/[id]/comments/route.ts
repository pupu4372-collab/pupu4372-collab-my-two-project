import { createQaComment } from "@/lib/community/qa-detail";
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
  const { id } = await params;
  const userId = await getUserIdFromRequest(request);
  const token = getBearerToken(request);

  if (!userId || !token) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  const supabase = createUserSupabaseClient(token);
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });
  }

  let body: { content?: string; parentId?: string | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (!body.content?.trim() || body.content.trim().length < 2) {
    return NextResponse.json({ error: "Comment must be at least 2 characters." }, { status: 400 });
  }

  try {
    const comment = await createQaComment(supabase, {
      postId: id,
      authorId: userId,
      content: body.content,
      parentId: body.parentId,
    });
    return NextResponse.json({ comment }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create comment.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
