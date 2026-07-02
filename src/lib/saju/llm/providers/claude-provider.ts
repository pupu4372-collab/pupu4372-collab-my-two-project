import Anthropic from "@anthropic-ai/sdk";
import { isLlmDebugEnabled, llmDebugLog } from "../debug-log";
import { parseJsonObject } from "../json-utils";
import type { LlmPromptPair } from "../types";

const DEFAULT_MODEL = "claude-sonnet-4-20250514";

export function isClaudeEnabled(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}

export async function callClaudeJson(
  prompts: LlmPromptPair,
  maxTokens = 3000
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
  });

  const message = await client.messages.create({
    model,
    max_tokens: maxTokens,
    temperature: 0.7,
    system: prompts.system,
    messages: [{ role: "user", content: prompts.user }],
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
  maxTokens = 3000
): Promise<unknown> {
  const { text, stopReason } = await callClaudeJson(prompts, maxTokens);
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
