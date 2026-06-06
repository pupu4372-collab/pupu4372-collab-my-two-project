import { requireAdmin } from "@/lib/admin/auth";
import { fetchAdminRecentPosts, isAdminPostBoardFilter } from "@/lib/admin/moderation";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const adminId = await requireAdmin(request);
  if (!adminId) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const boardParam = searchParams.get("board");
  const board = isAdminPostBoardFilter(boardParam) ? boardParam : "all";

  const page = await fetchAdminRecentPosts(40, board);
  return NextResponse.json(page);
}
