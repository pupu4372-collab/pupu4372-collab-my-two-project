import type {
  PetCompatibilityLlmJson,
  PetMbtiPremiumLlmJson,
  PetZodiacLlmJson,
} from "./pet-premium/types";
import { sanitizeLlmSlotText } from "./slot-output-sanitize";
import type { PetInterpretationJson } from "./types";

function slot(slotName: string, text: string): string {
  return sanitizeLlmSlotText(slotName, text);
}

export function sanitizePetInterpretationJson(data: PetInterpretationJson): PetInterpretationJson {
  return {
    characterIntro: slot("pet.characterIntro", data.characterIntro),
    personality: slot("pet.personality", data.personality),
    healthNote: slot("pet.healthNote", data.healthNote),
    compatibility: slot("pet.compatibility", data.compatibility),
  };
}

export function sanitizePetMbtiPremiumLlmJson(data: PetMbtiPremiumLlmJson): PetMbtiPremiumLlmJson {
  return {
    personalityBlend: slot("pet.mbti.personalityBlend", data.personalityBlend),
    sajuCombo: slot("pet.mbti.sajuCombo", data.sajuCombo),
    butlerFit: slot("pet.mbti.butlerFit", data.butlerFit),
    health: slot("pet.mbti.health", data.health),
    dailyCare: slot("pet.mbti.dailyCare", data.dailyCare),
  };
}

export function sanitizePetCompatibilityLlmJson(data: PetCompatibilityLlmJson): PetCompatibilityLlmJson {
  return {
    story: slot("pet.compatibility.story", data.story),
    relationDescription: slot("pet.compatibility.relationDescription", data.relationDescription),
    petElementNote: slot("pet.compatibility.petElementNote", data.petElementNote),
    ownerElementNote: slot("pet.compatibility.ownerElementNote", data.ownerElementNote),
    details: data.details.map((item, index) => ({
      title: slot(`pet.compatibility.details.${index}.title`, item.title),
      body: slot(`pet.compatibility.details.${index}.body`, item.body),
    })),
    careTips: data.careTips.map((tip, index) => slot(`pet.compatibility.careTips.${index}`, tip)),
  };
}

export function sanitizePetZodiacPersonalityLlmJson(
  data: Pick<PetZodiacLlmJson, "personalityDetails">
): Pick<PetZodiacLlmJson, "personalityDetails"> {
  return {
    personalityDetails: data.personalityDetails.map((item, index) => ({
      title: slot(`pet.zodiac.personality.${index}.title`, item.title),
      body: slot(`pet.zodiac.personality.${index}.body`, item.body),
    })),
  };
}

export function sanitizePetZodiacDailyText(dailyToday: string): string {
  return slot("pet.zodiac.dailyToday", dailyToday);
}

export function sanitizePetGeminiNarrative(fields: {
  headline: string;
  story: string;
  traits: string[];
}): { headline: string; story: string; traits: string[] } {
  return {
    headline: slot("pet.gemini.headline", fields.headline),
    story: slot("pet.gemini.story", fields.story),
    traits: fields.traits.map((trait, index) => slot(`pet.gemini.trait.${index}`, trait)),
  };
}
