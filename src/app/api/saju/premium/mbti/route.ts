import { isPetSpecies } from "@/lib/pets/species";
import {
  buildPetMbtiResult,
  buildPetMbtiResultFromType,
  isPetMbtiComplete,
  scoresFromAnswers,
} from "@/lib/pet/mbti-inference";
import { checkPetMbtiLlmGate } from "@/lib/payments/pet-premium-llm-gate";
import { generatePetMbtiPremiumInsight } from "@/lib/saju/llm/pet-premium/orchestrator";
import { validatePetName } from "@/lib/saju/moderation";
import { persistMbtiPremiumResult } from "@/lib/saju/persist-mbti";
import { normalizeBirthCalendarType } from "@/lib/saju/resolve-birth-date";
import type { Gender, Locale, Species } from "@/lib/saju/types";
import {
  createUserSupabaseClient,
  getBearerToken,
  getRegisteredUserIdFromRequest,
  getUserIdFromRequest,
} from "@/lib/supabase/auth-server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

let mbtiRetakeRatelimit: Ratelimit | null | undefined;

function redisConfigured(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

function logRateLimitFallback(
  cause: "env_missing" | "limit_error",
  extra?: Record<string, unknown>
) {
  console.error("[RATE_LIMIT_FALLBACK]", { limiter: "mbti_retake", cause, ...extra });
}

function getMbtiRetakeRatelimit(): Ratelimit | null {
  if (mbtiRetakeRatelimit !== undefined) return mbtiRetakeRatelimit;
  if (!redisConfigured()) {
    mbtiRetakeRatelimit = null;
    logRateLimitFallback("env_missing");
    return null;
  }
  try {
    mbtiRetakeRatelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(2, "24 h"),
      prefix: "pet_mbti_retake",
      analytics: true,
    });
    return mbtiRetakeRatelimit;
  } catch (err) {
    mbtiRetakeRatelimit = null;
    logRateLimitFallback("limit_error", {
      message: err instanceof Error ? err.message : String(err),
      phase: "init",
    });
    return null;
  }
}

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

async function petHasExistingMbtiReport(
  request: Request,
  petId: string | null
): Promise<boolean> {
  if (!petId || !isSupabaseConfigured()) return false;
  const ownerId = await getRegisteredUserIdFromRequest(request);
  const token = getBearerToken(request);
  if (!ownerId || !token) return false;
  const supabase = createUserSupabaseClient(token);
  if (!supabase) return false;

  const { data, error } = await supabase
    .from("saju_results")
    .select("id")
    .eq("owner_id", ownerId)
    .eq("pet_id", petId)
    .eq("saju_type", "mbti")
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[mbti_retake] existing_report_check_failed", {
      petId,
      message: error.message,
    });
    return false;
  }
  return Boolean(data);
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

  const gateError = await checkPetMbtiLlmGate(
    request,
    body.petId ? String(body.petId) : null
  );
  if (gateError) {
    return NextResponse.json({ error: gateError.error }, { status: gateError.status });
  }

  const petIdForCheck = body.petId ? String(body.petId) : null;
  const clientRetake = body.retake === true;
  const hasExisting = await petHasExistingMbtiReport(request, petIdForCheck);
  const isRetake = clientRetake || hasExisting;

  if (isRetake) {
    const registeredUserId = await getRegisteredUserIdFromRequest(request);
    if (registeredUserId) {
      const limiter = getMbtiRetakeRatelimit();
      if (limiter) {
        try {
          const { success, limit, reset, remaining } = await limiter.limit(registeredUserId);
          if (!success) {
            console.warn(
              `[saju/premium/mbti] mbti_retake_limited userId=${registeredUserId}`
            );
            return NextResponse.json(
              {
                error:
                  locale === "ko"
                    ? "오늘은 더 이상 다시 입력할 수 없어요. 내일 다시 시도해주세요."
                    : "You've reached today's retake limit. Please try again tomorrow.",
                code: "mbti_retake_limited",
              },
              {
                status: 429,
                headers: {
                  "X-RateLimit-Limit": limit.toString(),
                  "X-RateLimit-Remaining": remaining.toString(),
                  "X-RateLimit-Reset": reset.toString(),
                },
              }
            );
          }
        } catch (err) {
          logRateLimitFallback("limit_error", {
            message: err instanceof Error ? err.message : String(err),
            phase: "limit",
          });
        }
      }
    }
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
