import { isPetSpecies } from "@/lib/pets/species";
import {
  PET_BASIC_GUEST_COOKIE,
  PET_BASIC_GUEST_COOKIE_MAX_AGE_SEC,
  resolvePetBasicGuestCookie,
  type PetBasicGuestCookie,
} from "@/lib/saju/basic-guest-cookie";
import { computePetSajuBundle } from "@/lib/saju/engine";
import { generateGeminiNarrative } from "@/lib/saju/gemini-narrative";
import { applyPetInterpretationToBasicResponse } from "@/lib/saju/llm/apply-pet-to-basic";
import { interpretSaju, isSajuInterpretLlmEnabled } from "@/lib/saju/llm/interpret";
import { enrichBasicResultDisplayFields } from "@/lib/saju/enrich-basic-result-display";
import { finalizePetHeadline } from "@/lib/saju/pet-headline";
import { validatePetName } from "@/lib/saju/moderation";
import { persistSajuResult } from "@/lib/saju/persist";
import type { Gender, Locale, Species, SajuBasicRequest } from "@/lib/saju/types";
import { normalizeBirthCalendarType } from "@/lib/saju/resolve-birth-date";
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

let ipRatelimit: Ratelimit | null | undefined;
let userDailyRatelimit: Ratelimit | null | undefined;
let guestDailyRatelimit: Ratelimit | null | undefined;

function redisConfigured(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

function getIpRatelimit(): Ratelimit | null {
  if (ipRatelimit !== undefined) return ipRatelimit;
  if (!redisConfigured()) {
    ipRatelimit = null;
    return null;
  }
  try {
    ipRatelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      prefix: "pet_basic_ip",
      analytics: true,
    });
    return ipRatelimit;
  } catch {
    ipRatelimit = null;
    return null;
  }
}

function getUserDailyRatelimit(): Ratelimit | null {
  if (userDailyRatelimit !== undefined) return userDailyRatelimit;
  if (!redisConfigured()) {
    userDailyRatelimit = null;
    return null;
  }
  try {
    userDailyRatelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(3, "24 h"),
      prefix: "pet_basic_daily_user",
      analytics: true,
    });
    return userDailyRatelimit;
  } catch {
    userDailyRatelimit = null;
    return null;
  }
}

function getGuestDailyRatelimit(): Ratelimit | null {
  if (guestDailyRatelimit !== undefined) return guestDailyRatelimit;
  if (!redisConfigured()) {
    guestDailyRatelimit = null;
    return null;
  }
  try {
    guestDailyRatelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(1, "24 h"),
      prefix: "pet_basic_daily_guest",
      analytics: true,
    });
    return guestDailyRatelimit;
  } catch {
    guestDailyRatelimit = null;
    return null;
  }
}

function attachGuestCookie(res: NextResponse, guest: PetBasicGuestCookie | null): NextResponse {
  if (guest?.isNew) {
    res.cookies.set(PET_BASIC_GUEST_COOKIE, guest.id, {
      httpOnly: true,
      maxAge: PET_BASIC_GUEST_COOKIE_MAX_AGE_SEC,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
    });
  }
  return res;
}

function jsonResponse(
  body: unknown,
  init: ResponseInit | undefined,
  guest: PetBasicGuestCookie | null
): NextResponse {
  return attachGuestCookie(NextResponse.json(body, init), guest);
}

function isValidDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
}

function isValidTime(s: string | null): boolean {
  if (s === null) return true;
  return /^\d{2}:\d{2}$/.test(s);
}

