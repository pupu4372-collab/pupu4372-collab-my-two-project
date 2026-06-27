import type { HumanPremiumFactsBlock } from "@/lib/reports/human-premium/facts";
import type { HumanPremiumDeliveryMode, ReportType } from "@/lib/reports/human-premium/types";
import type { HumanPremiumPromptProductKey } from "@/lib/reports/human-premium/report-prompts/products";
import type { HumanSajuMapping } from "@/lib/saju/human-trait-mapping";
import type { Locale, SajuBasicResponse } from "@/lib/saju/types";

export interface PremiumPromptContext {
  mapping: HumanSajuMapping;
  saju: SajuBasicResponse;
  facts: HumanPremiumFactsBlock;
  locale: Locale;
  reportType: ReportType;
  /** Prompt pack key; defaults from deliveryMode / reportType */
  promptProduct?: HumanPremiumPromptProductKey;
  deliveryMode?: HumanPremiumDeliveryMode;
  analysisMode: "three_pillars" | "four_pillars";
  dayPillarLabel: string;
  /** Solar birth date (YYYY-MM-DD) for ksaju-engine report inputs */
  solarBirthDate: string;
  birthTime: string | null;
  birthTimeUnknown: boolean;
  gender?: "male" | "female" | null;
  /** Issue year for prophecy slot (e.g. future-year anchors) */
  currentYear?: number;
}
