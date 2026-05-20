import { computeBasicSaju } from "@/lib/saju/engine";
import { validatePetName } from "@/lib/saju/moderation";
import type { Locale, Species, SajuBasicRequest } from "@/lib/saju/types";
import { NextResponse } from "next/server";

function isValidDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
}

function isValidTime(s: string | null): boolean {
  if (s === null) return true;
  return /^\d{2}:\d{2}$/.test(s);
}

export async function POST(request: Request) {
  let body: Partial<SajuBasicRequest>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.privacyConsent) {
    return NextResponse.json(
      { error: "Privacy consent is required." },
      { status: 400 }
    );
  }

  const nameError = validatePetName(body.petName ?? "");
  if (nameError) {
    return NextResponse.json({ error: nameError }, { status: 400 });
  }

  if (!body.species || !["dog", "cat"].includes(body.species)) {
    return NextResponse.json({ error: "Invalid species." }, { status: 400 });
  }

  if (!body.birthDate || !isValidDate(body.birthDate)) {
    return NextResponse.json({ error: "Invalid birth date." }, { status: 400 });
  }

  if (!isValidTime(body.birthTime ?? null)) {
    return NextResponse.json({ error: "Invalid birth time." }, { status: 400 });
  }

  if (!body.timezone || typeof body.timezone !== "string") {
    return NextResponse.json({ error: "Timezone is required." }, { status: 400 });
  }

  try {
    Intl.DateTimeFormat(undefined, { timeZone: body.timezone });
  } catch {
    return NextResponse.json({ error: "Invalid timezone." }, { status: 400 });
  }

  const locale: Locale = body.locale === "ko" ? "ko" : "en";

  try {
    const result = computeBasicSaju({
      petName: (body.petName ?? "").trim(),
      species: body.species as Species,
      birthDate: body.birthDate,
      birthTime: body.birthTime ?? null,
      birthTimeUnknown: Boolean(body.birthTimeUnknown),
      timezone: body.timezone,
      locale,
      privacyConsent: true,
    });

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Calculation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
