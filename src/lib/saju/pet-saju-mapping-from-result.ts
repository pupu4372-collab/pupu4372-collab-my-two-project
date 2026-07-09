import { BRANCH_ELEMENT, STEM_META, STEMS, BRANCHES, type Branch, type FiveElement, type Stem } from "@/lib/saju/ksaju-engine/core-tables";
import { speciesToAnimalGroup } from "@/lib/saju/ksaju-adapter";
import { mapToPetTraits, type PetSajuMapping } from "@/lib/saju/pet-trait-mapping";
import type { PillarDisplay, SajuBasicResponse } from "@/lib/saju/types";

function isValidStem(value: string): value is Stem {
  return (STEMS as readonly string[]).includes(value);
}

function isValidBranch(value: string): value is Branch {
  return (BRANCHES as readonly string[]).includes(value);
}

function isUsablePillar(pillar: PillarDisplay | null | undefined): pillar is PillarDisplay {
  if (!pillar) return false;
  return isValidStem(pillar.stemHanja) && isValidBranch(pillar.branchHanja);
}

function extractElementsFromPillars(
  pillars: SajuBasicResponse["pillars"],
  includeHour: boolean
): FiveElement[] | null {
  if (!isUsablePillar(pillars.year) || !isUsablePillar(pillars.month) || !isUsablePillar(pillars.day)) {
    return null;
  }

  const elements: FiveElement[] = [];

  const pushPillar = (pillar: PillarDisplay) => {
    const stem = pillar.stemHanja as Stem;
    const branch = pillar.branchHanja as Branch;
    elements.push(STEM_META[stem].element);
    elements.push(BRANCH_ELEMENT[branch]);
  };

  pushPillar(pillars.year);
  pushPillar(pillars.month);
  pushPillar(pillars.day);
  if (includeHour && isUsablePillar(pillars.hour)) pushPillar(pillars.hour);

  return elements;
}

/** Live-result fallback only — vault must not call this. */
export function buildPetSajuMappingFromBasicResponse(result: SajuBasicResponse): PetSajuMapping | null {
  const elements = extractElementsFromPillars(result.pillars, !result.birthTimeUnknown);
  const dayMaster = result.pillars.day?.stemHanja;
  if (!elements || !dayMaster || !isValidStem(dayMaster)) return null;

  return mapToPetTraits(
    elements,
    dayMaster,
    speciesToAnimalGroup(result.species),
    result.locale
  );
}
