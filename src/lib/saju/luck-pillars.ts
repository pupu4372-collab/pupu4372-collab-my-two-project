import { formatStemBranchLabels } from "./elements";
import {
  findAdjacentSolarTermInstant,
  getMonthGanZhiAtLocal,
  getSeunYearGanZhi,
  splitGanZhi,
  branchRelationLabel,
} from "./ksaju-engine";
import { BRANCH_META, formatTenGodLabel, STEM_META } from "./sipseong";
import type { Locale, PillarDisplay } from "./types";

const STEM_ORDER = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const BRANCH_ORDER = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const YANG_STEMS = new Set(["甲", "丙", "戊", "庚", "壬"]);

function pillarFromStemBranch(
  stem: string,
  branch: string,
  locale: Locale = "ko"
): PillarDisplay {
  const labels = formatStemBranchLabels(stem, branch, locale);
  return {
    pillar: `${stem}${branch}`,
    stem,
    branch,
    stemHanja: stem,
    branchHanja: branch,
    ...labels,
  };
}

function pillarFromGanZhi(ganzi: string, locale: Locale = "ko"): PillarDisplay {
  const { stem, branch } = splitGanZhi(ganzi);
  return pillarFromStemBranch(stem, branch, locale);
}

function sexagenaryIndex(pillar: PillarDisplay): number {
  const stem = pillar.stemHanja || pillar.stem;
  const branch = pillar.branchHanja || pillar.branch;
  for (let i = 0; i < 60; i += 1) {
    if (STEM_ORDER[i % 10] === stem && BRANCH_ORDER[i % 12] === branch) {
      return i;
    }
  }
  return 0;
}

function shiftPillar(
  pillar: PillarDisplay,
  offset: number,
  locale: Locale = "ko"
): PillarDisplay {
  const next = (sexagenaryIndex(pillar) + offset + 600) % 60;
  return pillarFromStemBranch(
    STEM_ORDER[next % 10],
    BRANCH_ORDER[next % 12],
    locale
  );
}

export function computeSeunPillar(year: number): PillarDisplay {
  return pillarFromGanZhi(getSeunYearGanZhi(year));
}

export type DaewoonDirection = "forward" | "reverse";
export type DaewoonGender = "male" | "female";

export interface DaewoonCycle {
  index: number;
  startAge: number;
  endAge: number;
  pillar: PillarDisplay;
  stemTenGod: string;
  branchTenGod: string;
}

export interface DaewoonCandidate {
  direction: DaewoonDirection;
  directionLabel: string;
  startAge: number;
  startAgeNote: string;
  cycles: DaewoonCycle[];
}

function resolveDaewoonDirection(
  yearStem: string,
  gender: DaewoonGender | null
): DaewoonDirection | null {
  if (!gender) return null;
  const isYangYear = YANG_STEMS.has(yearStem);
  return (gender === "male" && isYangYear) || (gender === "female" && !isYangYear)
    ? "forward"
    : "reverse";
}

function computeStartAge(
  birthUtc: string,
  direction: DaewoonDirection,
  locale: Locale
): { age: number; note: string } {
  const birth = new Date(birthUtc);
  const term = findAdjacentSolarTermInstant(birth, direction);
  if (!term) {
    return {
      age: 1,
      note: locale === "ko" ? "절기 기준 1세 근사" : "Approx. age 1 by solar-term basis",
    };
  }

  const diffDays = Math.abs(term.getTime() - birth.getTime()) / 86_400_000;
  const age = Math.max(1, Math.round(diffDays / 3));
  return {
    age,
    note:
      locale === "ko"
        ? `출생 시점과 ${direction === "forward" ? "다음" : "이전"} 절기 차이 약 ${Math.round(diffDays)}일 기준`
        : `Based on approx. ${Math.round(diffDays)} days to the ${
            direction === "forward" ? "next" : "previous"
          } solar term`,
  };
}

