import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { SajuLlmCacheInsert, SajuLlmCacheRow } from "@/lib/supabase/types";
import type { Locale } from "@/lib/saju/types";
import type { InterpretSajuResult } from "./types";

export type LlmCacheKind =
  | "interpret_pet"
  | "interpret_human"
  | "human_premium_section";

const interpretInFlight = new Map<string, Promise<InterpretSajuResult>>();
const sectionInFlight = new Map<string, Promise<string | null>>();

export function isLlmCacheEnabled(): boolean {
  if (process.env.LLM_CACHE === "0") return false;
  return Boolean(
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() &&
      process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  );
}

function cacheTtlMs(): number | null {
  const raw = process.env.LLM_CACHE_TTL_DAYS?.trim();
  if (!raw) return 90 * 86_400_000;
  const days = Number(raw);
  if (!Number.isFinite(days) || days <= 0) return null;
  return days * 86_400_000;
}

function expiresAtIso(): string | null {
  const ttl = cacheTtlMs();
  if (ttl == null) return null;
  return new Date(Date.now() + ttl).toISOString();
}

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() <= Date.now();
}

export async function getCachedInterpretResult(
  cacheKey: string
): Promise<InterpretSajuResult | null> {
  if (!isLlmCacheEnabled()) return null;

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

  const payload = row.payload as InterpretSajuResult | null;
  if (!payload || typeof payload !== "object" || !("tier" in payload)) {
    return null;
  }
  return payload;
}

export async function setCachedInterpretResult(
  cacheKey: string,
  kind: "interpret_pet" | "interpret_human",
  locale: Locale,
  provider: string,
  model: string,
  result: InterpretSajuResult
): Promise<void> {
  if (!isLlmCacheEnabled()) return;

  const supabase = getSupabaseServerClient();
  if (!supabase) return;

  const row: SajuLlmCacheInsert = {
    cache_key: cacheKey,
    cache_kind: kind,
    locale,
    provider,
    model,
    payload: result as unknown as Record<string, unknown>,
    expires_at: expiresAtIso(),
  };

  const { error } = await supabase.from("saju_llm_cache").upsert(row as never, {
    onConflict: "cache_key",
  });

  if (error) {
    console.error("saju_llm_cache upsert failed (interpret)", error.message);
  }
}

export async function getCachedHumanPremiumSectionBody(
  cacheKey: string
): Promise<string | null> {
  if (!isLlmCacheEnabled()) return null;

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

  const body = (row.payload as { body?: unknown } | null)?.body;
  return typeof body === "string" && body.trim().length > 0 ? body.trim() : null;
}

export async function setCachedHumanPremiumSectionBody(
  cacheKey: string,
  locale: Locale,
  model: string,
  body: string
): Promise<void> {
  if (!isLlmCacheEnabled()) return;

  const supabase = getSupabaseServerClient();
  if (!supabase) return;

  const row: SajuLlmCacheInsert = {
    cache_key: cacheKey,
    cache_kind: "human_premium_section",
    locale,
    provider: "gemini",
    model,
    payload: { body },
    expires_at: expiresAtIso(),
  };

  const { error } = await supabase.from("saju_llm_cache").upsert(row as never, {
    onConflict: "cache_key",
  });

  if (error) {
    console.error("saju_llm_cache upsert failed (section)", error.message);
  }
}

export function getInterpretInFlight(
  cacheKey: string
): Promise<InterpretSajuResult> | undefined {
  return interpretInFlight.get(cacheKey);
}

export function setInterpretInFlight(
  cacheKey: string,
  promise: Promise<InterpretSajuResult>
): void {
  interpretInFlight.set(cacheKey, promise);
}

export function clearInterpretInFlight(cacheKey: string): void {
  interpretInFlight.delete(cacheKey);
}

export function getSectionInFlight(
  cacheKey: string
): Promise<string | null> | undefined {
  return sectionInFlight.get(cacheKey);
}

export function setSectionInFlight(
  cacheKey: string,
  promise: Promise<string | null>
): void {
  sectionInFlight.set(cacheKey, promise);
}

export function clearSectionInFlight(cacheKey: string): void {
  sectionInFlight.delete(cacheKey);
}
