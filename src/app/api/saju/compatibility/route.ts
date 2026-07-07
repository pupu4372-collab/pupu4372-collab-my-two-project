import { isPetSpecies } from "@/lib/pets/species";
import { checkPetPremiumLlmGate } from "@/lib/payments/pet-premium-llm-gate";
import { enrichCompatibilityWithPremiumLlm } from "@/lib/saju/llm/pet-premium/orchestrator";
import { computeCompatibility } from "@/lib/saju/compatibility/engine";
import { persistCompatibilityResult } from "@/lib/saju/persist-compatibility";
import { validatePetName } from "@/lib/saju/moderation";
import type { Gender, Locale, Species } from "@/lib/saju/types";
import { normalizeBirthCalendarType } from "@/lib/saju/resolve-birth-date";
import {
  createUserSupabaseClient,
  getBearerToken,
  getUserIdFromRequest,
} from "@/lib/supabase/auth-server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { NextResponse } from "next/server";

function isValidDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
}

function isValidTime(s: string | null): boolean {
  if (s === null) return true;
  return /^\d{2}:\d{2}$/.test(s);
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.privacyConsent) {
    return NextResponse.json({ error: "Privacy consent is required." }, { status: 400 });
  }

  const petNameError = validatePetName(String(body.petName ?? ""));
  if (petNameError) {
    return NextResponse.json({ error: petNameError }, { status: 400 });
  }

  const ownerNameError = validatePetName(String(body.ownerName ?? ""));
  if (ownerNameError) {
    return NextResponse.json({ error: `Owner: ${ownerNameError}` }, { status: 400 });
  }

  if (!body.species || !isPetSpecies(String(body.species))) {
    return NextResponse.json({ error: "Invalid species." }, { status: 400 });
  }

  if (!body.petGender || !["male", "female"].includes(String(body.petGender))) {
    return NextResponse.json({ error: "Invalid pet gender." }, { status: 400 });
  }
  if (!body.ownerGender || !["male", "female"].includes(String(body.ownerGender))) {
    return NextResponse.json({ error: "Invalid owner gender." }, { status: 400 });
  }

  for (const key of ["petBirthDate", "ownerBirthDate"] as const) {
    const d = String(body[key] ?? "");
    if (!isValidDate(d)) {
      return NextResponse.json({ error: `Invalid ${key}.` }, { status: 400 });
    }
  }

  if (!isValidTime((body.petBirthTime as string) ?? null)) {
    return NextResponse.json({ error: "Invalid pet birth time." }, { status: 400 });
  }
  if (!isValidTime((body.ownerBirthTime as string) ?? null)) {
    return NextResponse.json({ error: "Invalid owner birth time." }, { status: 400 });
  }

  if (!body.timezone || typeof body.timezone !== "string") {
    return NextResponse.json({ error: "Timezone is required." }, { status: 400 });
  }

  try {
    Intl.DateTimeFormat(undefined, { timeZone: body.timezone as string });
  } catch {
    return NextResponse.json({ error: "Invalid timezone." }, { status: 400 });
  }

  const locale: Locale = body.locale === "en" ? "en" : "ko";

  const requestPayload = {
    petName: String(body.petName).trim(),
    ownerName: String(body.ownerName).trim(),
    species: body.species as Species,
    petGender: body.petGender as Gender,
    ownerGender: body.ownerGender as Gender,
    petBirthDate: String(body.petBirthDate),
    petCalendarType: normalizeBirthCalendarType(body.petCalendarType ?? body.calendarType),
    petBirthTime: (body.petBirthTime as string) ?? null,
    petBirthTimeUnknown: Boolean(body.petBirthTimeUnknown),
    ownerBirthDate: String(body.ownerBirthDate),
    ownerCalendarType: normalizeBirthCalendarType(body.ownerCalendarType),
    ownerBirthTime: (body.ownerBirthTime as string) ?? null,
    ownerBirthTimeUnknown: Boolean(body.ownerBirthTimeUnknown),
    timezone: body.timezone as string,
    locale,
  };

  const gateError = await checkPetPremiumLlmGate(request, String(body.petId ?? "") || null);
  if (gateError) {
    return NextResponse.json({ error: gateError.error }, { status: gateError.status });
  }

  try {
    const base = computeCompatibility(requestPayload);
    const result = await enrichCompatibilityWithPremiumLlm(base, {
      petBirthDate: requestPayload.petBirthDate,
      petBirthTime: requestPayload.petBirthTime,
      petBirthTimeUnknown: requestPayload.petBirthTimeUnknown,
      ownerBirthDate: requestPayload.ownerBirthDate,
      ownerBirthTime: requestPayload.ownerBirthTime,
      ownerBirthTimeUnknown: requestPayload.ownerBirthTimeUnknown,
      timezone: requestPayload.timezone,
      petId: String(body.petId ?? "") || null,
    });

    let persisted = false;
    let petId: string | null = null;
    let sajuResultId: string | null = null;
    let persistError: string | null = null;

    if (isSupabaseConfigured()) {
      const ownerId = await getUserIdFromRequest(request);
      const token = getBearerToken(request);
      const userClient = token ? createUserSupabaseClient(token) : null;

      if (ownerId && userClient) {
        try {
          const saved = await persistCompatibilityResult(
            userClient,
            ownerId,
            requestPayload,
            result
          );
          persisted = true;
          petId = saved.petId;
          sajuResultId = saved.sajuResultId;
        } catch (err) {
          persistError =
            err instanceof Error ? err.message : "Could not save to database.";
        }
      }
    }

    return NextResponse.json({
      ...result,
      persisted,
      petId,
      sajuResultId,
      persistError,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Compatibility failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
