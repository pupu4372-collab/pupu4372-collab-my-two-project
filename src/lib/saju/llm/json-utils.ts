export function extractJsonObject(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)?.[1];
  if (fenced) return fenced.trim();

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);

  return trimmed;
}

/** Best-effort repair for common LLM JSON mistakes (trailing commas). */
export function repairLooseJson(text: string): string {
  return extractJsonObject(text).replace(/,\s*([}\]])/g, "$1");
}

export function parseJsonObject(text: string): unknown {
  const extracted = extractJsonObject(text);
  try {
    return JSON.parse(extracted) as unknown;
  } catch {
    return JSON.parse(repairLooseJson(text)) as unknown;
  }
}
