import type { HumanPremiumReportPayload } from "@/lib/reports/human-premium/types";
import type { PillarDisplay } from "@/lib/saju/types";

export const OBANG_COLORS: Record<string, string> = {
  wood: "#3E5C76",
  fire: "#9A3B3B",
  earth: "#D4A373",
  metal: "#BDBDBD",
  water: "#3D3D3D",
};

export interface ElementBreakdown {
  key: string;
  hanja: string;
  hangul: string;
  romanized: string;
  meaning: string;
  count: number;
}

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
  return raw.map((item) => ({
    key: String(item.key ?? ""),
    hanja: String(item.hanja ?? ""),
    hangul: String(item.hangul ?? ""),
    romanized: String(item.romanized ?? ""),
    meaning: String(item.meaning ?? ""),
    count: Number(item.count ?? 0),
  }));
}

export function findSectionBody(
  report: HumanPremiumReportPayload,
  sectionId: string
): string {
  for (const chapter of report.saju.chapters) {
    const section = chapter.sections.find((item) => item.id === sectionId);
    if (section?.body.trim()) return section.body;
  }
  return "";
}

export function dayPillarNickname(
  report: HumanPremiumReportPayload,
  isKo: boolean
): string {
  const day = asPillars(report.saju.pillars).day;
  return isKo ? `${day.pillar} 일주` : `${day.pillar} day pillar`;
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

export function firstProphecyLine(text: string): string {
  const line = text.split(/\n/).map((part) => part.trim()).find(Boolean);
  return line ?? text.trim();
}
