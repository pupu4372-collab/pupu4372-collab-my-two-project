import { requireAdmin } from "@/lib/admin/auth";
import { setCommentHidden, setPostHidden, updateReportStatus } from "@/lib/admin/moderation";
import type { ReportStatus } from "@/lib/supabase/types";
import { NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const VALID_STATUSES = new Set<ReportStatus>(["pending", "reviewing", "resolved", "rejected"]);

export async function PATCH(request: Request, { params }: RouteContext) {
  const adminId = await requireAdmin(request);
  if (!adminId) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { id } = await params;
  let body: {
    status?: ReportStatus;
    action?: "hide_post" | "unhide_post" | "hide_comment" | "unhide_comment" | "none";
    postId?: string | null;
    commentId?: string | null;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const status = body.status ?? "reviewing";
  if (!VALID_STATUSES.has(status)) {
    return NextResponse.json({ error: "Invalid report status." }, { status: 400 });
  }

  if (body.action === "hide_post" || body.action === "unhide_post") {
    if (!body.postId) {
      return NextResponse.json({ error: "postId required." }, { status: 400 });
    }
    const ok = await setPostHidden(body.postId, body.action === "hide_post");
    if (!ok) {
      return NextResponse.json({ error: "Failed to update post." }, { status: 500 });
    }
  }

  if (body.action === "hide_comment" || body.action === "unhide_comment") {
    if (!body.commentId) {
      return NextResponse.json({ error: "commentId required." }, { status: 400 });
    }
    const ok = await setCommentHidden(body.commentId, body.action === "hide_comment");
    if (!ok) {
      return NextResponse.json({ error: "Failed to update comment." }, { status: 500 });
    }
  }

  const updated = await updateReportStatus(id, status);
  if (!updated) {
    return NextResponse.json({ error: "Failed to update report." }, { status: 500 });
  }

  return NextResponse.json({ id, status });
}
