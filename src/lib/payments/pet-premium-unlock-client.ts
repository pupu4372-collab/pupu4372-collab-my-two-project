import {
  normalizePetPremiumReturnTo,
  type PetPremiumReturnTo,
} from "@/lib/payments/pet-premium-return-to";
import { readSajuResultSession } from "@/lib/saju/saju-result-session";
import type { Locale } from "@/lib/saju/types";

export type { PetPremiumReturnTo };

export type PetPremiumContinuation = {
  petName: string;
  species: string;
  petGender?: string;
  birthDate: string;
  birthTime?: string;
  timezone?: string;
  locale: Locale;
  petId?: string | null;
  sajuResultId?: string | null;
  mbtiType?: string;
  returnTo?: PetPremiumReturnTo;
};

export function buildPetPremiumPaymentHref(input: PetPremiumContinuation): string {
  const params = new URLSearchParams({
    product: "pet_premium_v1",
    petName: input.petName,
    species: input.species,
    birthDate: input.birthDate,
    locale: input.locale,
  });
  if (input.petGender) params.set("petGender", input.petGender);
  if (input.birthTime) params.set("birthTime", input.birthTime);
  if (input.timezone) params.set("timezone", input.timezone);
  if (input.petId) params.set("petId", input.petId);
  if (input.sajuResultId) params.set("sajuResultId", input.sajuResultId);
  if (input.mbtiType) params.set("mbtiType", input.mbtiType);
  const safeReturnTo = normalizePetPremiumReturnTo(input.returnTo ?? null);
  if (safeReturnTo) params.set("returnTo", safeReturnTo);
  return `/payment?${params.toString()}`;
}

export function buildPetPremiumSuccessHref(
  continuationQuery: string,
  returnTo: string | null | undefined
): string {
  const safeReturnTo = normalizePetPremiumReturnTo(returnTo);
  const withPoll = new URLSearchParams(continuationQuery);
  withPoll.set("premiumUnlockPoll", "1");

  if (safeReturnTo === "zodiac-page") {
    return `/saju/zodiac?${withPoll.toString()}`;
  }
  if (safeReturnTo === "compatibility-page") {
    return `/saju/compatibility?${withPoll.toString()}`;
  }

  const hubQs = new URLSearchParams(withPoll);
  if (safeReturnTo === "mbti" || safeReturnTo === "zodiac" || safeReturnTo === "compatibility") {
    hubQs.set("view", safeReturnTo);
  }
  return `/saju/premium?${hubQs.toString()}`;
}

export function buildPetPremiumCancelHref(
  continuationQuery: string,
  returnTo: string | null | undefined
): string {
  const safeReturnTo = normalizePetPremiumReturnTo(returnTo);
  const params = new URLSearchParams(continuationQuery);
  const sajuResultId = params.get("sajuResultId");

  if (safeReturnTo === "basic") {
    if (sajuResultId) return `/reports/${sajuResultId}`;
    // Guests cannot reach /payment by policy; defensive fallback only.
    return "/saju?restore=1";
  }

  if (safeReturnTo === "zodiac-page") {
    return `/saju/zodiac?${params.toString()}`;
  }
  if (safeReturnTo === "compatibility-page") {
    return `/saju/compatibility?${params.toString()}`;
  }
  if (safeReturnTo === "mbti" || safeReturnTo === "zodiac" || safeReturnTo === "compatibility") {
    params.set("view", safeReturnTo);
    return `/saju/premium?${params.toString()}`;
  }

  if (sajuResultId) return `/reports/${sajuResultId}`;
  if (readSajuResultSession()) return "/saju?restore=1";
  if (params.get("petName") && params.get("birthDate")) {
    return `/saju/premium?${params.toString()}`;
  }
  return "/saju";
}
