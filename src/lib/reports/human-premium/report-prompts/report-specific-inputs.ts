import {
  getDayGanZhiAtLocal,
  getMonthGanZhiAtLocal,
  getSeunYearGanZhi,
  splitGanZhi,
} from "@/lib/saju/ksaju-engine";
import type { PremiumPromptContext } from "@/lib/saju/llm/prompts/premium-context";
import {
  FREE_DAILY_PREVIEW_PROMPT_PRODUCT,
  type HumanPremiumPromptProductKey,
} from "./products";
import { resolvePromptProduct } from "./registry";

export interface ReportSpecificInputVars {
  today_stem: string;
  today_branch: string;
  target_month: string;
  month_stem: string;
  month_branch: string;
  decade_sewun_list: string;
  daewoon_list: string;
  current_age: string;
  reportSpecificBlock: string;
}

const EMPTY_VARS: ReportSpecificInputVars = {
  today_stem: "",
  today_branch: "",
  target_month: "",
  month_stem: "",
  month_branch: "",
  decade_sewun_list: "",
  daewoon_list: "",
  current_age: "",
  reportSpecificBlock: "",
};

function kstDateParts(date = new Date()): { year: number; month: number; day: number } {
  const kst = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  return {
    year: kst.getFullYear(),
    month: kst.getMonth() + 1,
    day: kst.getDate(),
  };
}

function computeCurrentAge(solarBirthDate: string): number {
  const [birthYear, birthMonth, birthDay] = solarBirthDate.split("-").map(Number);
  const now = kstDateParts();
  let age = now.year - birthYear;
  if (now.month < birthMonth || (now.month === birthMonth && now.day < birthDay)) {
    age -= 1;
  }
  return Math.max(0, age);
}

function formatTodayInputs(ctx: PremiumPromptContext): ReportSpecificInputVars {
  const { year, month, day } = kstDateParts();
  const ganzi = getDayGanZhiAtLocal(year, month, day);
  const { stem, branch } = splitGanZhi(ganzi);
  const dateKst = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const block =
    ctx.locale === "ko"
      ? [
          "\n【리포트 특수 입력】",
          `- today_stem: ${stem}`,
          `- today_branch: ${branch}`,
          `- 오늘 일진(日辰): ${ganzi} (${dateKst} KST)`,
        ].join("\n")
      : [
          "\n【Report-specific inputs】",
          `- today_stem: ${stem}`,
          `- today_branch: ${branch}`,
          `- Today's day pillar: ${ganzi} (${dateKst} KST)`,
        ].join("\n");

  return {
    ...EMPTY_VARS,
    today_stem: stem,
    today_branch: branch,
    reportSpecificBlock: block,
  };
}

function formatMonthlyInputs(ctx: PremiumPromptContext): ReportSpecificInputVars {
  const { year, month } = kstDateParts();
  const ganzi = getMonthGanZhiAtLocal(year, month);
  const { stem, branch } = splitGanZhi(ganzi);
  const targetMonth =
    ctx.locale === "ko" ? `${year}년 ${month}월` : `${year}-${String(month).padStart(2, "0")}`;

  const block =
    ctx.locale === "ko"
      ? [
          "\n【리포트 특수 입력】",
          `- target_month: ${targetMonth}`,
          `- month_stem: ${stem}`,
          `- month_branch: ${branch}`,
          `- 월간지(月運): ${ganzi}`,
        ].join("\n")
      : [
          "\n【Report-specific inputs】",
          `- target_month: ${targetMonth}`,
          `- month_stem: ${stem}`,
          `- month_branch: ${branch}`,
          `- Monthly luck pillar: ${ganzi}`,
        ].join("\n");

  return {
    ...EMPTY_VARS,
    target_month: targetMonth,
    month_stem: stem,
    month_branch: branch,
    reportSpecificBlock: block,
  };
}

function formatDecadeInputs(ctx: PremiumPromptContext): ReportSpecificInputVars {
  const startYear = kstDateParts().year;
  const lines = Array.from({ length: 10 }, (_, index) => {
    const year = startYear + index;
    const ganzi = getSeunYearGanZhi(year);
    return ctx.locale === "ko" ? `${year}년 ${ganzi}` : `${year} ${ganzi}`;
  });
  const decade_sewun_list = lines.join("\n");

  const block =
    ctx.locale === "ko"
      ? ["\n【리포트 특수 입력】", `- decade_sewun_list:`, ...lines.map((line) => `  ${line}`)].join(
          "\n"
        )
      : [
          "\n【Report-specific inputs】",
          `- decade_sewun_list:`,
          ...lines.map((line) => `  ${line}`),
        ].join("\n");

  return {
    ...EMPTY_VARS,
    decade_sewun_list,
    reportSpecificBlock: block,
  };
}

function formatLifetimeInputs(ctx: PremiumPromptContext): ReportSpecificInputVars {
  const current_age = String(computeCurrentAge(ctx.solarBirthDate));
  const { daewoon } = ctx.facts;

  const lines: string[] = [];
  for (const candidate of daewoon.candidates) {
    if (ctx.locale === "ko") {
      lines.push(
        `- ${candidate.directionLabel} (${candidate.startAge}세~ · ${candidate.startAgeNote})`
      );
    } else {
      lines.push(
        `- ${candidate.directionLabel} (from age ${candidate.startAge} · ${candidate.startAgeNote})`
      );
    }
    for (const cycle of candidate.cycles) {
      lines.push(
        ctx.locale === "ko"
          ? `  ${cycle.ageRange}: ${cycle.pillar} | 천간 ${cycle.stemTenGod}, 지지 ${cycle.branchTenGod}`
          : `  ${cycle.ageRange}: ${cycle.pillar} | stem ${cycle.stemTenGod}, branch ${cycle.branchTenGod}`
      );
    }
  }

  const daewoon_list = lines.join("\n");

  const block =
    ctx.locale === "ko"
      ? [
          "\n【리포트 특수 입력】",
          `- current_age: ${current_age}`,
          `- daewoon_list:`,
          ...lines.map((line) => `  ${line}`),
        ].join("\n")
      : [
          "\n【Report-specific inputs】",
          `- current_age: ${current_age}`,
          `- daewoon_list:`,
          ...lines.map((line) => `  ${line}`),
        ].join("\n");

  return {
    ...EMPTY_VARS,
    current_age,
    daewoon_list,
    reportSpecificBlock: block,
  };
}

export function buildReportSpecificInputs(
  ctx: PremiumPromptContext,
  productKey?: HumanPremiumPromptProductKey
): ReportSpecificInputVars {
  const key = productKey ?? resolvePromptProduct(ctx);

  switch (key) {
    case "daily":
    case FREE_DAILY_PREVIEW_PROMPT_PRODUCT:
      return formatTodayInputs(ctx);
    case "monthly":
      return formatMonthlyInputs(ctx);
    case "decade":
      return formatDecadeInputs(ctx);
    case "lifetime":
      return formatLifetimeInputs(ctx);
    default:
      return { ...EMPTY_VARS };
  }
}

/** Cache key facet for time-sensitive report inputs (daily/monthly/decade). */
export function reportSpecificInputCacheFacet(ctx: PremiumPromptContext): string | null {
  const { reportSpecificBlock } = buildReportSpecificInputs(ctx);
  return reportSpecificBlock || null;
}
