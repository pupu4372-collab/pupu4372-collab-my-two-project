import { isPetSpecies } from "@/lib/pets/species";
import { checkPetPremiumLlmGate } from "@/lib/payments/pet-premium-llm-gate";
import { persistZodiacFortune } from "@/lib/saju/persist-zodiac";
import { enrichZodiacWithPremiumLlm } from "@/lib/saju/llm/pet-premium/orchestrator";
import { computeZodiacFortune } from "@/lib/saju/zodiac/engine";
import { validatePetName } from "@/lib/saju/moderation";
import type { Locale, Species } from "@/lib/saju/types";
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

export async function POST(request: Request) {
  let body: {
    petName?: string;
    species?: string;
    birthDate?: string;
    calendarType?: string;
    birthTime?: string | null;
    birthTimeUnknown?: boolean;
    timezone?: string;
    locale?: string;
    petId?: string | null;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const nameError = validatePetName(body.petName ?? "");
  if (nameError) {
    return NextResponse.json({ error: nameError }, { status: 400 });
  }

  if (!body.species || !isPetSpecies(body.species)) {
    return NextResponse.json({ error: "Invalid species." }, { status: 400 });
  }

  if (!body.birthDate || !isValidDate(body.birthDate)) {
    return NextResponse.json({ error: "Invalid birth date." }, { status: 400 });
  }

  const gateError = await checkPetPremiumLlmGate(request, body.petId ?? null);
  if (gateError) {
    return NextResponse.json({ error: gateError.error }, { status: gateError.status });
  }

  const locale: Locale = body.locale === "en" ? "en" : "ko";

  const requestPayload = {
    petName: (body.petName ?? "").trim(),
    species: body.species as Species,
    birthDate: body.birthDate,
    calendarType: normalizeBirthCalendarType(body.calendarType),
    locale,
  };

  const enrichInput = {
    birthDate: requestPayload.birthDate,
    birthTime: body.birthTime ?? null,
    birthTimeUnknown: Boolean(body.birthTimeUnknown ?? !body.birthTime),
    timezone: body.timezone ?? "Asia/Seoul",
    petId: body.petId ?? null,
  };

  try {
    const base = computeZodiacFortune(requestPayload);
    const result = await enrichZodiacWithPremiumLlm(base, enrichInput);

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
          const saved = await persistZodiacFortune(
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
    const message = err instanceof Error ? err.message : "Zodiac calculation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
