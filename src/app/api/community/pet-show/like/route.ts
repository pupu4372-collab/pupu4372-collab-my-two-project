import { togglePostLike } from "@/lib/community/posts";
import {
  createUserSupabaseClient,
  getBearerToken,
  getUserIdFromRequest,
} from "@/lib/supabase/auth-server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const userId = await getUserIdFromRequest(request);
  const token = getBearerToken(request);

  if (!userId || !token) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  const supabase = createUserSupabaseClient(token);
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });
  }

  let body: { postId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (!body.postId) {
    return NextResponse.json({ error: "postId is required." }, { status: 400 });
  }

  try {
    const result = await togglePostLike(supabase, body.postId, userId);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Like failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
