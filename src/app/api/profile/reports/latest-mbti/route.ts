import {
  createUserSupabaseClient,
  getBearerToken,
  getRegisteredUserIdFromRequest,
} from "@/lib/supabase/auth-server";
import { isVisibleInVault } from "@/lib/reports/vault-policy";
import type { SajuResultRow } from "@/lib/supabase/types";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const ownerId = await getRegisteredUserIdFromRequest(request);
  const token = getBearerToken(request);

  if (!ownerId || !token) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const petId = new URL(request.url).searchParams.get("petId");
  if (!petId) {
    return NextResponse.json({ error: "petId required." }, { status: 400 });
  }

  const supabase = createUserSupabaseClient(token);
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("saju_results")
    .select("id, saju_type, created_at, is_premium")
    .eq("owner_id", ownerId)
    .eq("pet_id", petId)
    .eq("saju_type", "mbti")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const row = data as Pick<SajuResultRow, "id" | "saju_type" | "created_at" | "is_premium"> | null;
  if (!row || !isVisibleInVault(row)) {
    return NextResponse.json({ id: null });
  }

  return NextResponse.json({ id: row.id });
}
