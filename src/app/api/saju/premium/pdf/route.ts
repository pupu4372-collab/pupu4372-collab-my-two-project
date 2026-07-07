import { isPetSpecies } from "@/lib/pets/species";
import { checkPetPremiumLlmGate } from "@/lib/payments/pet-premium-llm-gate";
import { validatePetName } from "@/lib/saju/moderation";
import type { Locale } from "@/lib/saju/types";
import { buildPetPremiumPdfPayload } from "@/lib/reports/pet-premium/build-payload";
import { buildPetPremiumPdfFilename } from "@/lib/reports/pet-premium/filename";
import { renderPetPremiumPdf } from "@/lib/reports/pet-premium/pdf";
import type { PetPremiumPdfRequest } from "@/lib/reports/pet-premium/types";
import { NextResponse } from "next/server";

function isValidDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
}

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const petNameError = validatePetName(String(body.petName ?? ""));
  if (petNameError) {
    return NextResponse.json({ error: petNameError }, { status: 400 });
  }

  if (!body.species || !isPetSpecies(String(body.species))) {
    return NextResponse.json({ error: "Invalid species." }, { status: 400 });
  }

  const birthDate = String(body.birthDate ?? "");
  if (!isValidDate(birthDate)) {
    return NextResponse.json({ error: "Invalid birth date." }, { status: 400 });
  }

  const timezone = String(body.timezone ?? "Asia/Seoul");
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
  } catch {
    return NextResponse.json({ error: "Invalid timezone." }, { status: 400 });
  }

  const locale: Locale = body.locale === "en" ? "en" : "ko";
  const petId = body.petId ? String(body.petId) : null;

  const gateError = await checkPetPremiumLlmGate(request, petId);
  if (gateError) {
    return NextResponse.json({ error: gateError.error }, { status: gateError.status });
  }

  const pdfRequest: PetPremiumPdfRequest = {
    petName: String(body.petName).trim(),
    species: body.species as PetPremiumPdfRequest["species"],
    petGender:
      body.petGender === "male" || body.petGender === "female" ? body.petGender : undefined,
    birthDate,
    birthTime: (body.birthTime as string) ?? null,
    birthTimeUnknown: Boolean(body.birthTimeUnknown ?? !body.birthTime),
    timezone,
    locale,
    petId,
    mbtiType: body.mbtiType ? String(body.mbtiType) : undefined,
    mbtiAnswers:
      body.mbtiAnswers && typeof body.mbtiAnswers === "object" && !Array.isArray(body.mbtiAnswers)
        ? (body.mbtiAnswers as Record<string, string>)
        : undefined,
    ownerName: body.ownerName ? String(body.ownerName) : undefined,
    ownerGender:
      body.ownerGender === "male" || body.ownerGender === "female" ? body.ownerGender : undefined,
    ownerBirthDate: body.ownerBirthDate ? String(body.ownerBirthDate) : undefined,
    ownerBirthTime: (body.ownerBirthTime as string) ?? null,
    ownerBirthTimeUnknown: Boolean(body.ownerBirthTimeUnknown ?? !body.ownerBirthTime),
    privacyConsent: Boolean(body.privacyConsent),
  };

  try {
    const payload = await buildPetPremiumPdfPayload(pdfRequest);
    const pdf = await renderPetPremiumPdf(payload);
    const { display, asciiFallback } = buildPetPremiumPdfFilename(payload.petName, locale);

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
