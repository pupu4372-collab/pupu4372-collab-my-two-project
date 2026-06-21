import type { FiveElement, Stem } from "./ksaju-engine/core-tables";
import type { AnimalGroup, DayMasterArchetype, TraitMapping } from "./pet-trait-mapping";

export const DOG_TRAITS_EN: Record<FiveElement, TraitMapping> = {
  wood: {
    personality: ["Curious", "Strong growth drive", "Quick to learn tricks"],
    healthFocus: ["Joints & ligaments", "Growth-stage nutrition"],
    compatibilityTag: "Best with an active guardian who loves training and outdoor adventures",
  },
  fire: {
    personality: ["Energetic", "Big on affection", "Overflowing enthusiasm"],
    healthFocus: ["Heart & circulation", "Cool-down after overexcitement"],
    compatibilityTag: "Great chemistry with a playful, hands-on guardian",
  },
  earth: {
    personality: ["Steady", "Easygoing", "Loyal"],
    healthFocus: ["Digestion", "Weight management"],
    compatibilityTag: "Thrives with a consistent, routine-oriented guardian",
  },
  metal: {
    personality: ["Independent", "Alert boundaries", "Decisive"],
    healthFocus: ["Respiratory health", "Coat & skin care"],
    compatibilityTag: "Trust builds with a respectful guardian who gives space",
  },
  water: {
    personality: ["Clever", "Observant", "May need time to warm up"],
    healthFocus: ["Kidney & urinary health", "Hydration"],
    compatibilityTag: "Opens up slowly to a calm, patient guardian",
  },
};

export const CAT_TRAITS_EN: Record<FiveElement, TraitMapping> = {
  wood: {
    personality: ["Loves to explore", "Prefers high perches", "Strong self-will"],
    healthFocus: ["Joints", "Muscle tone"],
    compatibilityTag: "Best with a guardian who enriches the environment (cat trees, vertical space)",
  },
  fire: {
    personality: ["Mood swings", "Mix of affection and aloofness", "Bursts of energy"],
    healthFocus: ["Heart", "Stress-related issues"],
    compatibilityTag: "Matches a guardian who reads feline moods with care",
  },
  earth: {
    personality: ["Laid-back", "Homebody", "Seeks stability"],
    healthFocus: ["Weight gain", "Digestion"],
    compatibilityTag: "Comfortable with a quiet guardian and steady daily rhythm",
  },
  metal: {
    personality: ["Aloof", "Clear boundaries", "Observes before acting"],
    healthFocus: ["Respiratory health", "Dental care"],
    compatibilityTag: "Trust forms faster when the guardian waits for the cat to approach",
  },
  water: {
    personality: ["Cautious", "Shy with strangers", "Deep bond once attached"],
    healthFocus: ["Kidney health (common in cats)", "Hydration support"],
    compatibilityTag: "Relies on a patient guardian who never rushes closeness",
  },
};

export const REPTILE_TRAITS_EN: Record<FiveElement, TraitMapping> = {
  wood: {
    personality: ["Adapts well to habitat changes", "Expands activity range"],
    healthFocus: ["Shedding cycle", "Enclosure size"],
    compatibilityTag: "Best with a guardian who steadily improves the habitat",
  },
  fire: {
    personality: ["Temperature-sensitive", "Activity shifts with heat/light"],
    healthFocus: ["Temperature & basking light"],
    compatibilityTag: "Stays stable with a guardian who monitors heat and humidity",
  },
  earth: {
    personality: ["Steady biological rhythm", "Prefers routine"],
    healthFocus: ["Digestion & bowel regularity"],
    compatibilityTag: "Thrives with regular feeding and care schedules",
  },
  metal: {
    personality: ["High alertness", "May be touch-sensitive"],
    healthFocus: ["Skin & shed quality"],
    compatibilityTag: "Adapts gradually when handling is never forced",
  },
  water: {
    personality: ["Humidity-sensitive", "Prefers hiding spots"],
    healthFocus: ["Humidity control", "Hydration"],
    compatibilityTag: "Best with a guardian who provides hides and proper humidity",
  },
};

export const TRAIT_TABLES_EN: Record<AnimalGroup, Record<FiveElement, TraitMapping>> = {
  dog: DOG_TRAITS_EN,
  cat: CAT_TRAITS_EN,
  reptile: REPTILE_TRAITS_EN,
};

export const DOG_DAYMASTER_EN: Record<Stem, DayMasterArchetype> = {
  甲: { keyword: "Leader", description: "Natural pack-leader energy; likes to take the lead" },
  乙: { keyword: "Softie", description: "Flexible, adapts easily, loves staying close to people" },
  丙: { keyword: "Sunbeam", description: "Brightens the room just by being there" },
  丁: { keyword: "Gentle heart", description: "Calm outside, deep affection inside" },
  戊: { keyword: "Guardian", description: "Steady home protector; prefers stability over change" },
  己: { keyword: "Companion", description: "Quietly sticks by the guardian’s side day to day" },
  庚: { keyword: "Decisive", description: "Once decided, rarely changes course" },
  辛: { keyword: "Refined", description: "Sensitive, neat, and picky about comfort" },
  壬: { keyword: "Free spirit", description: "Wants room to roam and explore" },
  癸: { keyword: "Watcher", description: "Observes first, moves when the moment feels right" },
};

export const CAT_DAYMASTER_EN: Record<Stem, DayMasterArchetype> = {
  甲: { keyword: "Boss cat", description: "Acts like top cat of the household" },
  乙: { keyword: "Sweetheart", description: "Soft, clingy charm; shares space willingly" },
  丙: { keyword: "Social star", description: "Greets guests first; sunny, outgoing presence" },
  丁: { keyword: "Quiet love", description: "Prefers sitting nearby with subtle affection" },
  戊: { keyword: "Homebody", description: "Settles in one spot and stays put" },
  己: { keyword: "Slow pace", description: "Never in a hurry; lives on cat time" },
  庚: { keyword: "Cool cat", description: "Draws clear lines with chic confidence" },
  辛: { keyword: "Feisty", description: "Sensitive but deeply attentive to their person" },
  壬: { keyword: "Explorer", description: "Enjoys investigating every corner" },
  癸: { keyword: "Hider", description: "Cautious observer who retreats when unsure" },
};

export const REPTILE_DAYMASTER_EN: Record<Stem, DayMasterArchetype> = {
  甲: { keyword: "Pioneer", description: "Actively explores the enclosure" },
  乙: { keyword: "Adapter", description: "Handles habitat changes with relative ease" },
  丙: { keyword: "Active", description: "Often seen basking and moving with energy" },
  丁: { keyword: "Mild", description: "Calm response to most stimuli" },
  戊: { keyword: "Anchor", description: "Rarely leaves a familiar spot" },
  己: { keyword: "Routine", description: "Prefers predictable daily patterns" },
  庚: { keyword: "Guarded", description: "Cautious with handling; keeps distance" },
  辛: { keyword: "Sensitive", description: "Reacts finely to environmental shifts" },
  壬: { keyword: "Hide-seeker", description: "Feels safest with good cover" },
  癸: { keyword: "Humidity-bound", description: "Especially sensitive to moisture and climate" },
};

export const DAYMASTER_TABLES_EN: Record<AnimalGroup, Record<Stem, DayMasterArchetype>> = {
  dog: DOG_DAYMASTER_EN,
  cat: CAT_DAYMASTER_EN,
  reptile: REPTILE_DAYMASTER_EN,
};
