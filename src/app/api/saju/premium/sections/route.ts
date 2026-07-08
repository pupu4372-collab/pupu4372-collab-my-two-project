import {
  createUserSupabaseClient,
  getBearerToken,
  getRegisteredUserIdFromRequest,
} from "@/lib/supabase/auth-server";
import { loadPetPremiumStoredSections } from "@/lib/reports/pet-premium/stored-sections";
import { getPetOwnedByUser } from "@/lib/saju/verify-pet-owner";
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

  try {
    const ownedPet = await getPetOwnedByUser(supabase, ownerId, petId);
    if (!ownedPet) {
      return NextResponse.json({ error: "Pet not found." }, { status: 404 });
    }

    const stored = await loadPetPremiumStoredSections(supabase, ownerId, petId, ownedPet);
    if (!stored) {
      return NextResponse.json({ error: "Pet not found." }, { status: 404 });
    }

    return NextResponse.json({
      petId,
      completion: stored.completion,
      resultIds: stored.resultIds,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load premium sections.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
