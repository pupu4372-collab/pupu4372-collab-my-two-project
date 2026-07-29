/**
 * Converts a local birth date/time in an IANA timezone to UTC ISO string.
 * Birth times are interpreted in the user's chosen timezone (not server local).
 */
export function localBirthToUtc(
  birthDate: string,
  birthTime: string | null,
  timeZone: string
): string {
  const [year, month, day] = birthDate.split("-").map(Number);
  const [hour, minute] = (birthTime ?? "12:00").split(":").map(Number);

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    !Number.isFinite(hour) ||
    !Number.isFinite(minute)
  ) {
    throw new Error("Invalid birth date or time");
  }

  const desiredUtc = Date.UTC(year, month - 1, day, hour, minute, 0);
  let guess = new Date(desiredUtc);

  for (let i = 0; i < 4; i++) {
    const parts = getZonedParts(guess, timeZone);
    const actualUtc = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      0
    );
    const diff = desiredUtc - actualUtc;
    if (diff === 0) break;
    guess = new Date(guess.getTime() + diff);
  }

  return guess.toISOString();
}

export function getZonedParts(date: Date, timeZone: string) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts: Record<string, string> = {};
  for (const p of dtf.formatToParts(date)) {
    if (p.type !== "literal") parts[p.type] = p.value;
  }

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour) % 24,
    minute: Number(parts.minute),
    second: Number(parts.second ?? "0"),
  };
}

export function formatUtcForDisplay(utcIso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(utcIso));
}

/** Curated hubs — kept for favorites / fallback when supportedValuesOf is missing. */
export const COMMON_TIMEZONES = [
  "Asia/Seoul",
  "Asia/Tokyo",
  "America/New_York",
  "America/Los_Angeles",
  "America/Chicago",
  "Europe/London",
  "Europe/Paris",
  "Australia/Sydney",
] as const;

/** True if `value` is a valid IANA timezone for this runtime (not a whitelist). */
export function isValidIanaTimezone(value: string): boolean {
  if (!value || typeof value !== "string") return false;
  try {
    Intl.DateTimeFormat(undefined, { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

/**
 * Full IANA zone list when `Intl.supportedValuesOf('timeZone')` exists;
 * otherwise falls back to COMMON_TIMEZONES.
 */
export function listIanaTimeZones(): string[] {
  let zones: string[] = [];
  const supportedValuesOf = (
    Intl as typeof Intl & { supportedValuesOf?: (key: string) => string[] }
  ).supportedValuesOf;
  if (typeof supportedValuesOf === "function") {
    try {
      zones = [...supportedValuesOf("timeZone")];
    } catch {
      zones = [];
    }
  }
  if (zones.length === 0) {
    zones = [...COMMON_TIMEZONES];
  }
  const set = new Set(zones);
  for (const tz of COMMON_TIMEZONES) set.add(tz);
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

/** Ensure a stored/detected value stays selectable even if alias differs from the list. */
export function ensureTimezoneInList(zones: string[], value: string): string[] {
  if (!value || zones.includes(value)) return zones;
  return [...zones, value].sort((a, b) => a.localeCompare(b));
}

/** Readable label: city · GMT offset (IANA id). */
export function formatTimezoneLabel(timeZone: string, at: Date = new Date()): string {
  const city = timeZone.includes("/")
    ? timeZone.slice(timeZone.lastIndexOf("/") + 1).replace(/_/g, " ")
    : timeZone;
  let offset = "";
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "shortOffset",
    }).formatToParts(at);
    offset = parts.find((p) => p.type === "timeZoneName")?.value ?? "";
  } catch {
    /* ignore */
  }
  return offset ? `${city} · ${offset} (${timeZone})` : `${city} (${timeZone})`;
}
