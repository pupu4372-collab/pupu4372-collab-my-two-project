import type {
  ReportCohortInsight,
  ReportDecisionMoment,
  ReportDeepSection,
  ReportDomainScore,
  ReportLifeCycle,
  ReportOpportunity,
  ReportProphecy,
  ReportRisk,
  ReportRoadmapItem,
  ReportScore,
  ReportType,
  ReportYearCard,
} from "@/lib/reports/human-premium/types";
import {
  normalizeDecisionScriptQuotes,
  normalizeOpportunityTip,
  normalizeRiskCountermeasure,
  sanitizeLlmSlotText,
} from "./slot-output-sanitize";

const MIN_SCORE = 40;
const MAX_SCORE = 100;

function nonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

/**
 * EN bodies sometimes leak Hangul glosses (e.g. "을묘 cycle"). Strip Hangul only when
 * it is sparse vs Latin — leave KO-majority strings untouched.
 */
function stripSparseHangulLeak(text: string): string {
  const hangulChars = text.match(/[\uac00-\ud7a3]/g)?.length ?? 0;
  if (hangulChars === 0) return text;
  const letterChars = text.match(/[A-Za-z\uac00-\ud7a3]/g)?.length ?? 0;
  if (letterChars === 0) return text;
  if (hangulChars / letterChars > 0.3) return text;
  return text
    .replace(/[\uac00-\ud7a3]+/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/\(\s+\)/g, "")
    .trim();
}

function parsedSlotString(slot: string, value: unknown): string | null {
  const raw = nonEmptyString(value);
  if (!raw) return null;
  return stripSparseHangulLeak(sanitizeLlmSlotText(slot, raw));
}

/** Read first matching string field (aliases / case-insensitive). */
function pickAliasedString(
  slot: string,
  obj: Record<string, unknown>,
  aliases: string[]
): string | null {
  const normalized = new Map<string, unknown>();
  for (const [key, value] of Object.entries(obj)) {
    normalized.set(key.toLowerCase().replace(/[\s_\-]/g, ""), value);
  }
  for (const alias of aliases) {
    const key = alias.toLowerCase().replace(/[\s_\-]/g, "");
    if (normalized.has(key)) {
      const parsed = parsedSlotString(slot, normalized.get(key));
      if (parsed) return parsed;
    }
  }
  return null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function pickArrayField(
  value: unknown,
  aliases: string[]
): unknown[] | null {
  if (Array.isArray(value)) return value;
  const obj = asRecord(value);
  if (!obj) return null;
  const normalized = new Map<string, unknown>();
  for (const [key, entry] of Object.entries(obj)) {
    normalized.set(key.toLowerCase().replace(/[\s_\-]/g, ""), entry);
  }
  for (const alias of aliases) {
    const key = alias.toLowerCase().replace(/[\s_\-]/g, "");
    const hit = normalized.get(key);
    if (Array.isArray(hit)) return hit;
  }
  return null;
}

export function parseSajuStructure(value: unknown): string | null {
  if (typeof value === "string") return parsedSlotString("saju-structure", value);
  if (!value || typeof value !== "object") return null;
  return parsedSlotString("saju-structure", (value as { sajuStructure?: unknown }).sajuStructure);
}

export function parseDeepAnalysis(value: unknown): string | null {
  if (typeof value === "string") return parsedSlotString("deep-analysis", value);
  if (!value || typeof value !== "object") return null;
  const v = value as {
    deepAnalysis?: unknown;
    intro?: unknown;
  };
  return (
    parsedSlotString("deep-analysis", v.intro) ??
    parsedSlotString("deep-analysis", v.deepAnalysis)
  );
}

const DOMAIN_SCORE_MIN = 1;
const DOMAIN_SCORE_MAX = 10;

export function parseDomainScores(value: unknown): ReportDomainScore[] | null {
  if (!value || typeof value !== "object") return null;
  const raw =
    (value as { domains?: unknown }).domains ??
    (value as { domainScores?: unknown }).domainScores ??
    (Array.isArray(value) ? value : null);
  if (!Array.isArray(raw)) return null;

  const items = raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const o = item as Record<string, unknown>;
      const domain = parsedSlotString(
        "deep-analysis.domains.domain",
        o.domain ?? o.name ?? o.title ?? o.label
      );
      const analysis = parsedSlotString(
        "deep-analysis.domains.analysis",
        o.analysis ?? o.body ?? o.description ?? o.desc
      );
      const scoreRaw = o.score_out_of_10 ?? o.scoreOutOf10 ?? o.score;
      const score =
        typeof scoreRaw === "number" && Number.isFinite(scoreRaw)
          ? Math.max(DOMAIN_SCORE_MIN, Math.min(DOMAIN_SCORE_MAX, Math.round(scoreRaw)))
          : null;
      if (!domain || !analysis || score == null) return null;
      return { domain, score, analysis };
    })
    .filter((item): item is ReportDomainScore => item != null);

  return items.length >= 2 ? items : null;
}

