import {
  formatGanziLabel,
  formatSingleHanjaEn,
  hanjaCharToHangul,
  isGanziPair,
} from "@/lib/saju/elements";
import type { Locale } from "@/lib/saju/types";

const CJK_HANJA_RE = /[\u4E00-\u9FFF]/g;
const GANZI_PAIR_RE = /[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]/g;

/** Cover / TOC bullets that are ziwei section titles (never show on saju reports). */
const ZIWEI_BULLET_TITLES = new Set([
  "자미두수 명반 개요",
  "12궁 배치",
  "주성 해석 가이드",
  "Ziwei chart overview",
  "Twelve palaces",
  "Major star reading guide",
]);

/** Optional server ALS getter — registered only from slot-output-sanitize-server.ts. */
let hanjaSanitizeLocaleStore: (() => Locale | undefined) | null = null;

/** Called once from the server-only ALS module; keep this file client-safe. */
export function registerHanjaSanitizeLocaleStore(
  getter: () => Locale | undefined
): void {
  hanjaSanitizeLocaleStore = getter;
}

function resolveSanitizeLocale(override?: Locale): Locale {
  return override ?? hanjaSanitizeLocaleStore?.() ?? "ko";
}

function collectHanjaChars(text: string): string[] {
  const matches = text.match(CJK_HANJA_RE);
  if (!matches) return [];
  return [...new Set(matches)];
}

/** Hangul already paired with stem/branch/element hanja — do not unwrap to 목(목). */
const PRESERVED_HANGUL_HANJA_PAREN_RE =
  /[가-힣]\([木火土金水甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥]\)/g;

/**
 * Replace known stem/branch/element hanja with hangul labels (KO path).
 * Preserves already-correct `한글(漢字)` pairs (e.g. 목(木), 병(丙)).
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

  const preserved: string[] = [];
  const masked = text.replace(PRESERVED_HANGUL_HANJA_PAREN_RE, (match) => {
    const token = `\u0000H${preserved.length}\u0000`;
    preserved.push(match);
    return token;
  });

  const unmappedSet = new Set<string>();
  const replaced = masked.replace(CJK_HANJA_RE, (char) => {
    const hangul = hanjaCharToHangul(char);
    if (hangul) return hangul;
    unmappedSet.add(char);
    return char;
  });

  const restored = replaced.replace(/\u0000H(\d+)\u0000/g, (_, index: string) => {
    return preserved[Number(index)] ?? "";
  });

  return {
    text: restored,
    detected: detectedChars.join(""),
    unmapped: [...unmappedSet].join(""),
  };
}

/**
 * EN path: ganzi pairs → "Jeongmyo (Fire-Rabbit)"; lone stem/branch/element → romanized/meaning.
 * Manse table UI is not passed through this sanitizer.
 */
export function replaceKnownHanjaWithEnLabel(text: string): {
  text: string;
  detected: string;
  unmapped: string;
} {
  const detectedChars = collectHanjaChars(text);
  if (!detectedChars.length) {
    return { text, detected: "", unmapped: "" };
  }

  let next = text.replace(GANZI_PAIR_RE, (pair) => {
    const stem = pair.charAt(0);
    const branch = pair.charAt(1);
    if (!isGanziPair(stem, branch)) return pair;
    return formatGanziLabel(pair, "en");
  });

  const unmappedSet = new Set<string>();
  next = next.replace(CJK_HANJA_RE, (char) => {
    const en = formatSingleHanjaEn(char);
    if (en) return en;
    unmappedSet.add(char);
    return char;
  });

  return {
    text: next,
    detected: detectedChars.join(""),
    unmapped: [...unmappedSet].join(""),
  };
}

/**
 * Strip internal outline labels like `[오행_우세]:` / `[명리_진단]` / `【마스터 내러티브】`.
 * Keeps paragraph breaks when a label sat on its own line.
 */
export function stripInternalBracketLabels(text: string): string {
  return text
    .replace(/^[ \t]*\[[^\]]+\]\s*:?[ \t]*/gm, "")
    .replace(/[ \t]*\[[^\]]+\]\s*:?[ \t]*/g, " ")
    .replace(/^[ \t]*【[^】]+】\s*/gm, "")
    .replace(/[ \t]*【[^】]+】\s*/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Remove markdown bold/headers/backticks; keep inner text. */
export function stripMarkdownArtifacts(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * When UI/PDF already prints a label (잡는 법 / 대비책), strip the same
 * prefix from the LLM string so it is not duplicated.
 */
export function stripLeadingUiLabel(text: string, labels: readonly string[]): string {
  let next = text.trim();
  for (const label of labels) {
    const escaped = escapeRegExp(label);
    const re = new RegExp(`^(?:${escaped})\\s*[:：·.•\\-–—]?\\s*`, "i");
    next = next.replace(re, "").trim();
  }
  return next;
}

export const TIP_UI_LABELS = ["잡는 법", "How to catch"] as const;
export const COUNTERMEASURE_UI_LABELS = ["대비책", "Countermeasure", "주의", "Caution"] as const;

export function normalizeOpportunityTip(tip: string): string {
  return stripLeadingUiLabel(tip, TIP_UI_LABELS);
}

export function normalizeRiskCountermeasure(text: string): string {
  return stripLeadingUiLabel(text, COUNTERMEASURE_UI_LABELS);
}

/** Trim wrapping quotes before the renderer adds its own. */
export function normalizeDecisionScriptQuotes(script: string): string {
  return script
    .trim()
    .replace(/^[“”"'\u2018\u2019]+/, "")
    .replace(/[“”"'\u2018\u2019]+$/, "")
    .trim();
}

/** Drop ziwei section-title bullets from stored cover payloads (legacy reports). */
export function filterZiweiCoverBullets(bullets: string[] | undefined): string[] {
  if (!bullets?.length) return [];
  return bullets.filter((item) => {
    const trimmed = item.trim();
    if (ZIWEI_BULLET_TITLES.has(trimmed)) return false;
    if (/자미두수|Ziwei/i.test(trimmed)) return false;
    return true;
  });
}

/**
 * Post-process a report slot / display string:
 * KO: hanja→hangul; EN: hanja→romanization (meaning); strip labels/markdown.
 */
export function sanitizeLlmSlotText(
  slotName: string,
  text: string,
  localeOverride?: Locale
): string {
  const locale = resolveSanitizeLocale(localeOverride);
  const { text: afterHanja, detected, unmapped } =
    locale === "en"
      ? replaceKnownHanjaWithEnLabel(text)
      : replaceKnownHanjaWithHangul(text);

  // Log only when hanja remain unmapped after replacement (fully mapped EN/KO stays quiet).
  if (unmapped) {
    console.error("[LLM_SLOT_HANJA_DETECTED]", {
      slot: slotName,
      locale,
      detected,
      unmapped,
    });
    console.error("[LLM_SLOT_HANJA_UNMAPPED]", {
      slot: slotName,
      locale,
      chars: unmapped,
    });
  } else if (detected && locale === "ko") {
    // Preserve prior KO visibility when mapping succeeded.
    console.error("[LLM_SLOT_HANJA_DETECTED]", {
      slot: slotName,
      detected,
      unmapped: null,
    });
  }

  return stripMarkdownArtifacts(stripInternalBracketLabels(afterHanja));
}
