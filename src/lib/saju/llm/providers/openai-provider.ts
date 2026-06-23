import OpenAI from "openai";
import { parseJsonObject } from "../json-utils";
import type { LlmPromptPair } from "../types";

const DEFAULT_MODEL = "gpt-4o-mini";

export function isOpenAiEnabled(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export async function callOpenAiJson(
  prompts: LlmPromptPair,
  maxTokens = 1800
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const model = process.env.OPENAI_MODEL?.trim() || DEFAULT_MODEL;
  const client = new OpenAI({ apiKey });

  const response = await client.chat.completions.create({
    model,
    temperature: 0.7,
    max_tokens: maxTokens,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: prompts.system },
      { role: "user", content: prompts.user },
    ],
  });

  const text = response.choices[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("OpenAI returned empty content.");
  }

  return text;
}

export async function callOpenAiJsonParsed(
  prompts: LlmPromptPair,
  maxTokens = 1800
): Promise<unknown> {
  const text = await callOpenAiJson(prompts, maxTokens);
  try {
    return parseJsonObject(text);
  } catch (error) {
    throw new Error(
      error instanceof Error ? `OpenAI JSON parse failed: ${error.message}` : "OpenAI JSON parse failed."
    );
  }
}
