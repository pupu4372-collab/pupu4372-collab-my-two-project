import { hanjaCharToHangul } from "@/lib/saju/elements";

const CJK_HANJA_RE = /[\u4E00-\u9FFF]/g;

function collectHanjaChars(text: string): string[] {
  const matches = text.match(CJK_HANJA_RE);
  if (!matches) return [];
  return [...new Set(matches)];
}

/**
 * Replace known stem/branch/element hanja with hangul labels.
 * Unmapped hanja are kept as-is; callers log via sanitizeLlmSlotText().
 */
export function replaceKnownHanjaWithHangul(text: string): {
  text: string;
  detected: string;
  unmapped: string;
} {
  const detectedChars = collectHanjaChars(text);
  if (!detectedChars.length) {
    return { text, detected: "", unmapped: "" };
  }

  const unmappedSet = new Set<string>();
  const replaced = text.replace(CJK_HANJA_RE, (char) => {
    const hangul = hanjaCharToHangul(char);
    if (hangul) return hangul;
    unmappedSet.add(char);
    return char;
  });

  return {
    text: replaced,
    detected: detectedChars.join(""),
    unmapped: [...unmappedSet].join(""),
  };
}

/** Post-process a parsed report slot string — hanja leak detection and hangul substitution. */
export function sanitizeLlmSlotText(slotName: string, text: string): string {
  const { text: sanitized, detected, unmapped } = replaceKnownHanjaWithHangul(text);
  if (!detected) return text;

  console.error("[LLM_SLOT_HANJA_DETECTED]", {
    slot: slotName,
    detected,
    unmapped: unmapped || null,
  });

  if (unmapped) {
    console.error("[LLM_SLOT_HANJA_UNMAPPED]", {
      slot: slotName,
      chars: unmapped,
    });
  }

  return sanitized;
}
