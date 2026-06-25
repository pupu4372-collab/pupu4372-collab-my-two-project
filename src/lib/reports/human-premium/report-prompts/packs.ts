import {
  FREE_DAILY_PREVIEW_PROMPT_PRODUCT,
  HUMAN_PREMIUM_PROMPT_PRODUCT_LINE,
  type HumanPremiumPromptProductKey,
} from "./products";
import { BUILT_REPORT_PROMPT_PACKS } from "./prompts";
import type {
  HumanPremiumPromptSlotKey,
  PromptProductPack,
  PromptProductPackMap,
} from "./types";

function emptySlot() {
  return {
    systemKo: "",
    systemEn: "",
    userKo: "",
    userEn: "",
  };
}

function emptySlots(): Record<HumanPremiumPromptSlotKey, ReturnType<typeof emptySlot>> {
  return {
    "saju-structure": emptySlot(),
    "master-narrative": emptySlot(),
    "deep-analysis": emptySlot(),
    opportunities: emptySlot(),
    risks: emptySlot(),
    roadmap: emptySlot(),
    prophecy: emptySlot(),
  };
}

function createPack(productKey: HumanPremiumPromptProductKey): PromptProductPack {
  return {
    productKey,
    focusKo: "",
    focusEn: "",
    slots: emptySlots(),
  };
}

/**
 * Premium line — slot prompts live in prompts/*-report-prompt.ts (SLOTS map).
 * Empty slot strings fall back to human-prompt.ts defaults.
 */
const BASE_PROMPT_PRODUCT_PACKS = Object.fromEntries(
  HUMAN_PREMIUM_PROMPT_PRODUCT_LINE.map((productKey) => [productKey, createPack(productKey)])
) as PromptProductPackMap;

export const PROMPT_PRODUCT_PACKS: PromptProductPackMap = {
  ...BASE_PROMPT_PRODUCT_PACKS,
  ...BUILT_REPORT_PROMPT_PACKS,
};

/** @deprecated Use PROMPT_PRODUCT_PACKS */
export const REPORT_TYPE_PROMPT_PACKS = PROMPT_PRODUCT_PACKS;

export { FREE_DAILY_PREVIEW_PROMPT_PRODUCT, HUMAN_PREMIUM_PROMPT_PRODUCT_LINE };

/** @deprecated Use HUMAN_PREMIUM_PROMPT_PRODUCT_LINE */
export const HUMAN_PREMIUM_PROMPT_PRODUCT_TYPES = HUMAN_PREMIUM_PROMPT_PRODUCT_LINE;
