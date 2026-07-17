import Anthropic from "@anthropic-ai/sdk";
import { isLlmDebugEnabled, llmDebugLog } from "../debug-log";
import { parseJsonObject } from "../json-utils";
import type { LlmPromptPair } from "../types";

const DEFAULT_MODEL = "claude-sonnet-4-20250514";

export function isClaudeEnabled(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}

export type CallClaudeJsonOptions = {
  /** Slot / call kind for LLM_USAGE logs (e.g. saju-structure). */
  slot?: string;
};

function buildClaudeUserContent(
  prompts: LlmPromptPair
): string | Anthropic.TextBlockParam[] {
  const prefix = prompts.userCachePrefix;
  const variable = prompts.userVariable;
  if (prefix != null && variable != null) {
    // Same bytes as `${prefix}\n\n${variable}` === prompts.user
    return [
      {
        type: "text",
        text: prefix,
        cache_control: { type: "ephemeral" },
      },
      {
        type: "text",
        text: `\n\n${variable}`,
      },
    ];
  }
  return prompts.user;
}

export async function callClaudeJson(
  prompts: LlmPromptPair,
  maxTokens = 3000,
  options?: CallClaudeJsonOptions
): Promise<{ text: string; stopReason: string | null }> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured.");
  }

  const model = process.env.ANTHROPIC_MODEL?.trim() || DEFAULT_MODEL;
  const client = new Anthropic({ apiKey });

  llmDebugLog("[CLAUDE_CALL_ATTEMPT]", {
    model,
    promptLength: prompts.system.length + prompts.user.length,
    maxTokens,
    slot: options?.slot ?? null,
    promptCacheSplit: Boolean(
      prompts.userCachePrefix != null && prompts.userVariable != null
    ),
  });

  // System + user common prefix both marked ephemeral so the cached span
  // clears Sonnet's ~1024-token minimum more reliably than system alone.
  const message = await client.messages.create({
    model,
    max_tokens: maxTokens,
    temperature: 0.7,
    system: [
      {
        type: "text",
        text: prompts.system,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: buildClaudeUserContent(prompts) }],
  });

  const usage = message.usage as {
    input_tokens?: number;
    output_tokens?: number;
    cache_creation_input_tokens?: number;
    cache_read_input_tokens?: number;
  };

  console.log("LLM_USAGE", {
    slot: options?.slot ?? null,
    cache_creation_input_tokens: usage.cache_creation_input_tokens ?? 0,
    cache_read_input_tokens: usage.cache_read_input_tokens ?? 0,
    input_tokens: usage.input_tokens ?? 0,
    output_tokens: usage.output_tokens ?? 0,
  });

  const text = message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();

  llmDebugLog("[CLAUDE_CALL_OK]", {
    model,
    responseLength: text.length,
    stopReason: message.stop_reason,
  });

  if (!text) {
    throw new Error("Claude returned empty content.");
  }

  return { text, stopReason: message.stop_reason ?? null };
}

export async function callClaudeJsonParsed(
  prompts: LlmPromptPair,
  maxTokens = 3000,
  options?: CallClaudeJsonOptions
): Promise<unknown> {
  const { text, stopReason } = await callClaudeJson(prompts, maxTokens, options);
  try {
    return parseJsonObject(text);
  } catch (error) {
    console.error("[CLAUDE_JSON_PARSE_FAIL]", {
      stopReason,
      message: error instanceof Error ? error.message : String(error),
      ...(isLlmDebugEnabled() ? { rawTail: text.slice(-100) } : {}),
    });
    throw new Error(
      error instanceof Error ? `Claude JSON parse failed: ${error.message}` : "Claude JSON parse failed."
    );
  }
}
