import { isPetSpecies } from "@/lib/pets/species";
import { persistZodiacFortune } from "@/lib/saju/persist-zodiac";
import { computeZodiacFortune } from "@/lib/saju/zodiac/engine";
import { validatePetName } from "@/lib/saju/moderation";
import { hasPetPremiumUnlock } from "@/lib/payments/portone/entitlement";
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

  // ── 유료 게이트 ──────────────────────────────────────────
  if (isSupabaseConfigured()) {
    const userId = await getUserIdFromRequest(request);
    const token = getBearerToken(request);
    const userClient = token ? createUserSupabaseClient(token) : null;

    if (!userId || !userClient) {
      return NextResponse.json({ error: "login_required" }, { status: 401 });
    }

    const unlocked = await hasPetPremiumUnlock(
      userClient,
      userId,
      "pet_premium_v1",
      body.petId
    );

    if (!unlocked) {
      return NextResponse.json({ error: "premium_required" }, { status: 403 });
    }
  }
  // ─────────────────────────────────────────────────────────

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
