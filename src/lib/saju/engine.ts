import {
  buildElementBreakdown,
  countElements,
  formatStemBranchLabels,
} from "./elements";
import {
  buildPetSajuMapping,
  computeKsajuFromRequest,
} from "./ksaju-adapter";
import type { PillarInfo, SajuResult } from "./ksaju-engine";
import { buildNarrative } from "./narratives";
import { resolveSolarBirthDate } from "./resolve-birth-date";
import type { PetSajuMapping } from "./pet-trait-mapping";
import type {
  Locale,
  PillarDisplay,
  SajuBasicRequest,
  SajuBasicResponse,
  Species,
} from "./types";
import { getKstJijiFromUtc } from "./jiji-hours";
import { localBirthToUtc } from "./timezone";

function pillarFromKsaju(p: PillarInfo, locale: Locale): PillarDisplay {
  const labels = formatStemBranchLabels(p.stem, p.branch, locale);
  return {
    pillar: p.ganzi,
    stem: p.stem,
    branch: p.branch,
    stemHanja: p.stem,
    branchHanja: p.branch,
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

export function buildBasicSajuResponse(
  input: SajuBasicRequest,
  saju: SajuResult
): SajuBasicResponse {
  const calendarType = input.calendarType ?? "solar";
  const solarBirthDate = resolveSolarBirthDate(input.birthDate, calendarType);
  const birthUtc = localBirthToUtc(
    solarBirthDate,
    input.birthTimeUnknown ? null : input.birthTime,
    input.timezone
  );

  const pillars = {
    year: pillarFromKsaju(saju.pillars[0], input.locale),
    month: pillarFromKsaju(saju.pillars[1], input.locale),
    day: pillarFromKsaju(saju.pillars[2], input.locale),
    hour: input.birthTimeUnknown
      ? null
      : pillarFromKsaju(saju.pillars[3], input.locale),
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
    birthDate: input.birthDate,
    calendarType,
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

export function computeBasicSaju(input: SajuBasicRequest): SajuBasicResponse {
  return buildBasicSajuResponse(input, computeKsajuFromRequest(input));
}

/** Single ksaju pass: pillars for API/UI + trait mapping for LLM. */
export function computePetSajuBundle(input: SajuBasicRequest): {
  result: SajuBasicResponse;
  saju: SajuResult;
  mapping: PetSajuMapping;
} {
  const saju = computeKsajuFromRequest(input);
  return {
    result: buildBasicSajuResponse(input, saju),
    saju,
    mapping: buildPetSajuMapping(saju, input.species, input.locale),
  };
}

/** KST calendar date (YYYY-MM-DD) → that day's 日柱 pillar (noon KST).
 * 라벨 필드(stemLabel/branchLabel)는 locale을 따름.
 * 값 필드(pillar/branchHanja 등)는 locale 무관. */
export function computeKstDayPillar(dateKst: string, locale: Locale = "ko"): PillarDisplay {
  const saju = computeKsajuFromRequest({
    petName: "",
    species: "dog",
    birthDate: dateKst,
    birthTime: "12:00",
    birthTimeUnknown: false,
    timezone: "Asia/Seoul",
    locale,
    privacyConsent: true,
  });
  return pillarFromKsaju(saju.pillars[2], locale);
}
