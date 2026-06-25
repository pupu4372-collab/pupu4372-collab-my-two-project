import type { HumanPremiumPromptProductKey } from "./products";
import type { HumanPremiumPromptSlotKey } from "./types";

/** Per-product slot user prompts (section JSON schema + writing rules only). */
export type ReportSlotPromptMap = Record<HumanPremiumPromptSlotKey, string>;

export interface ReportPromptDefinition {
  productKey: HumanPremiumPromptProductKey;
  focusKo?: string;
  focusEn?: string;
  slots: ReportSlotPromptMap;
}

export function emptyReportSlots(): ReportSlotPromptMap {
  return {
    "saju-structure": "",
    "master-narrative": "",
    "deep-analysis": "",
    opportunities: "",
    risks: "",
    roadmap: "",
    prophecy: "",
  };
}
