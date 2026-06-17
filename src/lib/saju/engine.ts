import lunisolar from "lunisolar";
import {
  buildElementBreakdown,
  countElements,
  formatStemBranchLabels,
} from "./elements";
import { buildNarrative } from "./narratives";
import type {
  Locale,
  PillarDisplay,
  SajuBasicRequest,
  SajuBasicResponse,
  Species,
} from "./types";
import { getKstJijiFromUtc } from "./jiji-hours";
import { localBirthToUtc } from "./timezone";

function pillarFromChar8(pillar: unknown): PillarDisplay {
  const p = pillar as {
    stem?: { toString(): string };
    branch?: { toString(): string };
    toString?: () => string;
  };

  const stemHanja = p?.stem?.toString?.() ?? "";
  const branchHanja = p?.branch?.toString?.() ?? "";
  const fallback = p?.toString?.() ?? "";
  const stem = stemHanja || fallback.charAt(0);
  const branch = branchHanja || fallback.charAt(1);
  const labels = formatStemBranchLabels(stem, branch);

  return {
    pillar: `${stem}${branch}`,
    stem,
    branch,
    stemHanja: stem,
    branchHanja: branch,
    ...labels,
  };
}

function collectPillarChars(
  pillars: SajuBasicResponse["pillars"],
  includeHour: boolean
): string[] {
  const list = [
    pillars.year.stem,
    pillars.year.branch,
    pillars.month.stem,
    pillars.month.branch,
    pillars.day.stem,
    pillars.day.branch,
  ];
  if (includeHour && pillars.hour) {
    list.push(pillars.hour.stem, pillars.hour.branch);
  }
  return list;
}

export function computeBasicSaju(input: SajuBasicRequest): SajuBasicResponse {
  const birthUtc = localBirthToUtc(
    input.birthDate,
    input.birthTimeUnknown ? null : input.birthTime,
    input.timezone
  );

  const birth = new Date(birthUtc);
  const lsr = lunisolar(birth);
  const char8 = lsr.char8;

  const pillars = {
    year: pillarFromChar8(char8.year),
    month: pillarFromChar8(char8.month),
    day: pillarFromChar8(char8.day),
    hour: input.birthTimeUnknown ? null : pillarFromChar8(char8.hour),
  };

  const chars = collectPillarChars(pillars, !input.birthTimeUnknown);
  const dominantElement = countElements(chars);
  const elements = buildElementBreakdown(chars);
  const narrative = buildNarrative({
    locale: input.locale,
    element: dominantElement,
    species: input.species as Species,
    petName: input.petName,
  });

  const kstJiji = input.birthTimeUnknown ? null : getKstJijiFromUtc(birthUtc);

  return {
    petName: input.petName,
    species: input.species,
    petGender: input.petGender ?? null,
    locale: input.locale,
    birthUtc,
    timezone: input.timezone,
    birthTimeUnknown: input.birthTimeUnknown,
    kstJiji,
    pillars,
    elements,
    dominantElement,
    headline: narrative.headline,
    story: narrative.story,
    traits: narrative.traits,
  };
}

/** KST calendar date (YYYY-MM-DD) → that day's 日柱 pillar (noon KST). */
export function computeKstDayPillar(dateKst: string): PillarDisplay {
  const birthUtc = localBirthToUtc(dateKst, "12:00", "Asia/Seoul");
  const lsr = lunisolar(new Date(birthUtc));
  return pillarFromChar8(lsr.char8.day);
}