export async function POST(request: Request) {
  const registeredUserId = await getRegisteredUserIdFromRequest(request);
  const guestCookie = registeredUserId ? null : resolvePetBasicGuestCookie(request);

  const ip = request.headers.get("x-forwarded-for") ?? "anonymous";

  const ipLimiter = getIpRatelimit();
  if (ipLimiter) {
    try {
      const { success, limit, reset, remaining } = await ipLimiter.limit(ip);
      if (!success) {
        console.warn(
          `[saju/basic] ip_rate_limited ip=${ip} registered=${Boolean(registeredUserId)}`
        );
        return jsonResponse(
          {
            error: "요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.",
            code: "ip_rate_limited",
          },
          {
            status: 429,
            headers: {
              "X-RateLimit-Limit": limit.toString(),
              "X-RateLimit-Remaining": remaining.toString(),
              "X-RateLimit-Reset": reset.toString(),
            },
          },
          guestCookie
        );
      }
    } catch {
      // Upstash misconfigured — do not block saju in local/dev.
    }
  }

  if (registeredUserId) {
    const daily = getUserDailyRatelimit();
    if (daily) {
      try {
        const key = `user:${registeredUserId}`;
        const { success, limit, reset, remaining } = await daily.limit(key);
        if (!success) {
          console.warn(
            `[saju/basic] daily_quota_exceeded scope=user userId=${registeredUserId}`
          );
          return jsonResponse(
            {
              error: "오늘의 기본 사주 조회 한도를 모두 사용했어요. 내일 다시 시도해 주세요.",
              code: "daily_quota_exceeded",
            },
            {
              status: 429,
              headers: {
                "X-RateLimit-Limit": limit.toString(),
                "X-RateLimit-Remaining": remaining.toString(),
                "X-RateLimit-Reset": reset.toString(),
              },
            },
            guestCookie
          );
        }
      } catch {
        // fail-open
      }
    }
  } else if (guestCookie) {
    const daily = getGuestDailyRatelimit();
    if (daily) {
      try {
        const key = `guest:${guestCookie.id}`;
        const { success, limit, reset, remaining } = await daily.limit(key);
        if (!success) {
          console.warn(
            `[saju/basic] daily_quota_exceeded scope=guest guestId=${guestCookie.id}`
          );
          return jsonResponse(
            {
              error: "게스트는 하루에 한 번만 기본 사주를 볼 수 있어요. 내일 다시 시도하거나 로그인해 주세요.",
              code: "daily_quota_exceeded",
            },
            {
              status: 429,
              headers: {
                "X-RateLimit-Limit": limit.toString(),
                "X-RateLimit-Remaining": remaining.toString(),
                "X-RateLimit-Reset": reset.toString(),
              },
            },
            guestCookie
          );
        }
      } catch {
        // fail-open
      }
    }
  }

  let body: Partial<SajuBasicRequest>;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, { status: 400 }, guestCookie);
  }

  if (!body.privacyConsent) {
    return jsonResponse(
      { error: "Privacy consent is required." },
      { status: 400 },
      guestCookie
    );
  }

  const nameError = validatePetName(body.petName ?? "");
  if (nameError) {
    return jsonResponse({ error: nameError }, { status: 400 }, guestCookie);
  }

  if (!body.species || !isPetSpecies(body.species)) {
    return jsonResponse({ error: "Invalid species." }, { status: 400 }, guestCookie);
  }

  const petGender =
    body.petGender === "male" || body.petGender === "female"
      ? (body.petGender as Gender)
      : null;

  if (!body.birthDate || !isValidDate(body.birthDate)) {
    return jsonResponse({ error: "Invalid birth date." }, { status: 400 }, guestCookie);
  }

  if (!isValidTime(body.birthTime ?? null)) {
    return jsonResponse({ error: "Invalid birth time." }, { status: 400 }, guestCookie);
  }

  if (!body.timezone || typeof body.timezone !== "string") {
    return jsonResponse({ error: "Timezone is required." }, { status: 400 }, guestCookie);
  }

  try {
    Intl.DateTimeFormat(undefined, { timeZone: body.timezone });
  } catch {
    return jsonResponse({ error: "Invalid timezone." }, { status: 400 }, guestCookie);
  }

  const locale: Locale = body.locale === "ko" ? "ko" : "en";

  const sajuRequest: SajuBasicRequest = {
    petName: (body.petName ?? "").trim(),
    species: body.species as Species,
    petGender,
    birthDate: body.birthDate,
    calendarType: normalizeBirthCalendarType(body.calendarType),
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

    finalizePetHeadline(result, mapping);
    enrichBasicResultDisplayFields(result, mapping);

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

    return jsonResponse(
      {
        ...result,
        persisted,
        petId,
        sajuResultId,
        persistError,
      },
      undefined,
      guestCookie
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Calculation failed.";
    return jsonResponse({ error: message }, { status: 500 }, guestCookie);
  }
}
