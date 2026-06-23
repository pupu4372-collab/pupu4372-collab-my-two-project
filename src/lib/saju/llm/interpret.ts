import { buildHumanInterpretationPrompts } from "./prompts/human-prompt";
import { buildPetInterpretationPrompts } from "./prompts/pet-prompt";
import {
  callClaudeJsonParsed,
  isClaudeEnabled,
} from "./providers/claude-provider";
import {
  callOpenAiJsonParsed,
  isOpenAiEnabled,
} from "./providers/openai-provider";
import {
  buildInterpretCacheKey,
  resolveProviderModel,
} from "./cache-keys";
import {
  clearInterpretInFlight,
  getCachedInterpretResult,
  getInterpretInFlight,
  setCachedInterpretResult,
  setInterpretInFlight,
} from "./cache";
import {
  isLegacyHumanInterpretationJson,
  isPetInterpretationJson,
  SajuInterpretationError,
  type InterpretSajuInput,
  type InterpretSajuResult,
  type LlmPromptPair,
  type LlmProviderName,
} from "./types";

export function isSajuInterpretLlmEnabled(): boolean {
  return isClaudeEnabled() || isOpenAiEnabled();
}

function buildPrompts(input: InterpretSajuInput): LlmPromptPair {
  if (input.tier === "pet") {
    return buildPetInterpretationPrompts({
      mapping: input.mapping,
      locale: input.locale,
      petName: input.petName,
    });
  }
  return buildHumanInterpretationPrompts({
    mapping: input.mapping,
    locale: input.locale,
    subjectName: input.subjectName,
  });
}

async function callProvider(provider: LlmProviderName, prompts: LlmPromptPair): Promise<unknown> {
  if (provider === "claude") {
    return callClaudeJsonParsed(prompts);
  }
  return callOpenAiJsonParsed(prompts);
}

async function interpretWithProvider(
  provider: LlmProviderName,
  input: InterpretSajuInput,
  prompts: LlmPromptPair
): Promise<InterpretSajuResult> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const parsed = await callProvider(provider, prompts);
      if (input.tier === "pet") {
      if (!isPetInterpretationJson(parsed)) {
        throw new SajuInterpretationError(`Pet JSON schema validation failed (attempt ${attempt}).`);
      }
      return { tier: "pet", provider, data: parsed };
    }
    if (!isLegacyHumanInterpretationJson(parsed)) {
      throw new SajuInterpretationError(`Human JSON schema validation failed (attempt ${attempt}).`);
    }
    return { tier: "human", provider, data: parsed };
    } catch (error) {
      lastError = error;
    }
  }

  throw new SajuInterpretationError(
    `${provider} interpretation failed after retry.`,
    lastError
  );
}

async function interpretWithProviderCached(
  provider: LlmProviderName,
  input: InterpretSajuInput,
  prompts: LlmPromptPair
): Promise<InterpretSajuResult> {
  const model = resolveProviderModel(provider);
  const cacheKey = buildInterpretCacheKey(input, provider, model);
  const cacheKind = input.tier === "pet" ? "interpret_pet" : "interpret_human";

  const cached = await getCachedInterpretResult(cacheKey);
  if (cached) return cached;

  const inFlight = getInterpretInFlight(cacheKey);
  if (inFlight) return inFlight;

  const promise = interpretWithProvider(provider, input, prompts)
    .then(async (result) => {
      await setCachedInterpretResult(cacheKey, cacheKind, input.locale, provider, model, result);
      return result;
    })
    .finally(() => {
      clearInterpretInFlight(cacheKey);
    });

  setInterpretInFlight(cacheKey, promise);
  return promise;
}

export async function interpretSaju(input: InterpretSajuInput): Promise<InterpretSajuResult> {
  if (!isSajuInterpretLlmEnabled()) {
    throw new SajuInterpretationError("No LLM API keys configured (ANTHROPIC_API_KEY or OPENAI_API_KEY).");
  }

  const prompts = buildPrompts(input);
  const providers: LlmProviderName[] = [];

  if (isClaudeEnabled()) providers.push("claude");
  if (isOpenAiEnabled()) providers.push("openai");

  let lastError: unknown;

  for (const provider of providers) {
    try {
      return await interpretWithProviderCached(provider, input, prompts);
    } catch (error) {
      lastError = error;
    }
  }

  throw new SajuInterpretationError("All LLM providers failed.", lastError);
}
