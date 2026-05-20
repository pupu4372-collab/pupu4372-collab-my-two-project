export type ElementKey = "wood" | "fire" | "earth" | "metal" | "water";
export type Species = "dog" | "cat";
export type Locale = "en" | "ko";

export interface PillarDisplay {
  pillar: string;
  stem: string;
  branch: string;
  stemHanja: string;
  branchHanja: string;
  stemLabel: string;
  branchLabel: string;
}

export interface ElementDisplay {
  key: ElementKey;
  hanja: string;
  hangul: string;
  romanized: string;
  count: number;
}

/** KST-based 12 double-hour (지지) slot with hip romanization */
export interface KstJijiHour {
  kstTime: string;
  branchHanja: string;
  branchHangul: string;
  romanized: string;
  siNameKo: string;
  siNameEn: string;
  animalKo: string;
  animalEn: string;
  element: ElementKey;
  kstRange: string;
}

export interface SajuBasicRequest {
  petName: string;
  species: Species;
  birthDate: string;
  birthTime: string | null;
  birthTimeUnknown: boolean;
  timezone: string;
  locale: Locale;
  privacyConsent: boolean;
}

export interface SajuBasicResponse {
  petName: string;
  species: Species;
  locale: Locale;
  birthUtc: string;
  timezone: string;
  birthTimeUnknown: boolean;
  kstJiji: KstJijiHour | null;
  pillars: {
    year: PillarDisplay;
    month: PillarDisplay;
    day: PillarDisplay;
    hour: PillarDisplay | null;
  };
  elements: ElementDisplay[];
  dominantElement: ElementKey;
  headline: string;
  story: string;
  traits: string[];
}
