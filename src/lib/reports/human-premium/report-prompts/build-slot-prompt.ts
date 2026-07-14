import type { PremiumPromptContext } from "@/lib/saju/llm/prompts/premium-context";
import type { LlmPromptPair } from "@/lib/saju/llm/types";
import {
  ENGLISH_ONLY_RULE,
  REPORT_PROMPT_SYSTEM_BASE,
  REPORT_PROMPT_SYSTEM_BASE_EN,
  REPORT_PROMPT_USER_INPUT,
  REPORT_PROMPT_USER_INPUT_EN,
} from "./base-prompt";
import { getProductSlotMap } from "./prompts";
import { SLOTS_EN as YEARLY_SLOTS_EN } from "./prompts/annual-report-prompt";
import { resolvePromptProduct } from "./registry";
import {
  applyPromptTemplate,
  buildPromptTemplateContext,
} from "./template-vars";
import type { HumanPremiumPromptSlotKey } from "./types";

export interface BuildSlotPromptOptions {
  pillarBlock: string;
  focus: string;
  narrative?: string;
}

/**
 * finalUser = BASE_USER_INPUT + '\n\n' + SLOTS[slotKey]
 * system = BASE_SYSTEM
 * Returns null when the product slot is empty (caller uses template defaults).
 *
 * EN path (yearly only): EN system/user base + SLOTS_EN (+ ENGLISH_ONLY already in slots).
 * Other products keep the existing Korean slot map even when locale is en (until their EN packs land).
 * KO path: byte-stable use of REPORT_PROMPT_* and KO SLOTS.
 */
export function buildSlotPrompt(
  slotKey: HumanPremiumPromptSlotKey,
  ctx: PremiumPromptContext,
  options: BuildSlotPromptOptions
): LlmPromptPair | null {
  const productKey = resolvePromptProduct(ctx);
  const useYearlyEn = ctx.locale === "en" && productKey === "yearly";

  const slotContent = (
    useYearlyEn
      ? YEARLY_SLOTS_EN[slotKey]
      : getProductSlotMap(productKey)[slotKey]
  )?.trim() ?? "";
  if (!slotContent) return null;

  const vars = buildPromptTemplateContext(
    ctx,
    productKey,
    options.pillarBlock,
    options.focus,
    options.narrative
  );

  const systemBase = useYearlyEn
    ? REPORT_PROMPT_SYSTEM_BASE_EN
    : REPORT_PROMPT_SYSTEM_BASE;
  const userBase = useYearlyEn
    ? REPORT_PROMPT_USER_INPUT_EN
    : REPORT_PROMPT_USER_INPUT;

  const system = applyPromptTemplate(systemBase, vars);
  const baseUser = applyPromptTemplate(userBase, vars);
  const slotInstructions = applyPromptTemplate(slotContent, vars);

  let user = `${baseUser}\n\n${slotInstructions}`;

  // Defense-in-depth: if a future yearly EN slot omits ENGLISH_ONLY_RULE, still enforce it.
  if (useYearlyEn && !slotInstructions.includes("ENGLISH ONLY")) {
    user = `${user}\n\n${ENGLISH_ONLY_RULE}`;
  }

  const narrative = options.narrative?.trim() ?? "";
  const usesNarrativeVar = slotContent.includes("{{narrative}}");
  if (
    narrative &&
    !usesNarrativeVar &&
    slotKey !== "saju-structure" &&
    slotKey !== "master-narrative"
  ) {
    user +=
      ctx.locale === "ko"
        ? `\n\n[마스터 내러티브]\n${narrative.slice(0, 1200)}`
        : `\n\n[Master narrative]\n${narrative.slice(0, 1200)}`;
  }

  return { system, user };
}

export function isProductSlotFilled(
  slotKey: HumanPremiumPromptSlotKey,
  ctx: PremiumPromptContext
): boolean {
  const productKey = resolvePromptProduct(ctx);
  if (ctx.locale === "en" && productKey === "yearly") {
    return Boolean(YEARLY_SLOTS_EN[slotKey]?.trim());
  }
  return Boolean(getProductSlotMap(productKey)[slotKey]?.trim());
}
