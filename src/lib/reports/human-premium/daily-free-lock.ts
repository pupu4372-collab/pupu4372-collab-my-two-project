import { Redis } from "@upstash/redis";

const LOCK_TTL_SEC = 5 * 60;
const KST_TIMEZONE = "Asia/Seoul";

function logRateLimitFallback(
  cause: "env_missing" | "limit_error",
  extra?: Record<string, unknown>
) {
  console.error("[RATE_LIMIT_FALLBACK]", {
    limiter: "daily_free_lock",
    cause,
    ...extra,
  });
}

function kstDateKey(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: KST_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function lockKey(userId: string, now?: Date): string {
  return `daily_free_lock:${userId}:${kstDateKey(now)}`;
}

export type DailyFreeLockResult = "acquired" | "held" | "skipped";

/**
 * Short SET NX lock before coupon daily generation (secondary race defense).
 * Fail-open when Redis is missing/errors — DB `generating` seat is primary.
 */
export async function tryAcquireDailyFreeLock(userId: string): Promise<DailyFreeLockResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) {
    logRateLimitFallback("env_missing");
    return "skipped";
  }

  try {
    const redis = Redis.fromEnv();
    const key = lockKey(userId);
    const result = await redis.set(key, "1", { nx: true, ex: LOCK_TTL_SEC });
    if (result === "OK" || result === true) return "acquired";
    return "held";
  } catch (err) {
    logRateLimitFallback("limit_error", {
      message: err instanceof Error ? err.message : String(err),
      phase: "set_nx",
    });
    return "skipped";
  }
}

export async function releaseDailyFreeLock(userId: string): Promise<void> {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return;

  try {
    const redis = Redis.fromEnv();
    await redis.del(lockKey(userId));
  } catch (err) {
    logRateLimitFallback("limit_error", {
      message: err instanceof Error ? err.message : String(err),
      phase: "del",
    });
  }
}
