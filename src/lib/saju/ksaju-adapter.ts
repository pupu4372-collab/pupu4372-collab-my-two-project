/**
 * K-Saju Pet API 요청 ↔ ksaju-engine 입력/매핑 어댑터
 */
import { extractDayMaster, extractElementsFromSaju } from "@/lib/saju/extract-elements";
import { mapToHumanInterpretation, type HumanSajuMapping } from "@/lib/saju/human-trait-mapping";
import {
  calculateSaju,
  createZiweiChart,
  type BirthInput,
  type Gender as KsajuGender,
  type SajuResult,
  type ZiweiChart,
} from "@/lib/saju/ksaju-engine";
import {
  mapToPetTraits,
  type AnimalGroup,
  type PetSajuMapping,
} from "@/lib/saju/pet-trait-mapping";
import type { Gender, Locale, SajuBasicRequest, Species } from "@/lib/saju/types";

const DEFAULT_UNKNOWN_HOUR = 12;
const DEFAULT_UNKNOWN_MINUTE = 0;

export function speciesToAnimalGroup(species: Species): AnimalGroup {
  if (species === "dog") return "dog";
  if (species === "cat") return "cat";
  return "reptile";
}

export function petGenderToKsajuGender(gender?: Gender | null): KsajuGender {
  return gender === "female" ? "F" : "M";
}

/** birthDate/birthTime는 사용자 IANA timezone 기준 로컬 값 */
export function sajuBasicRequestToBirthInput(request: SajuBasicRequest): BirthInput {
  const [year, month, day] = request.birthDate.split("-").map(Number);
  const timeSource = request.birthTimeUnknown ? "12:00" : (request.birthTime ?? "12:00");
  const [hour, minute] = timeSource.split(":").map(Number);

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    !Number.isFinite(hour) ||
    !Number.isFinite(minute)
  ) {
    throw new Error("Invalid birth date or time");
  }

  return {
    year,
    month,
    day,
    hour: request.birthTimeUnknown ? DEFAULT_UNKNOWN_HOUR : hour,
    minute: request.birthTimeUnknown ? DEFAULT_UNKNOWN_MINUTE : minute,
    gender: petGenderToKsajuGender(request.petGender),
    isLunar: request.calendarType === "lunar",
  };
}

export function computeKsajuFromRequest(request: SajuBasicRequest): SajuResult {
  return calculateSaju(sajuBasicRequestToBirthInput(request));
}

export function buildPetSajuMapping(
  saju: SajuResult,
  species: Species,
  locale: Locale = "ko"
): PetSajuMapping {
  const elements = extractElementsFromSaju(saju);
  const dayMaster = extractDayMaster(saju);
  return mapToPetTraits(elements, dayMaster, speciesToAnimalGroup(species), locale);
}

export function computePetSajuMappingFromRequest(request: SajuBasicRequest): {
  saju: SajuResult;
  mapping: PetSajuMapping;
} {
  const saju = computeKsajuFromRequest(request);
  return { saju, mapping: buildPetSajuMapping(saju, request.species, request.locale) };
}

export function computeHumanSajuMappingFromBirthInput(
  input: BirthInput,
  locale: Locale = "ko"
): HumanSajuMapping {
  return mapToHumanInterpretation(calculateSaju(input), locale);
}

/** Human premium: solar/local birth fields → ksaju BirthInput */
export function premiumBirthToBirthInput(input: {
  birthDate: string;
  birthTime: string | null;
  birthTimeUnknown: boolean;
  gender?: "male" | "female" | null;
}): BirthInput {
  const [year, month, day] = input.birthDate.split("-").map(Number);
  const timeSource = input.birthTimeUnknown ? "12:00" : (input.birthTime ?? "12:00");
  const [hour, minute] = timeSource.split(":").map(Number);

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    !Number.isFinite(hour) ||
    !Number.isFinite(minute)
  ) {
    throw new Error("Invalid birth date or time");
  }

  return {
    year,
    month,
    day,
    hour: input.birthTimeUnknown ? DEFAULT_UNKNOWN_HOUR : hour,
    minute: input.birthTimeUnknown ? DEFAULT_UNKNOWN_MINUTE : minute,
    gender: input.gender === "female" ? "F" : "M",
    isLunar: false,
  };
}

export function computeHumanSajuMappingFromPremiumBirth(input: {
  birthDate: string;
  birthTime: string | null;
  birthTimeUnknown: boolean;
  gender?: "male" | "female" | null;
  locale?: Locale;
}): HumanSajuMapping {
  return computeHumanSajuMappingFromBirthInput(
    premiumBirthToBirthInput(input),
    input.locale ?? "ko"
  );
}

export function computeZiweiChartFromPremiumBirth(input: {
  birthDate: string;
  birthTime: string | null;
  birthTimeUnknown: boolean;
  gender?: "male" | "female" | null;
}): ZiweiChart {
  const birth = premiumBirthToBirthInput(input);
  return createZiweiChart({
    year: birth.year,
    month: birth.month,
    day: birth.day,
    hour: birth.hour,
    minute: birth.minute,
    gender: birth.gender,
    isLunar: false,
  });
}

export function computeZiweiChartFromRequest(request: SajuBasicRequest): ZiweiChart {
  const birth = sajuBasicRequestToBirthInput(request);
  return createZiweiChart(birth);
}

export type { BirthInput, SajuResult, PetSajuMapping, HumanSajuMapping, ZiweiChart, AnimalGroup };
