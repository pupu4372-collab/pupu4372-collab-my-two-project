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
    return NextResponse.json({ inquiries: [], source: "mock" });
  }

  const { data, error } = await supabase
    .from("support_inquiries")
    .select("id, user_id, name, email, category, title, message, status, admin_note, created_at, updated_at, resolved_at")
    .order("created_at", { ascending: false })
    .limit(80);

  if (error) {
    return NextResponse.json({ error: "Failed to load support inquiries." }, { status: 500 });
  }

  return NextResponse.json({ inquiries: data ?? [], source: "supabase" });
}
