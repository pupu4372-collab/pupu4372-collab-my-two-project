import {
  createUserSupabaseClient,
  getBearerToken,
  getUserIdFromRequest,
} from "@/lib/supabase/auth-server";
import { NextResponse } from "next/server";

const VALID_REASONS = new Set([
  "spam",
  "abuse",
  "adult",
  "privacy",
  "animal_harm",
  "misinformation",
  "other",
]);

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

  let body: {
    postId?: string | null;
    commentId?: string | null;
    reason?: string;
    detail?: string | null;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const postId = body.postId?.trim() || null;
  const commentId = body.commentId?.trim() || null;
  const reason = body.reason?.trim() ?? "";
  const detail = body.detail?.trim() || null;

  if ((!postId && !commentId) || (postId && commentId)) {
    return NextResponse.json({ error: "Report exactly one target." }, { status: 400 });
  }

  if (!VALID_REASONS.has(reason)) {
    return NextResponse.json({ error: "Invalid report reason." }, { status: 400 });
  }

  if (detail && detail.length > 1000) {
    return NextResponse.json({ error: "Report detail is too long." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("post_reports")
    .insert({
      post_id: postId,
      comment_id: commentId,
      reporter_id: userId,
      reason,
      detail,
    } as never)
    .select("id, status, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to submit report." }, { status: 500 });
  }

  return NextResponse.json({ report: data }, { status: 201 });
}
