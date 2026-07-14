import { computeElementPercents } from "@/lib/saju/elements";
import type { ElementKey } from "@/lib/saju/types";

/** Shared 오행 accent colors — web cards and PDF bars. */
export const OBANG_COLORS: Record<string, string> = {
  wood: "#5B7F5B",
  fire: "#C4674A",
  earth: "#B08D57",
  metal: "#8C8C88",
  water: "#3D4A5C",
};

/** Score / domain gauge fill (charcoal — not seal red). PDF overrides to green. */
export const SCORE_BAR_FILL = "#3E3A36";
/** PDF core-metric gauges — green family. */
export const PDF_SCORE_BAR_FILL = "#5B7F5B";
/** Score / element gauge track. */
export const SCORE_BAR_TRACK = "#E8E2D6";
export const ELEMENT_TRACK_COLOR = SCORE_BAR_TRACK;
export const OBANG_COLOR_FALLBACK = "#888888";

/** Mix accent into hanji (#F4F1EA) for PDF card fills (no CSS color-mix). */
export function obangPaleHex(key: string, mixPct = 14, base = "#F4F1EA"): string {
  const accent = OBANG_COLORS[key] ?? OBANG_COLOR_FALLBACK;
  const parse = (hex: string) => {
    const h = hex.replace("#", "");
    return [
      Number.parseInt(h.slice(0, 2), 16),
      Number.parseInt(h.slice(2, 4), 16),
      Number.parseInt(h.slice(4, 6), 16),
    ] as const;
  };
  const [ar, ag, ab] = parse(accent);
  const [br, bg, bb] = parse(base);
  const t = Math.max(0, Math.min(100, mixPct)) / 100;
  const mix = (a: number, b: number) => Math.round(a * t + b * (1 - t));
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${toHex(mix(ar, br))}${toHex(mix(ag, bg))}${toHex(mix(ab, bb))}`;
}

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

/** Match CoverSection labels: KO hangul, EN meaning only (no hanja/romanized). */
export function formatElementDisplayLabel(
  item: Pick<ElementDisplayRow, "hangul" | "hanja" | "meaning">,
  isKo: boolean
): string {
  return isKo ? `${item.hangul} (${item.hanja})` : item.meaning;
}
