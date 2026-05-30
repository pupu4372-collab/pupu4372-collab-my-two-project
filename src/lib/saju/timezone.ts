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

function getZonedParts(date: Date, timeZone: string) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
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
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}

export function formatUtcForDisplay(utcIso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(utcIso));
}

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
