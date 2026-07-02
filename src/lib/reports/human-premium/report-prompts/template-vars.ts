import type { PremiumPromptContext } from "@/lib/saju/llm/prompts/premium-context";
import {
  PROMPT_PRODUCT_LABELS_EN,
  PROMPT_PRODUCT_LABELS_KO,
  type HumanPremiumPromptProductKey,
} from "./products";
import { buildReportSpecificInputs } from "./report-specific-inputs";
import type { ReportTypePromptSlot } from "./types";

export interface PromptTemplateContext {
  pillarBlock: string;
  focus: string;
  narrative?: string;
  dayPillarLabel: string;
  reportTypeLabel: string;
  reportSpecificBlock: string;
  today_stem: string;
  today_branch: string;
  target_month: string;
  month_stem: string;
  month_branch: string;
  decade_sewun_list: string;
  daewoon_list: string;
  current_age: string;
  currentYear: string;
}

export function buildPromptTemplateContext(
  ctx: PremiumPromptContext,
  productKey: HumanPremiumPromptProductKey,
  pillarBlock: string,
  focus: string,
  narrative?: string
): PromptTemplateContext {
  const reportTypeLabel =
    ctx.locale === "ko"
      ? PROMPT_PRODUCT_LABELS_KO[productKey]
      : PROMPT_PRODUCT_LABELS_EN[productKey];

  const reportInputs = buildReportSpecificInputs(ctx, productKey);

  return {
    pillarBlock,
    focus,
    narrative,
    dayPillarLabel: ctx.dayPillarLabel,
    reportTypeLabel,
    reportSpecificBlock: reportInputs.reportSpecificBlock,
    today_stem: reportInputs.today_stem,
    today_branch: reportInputs.today_branch,
    target_month: reportInputs.target_month,
    month_stem: reportInputs.month_stem,
    month_branch: reportInputs.month_branch,
    decade_sewun_list: reportInputs.decade_sewun_list,
    daewoon_list: reportInputs.daewoon_list,
    current_age: reportInputs.current_age,
    currentYear: String(ctx.currentYear ?? new Date().getFullYear()),
  };
}

export function applyPromptTemplate(
  template: string,
  vars: PromptTemplateContext
): string {
  return template
    .replaceAll("{{pillarBlock}}", vars.pillarBlock)
    .replaceAll("{{focus}}", vars.focus)
    .replaceAll("{{narrative}}", vars.narrative ?? "")
    .replaceAll("{{dayPillarLabel}}", vars.dayPillarLabel)
    .replaceAll("{{reportTypeLabel}}", vars.reportTypeLabel)
    .replaceAll("{{reportSpecificBlock}}", vars.reportSpecificBlock)
    .replaceAll("{{today_stem}}", vars.today_stem)
    .replaceAll("{{today_branch}}", vars.today_branch)
    .replaceAll("{{target_month}}", vars.target_month)
    .replaceAll("{{month_stem}}", vars.month_stem)
    .replaceAll("{{month_branch}}", vars.month_branch)
    .replaceAll("{{decade_sewun_list}}", vars.decade_sewun_list)
    .replaceAll("{{daewoon_list}}", vars.daewoon_list)
    .replaceAll("{{current_age}}", vars.current_age)
    .replaceAll("{{currentYear}}", vars.currentYear);
}

export function mergePromptSlotOverride(
  defaults: { system: string; user: string },
  override: ReportTypePromptSlot | undefined,
  locale: "ko" | "en",
  vars: PromptTemplateContext
): { system: string; user: string } {
  if (!override) return defaults;

  const systemRaw = locale === "ko" ? override.systemKo : override.systemEn;
  const userRaw = locale === "ko" ? override.userKo : override.userEn;

  return {
    system: systemRaw?.trim()
      ? applyPromptTemplate(systemRaw, vars)
      : defaults.system,
    user: userRaw?.trim() ? applyPromptTemplate(userRaw, vars) : defaults.user,
  };
}
