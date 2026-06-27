export const PET_PREMIUM_PRODUCT_LABELS = {
  ko: {
    pet_premium_v1: "펫 프리미엄 패키지",
  },
  en: {
    pet_premium_v1: "Pet Premium Package",
  },
} as const;

export const PET_PREMIUM_INCLUDES = {
  ko: ["상세 MBTI", "별자리 운세", "펫·집사 궁합"],
  en: ["Detailed MBTI", "Zodiac fortune", "Pet & butler bond"],
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
  currency: "KRW";
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
