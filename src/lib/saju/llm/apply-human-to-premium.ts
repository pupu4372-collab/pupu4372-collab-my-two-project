import { patchSectionBody } from "@/lib/reports/human-premium/section-patch";
import type {
  HumanPremiumLlmSectionMeta,
  HumanPremiumReportPayload,
} from "@/lib/reports/human-premium/types";
import type { HumanInterpretationJson, LlmProviderName } from "./types";

/** Sections filled by a single interpretSaju(human) call */
export const HUMAN_INTERPRET_SECTION_IDS = [
  "result-temperament",
  "result-gyeokguk-yongsin",
  "cycle-daewoon",
] as const;

export type HumanInterpretSectionId = (typeof HUMAN_INTERPRET_SECTION_IDS)[number];

const INTERPRET_BODY_BY_SECTION: Record<
  HumanInterpretSectionId,
  keyof HumanInterpretationJson
> = {
  "result-temperament": "personality",
  "result-gyeokguk-yongsin": "tenGodAnalysis",
  "cycle-daewoon": "daewoonOutlook",
};

export function applyHumanInterpretationToPremiumReport(
  payload: HumanPremiumReportPayload,
  interpretation: HumanInterpretationJson,
  provider: LlmProviderName
): Record<string, HumanPremiumLlmSectionMeta> {
  const meta: Record<string, HumanPremiumLlmSectionMeta> = {};

  for (const sectionId of HUMAN_INTERPRET_SECTION_IDS) {
    const field = INTERPRET_BODY_BY_SECTION[sectionId];
    const body = interpretation[field].trim();
    if (!body) continue;

    if (patchSectionBody(payload, sectionId, body)) {
      meta[sectionId] = { source: provider };
    }
  }

  return meta;
}
