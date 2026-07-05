import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { HumanPremiumCalendarType, HumanPremiumReportRow } from "./types";

const KST_TIMEZONE = "Asia/Seoul";

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
  reason?: "guest" | "quota_exceeded";
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

function isCountableDailyReport(row: HumanPremiumReportRow): boolean {
  return row.report_type === "daily" && (row.status === "ready" || row.status === "email_sent");
}

function isFreeDailyReport(row: HumanPremiumReportRow): boolean {
  return isCountableDailyReport(row) && Number(row.amount_paid) === 0;
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
    .in("status", ["ready", "email_sent"])
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as HumanPremiumReportRow[];
}

/**
 * Enforce logged-in daily quota (KST). Re-visiting token URLs is unaffected.
 * MVP: concurrent double-submit may rarely create 2 free rows — no distributed lock.
 */
export async function checkDailyReportLimit(
  userId: string | null,
  birthInput: DailyBirthInput
): Promise<DailyLimitResult> {
  if (!userId) {
    return { allowed: false, reason: "guest" };
  }

  const fingerprint = dailyBirthFingerprint(birthInput);
  const todayRows = await listTodayDailyReports(userId);

  for (const row of todayRows) {
    if (dailyBirthFingerprint(dailyBirthInputFromRow(row)) === fingerprint) {
      return {
        allowed: true,
        existingReportToken: row.web_access_token,
      };
    }
  }

  const freeRows = todayRows.filter(isFreeDailyReport);
  const todayFreeReportToken = freeRows[0]?.web_access_token;

  if (freeRows.length >= 1) {
    return {
      allowed: false,
      reason: "quota_exceeded",
      todayFreeReportToken,
    };
  }

  return { allowed: true };
}
