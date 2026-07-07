import { computeBasicSaju } from "../engine";
import { ELEMENT_META } from "../elements";
import type { ElementKey, Gender, Locale, Species } from "../types";
import {
  getElementRelation,
  scoreFromRelation,
  type ElementRelation,
} from "./elements-cycle";
import { buildCompatibilityNarrative } from "./narratives";

export interface CompatibilityRequest {
  petName: string;
  ownerName: string;
  species: Species;
  petGender: Gender;
  ownerGender: Gender;
  petBirthDate: string;
  petCalendarType?: "solar" | "lunar";
  petBirthTime: string | null;
  petBirthTimeUnknown: boolean;
  ownerBirthDate: string;
  ownerCalendarType?: "solar" | "lunar";
  ownerBirthTime: string | null;
  ownerBirthTimeUnknown: boolean;
  timezone: string;
  locale: Locale;
}

export interface CompatibilityResponse {
  petName: string;
  ownerName: string;
  species: Species;
  petGender: Gender;
  ownerGender: Gender;
  locale: Locale;
  persisted?: boolean;
  petId?: string | null;
  sajuResultId?: string | null;
  persistError?: string | null;
  bondScore: number;
  bondLabel: string;
  bondEmoji: string;
  relation: ElementRelation;
  petElement: ElementKey;
  ownerElement: ElementKey;
  petElementLabel: { hanja: string; hangul: string; romanized: string; meaning: string };
  ownerElementLabel: { hanja: string; hangul: string; romanized: string; meaning: string };
  petDayPillar: string;
  ownerDayPillar: string;
  headline: string;
  story: string;
  details: {
    title: string;
    body: string;
  }[];
  careTips: string[];
  relationDescription: string;
  petElementNote: string;
  ownerElementNote: string;
  narrativeSource?: "template" | "llm";
}

export function computeCompatibility(input: CompatibilityRequest): CompatibilityResponse {
  const petSaju = computeBasicSaju({
    petName: input.petName,
    species: input.species,
    birthDate: input.petBirthDate,
    calendarType: input.petCalendarType ?? "solar",
    birthTime: input.petBirthTime,
    birthTimeUnknown: input.petBirthTimeUnknown,
    timezone: input.timezone,
    locale: input.locale,
    privacyConsent: true,
  });

  const ownerSaju = computeBasicSaju({
    petName: input.ownerName,
    species: input.species,
    birthDate: input.ownerBirthDate,
    calendarType: input.ownerCalendarType ?? "solar",
    birthTime: input.ownerBirthTime,
    birthTimeUnknown: input.ownerBirthTimeUnknown,
    timezone: input.timezone,
    locale: input.locale,
    privacyConsent: true,
  });

  const petElement = petSaju.dominantElement;
  const ownerElement = ownerSaju.dominantElement;
  const relation = getElementRelation(petElement, ownerElement);

  let bondScore = scoreFromRelation(relation);
  if (petSaju.pillars.day.pillar === ownerSaju.pillars.day.pillar) {
    bondScore = Math.min(98, bondScore + 5);
  }

  const narrative = buildCompatibilityNarrative(
    relation,
    bondScore,
    input.petName,
    input.ownerName,
    petElement,
    ownerElement,
    input.petGender,
    input.ownerGender,
    input.species,
    input.locale
  );

  const petMeta = ELEMENT_META[petElement];
  const ownerMeta = ELEMENT_META[ownerElement];

  return {
    petName: input.petName,
    ownerName: input.ownerName,
    species: input.species,
    petGender: input.petGender,
    ownerGender: input.ownerGender,
    locale: input.locale,
    bondScore,
    bondLabel: narrative.bondLabel,
    bondEmoji: narrative.bondEmoji,
    relation,
    petElement,
    ownerElement,
    petElementLabel: {
      hanja: petMeta.hanja,
      hangul: petMeta.hangul,
      romanized: petMeta.romanized,
      meaning: petMeta.meaning,
    },
    ownerElementLabel: {
      hanja: ownerMeta.hanja,
      hangul: ownerMeta.hangul,
      romanized: ownerMeta.romanized,
      meaning: ownerMeta.meaning,
    },
    petDayPillar: petSaju.pillars.day.pillar,
    ownerDayPillar: ownerSaju.pillars.day.pillar,
    headline: narrative.headline,
    story: narrative.story,
    details: narrative.details,
    careTips: narrative.careTips,
    relationDescription: narrative.relationDescription,
    petElementNote: narrative.petElementNote,
    ownerElementNote: narrative.ownerElementNote,
  };
}
