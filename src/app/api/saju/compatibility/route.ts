import { computeCompatibility } from "@/lib/saju/compatibility/engine";
import { persistCompatibilityResult } from "@/lib/saju/persist-compatibility";
import { validatePetName } from "@/lib/saju/moderation";
import { hasPetPremiumUnlock } from "@/lib/payments/portone/entitlement";
import type { Gender, Locale, Species } from "@/lib/saju/types";
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

  if (!body.species || !["dog", "cat", "other"].includes(String(body.species))) {
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
    petBirthTime: (body.petBirthTime as string) ?? null,
    petBirthTimeUnknown: Boolean(body.petBirthTimeUnknown),
    ownerBirthDate: String(body.ownerBirthDate),
    ownerBirthTime: (body.ownerBirthTime as string) ?? null,
    ownerBirthTimeUnknown: Boolean(body.ownerBirthTimeUnknown),
    timezone: body.timezone as string,
    locale,
  };

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
      String(body.petId ?? "") || null
    );

    if (!unlocked) {
      return NextResponse.json({ error: "premium_required" }, { status: 403 });
    }
  }
  // ─────────────────────────────────────────────────────────

  try {
    const result = computeCompatibility(requestPayload);

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
