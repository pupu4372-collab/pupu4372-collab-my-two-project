import { getBearerToken, getUserIdFromRequest } from "@/lib/supabase/auth-server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  const userId = await getUserIdFromRequest(request);
  const token = getBearerToken(request);

  if (!userId || !token) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Supabase admin is not configured." }, { status: 503 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  if ((profile as { role?: string } | null)?.role === "admin") {
    return NextResponse.json(
      { error: "Admin accounts cannot be deleted from this screen." },
      { status: 403 }
    );
  }

  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
