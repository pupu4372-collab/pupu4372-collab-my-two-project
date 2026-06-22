/**
 * Verify saju_llm_cache table + read/write round-trip (service role)
 * Run: npm run test:llm-cache-db
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import {
  getCachedInterpretResult,
  isLlmCacheEnabled,
  setCachedInterpretResult,
} from "@/lib/saju/llm/cache";
import type { Database } from "@/lib/supabase/types";

config({ path: ".env.local" });

const TEST_KEY = `__verify_llm_cache__:${Date.now()}`;

function pass(label: string) {
  console.log(`✓ ${label}`);
}

function fail(label: string, detail?: string): never {
  console.error(`✗ ${label}${detail ? `: ${detail}` : ""}`);
  process.exit(1);
}

async function main() {
  console.log("=== LLM cache DB verification ===\n");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url) fail("NEXT_PUBLIC_SUPABASE_URL missing in .env.local");
  if (!serviceKey) fail("SUPABASE_SERVICE_ROLE_KEY missing in .env.local");

  pass(`Supabase URL configured (${url})`);
  pass("Service role key present");

  if (process.env.LLM_CACHE === "0") {
    fail("LLM_CACHE=0 — cache disabled in env");
  }
  pass(`isLlmCacheEnabled(): ${isLlmCacheEnabled()}`);

  const admin = createClient<Database>(url!, serviceKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error: tableErr } = await admin.from("saju_llm_cache").select("cache_key").limit(1);
  if (tableErr) {
    fail("Table saju_llm_cache not reachable", tableErr.message);
  }
  pass("Table saju_llm_cache exists and is readable (service role)");

  const sampleResult = {
    tier: "pet" as const,
    provider: "claude" as const,
    data: {
      characterIntro: "verify",
      personality: "verify",
      healthNote: "verify",
      compatibility: "verify",
    },
  };

  await setCachedInterpretResult(
    TEST_KEY,
    "interpret_pet",
    "ko",
    "claude",
    "verify-model",
    sampleResult
  );

  const cached = await getCachedInterpretResult(TEST_KEY);
  if (!cached || cached.tier !== "pet") {
    fail("Round-trip read failed after upsert");
  }
  if (cached.data.characterIntro !== "verify") {
    fail("Payload mismatch after round-trip");
  }
  pass("Write + read round-trip OK");

  const { count, error: countErr } = await admin
    .from("saju_llm_cache")
    .select("*", { count: "exact", head: true });
  if (countErr) {
    fail("Row count query failed", countErr.message);
  }
  console.log(`  (total rows in saju_llm_cache: ${count ?? 0})`);

  const { error: delErr } = await admin.from("saju_llm_cache").delete().eq("cache_key", TEST_KEY);
  if (delErr) {
    fail("Cleanup delete failed", delErr.message);
  }
  pass("Test row cleaned up");

  console.log("\n=== All checks passed ===");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
