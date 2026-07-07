import type { Locale } from "@/lib/saju/types";
import {
  normalizePetPremiumReturnTo,
  type PetPremiumReturnTo,
} from "@/lib/payments/pet-premium-return-to";

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
