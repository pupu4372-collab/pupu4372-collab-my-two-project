import { formatElementLabelForLocale } from "./elements";
import type { ElementKey, Locale } from "./types";

function hash(input: string) {
  let value = 0;
  for (const char of input) value = (value * 31 + char.charCodeAt(0)) >>> 0;
  return value;
}

const LUCKY_COLORS = {
  ko: ["연노란색", "민트", "살구", "라벤더", "연분홍", "하늘색", "크림", "올리브"],
  en: ["soft yellow", "mint", "apricot", "lavender", "soft pink", "sky blue", "cream", "olive"],
} as const;

export interface PetLuckyScores {
  luckyNumber: number;
  wealthScore: number;
  healthScore: number;
  luckyColor: string;
}

export function buildPetLuckyScores(
  petName: string,
  birthUtc: string,
  dominantElement: ElementKey,
  locale: Locale,
  today = new Date()
): PetLuckyScores {
  const dayKey = today.toISOString().slice(0, 10);
  const seed = hash(`${petName}:${birthUtc}:${dominantElement}:${dayKey}`);
  const colors = LUCKY_COLORS[locale];

  return {
    luckyNumber: (seed % 9) + 1,
    wealthScore: 68 + (seed % 33),
    healthScore: 65 + ((seed * 7) % 35),
    luckyColor: colors[seed % colors.length],
  };
}

export function dominantElementLabel(element: ElementKey, locale: Locale) {
  return formatElementLabelForLocale(element, locale);
}
