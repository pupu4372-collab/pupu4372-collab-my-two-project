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

/**
 * Curated hubs for empty-query suggestions (UTC offset ascending).
 * Prefer these ids; resolveAliases maps them onto the runtime IANA list when needed.
 */
export const CURATED_TIMEZONES = [
  "Pacific/Honolulu",
  "America/Anchorage",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Toronto",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Africa/Lagos",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Bangkok",
  "Asia/Shanghai",
  "Asia/Singapore",
  "Asia/Manila",
  "Asia/Seoul",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Pacific/Auckland",
] as const;

const ZONE_ID_ALIASES: Record<string, string[]> = {
  "Asia/Kolkata": ["Asia/Calcutta"],
  "Asia/Calcutta": ["Asia/Kolkata"],
};

/** Extra search tokens so e.g. "kolkata" hits Asia/Calcutta on older ICU lists. */
const ZONE_SEARCH_ALIASES: Record<string, string[]> = {
  "Asia/Calcutta": ["kolkata", "india"],
  "Asia/Kolkata": ["kolkata", "calcutta", "india"],
  "America/Sao_Paulo": ["sao", "sao paulo", "brazil"],
  "America/Denver": ["denver", "mountain"],
};

/** Pick the first id that exists in `available` (preferred + aliases). */
export function resolveTimezoneId(
  preferred: string,
  available: ReadonlySet<string> | readonly string[]
): string | null {
  const set = available instanceof Set ? available : new Set(available);
  if (set.has(preferred)) return preferred;
  for (const alt of ZONE_ID_ALIASES[preferred] ?? []) {
    if (set.has(alt)) return alt;
  }
  return null;
}

/** Curated ids present in the runtime list, preserving CURATED_TIMEZONES order. */
export function listCuratedTimeZones(allZones: readonly string[]): string[] {
  const set = new Set(allZones);
  const out: string[] = [];
  for (const id of CURATED_TIMEZONES) {
    const resolved = resolveTimezoneId(id, set);
    if (resolved && !out.includes(resolved)) out.push(resolved);
  }
  return out;
}

/** Current UTC offset label, e.g. UTC+5:30 / UTC-5. */
export function formatTimezoneUtcOffset(timeZone: string, at: Date = new Date()): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "shortOffset",
    }).formatToParts(at);
    const raw = parts.find((p) => p.type === "timeZoneName")?.value ?? "";
    if (!raw) return "";
    if (raw === "GMT" || raw === "UTC") return "UTC+0";
    return raw.replace(/^GMT/, "UTC");
  } catch {
    return "";
  }
}

/** Display label: `Asia/Kolkata (UTC+5:30)`. Value stored remains raw IANA. */
export function formatTimezoneLabel(timeZone: string, at: Date = new Date()): string {
  const offset = formatTimezoneUtcOffset(timeZone, at);
  return offset ? `${timeZone} (${offset})` : timeZone;
}

export function timezoneMatchesQuery(timeZone: string, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (timeZone.toLowerCase().includes(q)) return true;
  if (formatTimezoneLabel(timeZone).toLowerCase().includes(q)) return true;
  const city = timeZone.includes("/")
    ? timeZone.slice(timeZone.lastIndexOf("/") + 1).replace(/_/g, " ").toLowerCase()
    : timeZone.toLowerCase();
  if (city.includes(q)) return true;
  for (const token of ZONE_SEARCH_ALIASES[timeZone] ?? []) {
    if (token.includes(q) || q.includes(token)) return true;
  }
  for (const alt of ZONE_ID_ALIASES[timeZone] ?? []) {
    if (alt.toLowerCase().includes(q)) return true;
    const altCity = alt.includes("/")
      ? alt.slice(alt.lastIndexOf("/") + 1).replace(/_/g, " ").toLowerCase()
      : alt.toLowerCase();
    if (altCity.includes(q)) return true;
  }
  return false;
}
