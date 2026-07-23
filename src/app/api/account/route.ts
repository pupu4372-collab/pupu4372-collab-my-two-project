import { getBearerToken, getUserIdFromRequest } from "@/lib/supabase/auth-server";
import { recordWithdrawnEmail } from "@/lib/auth/withdrawn-accounts";
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

  // ① Capture email before hard delete (auth.users row will be gone after).
  let emailForHash: string | null = null;
  try {
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    if (userError) {
      console.error("[WITHDRAWN_ACCOUNTS] get_user_failed", { message: userError.message });
    } else {
      emailForHash = userData.user?.email?.trim() || null;
    }
  } catch (err) {
    console.error("[WITHDRAWN_ACCOUNTS] get_user_failed", {
      message: err instanceof Error ? err.message : String(err),
    });
  }

  // ② Hard delete
  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // ③ Record hash only after successful delete (best-effort; never fail the response).
  await recordWithdrawnEmail(emailForHash);

  return NextResponse.json({ ok: true });
}
