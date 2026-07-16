import { requireAdminResponse } from "@/lib/admin/auth";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const gate = await requireAdminResponse(request);
  if ("response" in gate) return gate.response;

  try {
    const supabase = getSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from("support_inquiries")
      .select(
        "id, user_id, name, email, category, title, message, status, admin_note, created_at, updated_at, resolved_at"
      )
      .order("created_at", { ascending: false })
      .limit(80);

    if (error) {
      return NextResponse.json({ error: "Failed to load support inquiries." }, { status: 500 });
    }

    return NextResponse.json({ inquiries: data ?? [], source: "supabase" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Service unavailable.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
