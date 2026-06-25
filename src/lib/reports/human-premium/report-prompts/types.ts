import type { Locale } from "@/lib/saju/types";
import type { HumanPremiumPromptProductKey } from "./products";

/** LLM call slots aligned with human-premium-orchestrator.ts */
export const HUMAN_PREMIUM_PROMPT_SLOT_KEYS = [
  "saju-structure",
  "master-narrative",
  "deep-analysis",
  "opportunities",
  "risks",
  "roadmap",
  "prophecy",
] as const;

export type HumanPremiumPromptSlotKey = (typeof HUMAN_PREMIUM_PROMPT_SLOT_KEYS)[number];

/**
 * Per-slot prompt override. Leave strings empty to use the built-in default in human-prompt.ts.
 *
 * Template variables (user prompts):
 * - {{pillarBlock}} — birth chart fact block
 * - {{focus}} — product focus line
 * - {{narrative}} — master narrative (deep-analysis / opportunities / risks / roadmap / prophecy)
 * - {{dayPillarLabel}} — e.g. 甲子 일주
 * - {{reportTypeLabel}} — e.g. 오늘 운세 무료보기
 */
export interface ReportTypePromptSlot {
  systemKo?: string;
  systemEn?: string;
  userKo?: string;
  userEn?: string;
}

export interface PromptProductPack {
  productKey: HumanPremiumPromptProductKey;
  /** Overrides TYPE_FOCUS_* when non-empty */
  focusKo?: string;
  focusEn?: string;
  slots: Partial<Record<HumanPremiumPromptSlotKey, ReportTypePromptSlot>>;
}

/** @deprecated Use PromptProductPack */
export type ReportTypePromptPack = PromptProductPack;

export type PromptProductPackMap = Record<HumanPremiumPromptProductKey, PromptProductPack>;

export function isPromptSlotFilled(
  slot: ReportTypePromptSlot | undefined,
  locale: Locale
): boolean {
  if (!slot) return false;
  const user = locale === "ko" ? slot.userKo : slot.userEn;
  const system = locale === "ko" ? slot.systemKo : slot.systemEn;
  return Boolean(user?.trim() || system?.trim());
}
