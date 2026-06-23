import { formatStructuredSectionBodies } from "@/lib/reports/human-premium/content";
import { patchSectionBody } from "@/lib/reports/human-premium/section-patch";
import type {
  HumanPremiumLlmSectionMeta,
  HumanPremiumLlmSectionSource,
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
  };
}

export function applyHumanInterpretationToPremiumReport(
  payload: HumanPremiumReportPayload,
  interpretation: Partial<HumanInterpretationJson>,
  provider: HumanPremiumLlmSectionSource
): Record<string, HumanPremiumLlmSectionMeta> {
  const meta: Record<string, HumanPremiumLlmSectionMeta> = {};
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
    if (SKIP_LLM_SECTIONS.has(sectionId)) {
      meta[sectionId] = { source: "template" };
      continue;
    }

    const body = sectionBodies[sectionId];
    if (!body?.trim()) {
      meta[sectionId] = { source: "template" };
      continue;
    }

    if (patchSectionBody(payload, sectionId, body.trim())) {
      meta[sectionId] = { source: provider };
    } else {
      meta[sectionId] = { source: "template", error: "section_not_found" };
    }
  }

  return meta;
}
