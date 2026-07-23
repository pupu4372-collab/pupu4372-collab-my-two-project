import { createHash } from "node:crypto";
import type { WithdrawalCooldown } from "@/lib/auth/withdrawal-cooldown-error";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";

export type { WithdrawalCooldown } from "@/lib/auth/withdrawal-cooldown-error";
export { WithdrawalCooldownError } from "@/lib/auth/withdrawal-cooldown-error";

/** Lifetime of a withdrawal cooldown row (and retention). */
export const WITHDRAWAL_COOLDOWN_DAYS = 30;

const PEPPER_ENV = "WITHDRAWAL_EMAIL_HASH_PEPPER";

/**
 * Same base as `/api/auth/check-email`, plus whitespace strip so
 * `a b@x.com` / case variants cannot bypass the hash.
 */
export function normalizeEmailForHash(email: string): string {
  return email.trim().toLowerCase().replace(/\s+/g, "");
}

export function isWithdrawalPepperConfigured(): boolean {
  return Boolean(process.env[PEPPER_ENV]?.trim());
}

export function hashEmailForWithdrawal(email: string): string {
  const pepper = process.env[PEPPER_ENV]?.trim();
  if (!pepper) {
    throw new Error(`${PEPPER_ENV} is not configured.`);
  }
  const normalized = normalizeEmailForHash(email);
  return createHash("sha256").update(`${pepper}:${normalized}`, "utf8").digest("hex");
}

function daysRemainingFrom(withdrawnAt: Date, now = new Date()): number {
  const unlockAt = new Date(withdrawnAt.getTime());
  unlockAt.setUTCDate(unlockAt.getUTCDate() + WITHDRAWAL_COOLDOWN_DAYS);
  const ms = unlockAt.getTime() - now.getTime();
  if (ms <= 0) return 0;
  return Math.max(1, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}

function availableAtFrom(withdrawnAt: Date): string {
  const unlockAt = new Date(withdrawnAt.getTime());
  unlockAt.setUTCDate(unlockAt.getUTCDate() + WITHDRAWAL_COOLDOWN_DAYS);
  return unlockAt.toISOString();
}

/** Best-effort: never throws to callers (delete must still succeed). */
export async function recordWithdrawnEmail(email: string | null | undefined): Promise<void> {
  const trimmed = email?.trim();
  if (!trimmed) {
    console.error("[WITHDRAWN_ACCOUNTS] skip_record", { reason: "missing_email" });
    return;
  }
  if (!isWithdrawalPepperConfigured()) {
    console.error("[WITHDRAWN_ACCOUNTS] skip_record", { reason: "pepper_missing" });
    return;
  }

  try {
    const emailHash = hashEmailForWithdrawal(trimmed);
    const supabase = getSupabaseServiceRoleClient();
    const { error } = await supabase.from("withdrawn_accounts").upsert(
      {
        email_hash: emailHash,
        withdrawn_at: new Date().toISOString(),
      } as never,
      { onConflict: "email_hash" }
    );
    if (error) {
      console.error("[WITHDRAWN_ACCOUNTS] record_failed", { message: error.message });
    }
  } catch (err) {
    console.error("[WITHDRAWN_ACCOUNTS] record_failed", {
      message: err instanceof Error ? err.message : String(err),
    });
  }
}

/**
 * Active cooldown for this email, or null if free to rejoin.
 * Deletes expired rows for this hash (and best-effort global sweep of old rows).
 */
export async function getActiveWithdrawalCooldown(
  email: string
): Promise<WithdrawalCooldown | null> {
  if (!isWithdrawalPepperConfigured()) {
    return null;
  }

  let emailHash: string;
  try {
    emailHash = hashEmailForWithdrawal(email);
  } catch {
    return null;
  }

  const supabase = getSupabaseServiceRoleClient();
  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - WITHDRAWAL_COOLDOWN_DAYS);
  const cutoffIso = cutoff.toISOString();

  // Opportunistic cleanup of expired rows (no separate scheduler).
  const { error: cleanupError } = await supabase
    .from("withdrawn_accounts")
    .delete()
    .lt("withdrawn_at", cutoffIso);
  if (cleanupError) {
    console.error("[WITHDRAWN_ACCOUNTS] cleanup_failed", { message: cleanupError.message });
  }

  const { data, error } = await supabase
    .from("withdrawn_accounts")
    .select("withdrawn_at")
    .eq("email_hash", emailHash)
    .maybeSingle();

  if (error) {
    console.error("[WITHDRAWN_ACCOUNTS] lookup_failed", { message: error.message });
    return null;
  }

  const row = data as { withdrawn_at?: string } | null;
  if (!row?.withdrawn_at) return null;

  const withdrawnAt = new Date(row.withdrawn_at);
  if (Number.isNaN(withdrawnAt.getTime())) return null;

  const days = daysRemainingFrom(withdrawnAt);
  if (days <= 0) {
    await supabase.from("withdrawn_accounts").delete().eq("email_hash", emailHash);
    return null;
  }

  return {
    daysRemaining: days,
    availableAt: availableAtFrom(withdrawnAt),
  };
}
