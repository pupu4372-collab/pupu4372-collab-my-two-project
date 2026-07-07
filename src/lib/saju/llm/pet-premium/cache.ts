import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { SajuLlmCacheInsert, SajuLlmCacheRow } from "@/lib/supabase/types";
import type { Locale } from "@/lib/saju/types";
import type { PetPremiumCachePayload, PetPremiumFeature } from "./types";

const petPremiumInFlight = new Map<string, Promise<{ data: unknown; provider: string } | null>>();

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() <= Date.now();
}

function isCacheEnabled(): boolean {
  if (process.env.LLM_CACHE === "0") return false;
  return Boolean(
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() &&
      process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  );
}

export async function getCachedPetPremiumResult<T>(
  cacheKey: string,
  validate: (data: unknown) => data is T
): Promise<{ data: T; provider: string } | null> {
  if (!isCacheEnabled()) return null;

  const supabase = getSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("saju_llm_cache")
    .select("payload, expires_at")
    .eq("cache_key", cacheKey)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as Pick<SajuLlmCacheRow, "payload" | "expires_at">;
  if (isExpired(row.expires_at)) return null;

  const payload = row.payload as PetPremiumCachePayload | null;
  if (!payload?.data || typeof payload.provider !== "string") return null;
  if (!validate(payload.data)) return null;

  return { data: payload.data, provider: payload.provider };
}

function defaultExpiresAt(): string | null {
  const raw = process.env.LLM_CACHE_TTL_DAYS?.trim();
  const days = raw ? Number(raw) : 90;
  if (!Number.isFinite(days) || days <= 0) return null;
  return new Date(Date.now() + days * 86_400_000).toISOString();
}

export async function setCachedPetPremiumResult(input: {
  cacheKey: string;
  locale: Locale;
  provider: string;
  model: string;
  feature: PetPremiumFeature;
  data: PetPremiumCachePayload["data"];
  expiresAt?: string | null;
}): Promise<void> {
  if (!isCacheEnabled()) return;

  const supabase = getSupabaseServerClient();
  if (!supabase) return;

  const row: SajuLlmCacheInsert = {
    cache_key: input.cacheKey,
    cache_kind: "pet_premium",
    locale: input.locale,
    provider: input.provider,
    model: input.model,
    payload: {
      feature: input.feature,
      locale: input.locale,
      provider: input.provider,
      data: input.data,
    } satisfies PetPremiumCachePayload,
    expires_at: input.expiresAt === undefined ? defaultExpiresAt() : input.expiresAt,
  };

  const { error } = await supabase.from("saju_llm_cache").upsert(row as never, {
    onConflict: "cache_key",
  });

  if (error) {
    console.error("saju_llm_cache upsert failed (pet_premium)", error.message);
  }
}

export function getPetPremiumInFlight<T>(
  cacheKey: string
): Promise<{ data: T; provider: string } | null> | undefined {
  return petPremiumInFlight.get(cacheKey) as Promise<{ data: T; provider: string } | null> | undefined;
}

export function setPetPremiumInFlight(
  cacheKey: string,
  promise: Promise<{ data: unknown; provider: string } | null>
): void {
  petPremiumInFlight.set(cacheKey, promise);
}

export function clearPetPremiumInFlight(cacheKey: string): void {
  petPremiumInFlight.delete(cacheKey);
}
