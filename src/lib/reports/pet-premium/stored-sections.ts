import type { PetMbtiPremiumInsight } from "@/lib/saju/llm/pet-premium/types";
import type { CompatibilityResponse } from "@/lib/saju/compatibility/engine";
import { computePetSajuBundle } from "@/lib/saju/engine";
import type { ElementKey, Gender, Locale, Species } from "@/lib/saju/types";
import type { ZodiacFortuneResponse } from "@/lib/saju/zodiac/engine";
import { ELEMENT_META } from "@/lib/saju/elements";
import { dominantElementLabel as formatDominantElementLabel } from "@/lib/saju/pet-lucky-scores";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, FiveElement, Pet, SajuResultRow, SajuType } from "@/lib/supabase/types";
import type { PetPremiumPdfPayload } from "./types";
import {
  getPetPremiumSectionCompletionFromFlags,
  type PetPremiumSectionCompletion,
} from "./section-completion";
import { getTodayKstDateString } from "@/lib/saju/zodiac/fortunes";
import { getPetOwnedByUser } from "@/lib/saju/verify-pet-owner";

type DbClient = SupabaseClient<Database>;

export const PREMIUM_HUB_SAJU_TYPES = ["mbti", "zodiac", "compatibility"] as const satisfies readonly SajuType[];

export type PremiumHubSajuType = (typeof PREMIUM_HUB_SAJU_TYPES)[number];

const DB_TO_ELEMENT: Record<FiveElement, ElementKey> = {
  mok: "wood",
  hwa: "fire",
  to: "earth",
  geum: "metal",
  su: "water",
};

const SPECIES_LABEL: Record<Species, { ko: string; en: string }> = {
  dog: { ko: "강아지", en: "Dog" },
  cat: { ko: "고양이", en: "Cat" },
  reptile: { ko: "렙타일", en: "Reptile" },
  other: { ko: "기타", en: "Other" },
};