export function parseLuckyDates(value: unknown): string[] | null {
  if (!value || typeof value !== "object") return null;
  const raw =
    (value as { luckyDates?: unknown }).luckyDates ??
    (value as { lucky_dates?: unknown }).lucky_dates ??
    (value as { luckyMonths?: unknown }).luckyMonths ??
    (value as { lucky_months?: unknown }).lucky_months;
  if (!Array.isArray(raw)) return null;
  const dates = raw
    .map((item) =>
      typeof item === "string" ? parsedSlotString("deep-analysis.luckyDates", item) : null
    )
    .filter((item): item is string => Boolean(item));
  return dates.length >= 1 ? dates.slice(0, 5) : null;
}

export function parseDeepSections(value: unknown): ReportDeepSection[] | null {
  if (!value || typeof value !== "object") return null;
  const raw =
    (value as { sections?: unknown }).sections ??
    (value as { deepSections?: unknown }).deepSections;
  if (!Array.isArray(raw)) return null;

  const items = raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const o = item as Record<string, unknown>;
      const title = parsedSlotString(
        "deep-analysis.sections.title",
        o.title ?? o.name ?? o.label ?? o.domain
      );
      const body = parsedSlotString(
        "deep-analysis.sections.body",
        o.body ?? o.analysis ?? o.description ?? o.desc
      );
      if (!title || !body) return null;
      return { title, body };
    })
    .filter((item): item is ReportDeepSection => item != null);

  return items.length >= 1 ? items : null;
}

const YEAR_CARD_SCORE_MIN = 40;
const YEAR_CARD_SCORE_MAX = 100;

export function parseYearCards(value: unknown): ReportYearCard[] | null {
  if (!value || typeof value !== "object") return null;
  const raw =
    (value as { yearCards?: unknown }).yearCards ??
    (value as { year_cards?: unknown }).year_cards;
  if (!Array.isArray(raw)) return null;

  const items = raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const o = item as Record<string, unknown>;
      const yearRaw = o.year ?? o.label ?? o.period;
      const year =
        typeof yearRaw === "number" && Number.isFinite(yearRaw)
          ? String(Math.round(yearRaw))
          : parsedSlotString("deep-analysis.yearCards.year", yearRaw);
      const summary = parsedSlotString(
        "deep-analysis.yearCards.summary",
        o.summary ?? o.body ?? o.analysis ?? o.description ?? o.desc
      );
      const scoreRaw = o.score;
      const score =
        typeof scoreRaw === "number" && Number.isFinite(scoreRaw)
          ? Math.max(YEAR_CARD_SCORE_MIN, Math.min(YEAR_CARD_SCORE_MAX, Math.round(scoreRaw)))
          : null;
      if (!year || !summary || score == null) return null;
      return { year, score, summary };
    })
    .filter((item): item is ReportYearCard => item != null);

  return items.length >= 3 ? items : null;
}

