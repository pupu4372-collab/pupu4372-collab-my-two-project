import type { PetSajuMapping } from "@/lib/saju/pet-trait-mapping";
import { finalizePetHeadline } from "@/lib/saju/pet-headline";
import type { SajuBasicResponse } from "@/lib/saju/types";
import { sanitizePetInterpretationJson } from "./pet-output-sanitize";
import type { LlmProviderName, PetInterpretationJson } from "./types";

export function applyPetInterpretationToBasicResponse(
  result: SajuBasicResponse,
  interpretation: PetInterpretationJson,
  mapping: PetSajuMapping,
  provider: LlmProviderName
): void {
  const clean = sanitizePetInterpretationJson(interpretation);
  result.headline = clean.characterIntro.trim();
  result.story = [clean.personality, clean.healthNote, clean.compatibility]
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
  finalizePetHeadline(result, mapping);
}