export function computeDaewoonCandidates(options: {
  birthUtc: string;
  yearStem: string;
  monthPillar: PillarDisplay;
  dayStem: string;
  locale: Locale;
  gender?: DaewoonGender | null;
}): DaewoonCandidate[] {
  const resolved = resolveDaewoonDirection(
    options.yearStem,
    options.gender ?? null
  );
  const directions: DaewoonDirection[] = resolved
    ? [resolved]
    : ["forward", "reverse"];

  return directions.map((direction) => {
    const start = computeStartAge(options.birthUtc, direction, options.locale);
    const sign = direction === "forward" ? 1 : -1;
    const cycles = Array.from({ length: 8 }, (_, index) => {
      const pillar = shiftPillar(
        options.monthPillar,
        sign * (index + 1),
        options.locale
      );
      const reading = describeLuckPillar(options.dayStem, pillar, options.locale);
      return {
        index: index + 1,
        startAge: start.age + index * 10,
        endAge: start.age + index * 10 + 9,
        pillar,
        stemTenGod: reading.stemTenGod,
        branchTenGod: reading.branchTenGod,
      };
    });

    return {
      direction,
      directionLabel:
        options.locale === "ko"
          ? direction === "forward"
            ? "순행"
            : "역행"
          : direction === "forward"
            ? "Forward"
            : "Reverse",
      startAge: start.age,
      startAgeNote: start.note,
      cycles,
    };
  });
}

export function computeMonthLuckPillar(
  year: number,
  month: number,
  _timezone: string
): PillarDisplay {
  void _timezone;
  return pillarFromGanZhi(getMonthGanZhiAtLocal(year, month));
}

export interface LuckPillarReading {
  pillar: PillarDisplay;
  stemTenGod: string;
  branchTenGod: string;
}

export function describeLuckPillar(
  dayStem: string,
  pillar: PillarDisplay,
  locale: Locale
): LuckPillarReading {
  return {
    pillar,
    stemTenGod: formatTenGodLabel(dayStem, STEM_META[pillar.stemHanja], locale),
    branchTenGod: formatTenGodLabel(
      dayStem,
      BRANCH_META[pillar.branchHanja],
      locale
    ),
  };
}

export interface SeunNatalInteraction {
  natalSlot: "year" | "month" | "day" | "hour";
  natalBranch: string;
  relation: string;
  label: string;
}

const SLOT_LABEL: Record<SeunNatalInteraction["natalSlot"], { ko: string; en: string }> =
  {
    year: { ko: "년지", en: "Year branch" },
    month: { ko: "월지", en: "Month branch" },
    day: { ko: "일지", en: "Day branch" },
    hour: { ko: "시지", en: "Hour branch" },
  };

export function computeSeunNatalInteractions(
  seunBranch: string,
  pillars: {
    year: PillarDisplay;
    month: PillarDisplay;
    day: PillarDisplay;
    hour: PillarDisplay | null;
  },
  locale: Locale
): SeunNatalInteraction[] {
  const slots: Array<{
    slot: SeunNatalInteraction["natalSlot"];
    branch: string;
  }> = [
    { slot: "year", branch: pillars.year.branchHanja },
    { slot: "month", branch: pillars.month.branchHanja },
    { slot: "day", branch: pillars.day.branchHanja },
  ];
  if (pillars.hour) {
    slots.push({ slot: "hour", branch: pillars.hour.branchHanja });
  }

  const lines: SeunNatalInteraction[] = [];
  for (const { slot, branch } of slots) {
    if (branch === seunBranch) continue;
    const relation = branchRelationLabel(seunBranch, branch, locale);
    if (!relation) continue;
    const slotLabel = SLOT_LABEL[slot][locale];
    lines.push({
      natalSlot: slot,
      natalBranch: branch,
      relation,
      label:
        locale === "ko"
          ? `세운 지지 ${seunBranch} ↔ ${slotLabel} ${branch}: ${relation}`
          : `Seun branch ${seunBranch} ↔ ${slotLabel} ${branch}: ${relation}`,
    });
  }
  return lines;
}
