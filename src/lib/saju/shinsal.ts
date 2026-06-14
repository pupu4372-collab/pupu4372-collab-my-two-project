import type { Locale, PillarDisplay } from "./types";

type PillarSlot = "year" | "month" | "day" | "hour";

interface BranchRule {
  nameKo: string;
  nameEn: string;
  basisKo: string;
  basisEn: string;
  targetBranches: string[];
}

export interface ShinsalFact {
  key: string;
  name: string;
  basis: string;
  targetBranches: string[];
  matchedSlots: Array<{
    slot: PillarSlot;
    branch: string;
    label: string;
  }>;
}

const SLOT_LABEL: Record<PillarSlot, { ko: string; en: string }> = {
  year: { ko: "년지", en: "Year branch" },
  month: { ko: "월지", en: "Month branch" },
  day: { ko: "일지", en: "Day branch" },
  hour: { ko: "시지", en: "Hour branch" },
};

const CHEONEUL_RULES: Record<string, string[]> = {
  甲: ["丑", "未"],
  戊: ["丑", "未"],
  庚: ["丑", "未"],
  乙: ["子", "申"],
  己: ["子", "申"],
  丙: ["亥", "酉"],
  丁: ["亥", "酉"],
  壬: ["卯", "巳"],
  癸: ["卯", "巳"],
  辛: ["寅", "午"],
};

const MUNCHANG_RULES: Record<string, string[]> = {
  甲: ["巳"],
  乙: ["午"],
  丙: ["申"],
  丁: ["酉"],
  戊: ["申"],
  己: ["酉"],
  庚: ["亥"],
  辛: ["子"],
  壬: ["寅"],
  癸: ["卯"],
};

const GROUP_RULES: Record<
  string,
  { peach: string; horse: string; canopy: string }
> = {
  "申子辰": { peach: "酉", horse: "寅", canopy: "辰" },
  "寅午戌": { peach: "卯", horse: "申", canopy: "戌" },
  "巳酉丑": { peach: "午", horse: "亥", canopy: "丑" },
  "亥卯未": { peach: "子", horse: "巳", canopy: "未" },
};

function groupTargets(branch: string): { peach: string; horse: string; canopy: string } {
  const found = Object.entries(GROUP_RULES).find(([group]) =>
    group.includes(branch)
  );
  return found?.[1] ?? GROUP_RULES["申子辰"];
}

function buildRules(dayStem: string, dayBranch: string): Record<string, BranchRule> {
  const group = groupTargets(dayBranch);
  return {
    cheoneul: {
      nameKo: "천을귀인",
      nameEn: "Heavenly Noble",
      basisKo: "일간 기준",
      basisEn: "Day stem basis",
      targetBranches: CHEONEUL_RULES[dayStem] ?? [],
    },
    peach: {
      nameKo: "도화",
      nameEn: "Peach Blossom",
      basisKo: "일지 삼합 기준",
      basisEn: "Day-branch trine basis",
      targetBranches: [group.peach],
    },
    horse: {
      nameKo: "역마",
      nameEn: "Traveling Horse",
      basisKo: "일지 삼합 기준",
      basisEn: "Day-branch trine basis",
      targetBranches: [group.horse],
    },
    canopy: {
      nameKo: "화개",
      nameEn: "Canopy",
      basisKo: "일지 삼합 기준",
      basisEn: "Day-branch trine basis",
      targetBranches: [group.canopy],
    },
    munchang: {
      nameKo: "문창귀인",
      nameEn: "Literary Noble",
      basisKo: "일간 기준",
      basisEn: "Day stem basis",
      targetBranches: MUNCHANG_RULES[dayStem] ?? [],
    },
  };
}

export function computeRepresentativeShinsal(
  pillars: {
    year: PillarDisplay;
    month: PillarDisplay;
    day: PillarDisplay;
    hour: PillarDisplay | null;
  },
  locale: Locale
): ShinsalFact[] {
  const branches: Array<{ slot: PillarSlot; branch: string }> = [
    { slot: "year", branch: pillars.year.branchHanja },
    { slot: "month", branch: pillars.month.branchHanja },
    { slot: "day", branch: pillars.day.branchHanja },
  ];
  if (pillars.hour) {
    branches.push({ slot: "hour", branch: pillars.hour.branchHanja });
  }

  const rules = buildRules(pillars.day.stemHanja, pillars.day.branchHanja);
  return Object.entries(rules).map(([key, rule]) => {
    const matchedSlots = branches
      .filter((item) => rule.targetBranches.includes(item.branch))
      .map((item) => {
        const slotLabel = SLOT_LABEL[item.slot][locale];
        return {
          slot: item.slot,
          branch: item.branch,
          label:
            locale === "ko"
              ? `${slotLabel} ${item.branch}`
              : `${slotLabel} ${item.branch}`,
        };
      });

    return {
      key,
      name: locale === "ko" ? rule.nameKo : rule.nameEn,
      basis: locale === "ko" ? rule.basisKo : rule.basisEn,
      targetBranches: rule.targetBranches,
      matchedSlots,
    };
  });
}
