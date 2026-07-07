import { createHash } from "node:crypto";
import type { Locale } from "@/lib/saju/types";
import type { PetPremiumFeature } from "./types";

export const PET_PREMIUM_PROMPT_VERSION = 4;

function stableStringify(value: unknown): string {
  return JSON.stringify(value, (_key, current) => {
    if (current && typeof current === "object" && !Array.isArray(current)) {
      const sorted: Record<string, unknown> = {};
      for (const key of Object.keys(current as Record<string, unknown>).sort()) {
        sorted[key] = (current as Record<string, unknown>)[key];
      }
      return sorted;
    }
    return current;
  });
}

function sha256Hex(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export function buildPetPremiumCacheKey(options: {
  feature: PetPremiumFeature;
  locale: Locale;
  provider: string;
  model: string;
  facet: Record<string, unknown>;
}): string {
  return sha256Hex(
    stableStringify({
      v: PET_PREMIUM_PROMPT_VERSION,
      feature: options.feature,
      locale: options.locale,
      provider: options.provider,
      model: options.model,
      facet: options.facet,
    })
  );
}

/** Zodiac daily body regenerates per KST date; personality sections use stable facet. */
export function zodiacDailyCacheFacet(input: {
  petId?: string | null;
  petName: string;
  species: string;
  birthDate: string;
  fortuneDateKst: string;
}): Record<string, unknown> {
  return {
    kind: "zodiac_daily",
    petId: input.petId ?? null,
    petName: input.petName.trim(),
    species: input.species,
    birthDate: input.birthDate,
    fortuneDateKst: input.fortuneDateKst,
  };
}

export function zodiacPersonalityCacheFacet(input: {
  petId?: string | null;
  petName: string;
  species: string;
  birthDate: string;
  signKey: string;
}): Record<string, unknown> {
  return {
    kind: "zodiac_personality",
    petId: input.petId ?? null,
    petName: input.petName.trim(),
    species: input.species,
    birthDate: input.birthDate,
    signKey: input.signKey,
  };
}
