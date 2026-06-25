import type { PremiumPromptContext } from "@/lib/saju/llm/prompts/premium-context";
import type { LlmPromptPair } from "@/lib/saju/llm/types";
import {
  REPORT_PROMPT_SYSTEM_BASE,
  REPORT_PROMPT_USER_INPUT,
} from "./base-prompt";
import { getProductSlotMap } from "./prompts";
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
 */
export function buildSlotPrompt(
  slotKey: HumanPremiumPromptSlotKey,
  ctx: PremiumPromptContext,
  options: BuildSlotPromptOptions
): LlmPromptPair | null {
  const productKey = resolvePromptProduct(ctx);
  const slotContent = getProductSlotMap(productKey)[slotKey]?.trim() ?? "";
  if (!slotContent) return null;

  const vars = buildPromptTemplateContext(
    ctx,
    productKey,
    options.pillarBlock,
    options.focus,
    options.narrative
  );

  const system = applyPromptTemplate(REPORT_PROMPT_SYSTEM_BASE, vars);
  const baseUser = applyPromptTemplate(REPORT_PROMPT_USER_INPUT, vars);
  const slotInstructions = applyPromptTemplate(slotContent, vars);

  let user = `${baseUser}\n\n${slotInstructions}`;

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
  return Boolean(getProductSlotMap(productKey)[slotKey]?.trim());
}
