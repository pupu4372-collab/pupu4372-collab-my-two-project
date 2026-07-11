import { formatStructuredSectionBodies } from "@/lib/reports/human-premium/content";
import { patchSectionBody } from "@/lib/reports/human-premium/section-patch";
import type { HumanPremiumPromptSlotKey } from "@/lib/reports/human-premium/report-prompts/types";
import type {
  HumanPremiumReportPayload,
  HumanPremiumReportStructured,
} from "@/lib/reports/human-premium/types";
import type { HumanInterpretationJson } from "./types";

export const HUMAN_INTERPRET_SECTION_IDS = [
  "section-cover",
  "section-structure",
  "section-metrics",
  "section-depth",
  "section-opportunity",
  "section-risk",
  "section-roadmap",
  "section-prophecy",
] as const;

export type HumanInterpretSectionId = (typeof HUMAN_INTERPRET_SECTION_IDS)[number];

/** Prompt slot → report section (master-narrative feeds later slots only). */
export const HUMAN_PREMIUM_PROMPT_SLOT_SECTIONS: Partial<
  Record<HumanPremiumPromptSlotKey, HumanInterpretSectionId>
> = {
  "saju-structure": "section-structure",
  "deep-analysis": "section-depth",
  opportunities: "section-opportunity",
  risks: "section-risk",
  roadmap: "section-roadmap",
  prophecy: "section-prophecy",
};

const SKIP_LLM_SECTIONS = new Set<string>(["section-cover"]);

function mergeStructured(
  payload: HumanPremiumReportPayload,
  interpretation: Partial<HumanInterpretationJson>
): HumanPremiumReportStructured {
  const base = payload.structured;
  return {
    scores: interpretation.scores ?? base.scores,
    opportunities: interpretation.opportunities ?? base.opportunities,
    risks: interpretation.risks ?? base.risks,
    roadmap: interpretation.roadmap ?? base.roadmap,
    decisionMoments: interpretation.decisionMoments ?? base.decisionMoments,
    prophecy: interpretation.prophecy ?? base.prophecy,
    cohortInsight: interpretation.cohortInsight ?? base.cohortInsight,
    domainScores: interpretation.domainScores ?? base.domainScores,
    luckyDates: interpretation.luckyDates ?? base.luckyDates,
    deepSections: interpretation.deepSections ?? base.deepSections,
    yearCards: interpretation.yearCards ?? base.yearCards,
    lifeCycles: interpretation.lifeCycles ?? base.lifeCycles,
  };
}

export function applyHumanInterpretationToPremiumReport(
  payload: HumanPremiumReportPayload,
  interpretation: Partial<HumanInterpretationJson>
): void {
  const structured = mergeStructured(payload, interpretation);
  payload.structured = structured;

  const sectionBodies = formatStructuredSectionBodies(
    structured,
    payload.locale,
    payload.reportType,
    {
      sajuStructure: interpretation.sajuStructure,
      deepAnalysis: interpretation.deepAnalysis,
    }
  );

  for (const sectionId of HUMAN_INTERPRET_SECTION_IDS) {
    if (SKIP_LLM_SECTIONS.has(sectionId)) continue;

    const body = sectionBodies[sectionId];
    if (!body?.trim()) continue;

    patchSectionBody(payload, sectionId, body.trim());
  }
}
