import type { HumanPremiumCalendarType } from "./types";
import type { HumanPremiumBirthBasis } from "./types";
import { formatJijiTimeRangeDisplay } from "@/lib/saju/jiji-hours";

function parseYmd(date: string): { year: number; month: number; day: number } | null {
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) return null;
  return { year, month, day };
}

export function formatBirthDateDisplay(
  birthDate: string,
  calendarType: HumanPremiumCalendarType,
  isKo: boolean
): string {
  const parts = parseYmd(birthDate);
  if (!parts) return birthDate;

  const calendarTag =
    calendarType === "lunar"
      ? isKo
        ? " (음력)"
        : " (lunar)"
      : isKo
        ? " (양력)"
        : " (solar)";

  if (isKo) {
    return `${parts.year}년 ${parts.month}월 ${parts.day}일${calendarTag}`;
  }

  const enDate = new Date(parts.year, parts.month - 1, parts.day).toLocaleDateString(
    "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );
  return `${enDate}${calendarTag}`;
}

export function formatBirthTimeDisplay(
  birthTime: string | null,
  birthTimeUnknown: boolean,
  isKo: boolean
): string {
  if (birthTimeUnknown || !birthTime) {
    return isKo ? "모름" : "Unknown";
  }
  const normalized = birthTime.trim().slice(0, 5);
  try {
    return formatJijiTimeRangeDisplay(normalized);
  } catch {
    return normalized;
  }
}

export function formatBirthInputSummary(
  birthBasis: HumanPremiumBirthBasis,
  calendarType: HumanPremiumCalendarType,
  isKo: boolean
): string {
  const birthDate = formatBirthDateDisplay(
    birthBasis.birthDate,
    calendarType,
    isKo
  );
  const birthTime = formatBirthTimeDisplay(
    birthBasis.birthTime,
    birthBasis.birthTimeUnknown,
    isKo
  );

  if (isKo) {
    return `생년월일: ${birthDate} · 출생시간: ${birthTime}`;
  }
  return `Birth date: ${birthDate} · Birth time: ${birthTime}`;
}

export function formatIssuedDate(iso: string, isKo: boolean): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso.slice(0, 10);
  if (isKo) {
    return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, "0")}. ${String(date.getDate()).padStart(2, "0")}`;
  }
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