export function parseLifeCycles(value: unknown): ReportLifeCycle[] | null {
  if (!value || typeof value !== "object") return null;
  const raw =
    (value as { cycles?: unknown }).cycles ??
    (value as { lifeCycles?: unknown }).lifeCycles ??
    (value as { daewoonCycles?: unknown }).daewoonCycles;
  if (!Array.isArray(raw)) return null;

  const items = raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const o = item as Record<string, unknown>;
      const period = parsedSlotString(
        "deep-analysis.cycles.period",
        o.period ?? o.ageRange ?? o.range ?? o.label
      );
      const titleRaw = parsedSlotString(
        "deep-analysis.cycles.title",
        o.title ?? o.name ?? o.era ?? o.alias
      );
      // System marks the current cycle; strip LLM marker tokens from titles.
      const title = titleRaw
        ? titleRaw
            .replace(/\s*[(\[]\s*현재\s*[)\]]\s*/g, " ")
            .replace(/(?:^|\s)현재(?:\s|$)/g, " ")
            .replace(/\s+/g, " ")
            .trim()
        : null;
      const body = parsedSlotString(
        "deep-analysis.cycles.body",
        o.body ?? o.analysis ?? o.description ?? o.desc
      );
      if (!period || !title || !body) return null;
      return { period, title, body };
    })
    .filter((item): item is ReportLifeCycle => item != null);

  return items.length >= 2 ? items : null;
}

export interface DeepAnalysisParseResult {
  intro: string | null;
  domains: ReportDomainScore[] | null;
  luckyDates: string[] | null;
  sections: ReportDeepSection[] | null;
  yearCards: ReportYearCard[] | null;
  cycles: ReportLifeCycle[] | null;
}

/**
 * Prefer structured S4. Legacy flat `{ deepAnalysis: string }` → intro only.
 * When any structured array is present, only explicit `intro` is used for prose.
 */
export function parseDeepAnalysisResult(value: unknown): DeepAnalysisParseResult | null {
  if (value == null) return null;
  if (typeof value === "string") {
    const intro = parsedSlotString("deep-analysis", value);
    return intro
      ? {
          intro,
          domains: null,
          luckyDates: null,
          sections: null,
          yearCards: null,
          cycles: null,
        }
      : null;
  }
  if (typeof value !== "object") return null;

  const domains = parseDomainScores(value);
  const luckyDates = parseLuckyDates(value);
  const sections = parseDeepSections(value);
  const yearCards = parseYearCards(value);
  const cycles = parseLifeCycles(value);
  const v = value as { intro?: unknown; deepAnalysis?: unknown };

  const hasStructured = Boolean(
    domains?.length || sections?.length || yearCards?.length || cycles?.length
  );

  let intro: string | null = null;
  if (hasStructured) {
    intro = parsedSlotString("deep-analysis.intro", v.intro);
  } else {
    intro =
      parsedSlotString("deep-analysis", v.intro) ??
      parsedSlotString("deep-analysis", v.deepAnalysis);
  }

  if (!intro && !hasStructured) return null;

  return {
    intro: intro ?? null,
    domains,
    luckyDates,
    sections,
    yearCards,
    cycles,
  };
}

export function parseMasterNarrative(value: unknown): string | null {
  if (typeof value === "string") return parsedSlotString("master-narrative", value);
  if (!value || typeof value !== "object") return null;
  const v = value as {
    narrative?: unknown;
    masterNarrative?: unknown;
    /** @deprecated legacy packs that used deepAnalysis for master-narrative */
    deepAnalysis?: unknown;
  };
  return (
    parsedSlotString("master-narrative", v.narrative) ??
    parsedSlotString("master-narrative", v.masterNarrative) ??
    parsedSlotString("master-narrative", v.deepAnalysis)
  );
}

export interface MasterNarrativeParseResult {
  narrative: string;
  scores: ReportScore[] | null;
}

