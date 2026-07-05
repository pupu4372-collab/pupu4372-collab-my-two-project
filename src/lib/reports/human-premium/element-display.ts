import { computeElementPercents } from "@/lib/saju/elements";
import type { ElementKey } from "@/lib/saju/types";

/** Shared 오행 accent colors — web cards and PDF bars use the same palette. */
export const OBANG_COLORS: Record<string, string> = {
  wood: "#3E5C76",
  fire: "#9A3B3B",
  earth: "#D4A373",
  metal: "#BDBDBD",
  water: "#3D3D3D",
};

export const ELEMENT_TRACK_COLOR = "#EFEAE0";
export const OBANG_COLOR_FALLBACK = "#888888";

export interface ElementDisplayRow {
  key: string;
  hanja: string;
  hangul: string;
  romanized: string;
  meaning: string;
  count: number;
  percent: number;
}

export function parseElementRows(raw: Record<string, unknown>[]): ElementDisplayRow[] {
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

export function elementAccentColor(key: string): string {
  return OBANG_COLORS[key] ?? OBANG_COLOR_FALLBACK;
}

/** Match CoverSection labels: KO hangul, EN meaning (not romanized). */
export function formatElementDisplayLabel(
  item: Pick<ElementDisplayRow, "hangul" | "hanja" | "meaning">,
  isKo: boolean
): string {
  return isKo ? `${item.hangul} (${item.hanja})` : `${item.meaning} (${item.hanja})`;
}
