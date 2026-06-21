/**
 * 지지(地支) 상호 관계 — lunisolar Branch API와 동일 우선순위
 * 冲 → 合 → 害 → 刑 → 破
 */
import type { Branch } from "./core-tables";

export type BranchRelationKind = "clash" | "harmony" | "harm" | "punish" | "break";

const LIU_CHONG: Record<Branch, Branch> = {
  子: "午",
  午: "子",
  丑: "未",
  未: "丑",
  寅: "申",
  申: "寅",
  卯: "酉",
  酉: "卯",
  辰: "戌",
  戌: "辰",
  巳: "亥",
  亥: "巳",
};

const LIU_HE: Record<Branch, Branch> = {
  子: "丑",
  丑: "子",
  寅: "亥",
  亥: "寅",
  卯: "戌",
  戌: "卯",
  辰: "酉",
  酉: "辰",
  巳: "申",
  申: "巳",
  午: "未",
  未: "午",
};

const LIU_HAI: Record<Branch, Branch> = {
  子: "未",
  未: "子",
  丑: "午",
  午: "丑",
  寅: "巳",
  巳: "寅",
  卯: "辰",
  辰: "卯",
  申: "亥",
  亥: "申",
  酉: "戌",
  戌: "酉",
};

const LIU_PO: Partial<Record<Branch, Branch>> = {
  子: "酉",
  酉: "子",
  丑: "辰",
  辰: "丑",
  卯: "午",
  午: "卯",
};

const PUNISH_PAIRS = new Set<string>([
  "子卯",
  "卯子",
  "丑戌",
  "戌丑",
  "未戌",
  "戌未",
]);

export function detectBranchRelation(
  from: string,
  to: string
): BranchRelationKind | null {
  const a = from as Branch;
  const b = to as Branch;

  if (LIU_CHONG[a] === b) return "clash";
  if (LIU_HE[a] === b) return "harmony";
  if (LIU_HAI[a] === b) return "harm";
  if (PUNISH_PAIRS.has(`${a}${b}`)) return "punish";
  if (LIU_PO[a] === b) return "break";
  return null;
}

export function branchRelationLabel(
  from: string,
  to: string,
  locale: "ko" | "en"
): string | null {
  const relation = detectBranchRelation(from, to);
  if (!relation) return null;

  const ko = locale === "ko";
  switch (relation) {
    case "clash":
      return ko ? "충(冲)" : "Clash";
    case "harmony":
      return ko ? "합(合)" : "Harmony";
    case "harm":
      return ko ? "해(害)" : "Harm";
    case "punish":
      return ko ? "형(刑)" : "Punish";
    case "break":
      return ko ? "파(破)" : "Break";
  }
}
