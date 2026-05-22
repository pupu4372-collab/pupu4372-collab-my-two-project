import { persistZodiacFortune } from "@/lib/saju/persist-zodiac";
import { computeZodiacFortune } from "@/lib/saju/zodiac/engine";
import { validatePetName } from "@/lib/saju/moderation";
import type { Locale, Species } from "@/lib/saju/types";
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
    locale?: string;
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

  if (!body.species || !["dog", "cat"].includes(body.species)) {
    return NextResponse.json({ error: "Invalid species." }, { status: 400 });
  }

  if (!body.birthDate || !isValidDate(body.birthDate)) {
    return NextResponse.json({ error: "Invalid birth date." }, { status: 400 });
  }

  const locale: Locale = body.locale === "en" ? "en" : "ko";

  const requestPayload = {
    petName: (body.petName ?? "").trim(),
    species: body.species as Species,
    birthDate: body.birthDate,
    locale,
  };

  try {
    const result = computeZodiacFortune(requestPayload);

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
