import type { HumanPremiumReportPayload } from "@/lib/reports/human-premium/types";
import type { PillarDisplay } from "@/lib/saju/types";
import { charToElement, computeElementPercents } from "@/lib/saju/elements";
import { formatJijiTimeRangeDisplay } from "@/lib/saju/jiji-hours";
import type { ElementKey } from "@/lib/saju/types";

export const OBANG_COLORS: Record<string, string> = {
  wood: "#3E5C76",
  fire: "#9A3B3B",
  earth: "#D4A373",
  metal: "#BDBDBD",
  water: "#3D3D3D",
};

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

export interface ElementBreakdown {
  key: string;
  hanja: string;
  hangul: string;
  romanized: string;
  meaning: string;
  count: number;
  percent: number;
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
  const items = raw.map((item) => ({
    key: String(item.key ?? "") as ElementKey,
    hanja: String(item.hanja ?? ""),
    hangul: String(item.hangul ?? ""),
    romanized: String(item.romanized ?? ""),
    meaning: String(item.meaning ?? ""),
    count: Number(item.count ?? 0),
    percent:
      typeof item.percent === "number" && Number.isFinite(item.percent)
        ? item.percent
        : null,
  }));

  const needsFallback = items.some((item) => item.percent == null);
  const fallbackPercents = needsFallback
    ? computeElementPercents(
        Object.fromEntries(items.map((item) => [item.key, item.count])) as Record<
          ElementKey,
          number
        >
      )
    : null;

  return items.map((item) => ({
    key: item.key,
    hanja: item.hanja,
    hangul: item.hangul,
    romanized: item.romanized,
    meaning: item.meaning,
    count: item.count,
    percent: item.percent ?? fallbackPercents?.[item.key as ElementKey] ?? 0,
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

function parseYmd(date: string): { year: number; month: number; day: number } | null {
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) return null;
  return { year, month, day };
}

export function formatBirthDateDisplay(
  birthDate: string,
  calendarType: "solar" | "lunar",
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
  birthBasis: HumanPremiumReportPayload["birthBasis"],
  calendarType: HumanPremiumReportPayload["calendarType"],
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

export function firstProphecyLine(text: string): string {
  const line = text.split(/\n/).map((part) => part.trim()).find(Boolean);
  return line ?? text.trim();
}
