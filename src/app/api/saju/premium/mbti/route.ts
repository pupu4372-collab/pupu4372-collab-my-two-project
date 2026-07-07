import { isPetSpecies } from "@/lib/pets/species";
import { buildPetMbtiResultFromType } from "@/lib/pet/mbti-inference";
import { generatePetMbtiPremiumInsight } from "@/lib/saju/llm/pet-premium/orchestrator";
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

  const petNameError = validatePetName(String(body.petName ?? ""));
  if (petNameError) {
    return NextResponse.json({ error: petNameError }, { status: 400 });
  }

  if (!body.species || !isPetSpecies(String(body.species))) {
    return NextResponse.json({ error: "Invalid species." }, { status: 400 });
  }

  const mbtiType = String(body.mbtiType ?? "").trim().toUpperCase();
  if (!/^[EI][SN][TF][JP]$/.test(mbtiType)) {
    return NextResponse.json({ error: "Invalid MBTI type." }, { status: 400 });
  }

  const birthDate = String(body.birthDate ?? "");
  if (!isValidDate(birthDate)) {
    return NextResponse.json({ error: "Invalid birth date." }, { status: 400 });
  }

  if (!isValidTime((body.birthTime as string) ?? null)) {
    return NextResponse.json({ error: "Invalid birth time." }, { status: 400 });
  }

  const timezone = String(body.timezone ?? "Asia/Seoul");
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
  } catch {
    return NextResponse.json({ error: "Invalid timezone." }, { status: 400 });
  }

  const locale: Locale = body.locale === "en" ? "en" : "ko";
  const petGender: Gender | undefined =
    body.petGender === "male" || body.petGender === "female"
      ? body.petGender
      : undefined;

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

  try {
    const mbti = buildPetMbtiResultFromType(mbtiType);
    if (!mbti) {
      return NextResponse.json({ error: "Invalid MBTI type." }, { status: 400 });
    }
    const insight = await generatePetMbtiPremiumInsight({
      petName: String(body.petName).trim(),
      species: body.species as Species,
      petGender,
      birthDate,
      birthTime: (body.birthTime as string) ?? null,
      birthTimeUnknown: Boolean(body.birthTimeUnknown ?? !body.birthTime),
      timezone,
      locale,
      mbti,
      petId: body.petId ? String(body.petId) : null,
    });

    return NextResponse.json(insight);
  } catch (err) {
    const message = err instanceof Error ? err.message : "MBTI premium generation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
