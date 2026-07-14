export const PET_PREMIUM_PACKAGE_CODE = "pet_premium_v1" as const;
export const PET_MBTI_STANDALONE_CODE = "pet_mbti_v1" as const;

export type PetProductCode = typeof PET_PREMIUM_PACKAGE_CODE | typeof PET_MBTI_STANDALONE_CODE;

export const ALLOWED_PET_PRODUCT_CODES = new Set<PetProductCode>([
  PET_PREMIUM_PACKAGE_CODE,
  PET_MBTI_STANDALONE_CODE,
]);

/** Authoritative KRW amounts — server verify uses this map. Client display must match. */
export const PET_PRODUCT_AMOUNT_KRW: Record<PetProductCode, number> = {
  [PET_PREMIUM_PACKAGE_CODE]: 4500,
  [PET_MBTI_STANDALONE_CODE]: 1900,
};

/** EN display (whole USD). Payment currency switch is P-4 — not wired yet. */
export const PET_PRODUCT_AMOUNT_USD: Record<PetProductCode, number> = {
  [PET_PREMIUM_PACKAGE_CODE]: 4,
  [PET_MBTI_STANDALONE_CODE]: 2,
};

export const PET_PACKAGE_UNLOCK_CODES = [PET_PREMIUM_PACKAGE_CODE] as const;
export const PET_MBTI_UNLOCK_CODES = [PET_MBTI_STANDALONE_CODE] as const;

export type PetUnlockScope = "package" | "mbti";

export function productCodesForUnlockScope(scope: PetUnlockScope): readonly PetProductCode[] {
  return scope === "mbti" ? PET_MBTI_UNLOCK_CODES : PET_PACKAGE_UNLOCK_CODES;
}

export function normalizePetProductCode(value: string | null | undefined): PetProductCode {
  if (value === PET_MBTI_STANDALONE_CODE) return PET_MBTI_STANDALONE_CODE;
  return PET_PREMIUM_PACKAGE_CODE;
}

export function isAllowedPetProductCode(value: string): value is PetProductCode {
  return ALLOWED_PET_PRODUCT_CODES.has(value as PetProductCode);
}

export function formatPetProductPrice(code: PetProductCode, locale: "ko" | "en"): string {
  if (locale === "en") {
    return `$${PET_PRODUCT_AMOUNT_USD[code]}`;
  }
  const amount = PET_PRODUCT_AMOUNT_KRW[code];
  return `₩${amount.toLocaleString("ko-KR")}`;
}

export const PET_PRODUCT_ORDER_NAME: Record<PetProductCode, string> = {
  [PET_PREMIUM_PACKAGE_CODE]: "펫 프리미엄 패키지 (궁합 + 별자리)",
  [PET_MBTI_STANDALONE_CODE]: "펫 MBTI 상세 진단",
};

export const PET_PRODUCT_PAYMENT_ID_PREFIX: Record<PetProductCode, string> = {
  [PET_PREMIUM_PACKAGE_CODE]: "pet_premium_v1",
  [PET_MBTI_STANDALONE_CODE]: "pet_mbti_v1",
};
