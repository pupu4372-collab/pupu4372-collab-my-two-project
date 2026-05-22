import type { ElementKey } from "../types";

export type ZodiacSignKey =
  | "aries"
  | "taurus"
  | "gemini"
  | "cancer"
  | "leo"
  | "virgo"
  | "libra"
  | "scorpio"
  | "sagittarius"
  | "capricorn"
  | "aquarius"
  | "pisces";

export interface ZodiacSignMeta {
  key: ZodiacSignKey;
  symbol: string;
  nameKo: string;
  nameEn: string;
  dateRangeKo: string;
  dateRangeEn: string;
  /** K-Saju 오행 affinity for Cosmic Paws branding */
  elementAffinity: ElementKey;
  emoji: string;
}

/** Tropical zodiac — month/day boundaries (inclusive start, exclusive end for parsing) */
const RANGES: Array<{ key: ZodiacSignKey; start: [number, number]; end: [number, number] }> = [
  { key: "capricorn", start: [12, 22], end: [1, 20] },
  { key: "aquarius", start: [1, 21], end: [2, 19] },
  { key: "pisces", start: [2, 20], end: [3, 20] },
  { key: "aries", start: [3, 21], end: [4, 20] },
  { key: "taurus", start: [4, 21], end: [5, 21] },
  { key: "gemini", start: [5, 22], end: [6, 21] },
  { key: "cancer", start: [6, 22], end: [7, 22] },
  { key: "leo", start: [7, 23], end: [8, 22] },
  { key: "virgo", start: [8, 23], end: [9, 22] },
  { key: "libra", start: [9, 23], end: [10, 22] },
  { key: "scorpio", start: [10, 23], end: [11, 21] },
  { key: "sagittarius", start: [11, 22], end: [12, 21] },
];

export const ZODIAC_META: Record<ZodiacSignKey, ZodiacSignMeta> = {
  aries: {
    key: "aries",
    symbol: "♈",
    nameKo: "양자리",
    nameEn: "Aries",
    dateRangeKo: "3/21 ~ 4/20",
    dateRangeEn: "Mar 21 – Apr 20",
    elementAffinity: "fire",
    emoji: "🔥",
  },
  taurus: {
    key: "taurus",
    symbol: "♉",
    nameKo: "황소자리",
    nameEn: "Taurus",
    dateRangeKo: "4/21 ~ 5/21",
    dateRangeEn: "Apr 21 – May 21",
    elementAffinity: "earth",
    emoji: "🌿",
  },
  gemini: {
    key: "gemini",
    symbol: "♊",
    nameKo: "쌍둥이자리",
    nameEn: "Gemini",
    dateRangeKo: "5/22 ~ 6/21",
    dateRangeEn: "May 22 – Jun 21",
    elementAffinity: "metal",
    emoji: "💨",
  },
  cancer: {
    key: "cancer",
    symbol: "♋",
    nameKo: "게자리",
    nameEn: "Cancer",
    dateRangeKo: "6/22 ~ 7/22",
    dateRangeEn: "Jun 22 – Jul 22",
    elementAffinity: "water",
    emoji: "🌙",
  },
  leo: {
    key: "leo",
    symbol: "♌",
    nameKo: "사자자리",
    nameEn: "Leo",
    dateRangeKo: "7/23 ~ 8/22",
    dateRangeEn: "Jul 23 – Aug 22",
    elementAffinity: "fire",
    emoji: "☀️",
  },
  virgo: {
    key: "virgo",
    symbol: "♍",
    nameKo: "처녀자리",
    nameEn: "Virgo",
    dateRangeKo: "8/23 ~ 9/22",
    dateRangeEn: "Aug 23 – Sep 22",
    elementAffinity: "earth",
    emoji: "🍃",
  },
  libra: {
    key: "libra",
    symbol: "♎",
    nameKo: "천칭자리",
    nameEn: "Libra",
    dateRangeKo: "9/23 ~ 10/22",
    dateRangeEn: "Sep 23 – Oct 22",
    elementAffinity: "metal",
    emoji: "⚖️",
  },
  scorpio: {
    key: "scorpio",
    symbol: "♏",
    nameKo: "전갈자리",
    nameEn: "Scorpio",
    dateRangeKo: "10/23 ~ 11/21",
    dateRangeEn: "Oct 23 – Nov 21",
    elementAffinity: "water",
    emoji: "🦂",
  },
  sagittarius: {
    key: "sagittarius",
    symbol: "♐",
    nameKo: "사수자리",
    nameEn: "Sagittarius",
    dateRangeKo: "11/22 ~ 12/21",
    dateRangeEn: "Nov 22 – Dec 21",
    elementAffinity: "fire",
    emoji: "🏹",
  },
  capricorn: {
    key: "capricorn",
    symbol: "♑",
    nameKo: "염소자리",
    nameEn: "Capricorn",
    dateRangeKo: "12/22 ~ 1/19",
    dateRangeEn: "Dec 22 – Jan 19",
    elementAffinity: "earth",
    emoji: "⛰️",
  },
  aquarius: {
    key: "aquarius",
    symbol: "♒",
    nameKo: "물병자리",
    nameEn: "Aquarius",
    dateRangeKo: "1/20 ~ 2/18",
    dateRangeEn: "Jan 20 – Feb 18",
    elementAffinity: "water",
    emoji: "💧",
  },
  pisces: {
    key: "pisces",
    symbol: "♓",
    nameKo: "물고기자리",
    nameEn: "Pisces",
    dateRangeKo: "2/19 ~ 3/20",
    dateRangeEn: "Feb 19 – Mar 20",
    elementAffinity: "water",
    emoji: "🐟",
  },
};

function dayOfYear(month: number, day: number): number {
  const days = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  return days[month - 1] + day;
}

function isInRange(
  month: number,
  day: number,
  start: [number, number],
  end: [number, number]
): boolean {
  const d = dayOfYear(month, day);
  const s = dayOfYear(start[0], start[1]);
  const e = dayOfYear(end[0], end[1]);
  if (s <= e) return d >= s && d <= e;
  return d >= s || d <= e;
}

export function getZodiacSignFromBirthDate(birthDate: string): ZodiacSignMeta {
  const [y, m, d] = birthDate.split("-").map(Number);
  if (!Number.isFinite(m) || !Number.isFinite(d)) {
    throw new Error("Invalid birth date");
  }

  for (const range of RANGES) {
    if (isInRange(m, d, range.start, range.end)) {
      return ZODIAC_META[range.key];
    }
  }

  return ZODIAC_META.capricorn;
}
