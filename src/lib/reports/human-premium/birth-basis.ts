import { convertLunarYmdToSolar } from "@/lib/saju/ksaju-engine";
import { localBirthToUtc } from "@/lib/saju/timezone";
import type { HumanPremiumBirthBasis, HumanPremiumReportInput } from "./types";

function parseYmd(date: string): { year: number; month: number; day: number } {
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) {
    throw new Error("Invalid birth date.");
  }
  return { year, month, day };
}

export function resolveSolarBirthDate(input: HumanPremiumReportInput): string {
  if (input.calendarType === "solar") {
    return input.birthDate;
  }

  const { year, month, day } = parseYmd(input.birthDate);
  return convertLunarYmdToSolar(year, month, day, false);
}

export function resolveHumanBirthBasis(
  input: HumanPremiumReportInput
): HumanPremiumBirthBasis {
  const convertedSolarDate =
    input.calendarType === "lunar"
      ? resolveSolarBirthDate(input)
      : undefined;

  const birthUtc = localBirthToUtc(
    convertedSolarDate ?? input.birthDate,
    input.birthTimeUnknown ? null : input.birthTime,
    input.timezone
  );

  return {
    birthDate: input.birthDate,
    birthTime: input.birthTime,
    birthTimeUnknown: input.birthTimeUnknown,
    timezone: input.timezone,
    calendarType: input.calendarType,
    locale: input.locale,
    birthUtc,
    convertedSolarDate,
    gender: input.gender ?? null,
  };
}
