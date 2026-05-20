import type { ElementKey, Locale, Species } from "../types";
import { narrativeEn } from "./en";
import { narrativeKo } from "./ko";

export function buildNarrative(params: {
  locale: Locale;
  element: ElementKey;
  species: Species;
  petName: string;
}) {
  const { locale, element, species, petName } = params;
  if (locale === "ko") return narrativeKo(element, species, petName);
  return narrativeEn(element, species, petName);
}
