import type { CompatibilityResponse } from "@/lib/saju/compatibility/engine";
import type { PetMbtiPremiumInsight } from "@/lib/saju/llm/pet-premium/types";
import type { BirthCalendarType, ElementKey, Locale, Species } from "@/lib/saju/types";
import type { ZodiacFortuneResponse } from "@/lib/saju/zodiac/engine";

export interface PetPremiumPdfPayload {
  version: 1;
  generatedAt: string;
  issuedDateKst: string;
  locale: Locale;
  petName: string;
  species: Species;
  speciesLabel: string;
  dominantElement: ElementKey;
  dominantElementLabel: string;
  mbti: PetMbtiPremiumInsight | null;
  compatibility: CompatibilityResponse | null;
  zodiac: ZodiacFortuneResponse | null;
}

export interface PetPremiumPdfRequest {
  petName: string;
  species: Species;
  petGender?: "male" | "female";
  birthDate: string;
  calendarType?: BirthCalendarType;
  birthTime?: string | null;
  birthTimeUnknown?: boolean;
  timezone: string;
  locale: Locale;
  petId?: string | null;
  mbtiType?: string;
  mbtiAnswers?: Record<string, string>;
  ownerName?: string;
  ownerGender?: "male" | "female";
  ownerBirthDate?: string;
  ownerCalendarType?: BirthCalendarType;
  ownerBirthTime?: string | null;
  ownerBirthTimeUnknown?: boolean;
  privacyConsent?: boolean;
}
