import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

let checkEmailRatelimit: Ratelimit | null | undefined;

function redisConfigured(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

function logRateLimitFallback(
  cause: "env_missing" | "limit_error",
  extra?: Record<string, unknown>
) {
  console.error("[RATE_LIMIT_FALLBACK]", { limiter: "auth_check_email", cause, ...extra });
}

function getCheckEmailRatelimit(): Ratelimit | null {
  if (checkEmailRatelimit !== undefined) return checkEmailRatelimit;
  if (!redisConfigured()) {
    checkEmailRatelimit = null;
    logRateLimitFallback("env_missing");
    return null;
  }
  try {
    checkEmailRatelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, "1 h"),
      prefix: "auth_check_email",
      analytics: true,
    });
    return checkEmailRatelimit;
  } catch (err) {
    checkEmailRatelimit = null;
    logRateLimitFallback("limit_error", {
      message: err instanceof Error ? err.message : String(err),
      phase: "init",
    });
    return null;
  }
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

type SignupStatus = { exists: boolean; confirmed: boolean };

async function lookupSignupStatus(email: string): Promise<SignupStatus> {
  const supabase = getSupabaseServiceRoleClient();
  // RPC added in migration 050; Database.Functions typing not generated yet.
  const { data, error } = await supabase.rpc(
    "auth_email_signup_status" as never,
    { p_email: email } as never
  );

  if (error) {
    throw new Error(error.message);
  }

  const row =
    data && typeof data === "object" && !Array.isArray(data)
      ? (data as { exists?: unknown; confirmed?: unknown })
      : null;
  return {
    exists: Boolean(row?.exists),
    confirmed: Boolean(row?.confirmed),
  };
}

/**
 * Signup-confirm UI (`LoginButtons` mode=confirm): whether an email is registered
 * and whether email_confirmed_at is set. Existence distinction is required for UX
 * (signupEmailMissing / Confirmed / Unconfirmed) — keep exists+confirmed + IP rate limit.
 */
export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
  const limiter = getCheckEmailRatelimit();
  if (limiter) {
    try {
      const { success, limit, reset, remaining } = await limiter.limit(ip);
      if (!success) {
        return NextResponse.json(
          { error: "Too many requests. Please try again later." },
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

  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email || !isEmail(email)) {
    return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ error: "Supabase admin is not configured." }, { status: 503 });
  }

  try {
    const status = await lookupSignupStatus(email);
    return NextResponse.json(status);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lookup failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
