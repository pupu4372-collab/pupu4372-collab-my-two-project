import {
  normalizePetPremiumReturnTo,
  type PetPremiumReturnTo,
} from "@/lib/payments/pet-premium-return-to";
import {
  normalizePetProductCode,
  PET_MBTI_STANDALONE_CODE,
  PET_PREMIUM_PACKAGE_CODE,
  type PetProductCode,
} from "@/lib/payments/pet-product-catalog";
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
  product?: PetProductCode;
};

export function buildPetPremiumPaymentHref(input: PetPremiumContinuation): string {
  const product = input.product ?? PET_PREMIUM_PACKAGE_CODE;
  const params = new URLSearchParams({
    product,
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

export function buildMbtiStandalonePaymentHref(
  input: Omit<PetPremiumContinuation, "product" | "returnTo">
): string {
  return buildPetPremiumPaymentHref({
    ...input,
    product: PET_MBTI_STANDALONE_CODE,
    returnTo: "mbti_standalone",
  });
}

export function buildPetPremiumSuccessHref(
  continuationQuery: string,
  returnTo: string | null | undefined
): string {
  const safeReturnTo = normalizePetPremiumReturnTo(returnTo);
  const withPoll = new URLSearchParams(continuationQuery);
  withPoll.set("premiumUnlockPoll", "1");

  if (safeReturnTo === "mbti_standalone") {
    return `/saju/mbti?${withPoll.toString()}`;
  }

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

  if (safeReturnTo === "basic" || safeReturnTo === "mbti_standalone") {
    if (sajuResultId) return `/reports/${sajuResultId}`;
    if (readSajuResultSession()) return "/saju?restore=1";
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

export function resolveProductFromQuery(productParam: string | null): PetProductCode {
  return normalizePetProductCode(productParam);
}
