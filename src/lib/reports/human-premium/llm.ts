import type { Locale } from "@/lib/saju/types";
import type { HumanPremiumFactsBlock } from "./facts";
import {
  buildHumanPremiumSectionUserPrompt,
  buildHumanPremiumSystemPrompt,
  type HumanPremiumLlmSectionKey,
} from "./prompts";

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_MODEL = "gemini-2.5-flash";

interface GeminiApiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
}

interface LlmBodyPayload {
  body: string;
}

export function isHumanPremiumLlmEnabled(): boolean {
  if (process.env.HUMAN_PREMIUM_LLM === "0") return false;
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

function extractJson(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)?.[1];
  if (fenced) return fenced;

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);
  return trimmed;
}

function isValidBodyPayload(
  value: unknown,
  minChars: number
): value is LlmBodyPayload {
  if (!value || typeof value !== "object") return false;
  const body = (value as Partial<LlmBodyPayload>).body;
  return typeof body === "string" && body.trim().length >= minChars;
}

export async function generateHumanPremiumSectionBody(options: {
  sectionKey: HumanPremiumLlmSectionKey;
  facts: HumanPremiumFactsBlock;
  locale: Locale;
  targetChars: number;
  minChars: number;
  month?: number;
}): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;

  const model = process.env.GEMINI_MODEL ?? DEFAULT_MODEL;
  const systemPrompt = buildHumanPremiumSystemPrompt(options.locale);
  const userPrompt = buildHumanPremiumSectionUserPrompt(
    options.sectionKey,
    options.facts,
    options.locale,
    options.targetChars,
    options.month
  );

  const response = await fetch(
    `${GEMINI_ENDPOINT}/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0.6,
          topP: 0.9,
          maxOutputTokens: 4096,
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              body: { type: "STRING" },
            },
            required: ["body"],
          },
        },
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(
      `Gemini request failed: ${response.status}${errorBody ? ` — ${errorBody.slice(0, 200)}` : ""}`
    );
  }

  const apiPayload = (await response.json()) as GeminiApiResponse;
  const text = apiPayload.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();
  if (!text) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(extractJson(text));
  } catch (err) {
    const salvaged = salvageBodyFromText(text);
    if (salvaged && salvaged.length >= options.minChars) return salvaged;
    throw new Error(
      err instanceof Error ? err.message : "Gemini JSON parse failed."
    );
  }

  if (!isValidBodyPayload(parsed, options.minChars)) {
    const salvaged = salvageBodyFromText(text);
    if (salvaged && salvaged.length >= options.minChars) return salvaged;
    return null;
  }
  return parsed.body.trim();
}

function salvageBodyFromText(text: string): string | null {
  const match = text.match(/"body"\s*:\s*"((?:\\.|[^"\\])*)"/);
  const raw =
    match?.[1] ??
    text
      .match(/"body"\s*:\s*"([\s\S]*)$/)?.[1]
      ?.replace(/\s*```\s*$/g, "")
      .replace(/\s*"}\s*$/g, "")
      .replace(/\s*}\s*$/g, "");
  if (!raw) return null;
  try {
    return JSON.parse(`"${raw}"`).trim();
  } catch {
    return raw.replace(/\\n/g, "\n").replace(/\\"/g, '"').trim() || null;
  }
}
