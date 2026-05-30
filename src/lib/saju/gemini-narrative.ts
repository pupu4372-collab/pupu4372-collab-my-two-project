import type { SajuBasicRequest, SajuBasicResponse } from "./types";

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_MODEL = "gemini-2.5-flash";

interface GeminiNarrative {
  headline: string;
  story: string;
  traits: string[];
}

interface GeminiPayload {
  headline: string;
  storyParagraphs: string[];
  traits: string[];
}

interface GeminiApiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

function buildPrompt(request: SajuBasicRequest, result: SajuBasicResponse) {
  const localeInstruction =
    request.locale === "ko"
      ? "한국어로 작성하세요. 따뜻하고 부드러운 반려동물 서비스 톤을 사용하세요."
      : "Write in English with a warm, gentle pet service tone.";

  const hourPillar = result.pillars.hour
    ? `${result.pillars.hour.pillar} (${result.pillars.hour.stemLabel}, ${result.pillars.hour.branchLabel})`
    : "unknown";

  return [
    "You are writing an entertainment-style pet saju interpretation.",
    localeInstruction,
    "Use only the calculated saju facts below. Do not claim medical, financial, or guaranteed future outcomes.",
    'Return JSON with keys: headline (string), storyParagraphs (array of 5-7 strings), traits (array of 5 short strings).',
    "Each storyParagraphs item must be 2-3 sentences. Cover personality, emotions, play/social style, care routine, cautions, and a lucky daily ritual.",
    "Avoid vague filler; tie content to the pillars or element mix.",
    "",
    "Calculated facts:",
    `Pet name: ${request.petName}`,
    `Species: ${request.species}`,
    `Gender: ${request.petGender ?? "unknown"}`,
    `Birth date: ${request.birthDate}`,
    `Birth time: ${request.birthTimeUnknown ? "unknown" : request.birthTime}`,
    `Timezone: ${request.timezone}`,
    `Year pillar: ${result.pillars.year.pillar} (${result.pillars.year.stemLabel}, ${result.pillars.year.branchLabel})`,
    `Month pillar: ${result.pillars.month.pillar} (${result.pillars.month.stemLabel}, ${result.pillars.month.branchLabel})`,
    `Day pillar: ${result.pillars.day.pillar} (${result.pillars.day.stemLabel}, ${result.pillars.day.branchLabel})`,
    `Hour pillar: ${hourPillar}`,
    `Dominant element: ${result.dominantElement}`,
    `Element mix: ${result.elements.map((el) => `${el.key}:${el.count}`).join(", ")}`,
  ].join("\n");
}

function extractJson(text: string) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)?.[1];
  if (fenced) return fenced;

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);

  return trimmed;
}

function isValidPayload(value: unknown): value is GeminiPayload {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<GeminiPayload>;
  return (
    typeof candidate.headline === "string" &&
    Array.isArray(candidate.storyParagraphs) &&
    candidate.storyParagraphs.length >= 3 &&
    candidate.storyParagraphs.every((p) => typeof p === "string" && p.trim().length > 0) &&
    Array.isArray(candidate.traits) &&
    candidate.traits.length >= 3 &&
    candidate.traits.every((trait) => typeof trait === "string")
  );
}

function toNarrative(payload: GeminiPayload): GeminiNarrative {
  return {
    headline: payload.headline.trim(),
    story: payload.storyParagraphs
      .map((p) => p.trim())
      .filter(Boolean)
      .join("\n\n"),
    traits: payload.traits.slice(0, 5).map((trait) => trait.trim()).filter(Boolean),
  };
}

export async function generateGeminiNarrative(
  request: SajuBasicRequest,
  result: SajuBasicResponse
): Promise<GeminiNarrative | null> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;

  const model = process.env.GEMINI_MODEL ?? DEFAULT_MODEL;
  const prompt = buildPrompt(request, result);

  const response = await fetch(`${GEMINI_ENDPOINT}/${model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.85,
        topP: 0.9,
        maxOutputTokens: 2800,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            headline: { type: "STRING" },
            storyParagraphs: {
              type: "ARRAY",
              items: { type: "STRING" },
            },
            traits: {
              type: "ARRAY",
              items: { type: "STRING" },
            },
          },
          required: ["headline", "storyParagraphs", "traits"],
        },
      },
    }),
  });

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
    parsed = JSON.parse(extractJson(text)) as unknown;
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : "Gemini JSON parse failed.");
  }

  if (!isValidPayload(parsed)) return null;
  return toNarrative(parsed);
}