/** Parses master-narrative JSON; optional scores reuse parseScores() for backward compatibility. */
export function parseMasterNarrativeResult(value: unknown): MasterNarrativeParseResult | null {
  const narrative = parseMasterNarrative(value);
  if (!narrative) return null;
  return { narrative, scores: parseScores(value) };
}

export function parseOpportunities(value: unknown): ReportOpportunity[] | null {
  const raw = pickArrayField(value, [
    "opportunities",
    "opportunity",
    "items",
    "기회",
  ]);
  if (!raw) return null;

  const items: ReportOpportunity[] = [];
  for (const item of raw) {
    const o = asRecord(item);
    if (!o) continue;
    const title = pickAliasedString("opportunities.title", o, [
      "title",
      "name",
      "label",
      "제목",
    ]);
    const body = pickAliasedString("opportunities.body", o, [
      "body",
      "content",
      "description",
      "desc",
      "본문",
      "내용",
    ]);
    const tipRaw = pickAliasedString("opportunities.tip", o, [
      "tip",
      "잡는법",
      "howto",
      "how",
      "howTo",
      "action",
      "tipText",
      "조언",
    ]);
    const tip = tipRaw ? normalizeOpportunityTip(tipRaw) : null;
    if (!title || !body || !tip) continue;
    items.push({ title, body, tip });
    if (items.length >= 5) break;
  }

  return items.length >= 3 ? items : null;
}

export function parseRisks(value: unknown): ReportRisk[] | null {
  const raw = pickArrayField(value, ["risks", "risk", "items", "리스크", "위험"]);
  if (!raw) return null;

  const items: ReportRisk[] = [];
  for (const item of raw) {
    const o = asRecord(item);
    if (!o) continue;
    const title = pickAliasedString("risks.title", o, [
      "title",
      "name",
      "label",
      "제목",
    ]);
    const body = pickAliasedString("risks.body", o, [
      "body",
      "content",
      "description",
      "desc",
      "본문",
      "내용",
    ]);
    const counterRaw = pickAliasedString("risks.countermeasure", o, [
      "countermeasure",
      "대비책",
      "action",
      "caution",
      "fix",
      "remedy",
      "solution",
      "대응",
    ]);
    const countermeasure = counterRaw
      ? normalizeRiskCountermeasure(counterRaw)
      : null;
    if (!title || !body || !countermeasure) continue;
    items.push({ title, body, countermeasure });
    if (items.length >= 4) break;
  }

  return items.length >= 2 ? items : null;
}

/**
 * Walk a (possibly truncated) JSON string and collect brace-balanced objects
 * that look like opportunity/risk items (have title/body fields).
 */
export function extractCompleteItemObjects(
  rawText: string
): Record<string, unknown>[] {
  const objects: Record<string, unknown>[] = [];
  let i = 0;
  while (i < rawText.length) {
    const start = rawText.indexOf("{", i);
    if (start < 0) break;

    let depth = 0;
    let inString = false;
    let escape = false;
    let end = -1;
    for (let j = start; j < rawText.length; j++) {
      const ch = rawText[j];
      if (inString) {
        if (escape) {
          escape = false;
          continue;
        }
        if (ch === "\\") {
          escape = true;
          continue;
        }
        if (ch === '"') inString = false;
        continue;
      }
      if (ch === '"') {
        inString = true;
        continue;
      }
      if (ch === "{") depth += 1;
      else if (ch === "}") {
        depth -= 1;
        if (depth === 0) {
          end = j;
          break;
        }
      }
    }
    if (end < 0) {
      // Truncated object — skip this '{' and keep scanning for complete siblings.
      i = start + 1;
      continue;
    }

    const slice = rawText.slice(start, end + 1);
    try {
      const parsed = JSON.parse(slice) as unknown;
      const record = asRecord(parsed);
      if (record && ("title" in record || "제목" in record)) {
        objects.push(record);
      }
    } catch {
      // skip malformed slice
    }
    i = end + 1;
  }
  return objects;
}

