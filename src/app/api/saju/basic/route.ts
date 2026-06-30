import { computePetSajuBundle } from "@/lib/saju/engine";
import { generateGeminiNarrative } from "@/lib/saju/gemini-narrative";
import { applyPetInterpretationToBasicResponse } from "@/lib/saju/llm/apply-pet-to-basic";
import { interpretSaju, isSajuInterpretLlmEnabled } from "@/lib/saju/llm/interpret";
import { validatePetName } from "@/lib/saju/moderation";
import { persistSajuResult } from "@/lib/saju/persist";
import type { Gender, Locale, Species, SajuBasicRequest } from "@/lib/saju/types";
import {
  createUserSupabaseClient,
  getBearerToken,
  getUserIdFromRequest,
} from "@/lib/supabase/auth-server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

let ratelimit: Ratelimit | null = null;

function getRatelimit(): Ratelimit | null {
  if (ratelimit) return ratelimit;
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  try {
    ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      analytics: true,
    });
    return ratelimit;
  } catch {
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

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "anonymous";

  const limiter = getRatelimit();
  if (limiter) {
    try {
      const { success, limit, reset, remaining } = await limiter.limit(ip);
      if (!success) {
      return NextResponse.json(
        { error: "요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요." },
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
    } catch {
      // Upstash misconfigured — do not block saju in local/dev.
    }
  }

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

  if (!body.species || !["dog", "cat", "other"].includes(body.species)) {
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
    const { result, mapping } = computePetSajuBundle(sajuRequest);
    result.narrativeSource = "template";
    let llmApplied = false;

    if (isSajuInterpretLlmEnabled()) {
      try {
        const interpretation = await interpretSaju({
          tier: "pet",
          mapping,
          locale: sajuRequest.locale,
          petName: sajuRequest.petName,
        });
        if (interpretation.tier === "pet") {
          applyPetInterpretationToBasicResponse(
            result,
            interpretation.data,
            mapping,
            interpretation.provider
          );
          llmApplied = true;
        }
      } catch (err) {
        result.narrativeError =
          err instanceof Error ? err.message : "LLM narrative generation failed.";
      }
    }

    if (!llmApplied) {
      try {
        const narrative = await generateGeminiNarrative(sajuRequest, result);
        if (narrative) {
          result.headline = narrative.headline;
          result.story = narrative.story;
          result.traits = narrative.traits;
          result.narrativeSource = "gemini";
          result.narrativeError = null;
        }
      } catch (err) {
        result.narrativeError =
          err instanceof Error ? err.message : "Gemini narrative generation failed.";
      }
    }

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
