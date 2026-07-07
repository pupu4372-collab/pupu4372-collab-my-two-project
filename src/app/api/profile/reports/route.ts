import {
  createUserSupabaseClient,
  getBearerToken,
  getUserIdFromRequest,
} from "@/lib/supabase/auth-server";
import type { Pet, SajuResultRow } from "@/lib/supabase/types";
import {
  isVisibleInVault,
  vaultMetaForReport,
  type VaultReportRow,
} from "@/lib/reports/vault-policy";
import { NextResponse } from "next/server";

const REPORT_SELECT =
  "id, pet_id, owner_id, saju_type, analysis_mode, birth_basis, pillars, five_elements, dominant_element, title, summary, storytelling_payload, is_premium, created_at";

const PET_SELECT =
  "id, owner_id, name, species, breed, gender, birth_date, birth_time, birth_time_unknown, birth_timezone, profile_image_url, personality_tags, created_at, updated_at";

export async function GET(request: Request) {
  const ownerId = await getUserIdFromRequest(request);
  const token = getBearerToken(request);

  if (!ownerId || !token) {
    return NextResponse.json({ error: "Authentication required.", reports: [] }, { status: 401 });
  }

  const supabase = createUserSupabaseClient(token);
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured.", reports: [] }, { status: 503 });
  }

  const { data: reports, error } = await supabase
    .from("saju_results")
    .select(REPORT_SELECT)
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message, reports: [] }, { status: 500 });
  }

  const reportRows = ((reports ?? []) as SajuResultRow[]).filter(isVisibleInVault);
  const petIds = [...new Set(reportRows.map((report) => report.pet_id))];
  const petsById = new Map<string, Pet>();

  if (petIds.length > 0) {
    const { data: pets } = await supabase
      .from("pets")
      .select(PET_SELECT)
      .in("id", petIds)
      .eq("owner_id", ownerId);

    for (const pet of (pets ?? []) as Pet[]) {
      petsById.set(pet.id, pet);
    }
  }

  const enriched: VaultReportRow[] = reportRows.map((report) => ({
    ...report,
    pet: petsById.get(report.pet_id) ?? null,
    vault: vaultMetaForReport(report),
  }));

  return NextResponse.json({
    reports: enriched,
    premiumReports: enriched.filter((report) => report.vault.tier === "premium"),
    freeReports: enriched.filter((report) => report.vault.tier === "free"),
  });
}
