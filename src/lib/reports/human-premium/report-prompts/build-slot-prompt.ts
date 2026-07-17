import type { PremiumPromptContext } from "@/lib/saju/llm/prompts/premium-context";
import type { LlmPromptPair } from "@/lib/saju/llm/types";
import {
  ENGLISH_ONLY_RULE,
  REPORT_PROMPT_SYSTEM_BASE,
  REPORT_PROMPT_SYSTEM_BASE_EN,
  REPORT_PROMPT_USER_INPUT,
  REPORT_PROMPT_USER_INPUT_EN,
} from "./base-prompt";
import type { HumanPremiumPromptProductKey } from "./products";
import { getProductSlotMap } from "./prompts";
import { SLOTS_EN as YEARLY_SLOTS_EN } from "./prompts/annual-report-prompt";
import { SLOTS_EN as BUSINESS_SLOTS_EN } from "./prompts/business-partner-report-prompt";
import { SLOTS_EN as CAREER_SLOTS_EN } from "./prompts/career-roadmap-report-prompt";
import { SLOTS_EN as DECADE_SLOTS_EN } from "./prompts/decade-life-strategy-report-prompt";
import { SLOTS_EN as LIFETIME_SLOTS_EN } from "./prompts/lifetime-life-strategy-report-prompt";
import { SLOTS_EN as LOVE_SLOTS_EN } from "./prompts/love-marriage-report-prompt";
import { SLOTS_EN as MENTAL_SLOTS_EN } from "./prompts/mental-wellness-report-prompt";
import { SLOTS_EN as MONTHLY_SLOTS_EN } from "./prompts/monthly-life-architecture-report-prompt";
import { SLOTS_EN as WEALTH_SLOTS_EN } from "./prompts/wealth-growth-report-prompt";
import { resolvePromptProduct } from "./registry";
import {
  applyPromptTemplate,
  buildPromptTemplateContext,
} from "./template-vars";
import type { HumanPremiumPromptSlotKey } from "./types";
import type { ReportSlotPromptMap as PromptSlotMap } from "./prompt-definition";

export interface BuildSlotPromptOptions {
  pillarBlock: string;
  focus: string;
  narrative?: string;
}

const EN_PRODUCT_SLOTS: Partial<
  Record<HumanPremiumPromptProductKey, PromptSlotMap>
> = {
  yearly: YEARLY_SLOTS_EN,
  decade: DECADE_SLOTS_EN,
  lifetime: LIFETIME_SLOTS_EN,
  career: CAREER_SLOTS_EN,
  love: LOVE_SLOTS_EN,
  wealth: WEALTH_SLOTS_EN,
  business: BUSINESS_SLOTS_EN,
  mental: MENTAL_SLOTS_EN,
  monthly: MONTHLY_SLOTS_EN,
};

/**
 * finalUser = BASE_USER_INPUT + '\n\n' + SLOTS[slotKey]
 * system = BASE_SYSTEM
 * Returns null when the product slot is empty (caller uses template defaults).
 *
 * EN path (paid topics with SLOTS_EN): EN system/user base + product SLOTS_EN.
 * Daily and any product without SLOTS_EN keep Korean slots even when locale is en.
 * KO path: byte-stable use of REPORT_PROMPT_* and KO SLOTS.
 */
export function buildSlotPrompt(
  slotKey: HumanPremiumPromptSlotKey,
  ctx: PremiumPromptContext,
  options: BuildSlotPromptOptions
): LlmPromptPair | null {
  const productKey = resolvePromptProduct(ctx);
  const enSlots = ctx.locale === "en" ? EN_PRODUCT_SLOTS[productKey] : undefined;
  const useEn = Boolean(enSlots);

  const slotContent = (
    useEn ? enSlots?.[slotKey] : getProductSlotMap(productKey)[slotKey]
  )?.trim() ?? "";
  if (!slotContent) return null;

  const vars = buildPromptTemplateContext(
    ctx,
    productKey,
    options.pillarBlock,
    options.focus,
    options.narrative
  );

  const systemBase = useEn
    ? REPORT_PROMPT_SYSTEM_BASE_EN
    : REPORT_PROMPT_SYSTEM_BASE;
  const userBase = useEn
    ? REPORT_PROMPT_USER_INPUT_EN
    : REPORT_PROMPT_USER_INPUT;

  const system = applyPromptTemplate(systemBase, vars);
  const baseUser = applyPromptTemplate(userBase, vars);
  const slotInstructions = applyPromptTemplate(slotContent, vars);

  // Variable tail only — join with `\n\n` so full `user` matches prior assembly.
  let userVariable = slotInstructions;

  if (useEn && !slotInstructions.includes("ENGLISH ONLY")) {
    userVariable = `${userVariable}\n\n${ENGLISH_ONLY_RULE}`;
  }

  const narrative = options.narrative?.trim() ?? "";
  const usesNarrativeVar = slotContent.includes("{{narrative}}");
  if (
    narrative &&
    !usesNarrativeVar &&
    slotKey !== "saju-structure" &&
    slotKey !== "master-narrative"
  ) {
    userVariable +=
      ctx.locale === "ko"
        ? `\n\n[마스터 내러티브]\n${narrative.slice(0, 1200)}`
        : `\n\n[Master narrative]\n${narrative.slice(0, 1200)}`;
  }

  const user = `${baseUser}\n\n${userVariable}`;

  return {
    system,
    user,
    userCachePrefix: baseUser,
    userVariable,
  };
}

export function isProductSlotFilled(
  slotKey: HumanPremiumPromptSlotKey,
  ctx: PremiumPromptContext
): boolean {
  const productKey = resolvePromptProduct(ctx);
  const enSlots = ctx.locale === "en" ? EN_PRODUCT_SLOTS[productKey] : undefined;
  if (enSlots) {
    return Boolean(enSlots[slotKey]?.trim());
  }
  return Boolean(getProductSlotMap(productKey)[slotKey]?.trim());
}
