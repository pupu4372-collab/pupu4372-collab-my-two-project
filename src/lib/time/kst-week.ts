const KST_TIMEZONE = "Asia/Seoul";

const WEEKDAY_TO_ISO: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

function formatKstDate(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: KST_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function kstIsoWeekday(now: Date): number {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: KST_TIMEZONE,
    weekday: "short",
  }).format(now);
  return WEEKDAY_TO_ISO[weekday] ?? 0;
}

function shiftKstDate(dateStr: string, deltaDays: number): string {
  const anchor = new Date(`${dateStr}T12:00:00+09:00`);
  anchor.setUTCDate(anchor.getUTCDate() + deltaDays);
  return formatKstDate(anchor);
}

/**
 * Inclusive lower bound for a KST calendar week (Monday 00:00 KST).
 * weeksAgo=0 → current week; weeksAgo=1 → previous week, etc.
 */
export function getKstWeekStartUtc(now: Date = new Date(), weeksAgo = 0): Date {
  const dateStr = formatKstDate(now);
  const daysSinceMonday = kstIsoWeekday(now);
  const mondayDate = shiftKstDate(dateStr, -daysSinceMonday - weeksAgo * 7);
  return new Date(`${mondayDate}T00:00:00+09:00`);
}

/** Exclusive upper bound for the same KST week window. */
export function getKstWeekEndUtc(now: Date = new Date(), weeksAgo = 0): Date {
  const start = getKstWeekStartUtc(now, weeksAgo);
  return new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
}

export function isCreatedAtInKstWeek(
  createdAt: string | Date,
  now: Date = new Date(),
  weeksAgo = 0,
): boolean {
  const ts = new Date(createdAt).getTime();
  const start = getKstWeekStartUtc(now, weeksAgo).getTime();
  const end = getKstWeekEndUtc(now, weeksAgo).getTime();
  return ts >= start && ts < end;
}
