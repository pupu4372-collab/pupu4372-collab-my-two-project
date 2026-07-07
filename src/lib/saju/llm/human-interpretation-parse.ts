import type {
  ReportCohortInsight,
  ReportDecisionMoment,
  ReportOpportunity,
  ReportProphecy,
  ReportRisk,
  ReportRoadmapItem,
  ReportScore,
  ReportType,
} from "@/lib/reports/human-premium/types";
import { sanitizeLlmSlotText } from "./slot-output-sanitize";

const MIN_SCORE = 40;
const MAX_SCORE = 100;

function nonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function parsedSlotString(slot: string, value: unknown): string | null {
  const raw = nonEmptyString(value);
  if (!raw) return null;
  return sanitizeLlmSlotText(slot, raw);
}

export function parseSajuStructure(value: unknown): string | null {
  if (typeof value === "string") return parsedSlotString("saju-structure", value);
  if (!value || typeof value !== "object") return null;
  return parsedSlotString("saju-structure", (value as { sajuStructure?: unknown }).sajuStructure);
}

export function parseDeepAnalysis(value: unknown): string | null {
  if (typeof value === "string") return parsedSlotString("deep-analysis", value);
  if (!value || typeof value !== "object") return null;
  return parsedSlotString("deep-analysis", (value as { deepAnalysis?: unknown }).deepAnalysis);
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
  if (!value || typeof value !== "object") return null;
  const raw =
    (value as { opportunities?: unknown }).opportunities ??
    (Array.isArray(value) ? value : null);
  if (!Array.isArray(raw)) return null;

  const items = raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const o = item as Partial<ReportOpportunity>;
      const title = parsedSlotString("opportunities.title", o.title);
      const body = parsedSlotString("opportunities.body", o.body);
      const tip = parsedSlotString("opportunities.tip", o.tip);
      if (!title || !body || !tip) return null;
      return { title, body, tip };
    })
    .filter((item): item is ReportOpportunity => item != null);

  return items.length >= 3 ? items.slice(0, 5) : null;
}

export function parseRisks(value: unknown): ReportRisk[] | null {
  if (!value || typeof value !== "object") return null;
  const raw = (value as { risks?: unknown }).risks ?? (Array.isArray(value) ? value : null);
  if (!Array.isArray(raw)) return null;

  const items = raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const o = item as Partial<ReportRisk>;
      const title = parsedSlotString("risks.title", o.title);
      const body = parsedSlotString("risks.body", o.body);
      const countermeasure = parsedSlotString("risks.countermeasure", o.countermeasure);
      if (!title || !body || !countermeasure) return null;
      return { title, body, countermeasure };
    })
    .filter((item): item is ReportRisk => item != null);

  return items.length >= 2 ? items.slice(0, 4) : null;
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
      const script = parsedSlotString("roadmap.decisionMoments.script", o.script);
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
      const o = item as Partial<ReportScore>;
      const label = parsedSlotString("master-narrative.scores.label", o.label);
      const description = parsedSlotString("master-narrative.scores.description", o.description);
      const score =
        typeof o.score === "number" && Number.isFinite(o.score)
          ? Math.max(MIN_SCORE, Math.min(MAX_SCORE, Math.round(o.score)))
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

  const deepAnalysis = parseDeepAnalysis(value);
  if (deepAnalysis) {
    data.deepAnalysis = deepAnalysis;
    validFields.deepAnalysis = true;
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
