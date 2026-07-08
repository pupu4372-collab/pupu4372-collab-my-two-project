import type { ElementKey } from "./types";

/** Bar / accent hex — matches tailwind `mok-green`, `hwa-red`, etc. */
export const ELEMENT_BAR_HEX: Record<ElementKey, string> = {
  wood: "#4A9B6E",
  fire: "#C75C5C",
  earth: "#C9956A",
  metal: "#9A9488",
  water: "#3E6B8A",
};

/** Soft card backgrounds — matches tailwind `element-*` utilities. */
export const ELEMENT_SOFT_HEX: Record<ElementKey, string> = {
  wood: "#E5F4EC",
  fire: "#FCEAE7",
  earth: "#F7F0E4",
  metal: "#F2F0ED",
  water: "#E6EFF6",
};

/** Readable text on soft cards — matches `result-styles` pill text colors. */
export const ELEMENT_TEXT_HEX: Record<ElementKey, string> = {
  wood: "#2F6B4F",
  fire: "#9E3F3F",
  earth: "#7A5A32",
  metal: "#5C574F",
  water: "#2E5570",
};

export function elementBarHex(key: ElementKey): string {
  return ELEMENT_BAR_HEX[key];
}

export function elementSoftHex(key: ElementKey): string {
  return ELEMENT_SOFT_HEX[key];
}

export function elementTextHex(key: ElementKey): string {
  return ELEMENT_TEXT_HEX[key];
}

/** Pet premium hub section accents (MBTI / compatibility / zodiac). */
export const PET_PREMIUM_SECTION_THEME = {
  mbti: {
    accent: "#8B5CF6",
    soft: "#EDE9FE",
    labelKo: "상세 MBTI",
    labelEn: "Detailed MBTI",
  },
  compatibility: {
    accent: "#EF4444",
    soft: "#FCEAE7",
    labelKo: "집사 궁합",
    labelEn: "Pet–butler bond",
  },
  zodiac: {
    accent: "#3E6B8A",
    soft: "#E6EFF6",
    labelKo: "별자리 케어",
    labelEn: "Zodiac care",
  },
} as const;

export type PetPremiumSectionKey = keyof typeof PET_PREMIUM_SECTION_THEME;

/** Bond ring gradient — aligned with `BondScoreRing.tsx`. */
export function bondScoreRingGradient(score: number): { from: string; to: string } {
  if (score >= 90) return { from: "#B8860B", to: "#FFD700" };
  if (score >= 82) return { from: "#2563EB", to: "#93C5FD" };
  if (score >= 64) return { from: "#16A34A", to: "#86EFAC" };
  return { from: "#442656", to: "#D1ABE4" };
}
