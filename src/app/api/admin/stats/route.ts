import { requireAdminResponse } from "@/lib/admin/auth";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const gate = await requireAdminResponse(request);
  if ("response" in gate) return gate.response;

  try {
    const supabase = getSupabaseServiceRoleClient();
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
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stats unavailable.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
