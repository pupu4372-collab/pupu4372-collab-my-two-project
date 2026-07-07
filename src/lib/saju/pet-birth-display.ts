import type { KstJijiHour, Locale } from "./types";

/** Pet result birth line — full date + optional local time with 12-branch (KST). */
export function formatPetBirthDisplayLabel(options: {
  birthUtc: string;
  timezone: string;
  locale: Locale;
  birthTimeUnknown: boolean;
  kstJiji?: KstJijiHour | null;
}): string {
  const { birthUtc, timezone, locale, birthTimeUnknown, kstJiji } = options;
  const date = new Date(birthUtc);

  if (locale === "ko") {
    const datePart = new Intl.DateTimeFormat("ko-KR", {
      timeZone: timezone,
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);

    if (birthTimeUnknown || !kstJiji) return datePart;

    const hourPart = new Intl.DateTimeFormat("ko-KR", {
      timeZone: timezone,
      hour: "numeric",
      hour12: true,
    }).format(date);

    return `${datePart} · ${hourPart}(${kstJiji.siNameKo})`;
  }

  const datePart = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);

  if (birthTimeUnknown || !kstJiji) return datePart;

  const timePart = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);

  return `${datePart} · ${timePart} (${kstJiji.siNameEn})`;
}
