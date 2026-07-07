import { isPetSpecies } from "@/lib/pets/species";
import {
  buildPetMbtiResult,
  buildPetMbtiResultFromType,
  isPetMbtiComplete,
  scoresFromAnswers,
} from "@/lib/pet/mbti-inference";
import { checkPetPremiumLlmGate } from "@/lib/payments/pet-premium-llm-gate";
import { generatePetMbtiPremiumInsight } from "@/lib/saju/llm/pet-premium/orchestrator";
import { validatePetName } from "@/lib/saju/moderation";
import { persistMbtiPremiumResult } from "@/lib/saju/persist-mbti";
import { normalizeBirthCalendarType } from "@/lib/saju/resolve-birth-date";
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

function parseMbtiAnswers(body: Record<string, unknown>): Record<string, string> | null {
  const raw = body.mbtiAnswers;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const answers: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string" && value.trim()) {
      answers[key] = value.trim();
    }
  }
  return isPetMbtiComplete(answers) ? answers : null;
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

  const gateError = await checkPetPremiumLlmGate(
    request,
    body.petId ? String(body.petId) : null
  );
  if (gateError) {
    return NextResponse.json({ error: gateError.error }, { status: gateError.status });
  }

  try {
    const mbtiAnswers = parseMbtiAnswers(body);
    const mbti = mbtiAnswers
      ? buildPetMbtiResult(scoresFromAnswers(mbtiAnswers))
      : buildPetMbtiResultFromType(mbtiType);

    if (!mbti) {
      return NextResponse.json({ error: "Invalid MBTI type." }, { status: 400 });
    }

    if (mbti.type !== mbtiType) {
      return NextResponse.json({ error: "MBTI type does not match survey answers." }, { status: 400 });
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
      mbtiAnswers: mbtiAnswers ?? undefined,
    });

    let persisted = false;
    let petId: string | null = body.petId ? String(body.petId) : null;
    let sajuResultId: string | null = null;
    let persistError: string | null = null;

    if (isSupabaseConfigured()) {
      const ownerId = await getUserIdFromRequest(request);
      const token = getBearerToken(request);
      const userClient = token ? createUserSupabaseClient(token) : null;

      if (ownerId && userClient) {
        try {
          const saved = await persistMbtiPremiumResult(userClient, ownerId, {
            petName: String(body.petName).trim(),
            species: body.species as Species,
            petGender,
            birthDate,
            calendarType: normalizeBirthCalendarType(body.calendarType),
            birthTime: (body.birthTime as string) ?? null,
            birthTimeUnknown: Boolean(body.birthTimeUnknown ?? !body.birthTime),
            timezone,
            locale,
            mbtiAnswers: mbtiAnswers ?? undefined,
            insight,
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
      ...insight,
      persisted,
      petId,
      sajuResultId,
      persistError,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "MBTI premium generation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
