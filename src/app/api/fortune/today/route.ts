import { buildOwnerDailyFortune } from "@/lib/saju/owner-daily-fortune";
import type { Locale } from "@/lib/saju/types";
import {
  createUserSupabaseClient,
  getBearerToken,
  getUserIdFromRequest,
} from "@/lib/supabase/auth-server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale: Locale = searchParams.get("locale") === "en" ? "en" : "ko";
  const userId = await getUserIdFromRequest(request);
  const token = getBearerToken(request);

  if (!userId || !token) {
    return NextResponse.json({ fortune: null }, { status: 401 });
  }

  const supabase = createUserSupabaseClient(token);
  if (!supabase) {
    return NextResponse.json({ fortune: null }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("saju_results")
    .select("birth_basis")
    .eq("owner_id", userId)
    .eq("saju_type", "compatibility")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ fortune: null });
  }

  const birthBasis = (data as { birth_basis?: Record<string, unknown> }).birth_basis;
  const fortune = birthBasis ? buildOwnerDailyFortune(birthBasis, locale) : null;

  return NextResponse.json({ fortune });
}
