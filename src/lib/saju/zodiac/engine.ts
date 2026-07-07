import { ELEMENT_META } from "../elements";
import { resolveSolarBirthDate } from "../resolve-birth-date";
import type { BirthCalendarType, ElementKey, Locale, Species } from "../types";
import { buildDailyFortune, getTodayKstDateString } from "./fortunes";
import { buildZodiacPersonality } from "./personality";
import { getZodiacSignFromBirthDate, type ZodiacSignMeta } from "./signs";

export interface ZodiacFortuneRequest {
  petName: string;
  species: Species;
  birthDate: string;
  calendarType?: BirthCalendarType;
  locale: Locale;
}

export interface ZodiacFortuneResponse {
  petName: string;
  species: Species;
  locale: Locale;
  birthDate: string;
  fortuneDateKst: string;
  persisted?: boolean;
  petId?: string | null;
  sajuResultId?: string | null;
  persistError?: string | null;
  sign: ZodiacSignMeta & {
    displayName: string;
    dateRange: string;
  };
  elementAffinity: ElementKey;
  elementLabel: {
    hanja: string;
    hangul: string;
    romanized: string;
    meaning: string;
  };
  personality: {
    headline: string;
    story: string;
    traits: string[];
    details: {
      title: string;
      body: string;
    }[];
  };
  daily: {
    luckScore: number;
    keyword: string;
    keywords: string[];
    today: string;
    luckySnack: string;
    caution: string;
    ownerTip: string;
  };
  narrativeSource?: "template" | "llm";
}

export function computeZodiacFortune(input: ZodiacFortuneRequest): ZodiacFortuneResponse {
  const solarBirthDate = resolveSolarBirthDate(
    input.birthDate,
    input.calendarType ?? "solar"
  );
  const signMeta = getZodiacSignFromBirthDate(solarBirthDate);
  const fortuneDateKst = getTodayKstDateString();
  const el = signMeta.elementAffinity;
  const elementMeta = ELEMENT_META[el];

  const personality = buildZodiacPersonality(
    signMeta.key,
    input.petName,
    input.species,
    el,
    input.locale
  );

  const daily = buildDailyFortune(
    signMeta.key,
    input.petName,
    input.species,
    input.locale,
    fortuneDateKst
  );

  const displayName =
    input.locale === "ko"
      ? `${signMeta.symbol} ${signMeta.nameKo}`
      : `${signMeta.symbol} ${signMeta.nameEn}`;

  return {
    petName: input.petName,
    species: input.species,
    locale: input.locale,
    birthDate: input.birthDate,
    fortuneDateKst,
    sign: {
      ...signMeta,
      displayName,
      dateRange: input.locale === "ko" ? signMeta.dateRangeKo : signMeta.dateRangeEn,
    },
    elementAffinity: el,
    elementLabel: {
      hanja: elementMeta.hanja,
      hangul: elementMeta.hangul,
      romanized: elementMeta.romanized,
      meaning: elementMeta.meaning,
    },
    personality,
    daily,
  };
}
