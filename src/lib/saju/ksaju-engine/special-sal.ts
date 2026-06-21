/**
 * 신살(神殺) 계산
 */
import type { Branch, Stem } from "./core-tables";

export interface SajuFourPillars {
  yearStem: Stem;
  yearBranch: Branch;
  monthStem: Stem;
  monthBranch: Branch;
  dayStem: Stem;
  dayBranch: Branch;
  hourStem: Stem;
  hourBranch: Branch;
}

function branchesOf(p: SajuFourPillars): Branch[] {
  return [p.yearBranch, p.monthBranch, p.dayBranch, p.hourBranch];
}

const YANGIN_BY_DAYSTEM: Partial<Record<Stem, Branch>> = {
  甲: "卯",
  丙: "午",
  戊: "午",
  庚: "酉",
  壬: "子",
};

const DOHWA_GROUP: Record<Branch, Branch> = {
  寅: "卯",
  午: "卯",
  戌: "卯",
  申: "酉",
  子: "酉",
  辰: "酉",
  巳: "午",
  酉: "午",
  丑: "午",
  亥: "子",
  卯: "子",
  未: "子",
};

const YEOKMA_GROUP: Record<Branch, Branch> = {
  寅: "申",
  午: "申",
  戌: "申",
  申: "寅",
  子: "寅",
  辰: "寅",
  巳: "亥",
  酉: "亥",
  丑: "亥",
  亥: "巳",
  卯: "巳",
  未: "巳",
};

const HWAGAE_GROUP: Record<Branch, Branch> = {
  寅: "戌",
  午: "戌",
  戌: "戌",
  申: "辰",
  子: "辰",
  辰: "辰",
  巳: "丑",
  酉: "丑",
  丑: "丑",
  亥: "未",
  卯: "未",
  未: "未",
};

const CHEONEUL_BY_DAYSTEM: Record<Stem, Branch[]> = {
  甲: ["丑", "未"],
  戊: ["丑", "未"],
  庚: ["丑", "未"],
  乙: ["子", "申"],
  己: ["子", "申"],
  丙: ["亥", "酉"],
  丁: ["亥", "酉"],
  辛: ["寅", "午"],
  壬: ["卯", "巳"],
  癸: ["卯", "巳"],
};

const MUNCHANG_BY_DAYSTEM: Record<Stem, Branch> = {
  甲: "巳",
  乙: "午",
  丙: "申",
  丁: "酉",
  戊: "申",
  己: "酉",
  庚: "亥",
  辛: "子",
  壬: "寅",
  癸: "卯",
};

const BAEKHO_DAYPILLARS = new Set(["甲辰", "乙未", "丙戌", "丁丑", "戊辰", "壬戌", "癸丑"]);
const GOEGANG_DAYPILLARS = new Set(["庚辰", "庚戌", "壬辰", "戊戌"]);

export interface SpecialSalResult {
  yangin: number[];
  dohwa: number[];
  yeokma: number[];
  hwagae: number[];
  cheoneul: number[];
  munchang: number[];
  baekho: boolean;
  goegang: boolean;
}

function findIndices(branches: Branch[], target: Branch | undefined): number[] {
  if (!target) return [];
  const result: number[] = [];
  branches.forEach((b, i) => {
    if (b === target) result.push(i);
  });
  return result;
}

export function calcSpecialSal(p: SajuFourPillars): SpecialSalResult {
  const branches = branchesOf(p);
  const dayPillarGanzi = p.dayStem + p.dayBranch;

  return {
    yangin: findIndices(branches, YANGIN_BY_DAYSTEM[p.dayStem]),
    dohwa: findIndices(branches, DOHWA_GROUP[p.yearBranch]),
    yeokma: findIndices(branches, YEOKMA_GROUP[p.yearBranch]),
    hwagae: findIndices(branches, HWAGAE_GROUP[p.yearBranch]),
    cheoneul: (CHEONEUL_BY_DAYSTEM[p.dayStem] ?? []).flatMap((b) => findIndices(branches, b)),
    munchang: findIndices(branches, MUNCHANG_BY_DAYSTEM[p.dayStem]),
    baekho: BAEKHO_DAYPILLARS.has(dayPillarGanzi),
    goegang: GOEGANG_DAYPILLARS.has(dayPillarGanzi),
  };
}