export type StoredPremiumSections = {
  pet: Pet;
  locale: Locale;
  dominantElement: ElementKey;
  mbti: PetMbtiPremiumInsight | null;
  zodiac: ZodiacFortuneResponse | null;
  compatibility: CompatibilityResponse | null;
  completion: PetPremiumSectionCompletion;
  resultIds: Partial<Record<PremiumHubSajuType, string>>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function pickLatestByType(rows: SajuResultRow[]): Partial<Record<PremiumHubSajuType, SajuResultRow>> {
  const out: Partial<Record<PremiumHubSajuType, SajuResultRow>> = {};
  for (const row of rows) {
    const type = row.saju_type as PremiumHubSajuType;
    if (!PREMIUM_HUB_SAJU_TYPES.includes(type)) continue;
    if (!out[type]) out[type] = row;
  }
  return out;
}

function resolveDominantElement(row: SajuResultRow | undefined, pet: Pet): ElementKey {
  const payload = row?.storytelling_payload;
  if (isRecord(payload) && typeof payload.dominantElement === "string") {
    const key = payload.dominantElement as ElementKey;
    if (ELEMENT_META[key]) return key;
  }
  if (row?.dominant_element && DB_TO_ELEMENT[row.dominant_element]) {
    return DB_TO_ELEMENT[row.dominant_element];
  }

  const petGender =
    pet.gender === "male" || pet.gender === "female" ? (pet.gender as Gender) : undefined;

  const { mapping } = computePetSajuBundle({
    petName: pet.name,
    species: pet.species as Species,
    petGender,
    birthDate: pet.birth_date,
    calendarType: "solar",
    birthTime: pet.birth_time,
    birthTimeUnknown: pet.birth_time_unknown,
    timezone: pet.birth_timezone || "Asia/Seoul",
    locale: "ko",
    privacyConsent: true,
  });

  return mapping.dominantElement as ElementKey;
}

function mbtiFromRow(row: SajuResultRow): PetMbtiPremiumInsight | null {
  const payload = row.storytelling_payload;
  if (!isRecord(payload)) return null;

  const mbtiType = payload.mbtiType;
  const axisPercents = payload.axisPercents;
  if (typeof mbtiType !== "string" || !/^[EI][SN][TF][JP]$/.test(mbtiType)) return null;
  if (!isRecord(axisPercents)) return null;

  const fields = ["personalityBlend", "sajuCombo", "butlerFit", "health", "dailyCare"] as const;
  for (const key of fields) {
    if (typeof payload[key] !== "string" || !payload[key].trim()) return null;
  }

  return {
    mbtiType: mbtiType as PetMbtiPremiumInsight["mbtiType"],
    axisPercents: axisPercents as PetMbtiPremiumInsight["axisPercents"],
    personalityBlend: payload.personalityBlend as string,
    sajuCombo: payload.sajuCombo as string,
    butlerFit: payload.butlerFit as string,
    health: payload.health as string,
    dailyCare: payload.dailyCare as string,
    narrativeSource:
      payload.narrativeSource === "llm" || payload.narrativeSource === "template"
        ? payload.narrativeSource
        : undefined,
  };
}

function zodiacFromRow(row: SajuResultRow, pet: Pet): ZodiacFortuneResponse | null {
  const payload = row.storytelling_payload;
  const basis = row.birth_basis;
  if (!isRecord(payload) || !isRecord(basis)) return null;
  if (!isRecord(payload.sign) || !isRecord(payload.personality) || !isRecord(payload.daily)) {
    return null;
  }

  const five = row.five_elements;
  const affinity =
    isRecord(five) && typeof five.affinity === "string"
      ? (five.affinity as ElementKey)
      : isRecord(payload.elementMeta) && typeof payload.elementMeta.key === "string"
        ? (payload.elementMeta.key as ElementKey)
        : null;

  if (!affinity || !ELEMENT_META[affinity]) return null;

  const locale: Locale = basis.locale === "en" ? "en" : "ko";
  const elementMeta = ELEMENT_META[affinity];

  return {
    petName: pet.name,
    species: pet.species as Species,
    locale,
    birthDate: typeof basis.birthDate === "string" ? basis.birthDate : pet.birth_date,
    fortuneDateKst:
      typeof basis.fortuneDateKst === "string" ? basis.fortuneDateKst : getTodayKstDateString(),
    sign: payload.sign as unknown as ZodiacFortuneResponse["sign"],
    elementAffinity: affinity,
    elementLabel: {
      hanja: elementMeta.hanja,
      hangul: elementMeta.hangul,
      romanized: elementMeta.romanized,
      meaning: elementMeta.meaning,
    },
    personality: payload.personality as ZodiacFortuneResponse["personality"],
    daily: payload.daily as ZodiacFortuneResponse["daily"],
    narrativeSource:
      payload.narrativeSource === "llm" || payload.narrativeSource === "template"
        ? payload.narrativeSource
        : undefined,
  };
}

function compatibilityFromRow(row: SajuResultRow, pet: Pet): CompatibilityResponse | null {
  const payload = row.storytelling_payload;
  const basis = row.birth_basis;
  const pillars = row.pillars;
  const five = row.five_elements;
  if (!isRecord(payload) || !isRecord(basis) || !isRecord(pillars) || !isRecord(five)) {
    return null;
  }

  if (typeof payload.bondScore !== "number") return null;
  if (typeof basis.ownerName !== "string" || !basis.ownerName.trim()) return null;
  if (basis.petGender !== "male" && basis.petGender !== "female") return null;
  if (basis.ownerGender !== "male" && basis.ownerGender !== "female") return null;
  if (typeof five.pet !== "string" || typeof five.owner !== "string" || typeof five.relation !== "string") {
    return null;
  }
  if (typeof pillars.petDay !== "string" || typeof pillars.ownerDay !== "string") return null;
  if (!Array.isArray(payload.details) || !Array.isArray(payload.careTips)) return null;
  if (!isRecord(payload.petElementLabel) || !isRecord(payload.ownerElementLabel)) return null;

  const locale: Locale = basis.locale === "en" ? "en" : "ko";

  return {
    petName: pet.name,
    ownerName: basis.ownerName.trim(),
    species: pet.species as Species,
    petGender: basis.petGender,
    ownerGender: basis.ownerGender,
    locale,
    bondScore: payload.bondScore,
    bondLabel: String(payload.bondLabel ?? ""),
    bondEmoji: String(payload.bondEmoji ?? ""),
    relation: five.relation as CompatibilityResponse["relation"],
    petElement: five.pet as ElementKey,
    ownerElement: five.owner as ElementKey,
    petElementLabel: payload.petElementLabel as CompatibilityResponse["petElementLabel"],
    ownerElementLabel: payload.ownerElementLabel as CompatibilityResponse["ownerElementLabel"],
    petDayPillar: pillars.petDay,
    ownerDayPillar: pillars.ownerDay,
    headline: row.title ?? String(payload.story ?? "").slice(0, 80),
    story: row.summary ?? String(payload.story ?? ""),
    details: payload.details as CompatibilityResponse["details"],
    careTips: payload.careTips.map(String),
    relationDescription: String(payload.relationDescription ?? ""),
    petElementNote: String(payload.petElementNote ?? ""),
    ownerElementNote: String(payload.ownerElementNote ?? ""),
    narrativeSource:
      payload.narrativeSource === "llm" || payload.narrativeSource === "template"
        ? payload.narrativeSource
        : undefined,
  };
}

export async function loadPetPremiumStoredSections(
  supabase: DbClient,
  ownerId: string,
  petId: string,
  ownedPet?: Pet | null
): Promise<StoredPremiumSections | null> {
  const pet = ownedPet ?? (await getPetOwnedByUser(supabase, ownerId, petId));
  if (!pet) return null;

  const { data: rows, error: rowsError } = await supabase
    .from("saju_results")
    .select("*")
    .eq("pet_id", petId)
    .eq("owner_id", ownerId)
    .eq("is_premium", true)
    .in("saju_type", [...PREMIUM_HUB_SAJU_TYPES])
    .order("created_at", { ascending: false });

  if (rowsError) {
    throw new Error(rowsError.message);
  }

  const latest = pickLatestByType((rows ?? []) as SajuResultRow[]);
  const mbti = latest.mbti ? mbtiFromRow(latest.mbti) : null;
  const zodiac = latest.zodiac ? zodiacFromRow(latest.zodiac, pet) : null;
  const compatibility = latest.compatibility ? compatibilityFromRow(latest.compatibility, pet) : null;

  const locale: Locale =
    zodiac?.locale ??
    (latest.mbti?.birth_basis && isRecord(latest.mbti.birth_basis) && latest.mbti.birth_basis.locale === "en"
      ? "en"
      : "ko");

  const completion = getPetPremiumSectionCompletionFromFlags({
    zodiacDone: Boolean(zodiac),
    compatibilityDone: Boolean(compatibility),
  });

  const resultIds: Partial<Record<PremiumHubSajuType, string>> = {};
  for (const type of PREMIUM_HUB_SAJU_TYPES) {
    if (latest[type]?.id) resultIds[type] = latest[type]!.id;
  }

  return {
    pet,
    locale,
    dominantElement: resolveDominantElement(latest.zodiac ?? latest.compatibility, pet),
    mbti,
    zodiac,
    compatibility,
    completion,
    resultIds,
  };
}

export function buildPetPremiumPdfPayloadFromStored(
  stored: StoredPremiumSections,
  localeOverride?: Locale
): PetPremiumPdfPayload | null {
  const { pet, zodiac, compatibility, dominantElement } = stored;
  if (!zodiac || !compatibility) return null;

  const locale: Locale =
    localeOverride === "en" ? "en" : localeOverride === "ko" ? "ko" : stored.locale;
  const isKo = locale === "ko";
  const species = pet.species as Species;

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    issuedDateKst: getTodayKstDateString(),
    locale,
    petName: pet.name,
    species,
    speciesLabel: SPECIES_LABEL[species][isKo ? "ko" : "en"],
    dominantElement,
    dominantElementLabel: formatDominantElementLabel(dominantElement, locale),
    mbti: null,
    compatibility,
    zodiac,
  };
}

export async function buildPetPremiumPdfPayloadFromDb(
  supabase: DbClient,
  ownerId: string,
  petId: string,
  localeOverride?: Locale,
  ownedPet?: Pet | null
): Promise<{ payload: PetPremiumPdfPayload } | { error: "pet_not_found" | "sections_incomplete" }> {
  const stored = await loadPetPremiumStoredSections(supabase, ownerId, petId, ownedPet);
  if (!stored) return { error: "pet_not_found" };

  const payload = buildPetPremiumPdfPayloadFromStored(stored, localeOverride);
  if (!payload) return { error: "sections_incomplete" };

  return { payload };
}
