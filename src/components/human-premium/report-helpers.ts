import type { HumanPremiumReportPayload } from "@/lib/reports/human-premium/types";
export {
  formatBirthDateDisplay,
  formatBirthInputSummary,
  formatBirthTimeDisplay,
  formatIssuedDate,
} from "@/lib/reports/human-premium/birth-display";
import {
  OBANG_COLORS,
  parseElementRows,
  type ElementDisplayRow,
} from "@/lib/reports/human-premium/element-display";
import type { PillarDisplay } from "@/lib/saju/types";
import { charToElement, formatDayPillarAddress, formatGanziLabel, stemHangulLabel, branchHangulLabel } from "@/lib/saju/elements";
import { sanitizeLlmSlotText } from "@/lib/saju/llm/slot-output-sanitize";

export { OBANG_COLORS } from "@/lib/reports/human-premium/element-display";

/** Pale fill for 오행 cards and 만세력 cells */
export function obangPaleBg(key: string, mixPct = 14): string {
  const color = OBANG_COLORS[key] ?? "#888888";
  return `color-mix(in srgb, ${color} ${mixPct}%, var(--jig-hanji))`;
}

export function hanjaPaleBg(hanja: string, mixPct = 12): string | undefined {
  const element = charToElement(hanja);
  if (!element) return undefined;
  return obangPaleBg(element, mixPct);
}

export type ElementBreakdown = ElementDisplayRow;

export type SajuPillars = {
  year: PillarDisplay;
  month: PillarDisplay;
  day: PillarDisplay;
  hour: PillarDisplay | null;
};

export function asPillars(raw: Record<string, unknown>): SajuPillars {
  return raw as SajuPillars;
}

export function asElements(raw: Record<string, unknown>[]): ElementBreakdown[] {
  return parseElementRows(raw);
}

export function findSectionBody(
  report: HumanPremiumReportPayload,
  sectionId: string
): string {
  for (const chapter of report.saju.chapters) {
    const section = chapter.sections.find((item) => item.id === sectionId);
    if (section?.body.trim()) {
      return sanitizeLlmSlotText(
        `display:${sectionId}`,
        section.body,
        report.locale
      );
    }
  }
  return "";
}

export function dayPillarNickname(
  report: HumanPremiumReportPayload,
  isKo: boolean
): string {
  const day = asPillars(report.saju.pillars).day;
  return formatDayPillarAddress(day.pillar, isKo ? "ko" : "en");
}

/** Cover "Day pillar element" line — Manse table below keeps hanja. */
export function dayPillarElementHeadline(
  day: PillarDisplay,
  isKo: boolean
): string {
  if (isKo) {
    return `${day.pillar} · ${stemHangulLabel(day.stemHanja)} · ${branchHangulLabel(day.branchHanja)}`;
  }
  return formatGanziLabel(day.pillar, "en");
}

export function firstProphecyLine(text: string): string {
  const line = text.split(/\n/).map((part) => part.trim()).find(Boolean);
  return line ?? text.trim();
}
