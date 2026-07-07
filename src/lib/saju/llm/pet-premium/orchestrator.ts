import type { PetMbtiResult } from "@/lib/pet/mbti-inference";
import type { CompatibilityResponse } from "@/lib/saju/compatibility/engine";
import { computePetSajuBundle } from "@/lib/saju/engine";
import type { SajuBasicRequest } from "@/lib/saju/types";
import type { ZodiacFortuneResponse } from "@/lib/saju/zodiac/engine";
import {
  callClaudeJsonParsed,
  isClaudeEnabled,
} from "../providers/claude-provider";
import {
  callOpenAiJsonParsed,
  isOpenAiEnabled,
} from "../providers/openai-provider";
import { resolveProviderModel } from "../cache-keys";
import type { LlmProviderName } from "../types";
import {
  getCachedPetPremiumResult,
  getPetPremiumInFlight,
  setCachedPetPremiumResult,
  setPetPremiumInFlight,
  clearPetPremiumInFlight,
} from "./cache";
import { buildPetPremiumCacheKey, zodiacDailyCacheFacet, zodiacPersonalityCacheFacet } from "./cache-keys";
import { buildPetMbtiPremiumPrompts } from "./prompts/mbti-prompt";
import { buildPetCompatibilityPremiumPrompts } from "./prompts/compatibility-prompt";
import { buildPetZodiacPremiumPrompts, buildZodiacMappingSummary } from "./prompts/zodiac-prompt";
import {
  applyCompatibilityPremiumLlm,
  applyMbtiPremiumLlm,
  applyZodiacDailyLlm,
  applyZodiacPersonalityLlm,
  templateMbtiPremiumInsight,
} from "./apply";
import {
  isPetCompatibilityLlmJson,
  isPetMbtiPremiumLlmJson,
  isPetZodiacDailyLlmJson,
  isPetZodiacPersonalityLlmJson,
  type PetMbtiPremiumInsight,
  type PetPremiumCachePayload,
} from "./types";

export function isPetPremiumLlmEnabled(): boolean {
  return isClaudeEnabled() || isOpenAiEnabled();
}

async function callProvider(provider: LlmProviderName, prompts: { system: string; user: string }) {
  if (provider === "claude") return callClaudeJsonParsed(prompts, 4096);
  return callOpenAiJsonParsed(prompts, 4096);
}

async function withPetPremiumCache<T>(options: {
  feature: PetPremiumCachePayload["feature"];
  locale: "ko" | "en";
  facet: Record<string, unknown>;
  validate: (data: unknown) => data is T;
  buildPrompts: (provider: LlmProviderName) => { system: string; user: string };
  dailyExpiresAt?: string | null;
}): Promise<{ data: T; provider: string } | null> {
  if (!isPetPremiumLlmEnabled()) return null;

  const providers: LlmProviderName[] = [];
  if (isClaudeEnabled()) providers.push("claude");
  if (isOpenAiEnabled()) providers.push("openai");
  if (providers.length === 0) return null;

  const provider = providers[0]!;
  const model = resolveProviderModel(provider);
  const cacheKey = buildPetPremiumCacheKey({
    feature: options.feature,
    locale: options.locale,
    provider,
    model,
    facet: options.facet,
  });

  const cached = await getCachedPetPremiumResult<T>(cacheKey, options.validate);
  if (cached) return { data: cached.data, provider: cached.provider };

  const inFlight = getPetPremiumInFlight<T>(cacheKey);
  if (inFlight) return inFlight;

  const promise = (async () => {
    let lastError: unknown;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const parsed = await callProvider(provider, options.buildPrompts(provider));
        if (!options.validate(parsed)) {
          throw new Error(`Pet premium JSON schema failed (${options.feature}, attempt ${attempt}).`);
        }
        await setCachedPetPremiumResult({
          cacheKey,
          locale: options.locale,
          provider,
          model,
          feature: options.feature,
          data: parsed as PetPremiumCachePayload["data"],
          expiresAt: options.dailyExpiresAt ?? null,
        });
        return { data: parsed, provider };
      } catch (error) {
        lastError = error;
      }
    }
    console.error(`[pet_premium_${options.feature}_llm_fallback]`, lastError);
    return null;
  })().finally(() => clearPetPremiumInFlight(cacheKey));

  setPetPremiumInFlight(cacheKey, promise);
  return promise;
}

function petSajuRequestFromContext(input: {
  petName: string;
  species: SajuBasicRequest["species"];
  petGender?: SajuBasicRequest["petGender"];
  birthDate: string;
  birthTime: string | null;
  birthTimeUnknown: boolean;
  timezone: string;
  locale: "ko" | "en";
}): SajuBasicRequest {
  return {
    petName: input.petName,
    species: input.species,
    petGender: input.petGender,
    birthDate: input.birthDate,
    birthTime: input.birthTime,
    birthTimeUnknown: input.birthTimeUnknown,
    timezone: input.timezone,
    locale: input.locale,
    privacyConsent: true,
  };
}

