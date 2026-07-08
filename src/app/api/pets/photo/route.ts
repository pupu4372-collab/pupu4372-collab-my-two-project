import { uploadPetFortunePhoto } from "@/lib/pets/upload-pet-fortune-photo";
import { getPetOwnedByUser } from "@/lib/saju/verify-pet-owner";
import {
  createUserSupabaseClient,
  getBearerToken,
  getUserIdFromRequest,
} from "@/lib/supabase/auth-server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const ownerId = await getUserIdFromRequest(request);
  const token = getBearerToken(request);

  if (!ownerId || !token) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  const supabase = createUserSupabaseClient(token);
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const file = formData.get("file");
  const petId = formData.get("petId");
  const consentRaw = formData.get("photoConsentSecondaryUse");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Image file is required." }, { status: 400 });
  }

  if (typeof petId !== "string" || !petId.trim()) {
    return NextResponse.json({ error: "Pet id is required." }, { status: 400 });
  }

  const owned = await getPetOwnedByUser(supabase, ownerId, petId.trim());
  if (!owned) {
    return NextResponse.json({ error: "Pet not found." }, { status: 404 });
  }

  const photoConsentSecondaryUse =
    consentRaw === "true" || consentRaw === "1" || consentRaw === "on";

  try {
    const photoUrl = await uploadPetFortunePhoto(
      supabase,
      ownerId,
      petId.trim(),
      file,
      photoConsentSecondaryUse
    );
    return NextResponse.json({ photoUrl, photoConsentSecondaryUse });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
