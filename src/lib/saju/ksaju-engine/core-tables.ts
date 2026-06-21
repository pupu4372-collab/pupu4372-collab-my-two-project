/**
 * 명리학 기초 데이터 테이블
 *
 * 천간지지, 오행, 60갑자, 십신, 십이운성 등은 전통 명리학의
 * 공공 영역(public domain) 지식 체계이며, 아래 테이블은 해당
 * 전통 규칙을 기반으로 독자적으로 정리한 것이다.
 */

export type FiveElement = "wood" | "fire" | "earth" | "metal" | "water";
export type YinYang = "yang" | "yin";

export const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;
export const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;

export type Stem = (typeof STEMS)[number];
export type Branch = (typeof BRANCHES)[number];

export const STEM_META: Record<Stem, { element: FiveElement; yy: YinYang }> = {
  甲: { element: "wood", yy: "yang" },
  乙: { element: "wood", yy: "yin" },
  丙: { element: "fire", yy: "yang" },
  丁: { element: "fire", yy: "yin" },
  戊: { element: "earth", yy: "yang" },
  己: { element: "earth", yy: "yin" },
  庚: { element: "metal", yy: "yang" },
  辛: { element: "metal", yy: "yin" },
  壬: { element: "water", yy: "yang" },
  癸: { element: "water", yy: "yin" },
};

export const BRANCH_ELEMENT: Record<Branch, FiveElement> = {
  子: "water",
  丑: "earth",
  寅: "wood",
  卯: "wood",
  辰: "earth",
  巳: "fire",
  午: "fire",
  未: "earth",
  申: "metal",
  酉: "metal",
  戌: "earth",
  亥: "water",
};

export const HIDDEN_STEMS: Record<Branch, Stem[]> = {
  子: ["壬", "癸"],
  丑: ["癸", "辛", "己"],
  寅: ["戊", "丙", "甲"],
  卯: ["甲", "乙"],
  辰: ["乙", "癸", "戊"],
  巳: ["戊", "庚", "丙"],
  午: ["丙", "己", "丁"],
  未: ["丁", "乙", "己"],
  申: ["戊", "壬", "庚"],
  酉: ["庚", "辛"],
  戌: ["辛", "丁", "戊"],
  亥: ["戊", "甲", "壬"],
};

export const SEXAGENARY: string[] = (() => {
  const list: string[] = [];
  for (let i = 0; i < 60; i++) {
    list.push(STEMS[i % 10] + BRANCHES[i % 12]);
  }
  return list;
})();

export function sexagenaryIndex(ganzi: string): number {
  return SEXAGENARY.indexOf(ganzi);
}

export const TEN_GODS = {
  peerSame: "比肩",
  peerDiff: "劫財",
  outputSame: "食神",
  outputDiff: "傷官",
  wealthSame: "偏財",
  wealthDiff: "正財",
  powerSame: "偏官",
  powerDiff: "正官",
  resSame: "偏印",
  resDiff: "正印",
} as const;

export const TWELVE_STAGES = [
  "長生",
  "沐浴",
  "冠帶",
  "建祿",
  "帝旺",
  "衰",
  "病",
  "死",
  "墓",
  "絶",
  "胎",
  "養",
] as const;

export const TWELVE_SAL = [
  "劫殺",
  "災殺",
  "天殺",
  "地殺",
  "年殺",
  "月殺",
  "亡身殺",
  "將星殺",
  "攀鞍殺",
  "驛馬殺",
  "六害殺",
  "華蓋殺",
] as const;

export const PILLAR_LABELS = ["年柱", "月柱", "日柱", "時柱"] as const;

export const NORMALIZE_HANJA: Record<string, string> = {
  临官: "建祿",
  财: "財",
  势: "勢",
  劫财: "劫財",
  伤官: "傷官",
  正财: "正財",
  偏财: "偏財",
  正官: "正官",
  七杀: "七殺",
  偏印: "偏印",
};

export function normalizeHanja(s: string): string {
  return NORMALIZE_HANJA[s] ?? s;
}
