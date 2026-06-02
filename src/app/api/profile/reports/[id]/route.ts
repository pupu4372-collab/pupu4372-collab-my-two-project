import {
  createUserSupabaseClient,
  getBearerToken,
  getUserIdFromRequest,
} from "@/lib/supabase/auth-server";
import type { Pet, SajuResultRow } from "@/lib/supabase/types";
import { NextResponse } from "next/server";

const REPORT_SELECT =
  "id, pet_id, owner_id, saju_type, analysis_mode, birth_basis, pillars, five_elements, dominant_element, title, summary, storytelling_payload, is_premium, created_at";

const PET_SELECT =
  "id, owner_id, name, species, breed, gender, birth_date, birth_time, birth_time_unknown, birth_timezone, profile_image_url, personality_tags, created_at, updated_at";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ownerId = await getUserIdFromRequest(request);
  const token = getBearerToken(request);

  if (!ownerId || !token) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const supabase = createUserSupabaseClient(token);
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });
  }

  const { id } = await params;
  const { data: report, error } = await supabase
    .from("saju_results")
    .select(REPORT_SELECT)
    .eq("id", id)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!report) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }

  const reportRow = report as SajuResultRow;
  const { data: pet } = await supabase
    .from("pets")
    .select(PET_SELECT)
    .eq("id", reportRow.pet_id)
    .eq("owner_id", ownerId)
    .maybeSingle();

  return NextResponse.json({
    report: {
      ...reportRow,
      pet: (pet as Pet | null) ?? null,
    },
  });
}
