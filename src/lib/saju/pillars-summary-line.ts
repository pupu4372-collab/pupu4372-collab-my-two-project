import { stemHangulLabel, branchHangulLabel } from "@/lib/saju/elements";
import type { Locale, PillarDisplay, SajuBasicResponse } from "@/lib/saju/types";

function pillarReading(pillar: PillarDisplay): string {
  return `${stemHangulLabel(pillar.stemHanja)}${branchHangulLabel(pillar.branchHanja)}(${pillar.pillar})`;
}

function slotLabel(slot: "hour" | "day" | "month" | "year", locale: Locale): string {
  if (locale === "ko") {
    return { hour: "시주", day: "일주", month: "월주", year: "연주" }[slot];
  }
  return { hour: "Hour", day: "Day", month: "Month", year: "Year" }[slot];
}

/** Four-pillar summary line — day pillar wrapped in <strong>. */
export function buildPillarsSummaryLine(result: SajuBasicResponse): string {
  const locale = result.locale;
  const segments: string[] = [];

  if (result.pillars.hour && !result.birthTimeUnknown) {
    segments.push(`${slotLabel("hour", locale)} ${pillarReading(result.pillars.hour)}`);
  }

  segments.push(
    `${slotLabel("day", locale)} <strong>${pillarReading(result.pillars.day)}</strong>`
  );
  segments.push(`${slotLabel("month", locale)} ${pillarReading(result.pillars.month)}`);
  segments.push(`${slotLabel("year", locale)} ${pillarReading(result.pillars.year)}`);

  return segments.join(" · ");
}
