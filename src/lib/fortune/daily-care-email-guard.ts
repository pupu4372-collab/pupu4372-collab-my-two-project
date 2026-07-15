import { Redis } from "@upstash/redis";

function redisConfigured(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

/** Returns true if this is the first claim for (userId, kstDate); false if already sent. */
export async function claimDailyCareEmailSlot(
  userId: string,
  dateKst: string
): Promise<"claimed" | "already_sent" | "unavailable"> {
  if (!redisConfigured()) return "unavailable";
  try {
    const redis = Redis.fromEnv();
    const key = `pet_daily_care_email:${userId}:${dateKst}`;
    const ok = await redis.set(key, "1", { nx: true, ex: 60 * 60 * 36 });
    return ok ? "claimed" : "already_sent";
  } catch {
    return "unavailable";
  }
}

export async function releaseDailyCareEmailSlot(userId: string, dateKst: string): Promise<void> {
  if (!redisConfigured()) return;
  try {
    const redis = Redis.fromEnv();
    await redis.del(`pet_daily_care_email:${userId}:${dateKst}`);
  } catch {
    // ignore
  }
}
