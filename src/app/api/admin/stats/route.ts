import { requireAdmin } from "@/lib/admin/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const adminId = await requireAdmin(request);
  if (!adminId) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({
      source: "mock",
      users: 128,
      pets: 96,
      photoPosts: 42,
      qaPosts: 50,
      comments: 50,
      payments: 8,
      sajuResults: 104,
    });
  }

  const [pets, photoPosts, qaPosts, comments, payments, saju] = await Promise.all([
    supabase.from("pets").select("id", { count: "exact", head: true }),
    supabase
      .from("community_posts")
      .select("id", { count: "exact", head: true })
      .eq("post_type", "photo_show"),
    supabase
      .from("community_posts")
      .select("id", { count: "exact", head: true })
      .eq("post_type", "qa"),
    supabase.from("post_comments").select("id", { count: "exact", head: true }),
    supabase
      .from("payments")
      .select("id", { count: "exact", head: true })
      .eq("status", "captured"),
    supabase.from("saju_results").select("id", { count: "exact", head: true }),
  ]);

  return NextResponse.json({
    source: "supabase",
    pets: pets.count ?? 0,
    photoPosts: photoPosts.count ?? 0,
    qaPosts: qaPosts.count ?? 0,
    comments: comments.count ?? 0,
    payments: payments.count ?? 0,
    sajuResults: saju.count ?? 0,
  });
}
