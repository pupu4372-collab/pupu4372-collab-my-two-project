import type { HumanPremiumPromptProductKey } from "../products";
import { buildReportPromptPack } from "../build-report-pack";
import type { ReportPromptDefinition, ReportSlotPromptMap } from "../prompt-definition";

import * as career from "./career-roadmap-report-prompt";
import * as wealth from "./wealth-growth-report-prompt";
import * as mental from "./mental-wellness-report-prompt";
import * as business from "./business-partner-report-prompt";
import * as love from "./love-marriage-report-prompt";
import * as dailyAction from "./daily-action-plan-report-prompt";
import * as decade from "./decade-life-strategy-report-prompt";
import * as monthly from "./monthly-life-architecture-report-prompt";
import * as annual from "./annual-report-prompt";
import * as lifetime from "./lifetime-life-strategy-report-prompt";

function def(
  productKey: HumanPremiumPromptProductKey,
  mod: {
    SLOTS: ReportPromptDefinition["slots"];
    FOCUS_KO?: string;
    FOCUS_EN?: string;
  }
): ReportPromptDefinition {
  return {
    productKey,
    focusKo: mod.FOCUS_KO,
    focusEn: mod.FOCUS_EN,
    slots: mod.SLOTS,
  };
}

/** Wired product keys → slot prompt definitions. */
export const REPORT_PROMPT_DEFINITIONS: ReportPromptDefinition[] = [
  def("career", career),
  def("wealth", wealth),
  def("mental", mental),
  def("business", business),
  def("love", love),
  def("daily", dailyAction),
  def("decade", decade),
  def("monthly", monthly),
  def("yearly", annual),
  def("lifetime", lifetime),
];

export const BUILT_REPORT_PROMPT_PACKS = Object.fromEntries(
  REPORT_PROMPT_DEFINITIONS.map((d) => [d.productKey, buildReportPromptPack(d)])
) as Record<HumanPremiumPromptProductKey, ReturnType<typeof buildReportPromptPack>>;

const PRODUCT_SLOT_MAP = Object.fromEntries(
  REPORT_PROMPT_DEFINITIONS.map((d) => [d.productKey, d.slots])
) as Record<HumanPremiumPromptProductKey, ReportSlotPromptMap>;

/** Raw SLOTS map per product — used by buildSlotPrompt(). */
export function getProductSlotMap(
  productKey: HumanPremiumPromptProductKey
): ReportSlotPromptMap {
  return PRODUCT_SLOT_MAP[productKey] ?? {};
}
