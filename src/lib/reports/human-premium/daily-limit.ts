import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { HumanPremiumCalendarType, HumanPremiumReportRow } from "./types";

const KST_TIMEZONE = "Asia/Seoul";
/** Stale `generating` rows older than this do not consume free quota (crash/timeout recovery). */
const GENERATING_STALE_MS = 10 * 60 * 1000;

export interface DailyBirthInput {
  birthDate: string;
  birthTime: string | null;
  birthTimeUnknown: boolean;
  birthTimezone: string;
  calendarType: HumanPremiumCalendarType;
  gender: "male" | "female" | null;
}

export interface DailyLimitResult {
  allowed: boolean;
  reason?: "guest" | "quota_exceeded" | "generating_in_progress";
  /** Same birth re-submit — reuse without consuming quota. */
  existingReportToken?: string;
  /** Today's free daily report token for "view again" link on paywall. */
  todayFreeReportToken?: string;
}

/** KST calendar day start as UTC Date (inclusive lower bound for created_at). */
export function getKstDayStartUtc(now: Date = new Date()): Date {
  const kstDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: KST_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  return new Date(`${kstDate}T00:00:00+09:00`);
}

export function dailyBirthFingerprint(input: DailyBirthInput): string {
  const timePart = input.birthTimeUnknown
    ? "unknown"
    : (input.birthTime ?? "unknown").trim().slice(0, 5);
  return [
    input.birthDate.trim(),
    timePart,
    input.birthTimezone.trim(),
    input.calendarType,
    input.gender ?? "unknown",
  ].join("|");
}

export function dailyBirthInputFromRow(row: HumanPremiumReportRow): DailyBirthInput {
  const basis = row.birth_basis;
  return {
    birthDate: row.birth_date,
    birthTime: row.birth_time,
    birthTimeUnknown: row.birth_time_unknown,
    birthTimezone: row.birth_timezone,
    calendarType: row.calendar_type,
    gender: basis?.gender ?? null,
  };
}

function isFreshGenerating(row: HumanPremiumReportRow, now: Date): boolean {
  if (row.status !== "generating") return false;
  const created = new Date(row.created_at).getTime();
  if (Number.isNaN(created)) return false;
  return now.getTime() - created < GENERATING_STALE_MS;
}

/** Free seat: in-flight generating (fresh) or completed free report. `failed` never counts. */
function isFreeQuotaSeat(row: HumanPremiumReportRow, now: Date): boolean {
  if (row.report_type !== "daily") return false;
  if (Number(row.amount_paid) !== 0) return false;
  if (row.status === "ready" || row.status === "email_sent") return true;
  return isFreshGenerating(row, now);
}

function isReusableCompleted(row: HumanPremiumReportRow): boolean {
  return (
    row.report_type === "daily" &&
    (row.status === "ready" || row.status === "email_sent")
  );
}

async function listTodayDailyReports(userId: string): Promise<HumanPremiumReportRow[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  const since = getKstDayStartUtc().toISOString();
  const { data, error } = await supabase
    .from("human_premium_reports")
    .select("*")
    .eq("user_id", userId)
    .eq("report_type", "daily")
    .gte("created_at", since)
    .in("status", ["generating", "ready", "email_sent", "failed"])
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as HumanPremiumReportRow[];
}

/**
 * Enforce logged-in daily free quota (KST).
 * Counts fresh `generating` + completed free rows so concurrent requests cannot
 * start a second LLM before the first row is ready.
 * `failed` does not consume the free seat (retry allowed).
 */
export async function checkDailyReportLimit(
  userId: string | null,
  birthInput: DailyBirthInput
): Promise<DailyLimitResult> {
  if (!userId) {
    return { allowed: false, reason: "guest" };
  }

  const now = new Date();
  const fingerprint = dailyBirthFingerprint(birthInput);
  const todayRows = await listTodayDailyReports(userId);

  for (const row of todayRows) {
    if (dailyBirthFingerprint(dailyBirthInputFromRow(row)) !== fingerprint) continue;

    if (isReusableCompleted(row)) {
      return {
        allowed: true,
        existingReportToken: row.web_access_token,
      };
    }

    if (isFreshGenerating(row, now) && Number(row.amount_paid) === 0) {
      return {
        allowed: false,
        reason: "generating_in_progress",
      };
    }
  }

  const freeSeats = todayRows.filter((row) => isFreeQuotaSeat(row, now));
  const todayFreeReportToken = freeSeats.find(isReusableCompleted)?.web_access_token;

  if (freeSeats.length >= 1) {
    return {
      allowed: false,
      reason: "quota_exceeded",
      todayFreeReportToken,
    };
  }

  return { allowed: true };
}