/** Unwrap `{ __json_parse_failed, raw }` or stringify object payloads. */
export function coerceLlmRawText(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value;
  if (!value || typeof value !== "object") return null;
  const rec = value as Record<string, unknown>;
  if (typeof rec.raw === "string" && rec.raw.trim()) return rec.raw;
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}

export function salvageOpportunitiesFromTruncated(
  rawText: string
): ReportOpportunity[] | null {
  return parseOpportunities({ opportunities: extractCompleteItemObjects(rawText) });
}

export function salvageRisksFromTruncated(rawText: string): ReportRisk[] | null {
  return parseRisks({ risks: extractCompleteItemObjects(rawText) });
}

export function parseRoadmap(value: unknown): ReportRoadmapItem[] | null {
  if (!value || typeof value !== "object") return null;
  const raw = (value as { roadmap?: unknown }).roadmap ?? (Array.isArray(value) ? value : null);
  if (!Array.isArray(raw)) return null;

  const items = raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const o = item as Partial<ReportRoadmapItem>;
      const period = parsedSlotString("roadmap.period", o.period);
      const label = parsedSlotString("roadmap.label", o.label);
      const body = parsedSlotString("roadmap.body", o.body);
      if (!period || !label || !body) return null;
      return { period, label, body };
    })
    .filter((item): item is ReportRoadmapItem => item != null);

  return items.length >= 2 ? items : null;
}

export function parseDecisionMoments(value: unknown): ReportDecisionMoment[] | null {
  if (!value || typeof value !== "object") return null;
  const raw = (value as { decisionMoments?: unknown }).decisionMoments;
  if (!Array.isArray(raw)) return null;

  const items = raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const o = item as Partial<ReportDecisionMoment>;
      const situation = parsedSlotString("roadmap.decisionMoments.situation", o.situation);
      const scriptRaw = parsedSlotString("roadmap.decisionMoments.script", o.script);
      const script = scriptRaw ? normalizeDecisionScriptQuotes(scriptRaw) : null;
      if (!situation || !script) return null;
      return { situation, script };
    })
    .filter((item): item is ReportDecisionMoment => item != null);

  return items.length >= 1 ? items : null;
}

export function parseProphecy(value: unknown, reportType: ReportType): ReportProphecy | null {
  if (!value || typeof value !== "object") return null;
  const v = value as { prophecy?: unknown; short?: unknown; full?: unknown };
  const nested =
    v.prophecy && typeof v.prophecy === "object"
      ? (v.prophecy as { short?: unknown; full?: unknown })
      : null;
  const short = parsedSlotString("prophecy.short", nested?.short ?? v.short);
  const full = parsedSlotString("prophecy.full", nested?.full ?? v.full);
  if (!short) return null;
  if (reportType === "lifetime" && full) return { short, full };
  return { short, ...(full ? { full } : {}) };
}

export function parseCohortInsight(value: unknown): ReportCohortInsight | null {
  if (!value || typeof value !== "object") return null;
  const v = value as { cohortInsight?: unknown; body?: unknown };
  const nested =
    v.cohortInsight && typeof v.cohortInsight === "object"
      ? (v.cohortInsight as { body?: unknown })
      : null;
  const body = parsedSlotString("cohortInsight.body", nested?.body ?? v.body ?? v.cohortInsight);
  return body ? { body } : null;
}

