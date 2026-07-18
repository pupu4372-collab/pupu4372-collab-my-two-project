import {
  formatGanziLabel,
  formatSingleHanjaEn,
  hanjaCharToHangul,
  isGanziPair,
} from "@/lib/saju/elements";
import type { Locale } from "@/lib/saju/types";

const CJK_HANJA_RE = /[\u4E00-\u9FFF]/g;
const GANZI_PAIR_RE = /[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]/g;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Shinsal (神殺) terms used by human-premium / special-sal / shinsal.ts.
 * Longer phrases first (replace order sorts by length).
 * EN display: "Romanized (meaning)".
 */
const SHINSAL_HANJA_TO_EN: Record<string, string> = {
  文昌貴人: "Munchang Gwiin (scholarly nobleman)",
  天乙貴人: "Cheoneul Gwiin (heavenly nobleman)",
  桃花殺: "Dohwa Sal (peach blossom)",
  驛馬殺: "Yeokma Sal (traveling horse)",
  華蓋殺: "Hwagae Sal (canopy)",
  白虎殺: "Baekho Sal (white tiger)",
  羊刃殺: "Yangin Sal (yang blade)",
  魁罡殺: "Goegang Sal (kui-gang)",
  桃花: "Dohwa (peach blossom)",
  驛馬: "Yeokma (traveling horse)",
  華蓋: "Hwagae (canopy)",
  羊刃: "Yangin (yang blade)",
  白虎: "Baekho (white tiger)",
  魁罡: "Goegang (kui-gang)",
  神殺: "Shinsal (spirit stars)",
};

/**
 * Ten Gods (十神) + core myungri terms used in human-premium reports.
 * Meanings align with ManseTable / formatTenGodLabel EN labels.
 * Simplified-Chinese variants included (LLM / tables sometimes emit these).
 */
const MYEONGRI_HANJA_TO_EN: Record<string, string> = {
  // Ten Gods — traditional
  正財: "jeongjae (direct wealth)",
  偏財: "pyeonjae (indirect wealth)",
  正官: "jeonggwan (direct officer)",
  偏官: "pyeongwan (seven killings)",
  七殺: "chilsal (seven killings)",
  正印: "jeongin (direct resource)",
  偏印: "pyeonin (indirect resource)",
  比肩: "bigyeon (peer)",
  劫財: "geopjae (rob wealth)",
  食神: "siksin (eating god)",
  傷官: "sanggwan (hurting officer)",
  十神: "sipsin (ten gods)",
  // Ten Gods — simplified
  正财: "jeongjae (direct wealth)",
  偏财: "pyeonjae (indirect wealth)",
  七杀: "chilsal (seven killings)",
  劫财: "geopjae (rob wealth)",
  伤官: "sanggwan (hurting officer)",
  // Core myungri
  用神: "yongsin (useful god / balancing element)",
  喜神: "huisin (favorable god)",
  忌神: "gisin (unfavorable god)",
  日干: "ilgan (day stem)",
  日主: "ilju (day master)",
  格局: "gyeokguk (chart frame)",
};

/** Chinese pinyin spellings → Korean romanization (meaning). Case-insensitive. */
const MYEONGRI_PINYIN_TO_EN: Record<string, string> = {
  zhengcai: "jeongjae (direct wealth)",
  piancai: "pyeonjae (indirect wealth)",
  zhengguan: "jeonggwan (direct officer)",
  pianguan: "pyeongwan (seven killings)",
  qisha: "chilsal (seven killings)",
  zhengyin: "jeongin (direct resource)",
  pianyin: "pyeonin (indirect resource)",
  bijian: "bigyeon (peer)",
  jiecai: "geopjae (rob wealth)",
  shishen: "siksin (eating god)",
  shangguan: "sanggwan (hurting officer)",
  yongshen: "yongsin (useful god / balancing element)",
  xishen: "huisin (favorable god)",
  jishen: "gisin (unfavorable god)",
  rigan: "ilgan (day stem)",
  rizhu: "ilju (day master)",
};

