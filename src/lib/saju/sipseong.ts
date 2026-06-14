import type { ElementKey, Locale, PillarDisplay } from "./types";

type Polarity = "yang" | "yin";

export interface StemBranchMeta {
  element: ElementKey;
  polarity: Polarity;
}

export const STEM_META: Record<string, StemBranchMeta> = {
  甲: { element: "wood", polarity: "yang" },
  乙: { element: "wood", polarity: "yin" },
  丙: { element: "fire", polarity: "yang" },
  丁: { element: "fire", polarity: "yin" },
  戊: { element: "earth", polarity: "yang" },
  己: { element: "earth", polarity: "yin" },
  庚: { element: "metal", polarity: "yang" },
  辛: { element: "metal", polarity: "yin" },
  壬: { element: "water", polarity: "yang" },
  癸: { element: "water", polarity: "yin" },
};

export const BRANCH_META: Record<string, StemBranchMeta> = {
  子: { element: "water", polarity: "yang" },
  丑: { element: "earth", polarity: "yin" },
  寅: { element: "wood", polarity: "yang" },
  卯: { element: "wood", polarity: "yin" },
  辰: { element: "earth", polarity: "yang" },
  巳: { element: "fire", polarity: "yin" },
  午: { element: "fire", polarity: "yang" },
  未: { element: "earth", polarity: "yin" },
  申: { element: "metal", polarity: "yang" },
  酉: { element: "metal", polarity: "yin" },
  戌: { element: "earth", polarity: "yang" },
  亥: { element: "water", polarity: "yin" },
};

const GENERATES: Record<ElementKey, ElementKey> = {
  wood: "fire",
  fire: "earth",
  earth: "metal",
  metal: "water",
  water: "wood",
};

const CONTROLS: Record<ElementKey, ElementKey> = {
  wood: "earth",
  fire: "metal",
  earth: "water",
  metal: "wood",
  water: "fire",
};

export type PillarSlot = "year" | "month" | "day" | "hour";

export interface PillarSipseongLabels {
  stem: string;
  branch: string;
}

export function formatTenGodLabel(
  dayStem: string,
  target: StemBranchMeta | undefined,
  locale: Locale
): string {
  const day = STEM_META[dayStem];
  if (!day || !target) return "-";

  const samePolarity = day.polarity === target.polarity;
  if (day.element === target.element) {
    return locale === "ko"
      ? samePolarity
        ? "비견"
        : "겁재"
      : samePolarity
        ? "Peer"
        : "Rob Wealth";
  }
  if (GENERATES[day.element] === target.element) {
    return locale === "ko"
      ? samePolarity
        ? "식신"
        : "상관"
      : samePolarity
        ? "Eating God"
        : "Hurting Officer";
  }
  if (GENERATES[target.element] === day.element) {
    return locale === "ko"
      ? samePolarity
        ? "편인"
        : "정인"
      : samePolarity
        ? "Indirect Resource"
        : "Direct Resource";
  }
  if (CONTROLS[day.element] === target.element) {
    return locale === "ko"
      ? samePolarity
        ? "편재"
        : "정재"
      : samePolarity
        ? "Indirect Wealth"
        : "Direct Wealth";
  }
  if (CONTROLS[target.element] === day.element) {
    return locale === "ko"
      ? samePolarity
        ? "편관"
        : "정관"
      : samePolarity
        ? "Seven Killings"
        : "Direct Officer";
  }
  return "-";
}

function pillarSipseong(
  dayStem: string,
  pillar: PillarDisplay,
  locale: Locale
): PillarSipseongLabels {
  return {
    stem: formatTenGodLabel(dayStem, STEM_META[pillar.stemHanja], locale),
    branch: formatTenGodLabel(dayStem, BRANCH_META[pillar.branchHanja], locale),
  };
}

export function computeChartSipseong(
  dayStem: string,
  pillars: {
    year: PillarDisplay;
    month: PillarDisplay;
    day: PillarDisplay;
    hour: PillarDisplay | null;
  },
  locale: Locale
): Record<PillarSlot, PillarSipseongLabels | null> {
  return {
    year: pillarSipseong(dayStem, pillars.year, locale),
    month: pillarSipseong(dayStem, pillars.month, locale),
    day: pillarSipseong(dayStem, pillars.day, locale),
    hour: pillars.hour ? pillarSipseong(dayStem, pillars.hour, locale) : null,
  };
}
