import { convertLunarYmdToSolar } from "@/lib/saju/ksaju-engine";
import type { BirthCalendarType } from "@/lib/saju/types";

export function normalizeBirthCalendarType(value: unknown): BirthCalendarType {
  return value === "lunar" ? "lunar" : "solar";
}

export function resolveSolarBirthDate(
  birthDate: string,
  calendarType: BirthCalendarType = "solar"
): string {
  if (calendarType === "solar") {
    return birthDate;
  }

  const [year, month, day] = birthDate.split("-").map(Number);
  if (!year || !month || !day) {
    throw new Error("Invalid birth date.");
  }

  return convertLunarYmdToSolar(year, month, day, false);
}
