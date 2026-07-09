import { buildCarePointText } from "@/lib/saju/care-point-copy";
import { buildPillarsSummaryLine } from "@/lib/saju/pillars-summary-line";
import { buildSajuNarrative } from "@/lib/saju/saju-narrative";
import type { PetSajuMapping } from "@/lib/saju/pet-trait-mapping";
import type { SajuBasicResponse } from "@/lib/saju/types";

export function buildPersonalityTraitTags(mapping: PetSajuMapping): string[] {
  return [mapping.dayMasterArchetype.keyword, ...mapping.dominantTraits.personality]
    .map((trait) => trait.trim())
    .filter(Boolean)
    .slice(0, 5);
}

/** Compute UI snapshot fields once at creation/save — vault restores these verbatim. */
export function enrichBasicResultDisplayFields(
  result: SajuBasicResponse,
  mapping: PetSajuMapping
): void {
  result.sajuNarrative = buildSajuNarrative(result, mapping);
  result.carePointText = buildCarePointText(mapping, result.locale);
  result.pillarsSummaryLine = buildPillarsSummaryLine(result);
  result.traits = buildPersonalityTraitTags(mapping);
}
