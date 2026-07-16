import { requireAdminResponse } from "@/lib/admin/auth";
import { fetchAdminRecentPosts, isAdminPostBoardFilter } from "@/lib/admin/moderation";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const gate = await requireAdminResponse(request);
  if ("response" in gate) return gate.response;

  const { searchParams } = new URL(request.url);
  const boardParam = searchParams.get("board");
  const board = isAdminPostBoardFilter(boardParam) ? boardParam : "all";

  try {
    const page = await fetchAdminRecentPosts(40, board);
    return NextResponse.json(page);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Service unavailable.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
