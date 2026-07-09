export const PET_PREMIUM_SECTION_COUNT = 2;

export type PetPremiumSectionCompletion = {
  mbtiDone: boolean;
  zodiacDone: boolean;
  compatibilityDone: boolean;
  completedCount: number;
  allComplete: boolean;
};

export const EMPTY_PET_PREMIUM_SECTION_COMPLETION: PetPremiumSectionCompletion = {
  mbtiDone: false,
  zodiacDone: false,
  compatibilityDone: false,
  completedCount: 0,
  allComplete: false,
};

export function getPetPremiumSectionCompletionFromFlags(flags: {
  zodiacDone: boolean;
  compatibilityDone: boolean;
}): PetPremiumSectionCompletion {
  const completedCount = [flags.zodiacDone, flags.compatibilityDone].filter(Boolean).length;

  return {
    mbtiDone: false,
    zodiacDone: flags.zodiacDone,
    compatibilityDone: flags.compatibilityDone,
    completedCount,
    allComplete: completedCount === PET_PREMIUM_SECTION_COUNT,
  };
}
