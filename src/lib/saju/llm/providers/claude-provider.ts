import Anthropic from "@anthropic-ai/sdk";
import { parseJsonObject } from "../json-utils";
import type { LlmPromptPair } from "../types";

const DEFAULT_MODEL = "claude-sonnet-4-20250514";

export function isClaudeEnabled(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}

export async function callClaudeJson(prompts: LlmPromptPair): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured.");
  }

  const model = process.env.ANTHROPIC_MODEL?.trim() || DEFAULT_MODEL;
  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model,
    max_tokens: 1800,
    temperature: 0.7,
    system: prompts.system,
    messages: [{ role: "user", content: prompts.user }],
  });

  const text = message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();

  if (!text) {
    throw new Error("Claude returned empty content.");
  }

  return text;
}

export async function callClaudeJsonParsed(prompts: LlmPromptPair): Promise<unknown> {
  const text = await callClaudeJson(prompts);
  try {
    return parseJsonObject(text);
  } catch (error) {
    throw new Error(
      error instanceof Error ? `Claude JSON parse failed: ${error.message}` : "Claude JSON parse failed."
    );
  }
}
