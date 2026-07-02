import type { ElementDisplay, ElementKey, Locale } from "./types";

const HANJA_TO_ELEMENT: Record<string, ElementKey> = {
  木: "wood",
  火: "fire",
  土: "earth",
  金: "metal",
  水: "water",
};

const STEM_BRANCH_ELEMENT: Record<string, ElementKey> = {
  甲: "wood",
  乙: "wood",
  丙: "fire",
  丁: "fire",
  戊: "earth",
  己: "earth",
  庚: "metal",
  辛: "metal",
  壬: "water",
  癸: "water",
  寅: "wood",
  卯: "wood",
  巳: "fire",
  午: "fire",
  辰: "earth",
  戌: "earth",
  丑: "earth",
  未: "earth",
  申: "metal",
  酉: "metal",
  亥: "water",
  子: "water",
};

export const ELEMENT_META: Record<
  ElementKey,
  { hanja: string; hangul: string; romanized: string; meaning: string }
> = {
  wood: { hanja: "木", hangul: "목", romanized: "Mok", meaning: "Tree" },
  fire: { hanja: "火", hangul: "화", romanized: "Hwa", meaning: "Fire" },
  earth: { hanja: "土", hangul: "토", romanized: "To", meaning: "Earth" },
  metal: { hanja: "金", hangul: "금", romanized: "Geum", meaning: "Metal" },
  water: { hanja: "水", hangul: "수", romanized: "Su", meaning: "Water" },
};

export const ELEMENT_ORDER: ElementKey[] = ["wood", "fire", "earth", "metal", "water"];

const STEM_LABEL: Record<string, { hangul: string; romanized: string }> = {
  甲: { hangul: "갑", romanized: "Gap" },
  乙: { hangul: "을", romanized: "Eul" },
  丙: { hangul: "병", romanized: "Byeong" },
  丁: { hangul: "정", romanized: "Jeong" },
  戊: { hangul: "무", romanized: "Mu" },
  己: { hangul: "기", romanized: "Gi" },
  庚: { hangul: "경", romanized: "Gyeong" },
  辛: { hangul: "신", romanized: "Sin" },
  壬: { hangul: "임", romanized: "Im" },
  癸: { hangul: "계", romanized: "Gye" },
};

const BRANCH_LABEL: Record<string, { hangul: string; romanized: string }> = {
  子: { hangul: "자", romanized: "Ja" },
  丑: { hangul: "축", romanized: "Chuk" },
  寅: { hangul: "인", romanized: "In" },
  卯: { hangul: "묘", romanized: "Myo" },
  辰: { hangul: "진", romanized: "Jin" },
  巳: { hangul: "사", romanized: "Sa" },
  午: { hangul: "오", romanized: "O" },
  未: { hangul: "미", romanized: "Mi" },
  申: { hangul: "신", romanized: "Sin" },
  酉: { hangul: "유", romanized: "Yu" },
  戌: { hangul: "술", romanized: "Sul" },
  亥: { hangul: "해", romanized: "Hae" },
};

const BRANCH_ZODIAC_EN: Record<string, string> = {
  子: "Rat",
  丑: "Ox",
  寅: "Tiger",
  卯: "Rabbit",
  辰: "Dragon",
  巳: "Snake",
  午: "Horse",
  未: "Goat",
  申: "Monkey",
  酉: "Rooster",
  戌: "Dog",
  亥: "Pig",
};

export function charToElement(char: string): ElementKey | null {
  return STEM_BRANCH_ELEMENT[char] ?? HANJA_TO_ELEMENT[char] ?? null;
}

export function countElements(chars: string[]): ElementKey {
  const counts: Record<ElementKey, number> = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  };

  for (const char of chars) {
    const el = charToElement(char);
    if (el) counts[el] += 1;
  }

  return (Object.keys(counts) as ElementKey[]).reduce((best, key) =>
    counts[key] > counts[best] ? key : best
  );
}

export function computeElementPercents(
  counts: Record<ElementKey, number>
): Record<ElementKey, number> {
  const total = ELEMENT_ORDER.reduce((sum, key) => sum + counts[key], 0);
  const percents = Object.fromEntries(ELEMENT_ORDER.map((key) => [key, 0])) as Record<
    ElementKey,
    number
  >;

  if (total <= 0) return percents;

  const floors = ELEMENT_ORDER.map((key, index) => {
    const count = counts[key];
    if (count <= 0) {
      return { index, key, count, floor: 0, fraction: 0 };
    }
    const exact = (count / total) * 100;
    const floor = Math.floor(exact);
    return { index, key, count, floor, fraction: exact - floor };
  });

  for (const entry of floors) {
    percents[entry.key] = entry.floor;
  }

  let remainder = 100 - floors.reduce((sum, entry) => sum + entry.floor, 0);
  const ranked = floors
    .filter((entry) => entry.count > 0)
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index);

  for (let i = 0; i < remainder && i < ranked.length; i += 1) {
    percents[ranked[i]!.key] += 1;
  }

  return percents;
}

export function buildElementBreakdown(chars: string[]): ElementDisplay[] {
  const counts: Record<ElementKey, number> = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  };

  for (const char of chars) {
    const el = charToElement(char);
    if (el) counts[el] += 1;
  }

  const percents = computeElementPercents(counts);

  return ELEMENT_ORDER.map((key) => ({
    key,
    ...ELEMENT_META[key],
    count: counts[key],
    percent: percents[key],
  }));
}

export function stemHangulLabel(stem: string): string {
  return STEM_LABEL[stem]?.hangul ?? stem;
}

export function branchHangulLabel(branch: string): string {
  return BRANCH_LABEL[branch]?.hangul ?? branch;
}

export function formatStemBranchLabels(
  stem: string,
  branch: string,
  locale: Locale = "ko"
): {
  stemLabel: string;
  branchLabel: string;
} {
  const s = STEM_LABEL[stem];
  const b = BRANCH_LABEL[branch];
  if (locale === "en") {
    return {
      stemLabel: s ? `${s.hangul} (${s.romanized})` : stem,
      branchLabel: b ? `${b.hangul} (${b.romanized})` : branch,
    };
  }
  return {
    stemLabel: s ? `${s.hangul}(${stem})` : stem,
    branchLabel: b ? `${b.hangul}(${branch})` : branch,
  };
}

export function formatBranchSign(branchHanja: string, locale: Locale): string {
  const b = BRANCH_LABEL[branchHanja];
  if (!b) return branchHanja;
  if (locale === "ko") return `${b.hangul}(${branchHanja})`;
  const zodiac = BRANCH_ZODIAC_EN[branchHanja] ?? b.romanized;
  return `${zodiac} (${branchHanja})`;
}