const HANJA_PHRASE_TO_EN: Record<string, string> = {
  ...SHINSAL_HANJA_TO_EN,
  ...MYEONGRI_HANJA_TO_EN,
};

const HANJA_PHRASES = Object.keys(HANJA_PHRASE_TO_EN).sort(
  (a, b) => b.length - a.length
);

/** Strip gloss parens only — do not consume leading Latin (avoids eating "and yongsin"). */
const HANJA_PAREN_GLOSS_RE = new RegExp(
  `[(\\uFF08](?:${HANJA_PHRASES.map(escapeRegExp).join("|")})[)\\uFF09]`,
  "g"
);

const PINYIN_KEYS = Object.keys(MYEONGRI_PINYIN_TO_EN).sort(
  (a, b) => b.length - a.length
);

const PINYIN_WORD_RE = new RegExp(
  `\\b(?:${PINYIN_KEYS.map(escapeRegExp).join("|")})\\b`,
  "gi"
);

/** Korean romanization bare tokens (after "(한자)" stripped) → full EN label. */
const MYEONGRI_ROMAN_TO_EN: Record<string, string> = {
  jeongjae: "jeongjae (direct wealth)",
  pyeonjae: "pyeonjae (indirect wealth)",
  jeonggwan: "jeonggwan (direct officer)",
  pyeongwan: "pyeongwan (seven killings)",
  chilsal: "chilsal (seven killings)",
  jeongin: "jeongin (direct resource)",
  pyeonin: "pyeonin (indirect resource)",
  bigyeon: "bigyeon (peer)",
  geopjae: "geopjae (rob wealth)",
  siksin: "siksin (eating god)",
  sanggwan: "sanggwan (hurting officer)",
  sipsin: "sipsin (ten gods)",
  yongsin: "yongsin (useful god / balancing element)",
  huisin: "huisin (favorable god)",
  gisin: "gisin (unfavorable god)",
  ilgan: "ilgan (day stem)",
  ilju: "ilju (day master)",
  gyeokguk: "gyeokguk (chart frame)",
};

const ROMAN_KEYS = Object.keys(MYEONGRI_ROMAN_TO_EN).sort(
  (a, b) => b.length - a.length
);

/** Bare roman not already followed by a meaning paren. */
const BARE_ROMAN_WORD_RE = new RegExp(
  `\\b(?:${ROMAN_KEYS.map(escapeRegExp).join("|")})\\b(?!\\s*\\()`,
  "gi"
);

function replaceHanjaPhrasesWithEn(text: string): string {
  let next = text.replace(HANJA_PAREN_GLOSS_RE, "");
  for (const phrase of HANJA_PHRASES) {
    const label = HANJA_PHRASE_TO_EN[phrase];
    if (!label || !next.includes(phrase)) continue;
    next = next.split(phrase).join(label);
  }
  return next.replace(/[ \t]{2,}/g, " ");
}

function expandBareMyeongriRoman(text: string): string {
  return text.replace(BARE_ROMAN_WORD_RE, (match) => {
    return MYEONGRI_ROMAN_TO_EN[match.toLowerCase()] ?? match;
  });
}

/** Normalize Chinese pinyin ten-god / myungri spellings to Korean romanization. */
export function replaceChinesePinyinMyeongri(text: string): string {
  const afterPinyin = text.replace(PINYIN_WORD_RE, (match) => {
    const mapped = MYEONGRI_PINYIN_TO_EN[match.toLowerCase()];
    return mapped ?? match;
  });
  return expandBareMyeongriRoman(afterPinyin);
}

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
 * EN path: ganzi pairs → "Jeongmyo (Fire-Rabbit)"; shinsal/ten-god/myungri phrases →
 * romanized (meaning); lone stem/branch/element → romanized/meaning.
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

  next = replaceHanjaPhrasesWithEn(next);

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
 * KO: hanja→hangul; EN: hanja→romanization (meaning) + Chinese pinyin→Korean romanization;
 * strip labels/markdown.
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

  const afterLocale =
    locale === "en" ? replaceChinesePinyinMyeongri(afterHanja) : afterHanja;

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

  return stripMarkdownArtifacts(stripInternalBracketLabels(afterLocale));
}