export function parseScores(value: unknown): ReportScore[] | null {
  if (!value || typeof value !== "object") return null;
  const raw = (value as { scores?: unknown }).scores;
  if (!Array.isArray(raw)) return null;

  const items = raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const o = item as Record<string, unknown>;
      // Accept label/description (canonical) and name/desc (prompt aliases).
      const label = parsedSlotString(
        "master-narrative.scores.label",
        o.label ?? o.name
      );
      const description = parsedSlotString(
        "master-narrative.scores.description",
        o.description ?? o.desc
      );
      const scoreRaw = o.score;
      const score =
        typeof scoreRaw === "number" && Number.isFinite(scoreRaw)
          ? Math.max(MIN_SCORE, Math.min(MAX_SCORE, Math.round(scoreRaw)))
          : null;
      if (!label || !description || score == null) return null;
      return { label, score, description };
    })
    .filter((item): item is ReportScore => item != null);

  return items.length >= 4 ? items : null;
}

export type HumanInterpretField =
  | "sajuStructure"
  | "scores"
  | "deepAnalysis"
  | "domainScores"
  | "opportunities"
  | "risks"
  | "roadmap"
  | "decisionMoments"
  | "prophecy"
  | "cohortInsight";

export interface ParsedHumanInterpretation {
  data: Partial<import("./types").HumanInterpretationJson>;
  validFields: Record<HumanInterpretField, boolean>;
}

export function parseHumanInterpretationJson(
  value: unknown,
  reportType: ReportType = "lifetime"
): ParsedHumanInterpretation {
  const data: Partial<import("./types").HumanInterpretationJson> = {};
  const validFields: Record<HumanInterpretField, boolean> = {
    sajuStructure: false,
    scores: false,
    deepAnalysis: false,
    domainScores: false,
    opportunities: false,
    risks: false,
    roadmap: false,
    decisionMoments: false,
    prophecy: false,
    cohortInsight: false,
  };

  const sajuStructure = parseSajuStructure(value);
  if (sajuStructure) {
    data.sajuStructure = sajuStructure;
    validFields.sajuStructure = true;
  }

  const scores = parseScores(value);
  if (scores) {
    data.scores = scores;
    validFields.scores = true;
  }

  const deepParsed = parseDeepAnalysisResult(value);
  if (deepParsed?.intro) {
    data.deepAnalysis = deepParsed.intro;
    validFields.deepAnalysis = true;
  }
  if (deepParsed?.domains?.length) {
    data.domainScores = deepParsed.domains;
    validFields.domainScores = true;
  }
  if (deepParsed?.luckyDates?.length) {
    data.luckyDates = deepParsed.luckyDates;
  }
  if (deepParsed?.sections?.length) {
    data.deepSections = deepParsed.sections;
  }
  if (deepParsed?.yearCards?.length) {
    data.yearCards = deepParsed.yearCards;
  }
  if (deepParsed?.cycles?.length) {
    data.lifeCycles = deepParsed.cycles;
  }

  const opportunities = parseOpportunities(value);
  if (opportunities) {
    data.opportunities = opportunities;
    validFields.opportunities = true;
  }

  const risks = parseRisks(value);
  if (risks) {
    data.risks = risks;
    validFields.risks = true;
  }

  const roadmap = parseRoadmap(value);
  if (roadmap) {
    data.roadmap = roadmap;
    validFields.roadmap = true;
  }

  const decisionMoments = parseDecisionMoments(value);
  if (decisionMoments) {
    data.decisionMoments = decisionMoments;
    validFields.decisionMoments = true;
  }

  const prophecy = parseProphecy(value, reportType);
  if (prophecy) {
    data.prophecy = prophecy;
    validFields.prophecy = true;
  }

  const cohortInsight = parseCohortInsight(value);
  if (cohortInsight) {
    data.cohortInsight = cohortInsight;
    validFields.cohortInsight = true;
  }

  return { data, validFields };
}

export function isHumanInterpretationJson(
  value: unknown,
  reportType: ReportType = "lifetime"
): value is import("./types").HumanInterpretationJson {
  const { validFields } = parseHumanInterpretationJson(value, reportType);
  return (
    validFields.sajuStructure &&
    validFields.deepAnalysis &&
    validFields.opportunities &&
    validFields.risks &&
    validFields.roadmap &&
    validFields.prophecy &&
    validFields.cohortInsight
  );
}