export async function generatePetMbtiPremiumInsight(input: {
  petName: string;
  species: SajuBasicRequest["species"];
  petGender?: SajuBasicRequest["petGender"];
  birthDate: string;
  birthTime: string | null;
  birthTimeUnknown: boolean;
  timezone: string;
  locale: "ko" | "en";
  mbti: PetMbtiResult;
  petId?: string | null;
}): Promise<PetMbtiPremiumInsight> {
  const template = templateMbtiPremiumInsight(input.mbti, input.petName, input.locale);
  const { mapping } = computePetSajuBundle(
    petSajuRequestFromContext({
      petName: input.petName,
      species: input.species,
      petGender: input.petGender,
      birthDate: input.birthDate,
      birthTime: input.birthTime,
      birthTimeUnknown: input.birthTimeUnknown,
      timezone: input.timezone,
      locale: input.locale,
    })
  );

  const llm = await withPetPremiumCache({
    feature: "mbti",
    locale: input.locale,
    facet: {
      petId: input.petId ?? null,
      petName: input.petName,
      mbtiType: input.mbti.type,
      scores: input.mbti.scores,
      birthDate: input.birthDate,
    },
    validate: isPetMbtiPremiumLlmJson,
    buildPrompts: () =>
      buildPetMbtiPremiumPrompts({
        locale: input.locale,
        petName: input.petName,
        species: input.species,
        mbti: input.mbti,
        mapping,
      }),
  });

  if (!llm) return template;
  return applyMbtiPremiumLlm(llm.data, input.locale);
}

export async function enrichCompatibilityWithPremiumLlm(
  result: CompatibilityResponse,
  input: {
    petBirthDate: string;
    petBirthTime: string | null;
    petBirthTimeUnknown: boolean;
    ownerBirthDate: string;
    ownerBirthTime: string | null;
    ownerBirthTimeUnknown: boolean;
    timezone: string;
    petId?: string | null;
  }
): Promise<CompatibilityResponse> {
  const llm = await withPetPremiumCache({
    feature: "compatibility",
    locale: result.locale,
    facet: {
      petId: input.petId ?? null,
      petName: result.petName,
      ownerName: result.ownerName,
      bondScore: result.bondScore,
      relation: result.relation,
      petBirthDate: input.petBirthDate,
      ownerBirthDate: input.ownerBirthDate,
    },
    validate: isPetCompatibilityLlmJson,
    buildPrompts: () =>
      buildPetCompatibilityPremiumPrompts({
        locale: result.locale,
        result,
      }),
  });

  if (!llm) return { ...result, narrativeSource: "template" };
  return applyCompatibilityPremiumLlm(result, llm.data);
}

export async function enrichZodiacWithPremiumLlm(
  fortune: ZodiacFortuneResponse,
  input: {
    birthDate: string;
    birthTime?: string | null;
    birthTimeUnknown?: boolean;
    timezone?: string;
    petId?: string | null;
  }
): Promise<ZodiacFortuneResponse> {
  const sajuReq = petSajuRequestFromContext({
    petName: fortune.petName,
    species: fortune.species,
    birthDate: input.birthDate,
    birthTime: input.birthTime ?? null,
    birthTimeUnknown: input.birthTimeUnknown ?? true,
    timezone: input.timezone ?? "Asia/Seoul",
    locale: fortune.locale,
  });
  const { mapping } = computePetSajuBundle(sajuReq);
  const mappingSummary = buildZodiacMappingSummary(mapping, fortune.locale);

  const personalityLlm = await withPetPremiumCache({
    feature: "zodiac_personality",
    locale: fortune.locale,
    facet: zodiacPersonalityCacheFacet({
      petId: input.petId,
      petName: fortune.petName,
      species: fortune.species,
      birthDate: input.birthDate,
      signKey: fortune.sign.key,
    }),
    validate: isPetZodiacPersonalityLlmJson,
    buildPrompts: () =>
      buildPetZodiacPremiumPrompts({
        locale: fortune.locale,
        fortune,
        mappingSummary,
        part: "personality",
      }),
  });

  let enriched = fortune;
  if (personalityLlm) {
    enriched = applyZodiacPersonalityLlm(enriched, personalityLlm.data);
    enriched.narrativeSource = "llm";
  }

  const dailyEnd = new Date(`${fortune.fortuneDateKst}T23:59:59+09:00`).toISOString();

  const dailyLlm = await withPetPremiumCache({
    feature: "zodiac_daily",
    locale: fortune.locale,
    facet: zodiacDailyCacheFacet({
      petId: input.petId,
      petName: fortune.petName,
      species: fortune.species,
      birthDate: input.birthDate,
      fortuneDateKst: fortune.fortuneDateKst,
    }),
    validate: isPetZodiacDailyLlmJson,
    buildPrompts: () =>
      buildPetZodiacPremiumPrompts({
        locale: fortune.locale,
        fortune,
        mappingSummary,
        part: "daily",
      }),
    dailyExpiresAt: dailyEnd,
  });

  if (dailyLlm) {
    enriched = applyZodiacDailyLlm(enriched, dailyLlm.data.dailyToday);
    enriched.narrativeSource = "llm";
  } else if (!personalityLlm) {
    enriched = { ...enriched, narrativeSource: "template" };
  }

  return enriched;
}
