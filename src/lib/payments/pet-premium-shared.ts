export const PET_PREMIUM_PRODUCT_LABELS = {
  ko: {
    pet_premium_v1: "펫 프리미엄 패키지",
    pet_mbti_v1: "펫 MBTI 상세 진단",
  },
  en: {
    pet_premium_v1: "Pet Premium Package",
    pet_mbti_v1: "Pet MBTI Detailed Report",
  },
} as const;

export const PET_PREMIUM_INCLUDES = {
  ko: ["집사 궁합 케어", "별자리 케어 가이드"],
  en: ["Pet & butler bond care", "Zodiac care guide"],
} as const;

export type PetPremiumPaymentRecord = {
  paymentId: string;
  productCode: string;
  petId: string;
  petName: string;
  species: string | null;
  petGender: string | null;
  birthDate: string | null;
  timezone: string | null;
  amount: number;
  currency: "KRW" | "USD";
  createdAt: string;
  expiresAt: string | null;
  isLifetime: boolean;
};

export function buildPetPremiumHubHref(
  order: Pick<
    PetPremiumPaymentRecord,
    "petId" | "petName" | "species" | "petGender" | "birthDate" | "timezone"
  >,
  locale: "ko" | "en"
) {
  const params = new URLSearchParams({ locale });
  if (order.petId) params.set("petId", order.petId);
  if (order.petName && order.petName !== "—") params.set("petName", order.petName);
  if (order.species) params.set("species", order.species);
  if (order.petGender && order.petGender !== "unknown") params.set("petGender", order.petGender);
  if (order.birthDate) params.set("birthDate", order.birthDate);
  if (order.timezone) params.set("timezone", order.timezone);
  return `/saju/premium?${params.toString()}`;
}
