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
  isHumanInterpretationJson,
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
      if (!isHumanInterpretationJson(parsed)) {
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
      return await interpretWithProvider(provider, input, prompts);
    } catch (error) {
      lastError = error;
    }
  }

  throw new SajuInterpretationError("All LLM providers failed.", lastError);
}
