import {
  buildPetDailyFortune,
  buildPetFortunePetMeta,
  type PetDailyFortune,
  type PetFortunePetMeta,
  type PetProfileForFortune,
} from "@/lib/saju/pet-daily-fortune";
import type { Locale } from "@/lib/saju/types";

/** Fixed showcase pet — deterministic fortune on every refresh. */
export const SAMPLE_PET_FORTUNE_ID = "guest-sample-mochi";

export const SAMPLE_PET_FORTUNE_PROFILE: PetProfileForFortune = {
  id: SAMPLE_PET_FORTUNE_ID,
  name: "모찌",
  species: "dog",
  birthDate: "2020-05-15",
  birthTime: null,
  birthTimeUnknown: true,
  birthTimezone: "Asia/Seoul",
  profileImageUrl: null,
};

export function buildSamplePetFortune(locale: Locale = "ko"): {
  pet: PetFortunePetMeta;
  fortune: PetDailyFortune;
} {
  const pet = buildPetFortunePetMeta(SAMPLE_PET_FORTUNE_PROFILE, locale);
  const fortune = buildPetDailyFortune(SAMPLE_PET_FORTUNE_PROFILE, locale);
  return { pet, fortune };
}
