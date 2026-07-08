import { checkPetPremiumLlmGate } from "@/lib/payments/pet-premium-llm-gate";
import { buildPetPremiumPdfFilename } from "@/lib/reports/pet-premium/filename";
import { renderPetPremiumPdf } from "@/lib/reports/pet-premium/pdf";
import { buildPetPremiumPdfPayloadFromDb } from "@/lib/reports/pet-premium/stored-sections";
import type { Locale } from "@/lib/saju/types";
import { getPetOwnedByUser } from "@/lib/saju/verify-pet-owner";
import {
  createUserSupabaseClient,
  getBearerToken,
  getRegisteredUserIdFromRequest,
} from "@/lib/supabase/auth-server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const petId = body.petId ? String(body.petId).trim() : "";
  if (!petId) {
    return NextResponse.json({ error: "petId required." }, { status: 400 });
  }

  const locale: Locale = body.locale === "en" ? "en" : "ko";

  const ownerId = await getRegisteredUserIdFromRequest(request);
  const token = getBearerToken(request);
  if (!ownerId || !token) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const gateError = await checkPetPremiumLlmGate(request, petId);
  if (gateError) {
    return NextResponse.json({ error: gateError.error }, { status: gateError.status });
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

    const built = await buildPetPremiumPdfPayloadFromDb(supabase, ownerId, petId, locale, ownedPet);
    if ("error" in built) {
      if (built.error === "pet_not_found") {
        return NextResponse.json({ error: "Pet not found." }, { status: 404 });
      }
      return NextResponse.json({ error: "sections_incomplete" }, { status: 400 });
    }

    const pdf = await renderPetPremiumPdf(built.payload);
    const { display, asciiFallback } = buildPetPremiumPdfFilename(built.payload.petName, locale);

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encodeURIComponent(display)}`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "PDF generation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
