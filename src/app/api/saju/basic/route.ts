import { computeBasicSaju } from "@/lib/saju/engine";
import { validatePetName } from "@/lib/saju/moderation";
import { persistSajuResult } from "@/lib/saju/persist";
import type { Gender, Locale, Species, SajuBasicRequest } from "@/lib/saju/types";
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

  const petGender =
    body.petGender === "male" || body.petGender === "female"
      ? (body.petGender as Gender)
      : null;

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

  const sajuRequest: SajuBasicRequest = {
    petName: (body.petName ?? "").trim(),
    species: body.species as Species,
    petGender,
    birthDate: body.birthDate,
    birthTime: body.birthTime ?? null,
    birthTimeUnknown: Boolean(body.birthTimeUnknown),
    timezone: body.timezone,
    locale,
    privacyConsent: true,
  };

  try {
    const result = computeBasicSaju(sajuRequest);

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
          const saved = await persistSajuResult(userClient, {
            request: sajuRequest,
            result,
            ownerId,
          });
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
    const message = err instanceof Error ? err.message : "Calculation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
