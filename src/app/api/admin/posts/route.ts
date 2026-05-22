import { requireAdmin } from "@/lib/admin/auth";
import { fetchAdminRecentPosts } from "@/lib/admin/moderation";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const adminId = await requireAdmin(request);
  if (!adminId) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const page = await fetchAdminRecentPosts(40);
  return NextResponse.json(page);
}
