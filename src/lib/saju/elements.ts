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

  return ELEMENT_ORDER.map((key) => ({
      key,
      ...ELEMENT_META[key],
      count: counts[key],
    }));
}

export function formatStemBranchLabels(stem: string, branch: string): {
  stemLabel: string;
  branchLabel: string;
} {
  const s = STEM_LABEL[stem];
  const b = BRANCH_LABEL[branch];
  return {
    stemLabel: s ? `${s.hangul} (${s.romanized})` : stem,
    branchLabel: b ? `${b.hangul} (${b.romanized})` : branch,
  };
}

export function formatBranchSign(branchHanja: string, locale: Locale): string {
  const b = BRANCH_LABEL[branchHanja];
  if (!b) return branchHanja;
  return locale === "ko" ? `${b.hangul}(${branchHanja})` : `${b.romanized} (${branchHanja})`;
}
