import type { PetSajuMapping } from "@/lib/saju/pet-trait-mapping";
import type { SajuBasicResponse } from "@/lib/saju/types";
import type { LlmProviderName, PetInterpretationJson } from "./types";

export function applyPetInterpretationToBasicResponse(
  result: SajuBasicResponse,
  interpretation: PetInterpretationJson,
  mapping: PetSajuMapping,
  provider: LlmProviderName
): void {
  result.headline = interpretation.characterIntro.trim();
  result.story = [interpretation.personality, interpretation.healthNote, interpretation.compatibility]
    .map((part) => part.trim())
    .filter(Boolean)
    .join("\n\n");
  result.traits = [
    mapping.dayMasterArchetype.keyword,
    ...mapping.dominantTraits.personality,
    ...mapping.weakTraits.healthFocus.slice(0, 1),
  ]
    .map((trait) => trait.trim())
    .filter(Boolean)
    .slice(0, 5);
  result.narrativeSource = provider;
  result.narrativeError = null;
}
