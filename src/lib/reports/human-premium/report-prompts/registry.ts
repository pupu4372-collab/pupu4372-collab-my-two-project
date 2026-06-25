import type { Locale } from "@/lib/saju/types";
import type { PremiumPromptContext } from "@/lib/saju/llm/prompts/premium-context";
import type { LlmPromptPair } from "@/lib/saju/llm/types";
import type { ReportType } from "../types";
import { PROMPT_PRODUCT_PACKS } from "./packs";
import {
  FREE_DAILY_PREVIEW_PROMPT_PRODUCT,
  HUMAN_PREMIUM_PROMPT_PRODUCT_LINE,
  type HumanPremiumPromptProductKey,
} from "./products";
import {
  buildPromptTemplateContext,
  mergePromptSlotOverride,
} from "./template-vars";
import type { HumanPremiumPromptSlotKey, PromptProductPack } from "./types";
import { isPromptSlotFilled } from "./types";

export function resolvePromptProduct(ctx: PremiumPromptContext): HumanPremiumPromptProductKey {
  if (ctx.promptProduct) return ctx.promptProduct;
  if (ctx.deliveryMode === "free-preview") return FREE_DAILY_PREVIEW_PROMPT_PRODUCT;
  return ctx.reportType;
}

export function getPromptProductPack(
  productKey: HumanPremiumPromptProductKey
): PromptProductPack {
  return PROMPT_PRODUCT_PACKS[productKey];
}

/** @deprecated Use getPromptProductPack */
export function getReportTypePromptPack(reportType: ReportType): PromptProductPack {
  return getPromptProductPack(reportType);
}

export function resolveReportTypeFocus(ctx: PremiumPromptContext): string {
  const pack = getPromptProductPack(resolvePromptProduct(ctx));
  if (ctx.locale === "ko" && pack.focusKo?.trim()) return pack.focusKo.trim();
  if (ctx.locale === "en" && pack.focusEn?.trim()) return pack.focusEn.trim();
  return "";
}

export function resolveReportTypePromptPair(
  slotKey: HumanPremiumPromptSlotKey,
  ctx: PremiumPromptContext,
  defaults: LlmPromptPair,
  options?: { pillarBlock?: string; focus?: string; narrative?: string }
): LlmPromptPair {
  const pack = getPromptProductPack(resolvePromptProduct(ctx));
  const slot = pack.slots[slotKey];
  const locale = ctx.locale as "ko" | "en";

  const productKey = resolvePromptProduct(ctx);
  const vars = buildPromptTemplateContext(
    ctx,
    productKey,
    options?.pillarBlock ?? "",
    options?.focus ?? "",
    options?.narrative
  );

  return mergePromptSlotOverride(defaults, slot, locale, vars);
}

export function listFilledPromptSlots(
  productKey: HumanPremiumPromptProductKey,
  locale: Locale
) {
  const pack = getPromptProductPack(productKey);
  return (Object.keys(pack.slots) as HumanPremiumPromptSlotKey[]).filter((key) =>
    isPromptSlotFilled(pack.slots[key], locale)
  );
}

export function summarizePromptPackReadiness(locale: Locale) {
  return HUMAN_PREMIUM_PROMPT_PRODUCT_LINE.map((productKey) => ({
    productKey,
    filledSlots: listFilledPromptSlots(productKey, locale),
    hasFocus: Boolean(
      locale === "ko"
        ? PROMPT_PRODUCT_PACKS[productKey].focusKo?.trim()
        : PROMPT_PRODUCT_PACKS[productKey].focusEn?.trim()
    ),
  }));
}
