import type { HumanPremiumFactsBlock } from "@/lib/reports/human-premium/facts";
import type {
  HumanPremiumLlmSectionMeta,
  HumanPremiumReportStructured,
  ReportCohortInsight,
  ReportOpportunity,
  ReportRisk,
  ReportScore,
  ReportType,
} from "@/lib/reports/human-premium/types";
import type { Locale, SajuBasicResponse } from "@/lib/saju/types";
import { buildHumanPremiumStructured } from "@/lib/reports/human-premium/content";
import {
  buildHumanPremiumCallCacheKey,
  resolveGeminiModel,
  resolveProviderModel,
} from "./cache-keys";
import {
  clearPremiumCallInFlight,
  getCachedPremiumCallResult,
  getPremiumCallInFlight,
  setCachedPremiumCallResult,
  setPremiumCallInFlight,
} from "./cache";
import {
  buildMasterNarrativePrompts,
  buildDeepAnalysisPrompts,
  buildOpportunitiesPrompts,
  buildProphecyPrompts,
  buildCohortInsightRetryPrompts,
  buildRisksPrompts,
  buildRoadmapPrompts,
  buildSajuStructurePrompts,
} from "./prompts/human-prompt";
import type { PremiumPromptContext } from "./prompts/premium-context";
import { resolvePromptProduct, reportSpecificInputCacheFacet } from "@/lib/reports/human-premium/report-prompts";
import {
  coerceLlmRawText,
  parseCohortInsight,
  parseDeepAnalysisResult,
  parseDecisionMoments,
  parseMasterNarrativeResult,
  parseOpportunities,
  parseProphecy,
  parseRisks,
  parseRoadmap,
  parseSajuStructure,
  salvageOpportunitiesFromTruncated,
  salvageRisksFromTruncated,
} from "./human-interpretation-parse";
import { llmDebugLog } from "./debug-log";
import {
  callClaudeJson,
  isClaudeEnabled,
} from "./providers/claude-provider";
import {
  callOpenAiJsonParsed,
  isOpenAiEnabled,
} from "./providers/openai-provider";
import type { HumanInterpretationJson, LlmPromptPair } from "./types";
import { parseJsonObject } from "./json-utils";

export type PremiumLlmProvider = "claude" | "openai" | "gemini";

export type PremiumLlmContext = PremiumPromptContext;

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

function isGeminiEnabled(): boolean {
  if (process.env.HUMAN_PREMIUM_LLM === "0") return false;
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

export function isHumanPremiumOrchestratorEnabled(): boolean {
  return isClaudeEnabled() || isOpenAiEnabled() || isGeminiEnabled();
}

async function callGeminiJsonParsed(
  prompts: LlmPromptPair,
  maxTokens: number
): Promise<unknown> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");

  const model = resolveGeminiModel();
  const response = await fetch(
    `${GEMINI_ENDPOINT}/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: prompts.system }] },
        contents: [{ role: "user", parts: [{ text: prompts.user }] }],
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: maxTokens,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(`Gemini failed: ${response.status} ${errorBody.slice(0, 200)}`);
  }

  const payload = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = payload.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();
  if (!text) throw new Error("Gemini returned empty content.");

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  const json = start >= 0 && end > start ? text.slice(start, end + 1) : text;
  return JSON.parse(json) as unknown;
}

async function callProviderJson(
  provider: PremiumLlmProvider,
  prompts: LlmPromptPair,
  maxTokens: number
): Promise<{ data: unknown; stopReason: string | null }> {
  if (provider === "claude") {
    const { text, stopReason } = await callClaudeJson(prompts, maxTokens);
    try {
      return { data: parseJsonObject(text), stopReason };
    } catch (error) {
      console.error("[CLAUDE_JSON_PARSE_FAIL]", {
        stopReason,
        message: error instanceof Error ? error.message : String(error),
        rawHead: text.slice(0, 300),
        rawTail: text.slice(-300),
      });
      // Keep raw for orchestrator parse_null logging / retry — do not drop to call_null.
      return {
        data: { __json_parse_failed: true, raw: text },
        stopReason,
      };
    }
  }
  if (provider === "openai") {
    return { data: await callOpenAiJsonParsed(prompts, maxTokens), stopReason: null };
  }
  return { data: await callGeminiJsonParsed(prompts, maxTokens), stopReason: null };
}

function providerOrder(): PremiumLlmProvider[] {
  const forced = process.env.HUMAN_PREMIUM_LLM_PROVIDER?.trim().toLowerCase();
  if (forced === "claude" && isClaudeEnabled()) {
    llmDebugLog("[LLM_PROVIDER_ORDER]", { forced, order: ["claude"], claudeEnabled: true });
    return ["claude"];
  }
  if (forced === "openai" && isOpenAiEnabled()) return ["openai"];
  if (forced === "gemini" && isGeminiEnabled()) return ["gemini"];

  const order: PremiumLlmProvider[] = [];
  if (isClaudeEnabled()) order.push("claude");
  if (isOpenAiEnabled()) order.push("openai");
  if (isGeminiEnabled()) order.push("gemini");
  llmDebugLog("[LLM_PROVIDER_ORDER]", {
    forced: forced || null,
    order,
    claudeEnabled: isClaudeEnabled(),
    openaiEnabled: isOpenAiEnabled(),
    geminiEnabled: isGeminiEnabled(),
    anthropicModel: process.env.ANTHROPIC_MODEL?.trim() || "(default)",
  });
  return order;
}

async function callPremiumJsonCached(options: {
  callKind: string;
  ctx: PremiumLlmContext;
  prompts: LlmPromptPair;
  maxTokens: number;
  narrative?: string;
}): Promise<{
  data: unknown;
  provider: PremiumLlmProvider;
  stopReason: string | null;
} | null> {
  const providers = providerOrder();
  if (!providers.length) return null;

  let lastParseFailed: {
    data: unknown;
    provider: PremiumLlmProvider;
    stopReason: string | null;
  } | null = null;

  for (const provider of providers) {
    const model =
      provider === "gemini" ? resolveGeminiModel() : resolveProviderModel(provider);
    const cacheKey = buildHumanPremiumCallCacheKey({
      callKind: options.callKind,
      reportType: options.ctx.reportType,
      promptProduct: resolvePromptProduct(options.ctx),
      reportInputFacet: reportSpecificInputCacheFacet(options.ctx),
      locale: options.ctx.locale,
      analysisMode: options.ctx.analysisMode,
      mapping: options.ctx.mapping,
      model,
      provider,
      narrative: options.narrative,
    });

    const cached = await getCachedPremiumCallResult(cacheKey);
    if (cached) {
      llmDebugLog("[LLM_CACHE_HIT]", {
        callKind: options.callKind,
        provider,
        model,
      });
      return {
        data: cached.data,
        provider: cached.provider as PremiumLlmProvider,
        stopReason: null,
      };
    }

    llmDebugLog("[LLM_CACHE_MISS]", {
      callKind: options.callKind,
      provider,
      model,
    });

    const inFlight = getPremiumCallInFlight(cacheKey);
    if (inFlight) {
      const result = await inFlight;
      if (result) {
        return {
          data: result.data,
          provider: result.provider as PremiumLlmProvider,
          stopReason: null,
        };
      }
      continue;
    }

    const promise = (async () => {
      try {
        const { data, stopReason } = await callProviderJson(
          provider,
          options.prompts,
          options.maxTokens
        );
        const parseFailed =
          Boolean(data) &&
          typeof data === "object" &&
          !Array.isArray(data) &&
          "__json_parse_failed" in (data as Record<string, unknown>);
        if (!parseFailed) {
          await setCachedPremiumCallResult(
            cacheKey,
            options.ctx.locale,
            provider,
            model,
            { data, provider }
          );
        }
        return { data, provider, stopReason };
      } catch (error) {
        console.error("[LLM_PROVIDER_ERROR]", {
          callKind: options.callKind,
          provider,
          model,
          message: error instanceof Error ? error.message : String(error),
        });
        return null;
      }
    })().finally(() => {
      clearPremiumCallInFlight(cacheKey);
    });

    setPremiumCallInFlight(
      cacheKey,
      promise.then((result) =>
        result ? { data: result.data, provider: result.provider } : null
      )
    );
    const result = await promise;
    if (result) {
      const parseFailed =
        Boolean(result.data) &&
        typeof result.data === "object" &&
        !Array.isArray(result.data) &&
        "__json_parse_failed" in (result.data as Record<string, unknown>);
      if (parseFailed) {
        lastParseFailed = {
          data: result.data,
          provider: result.provider as PremiumLlmProvider,
          stopReason: result.stopReason ?? null,
        };
        continue;
      }
      return {
        data: result.data,
        provider: result.provider as PremiumLlmProvider,
        stopReason: result.stopReason ?? null,
      };
    }
  }

  return lastParseFailed;
}

async function generateSajuStructure(ctx: PremiumLlmContext) {
  const result = await callPremiumJsonCached({
    callKind: "saju-structure",
    ctx,
    prompts: buildSajuStructurePrompts(ctx),
    maxTokens: 1500,
  });
  if (!result) return { value: null, provider: null };
  return { value: parseSajuStructure(result.data), provider: result.provider };
}

async function generateMasterNarrative(ctx: PremiumLlmContext) {
  const result = await callPremiumJsonCached({
    callKind: "master-narrative",
    ctx,
    prompts: buildMasterNarrativePrompts(ctx),
    maxTokens: 2800,
  });
  if (!result) return { narrative: null, scores: null, provider: null };
  const parsed = parseMasterNarrativeResult(result.data);
  if (!parsed) return { narrative: null, scores: null, provider: result.provider };
  return {
    narrative: parsed.narrative,
    scores: parsed.scores,
    provider: result.provider,
  };
}

async function generateDeepAnalysis(ctx: PremiumLlmContext, narrative: string) {
  const deepMaxTokens =
    ctx.reportType === "lifetime"
      ? 4500
      : ctx.reportType === "decade"
        ? 4000
        : ctx.reportType === "career"
          ? 3600
          : 2400;
  const result = await callPremiumJsonCached({
    callKind: "deep-analysis",
    ctx,
    prompts: buildDeepAnalysisPrompts(ctx, narrative),
    maxTokens: deepMaxTokens,
    narrative,
  });
  if (!result) {
    return { value: null, provider: null, stopReason: null, raw: null as unknown };
  }
  const parsed = parseDeepAnalysisResult(result.data);
  return {
    value: parsed,
    provider: result.provider,
    stopReason: result.stopReason ?? null,
    raw: result.data,
  };
}

const OPPORTUNITIES_JSON_CORRECTION = `

★ JSON 교정 (재시도):
JSON만 출력. 마크다운 코드펜스·백틱 금지.
각 항목에 title / body / tip 필수.
opportunities 정확히 5개.
스키마: { "opportunities": [{ "title": "string", "body": "string", "tip": "string" }] }`;

const RISKS_JSON_CORRECTION = `

★ JSON 교정 (재시도):
JSON만 출력. 마크다운 코드펜스·백틱 금지.
각 항목에 title / body / countermeasure 필수.
risks 정확히 4개.
스키마: { "risks": [{ "title": "string", "body": "string", "countermeasure": "string" }] }`;

const ROADMAP_JSON_CORRECTION = `

★ JSON 교정 (재시도):
JSON만 출력. 마크다운 코드펜스·백틱 금지.
roadmap / decisionMoments 배열을 채울 것.
스키마: { "roadmap": [{ "period", "label", "body" }], "decisionMoments": [{ "situation", "script" }] }`;

function appendUserCorrection(prompts: LlmPromptPair, correction: string): LlmPromptPair {
  return {
    system: prompts.system,
    user: `${prompts.user}${correction}`,
  };
}

function rawResponseSnippets(data: unknown): { head: string; tail: string } {
  let payload: unknown = data;
  if (
    payload &&
    typeof payload === "object" &&
    !Array.isArray(payload) &&
    "__json_parse_failed" in (payload as Record<string, unknown>)
  ) {
    payload = (payload as { raw?: unknown }).raw ?? payload;
  }
  const text =
    typeof payload === "string"
      ? payload
      : payload == null
        ? ""
        : JSON.stringify(payload);
  if (!text) return { head: "", tail: "" };
  return {
    head: text.slice(0, 300),
    tail: text.length > 300 ? text.slice(-300) : text.slice(0, 300),
  };
}

function logSlotParseOrCallFailure(options: {
  reportType: ReportType;
  slot: "opportunities" | "risks" | "roadmap";
  failStage: "call_null" | "parse_null";
  stopReason: string | null;
  raw: unknown;
  retried?: boolean;
}): void {
  const snippets = rawResponseSnippets(options.raw);
  const rawText =
    typeof options.raw === "string"
      ? options.raw
      : options.raw == null
        ? ""
        : JSON.stringify(options.raw);
  console.error("[LLM_SLOT_FAIL]", {
    reportType: options.reportType,
    slot: options.slot,
    failStage: options.failStage,
    stop_reason: options.stopReason,
    retried: options.retried ?? false,
    responseChars: rawText.length,
    rawHead: snippets.head,
    rawTail: snippets.tail,
  });
}

/** Unified grep tags: [OPP_FALLBACK] | [RISK_FALLBACK] | [ROADMAP_FALLBACK] | [DEEP_ANALYSIS_FALLBACK] */
function logParallelSlotFallback(options: {
  reportType: ReportType;
  slot: "opportunities" | "risks" | "roadmap";
  failStage: "call_null" | "parse_null";
  stopReason: string | null;
  provider: PremiumLlmProvider | null;
  raw: unknown;
}): void {
  const tag =
    options.slot === "opportunities"
      ? "[OPP_FALLBACK]"
      : options.slot === "risks"
        ? "[RISK_FALLBACK]"
        : "[ROADMAP_FALLBACK]";
  const snippets = rawResponseSnippets(options.raw);
  const rawText =
    typeof options.raw === "string"
      ? options.raw
      : options.raw == null
        ? ""
        : JSON.stringify(options.raw);
  console.error(tag, {
    reportType: options.reportType,
    slot: options.slot,
    failStage: options.failStage,
    stop_reason: options.stopReason,
    provider: options.provider,
    responseChars: rawText.length,
    rawHead: snippets.head,
    rawTail: snippets.tail,
  });
  logFallbackUsed(options.reportType, options.slot);
}

function logDeepAnalysisFailure(options: {
  reportType: ReportType;
  failStage: "call_null" | "parse_null" | "empty_payload";
  stopReason: string | null;
  provider: PremiumLlmProvider | null;
  raw: unknown;
}): void {
  const snippets = rawResponseSnippets(options.raw);
  const rawText =
    typeof options.raw === "string"
      ? options.raw
      : options.raw == null
        ? ""
        : JSON.stringify(options.raw);
  console.error("[DEEP_ANALYSIS_FALLBACK]", {
    reportType: options.reportType,
    failStage: options.failStage,
    stop_reason: options.stopReason,
    provider: options.provider,
    responseChars: rawText.length,
    rawHead: snippets.head,
    rawTail: snippets.tail,
  });
  logFallbackUsed(options.reportType, "deep-analysis");
}

function logFallbackUsed(reportType: ReportType, slot: string): void {
  console.warn(`[fallback-used] type=${reportType} slot=${slot}`);
}

const OPP_RISK_MAX_TOKENS = 7500;
const ROADMAP_MAX_TOKENS = 5000;
const ROADMAP_RETRY_MAX_TOKENS = 5200;

function resolveOpportunitiesPayload(
  data: unknown,
  reportType: ReportType,
  stopReason: string | null
): ReportOpportunity[] | null {
  const parsed = parseOpportunities(data);
  if (parsed?.length) return parsed;

  const rawText = coerceLlmRawText(data);
  if (!rawText) return null;
  const salvaged = salvageOpportunitiesFromTruncated(rawText);
  if (salvaged?.length) {
    console.error("[LLM_SLOT_TRUNCATED_SALVAGE]", {
      reportType,
      slot: "opportunities",
      count: salvaged.length,
      stop_reason: stopReason,
    });
    return salvaged;
  }
  return null;
}

function resolveRisksPayload(
  data: unknown,
  reportType: ReportType,
  stopReason: string | null
): ReportRisk[] | null {
  const parsed = parseRisks(data);
  if (parsed?.length) return parsed;

  const rawText = coerceLlmRawText(data);
  if (!rawText) return null;
  const salvaged = salvageRisksFromTruncated(rawText);
  if (salvaged?.length) {
    console.error("[LLM_SLOT_TRUNCATED_SALVAGE]", {
      reportType,
      slot: "risks",
      count: salvaged.length,
      stop_reason: stopReason,
    });
    return salvaged;
  }
  return null;
}

async function generateOpportunities(ctx: PremiumLlmContext, narrative: string) {
  const basePrompts = buildOpportunitiesPrompts(ctx, narrative);
  const first = await callPremiumJsonCached({
    callKind: "opportunities",
    ctx,
    prompts: basePrompts,
    maxTokens: OPP_RISK_MAX_TOKENS,
    narrative,
  });

  if (first) {
    const resolved = resolveOpportunitiesPayload(
      first.data,
      ctx.reportType,
      first.stopReason
    );
    if (resolved?.length) {
      return { value: resolved, provider: first.provider };
    }
    logSlotParseOrCallFailure({
      reportType: ctx.reportType,
      slot: "opportunities",
      failStage: "parse_null",
      stopReason: first.stopReason,
      raw: first.data,
    });
  } else {
    logSlotParseOrCallFailure({
      reportType: ctx.reportType,
      slot: "opportunities",
      failStage: "call_null",
      stopReason: null,
      raw: null,
    });
  }

  const retry = await callPremiumJsonCached({
    callKind: "opportunities-retry",
    ctx,
    prompts: appendUserCorrection(basePrompts, OPPORTUNITIES_JSON_CORRECTION),
    maxTokens: OPP_RISK_MAX_TOKENS,
    narrative,
  });
  if (retry) {
    const resolved = resolveOpportunitiesPayload(
      retry.data,
      ctx.reportType,
      retry.stopReason
    );
    if (resolved?.length) {
      console.error("[LLM_SLOT_RETRY_OK]", {
        reportType: ctx.reportType,
        slot: "opportunities",
        provider: retry.provider,
      });
      return { value: resolved, provider: retry.provider };
    }
    logSlotParseOrCallFailure({
      reportType: ctx.reportType,
      slot: "opportunities",
      failStage: "parse_null",
      stopReason: retry.stopReason,
      raw: retry.data,
      retried: true,
    });
    logParallelSlotFallback({
      reportType: ctx.reportType,
      slot: "opportunities",
      failStage: "parse_null",
      stopReason: retry.stopReason,
      provider: retry.provider,
      raw: retry.data,
    });
  } else {
    logSlotParseOrCallFailure({
      reportType: ctx.reportType,
      slot: "opportunities",
      failStage: "call_null",
      stopReason: null,
      raw: null,
      retried: true,
    });
    logParallelSlotFallback({
      reportType: ctx.reportType,
      slot: "opportunities",
      failStage: "call_null",
      stopReason: null,
      provider: null,
      raw: null,
    });
  }

  return { value: null, provider: null };
}

async function generateRisks(ctx: PremiumLlmContext, narrative: string) {
  const basePrompts = buildRisksPrompts(ctx, narrative);
  const first = await callPremiumJsonCached({
    callKind: "risks",
    ctx,
    prompts: basePrompts,
    maxTokens: OPP_RISK_MAX_TOKENS,
    narrative,
  });

  if (first) {
    const resolved = resolveRisksPayload(first.data, ctx.reportType, first.stopReason);
    if (resolved?.length) {
      return { value: resolved, provider: first.provider };
    }
    logSlotParseOrCallFailure({
      reportType: ctx.reportType,
      slot: "risks",
      failStage: "parse_null",
      stopReason: first.stopReason,
      raw: first.data,
    });
  } else {
    logSlotParseOrCallFailure({
      reportType: ctx.reportType,
      slot: "risks",
      failStage: "call_null",
      stopReason: null,
      raw: null,
    });
  }

  const retry = await callPremiumJsonCached({
    callKind: "risks-retry",
    ctx,
    prompts: appendUserCorrection(basePrompts, RISKS_JSON_CORRECTION),
    maxTokens: OPP_RISK_MAX_TOKENS,
    narrative,
  });
  if (retry) {
    const resolved = resolveRisksPayload(retry.data, ctx.reportType, retry.stopReason);
    if (resolved?.length) {
      console.error("[LLM_SLOT_RETRY_OK]", {
        reportType: ctx.reportType,
        slot: "risks",
        provider: retry.provider,
      });
      return { value: resolved, provider: retry.provider };
    }
    logSlotParseOrCallFailure({
      reportType: ctx.reportType,
      slot: "risks",
      failStage: "parse_null",
      stopReason: retry.stopReason,
      raw: retry.data,
      retried: true,
    });
    logParallelSlotFallback({
      reportType: ctx.reportType,
      slot: "risks",
      failStage: "parse_null",
      stopReason: retry.stopReason,
      provider: retry.provider,
      raw: retry.data,
    });
  } else {
    logSlotParseOrCallFailure({
      reportType: ctx.reportType,
      slot: "risks",
      failStage: "call_null",
      stopReason: null,
      raw: null,
      retried: true,
    });
    logParallelSlotFallback({
      reportType: ctx.reportType,
      slot: "risks",
      failStage: "call_null",
      stopReason: null,
      provider: null,
      raw: null,
    });
  }

  return { value: null, provider: null };
}

async function generateRoadmap(ctx: PremiumLlmContext, narrative: string) {
  const basePrompts = buildRoadmapPrompts(ctx, narrative);
  const first = await callPremiumJsonCached({
    callKind: "roadmap",
    ctx,
    prompts: basePrompts,
    maxTokens: ROADMAP_MAX_TOKENS,
    narrative,
  });

  if (first) {
    const roadmap = parseRoadmap(first.data);
    const decisionMoments = parseDecisionMoments(first.data);
    if (roadmap?.length) {
      return { roadmap, decisionMoments, provider: first.provider };
    }
    logSlotParseOrCallFailure({
      reportType: ctx.reportType,
      slot: "roadmap",
      failStage: "parse_null",
      stopReason: first.stopReason,
      raw: first.data,
    });
  } else {
    logSlotParseOrCallFailure({
      reportType: ctx.reportType,
      slot: "roadmap",
      failStage: "call_null",
      stopReason: null,
      raw: null,
    });
  }

  const retry = await callPremiumJsonCached({
    callKind: "roadmap-retry",
    ctx,
    prompts: appendUserCorrection(basePrompts, ROADMAP_JSON_CORRECTION),
    maxTokens: ROADMAP_RETRY_MAX_TOKENS,
    narrative,
  });
  if (retry) {
    const roadmap = parseRoadmap(retry.data);
    const decisionMoments = parseDecisionMoments(retry.data);
    if (roadmap?.length) {
      console.error("[LLM_SLOT_RETRY_OK]", {
        reportType: ctx.reportType,
        slot: "roadmap",
        provider: retry.provider,
      });
      return { roadmap, decisionMoments, provider: retry.provider };
    }
    logSlotParseOrCallFailure({
      reportType: ctx.reportType,
      slot: "roadmap",
      failStage: "parse_null",
      stopReason: retry.stopReason,
      raw: retry.data,
      retried: true,
    });
    logParallelSlotFallback({
      reportType: ctx.reportType,
      slot: "roadmap",
      failStage: "parse_null",
      stopReason: retry.stopReason,
      provider: retry.provider,
      raw: retry.data,
    });
  } else {
    logSlotParseOrCallFailure({
      reportType: ctx.reportType,
      slot: "roadmap",
      failStage: "call_null",
      stopReason: null,
      raw: null,
      retried: true,
    });
    logParallelSlotFallback({
      reportType: ctx.reportType,
      slot: "roadmap",
      failStage: "call_null",
      stopReason: null,
      provider: null,
      raw: null,
    });
  }

  return { roadmap: null, decisionMoments: null, provider: null };
}

async function generateProphecyBundle(ctx: PremiumLlmContext, narrative: string) {
  llmDebugLog("[LLM_SLOT_START]", { slot: "prophecy", reportType: ctx.reportType });
  const currentYear = ctx.currentYear ?? new Date().getFullYear();
  const ctxWithYear = { ...ctx, currentYear };
  const result = await callPremiumJsonCached({
    callKind: "prophecy",
    ctx,
    prompts: buildProphecyPrompts(ctxWithYear, narrative),
    maxTokens: 1600,
    narrative,
  });
  if (!result) {
    return {
      prophecy: null,
      cohortInsight: null,
      provider: null,
      cohortRetried: false,
      cohortInsightProvider: null,
    };
  }

  let prophecy = parseProphecy(result.data, ctx.reportType);
  if (prophecy && ctx.luckyKeywords?.shortCard) {
    prophecy = { ...prophecy, short: ctx.luckyKeywords.shortCard };
  }
  let cohortInsight = parseCohortInsight(result.data);
  let cohortInsightProvider: PremiumLlmProvider | null = cohortInsight?.body
    ? result.provider
    : null;
  let cohortRetried = false;

  if (!cohortInsight?.body && prophecy) {
    cohortRetried = true;
    llmDebugLog("[COHORT_INSIGHT_RETRY]", { reportType: ctx.reportType });
    const retry = await callPremiumJsonCached({
      callKind: "cohort-insight",
      ctx,
      prompts: buildCohortInsightRetryPrompts(ctxWithYear, narrative),
      maxTokens: 512,
      narrative,
    });
    if (retry) {
      cohortInsight = parseCohortInsight(retry.data);
      if (cohortInsight?.body) {
        cohortInsightProvider = retry.provider;
        llmDebugLog("[COHORT_INSIGHT_RETRY_OK]", {
          reportType: ctx.reportType,
          provider: retry.provider,
        });
      }
    }
  }

  return {
    prophecy,
    cohortInsight,
    provider: result.provider,
    cohortRetried,
    cohortInsightProvider,
  };
}


function generateCohortInsight(
  saju: SajuBasicResponse,
  locale: Locale,
  reportType: ReportType
): ReportCohortInsight {
  return buildHumanPremiumStructured(saju, locale, reportType).cohortInsight;
}

export interface HumanPremiumLlmBuildResult {
  structured: HumanPremiumReportStructured;
  interpretation: Partial<HumanInterpretationJson>;
  meta: Record<string, HumanPremiumLlmSectionMeta>;
  primaryProvider: PremiumLlmProvider | null;
}

export async function buildHumanPremiumStructuredWithLlm(
  ctx: PremiumLlmContext
): Promise<HumanPremiumLlmBuildResult> {
  const template = buildHumanPremiumStructured(
    ctx.saju,
    ctx.locale,
    ctx.reportType
  );
  const meta: Record<string, HumanPremiumLlmSectionMeta> = {};
  const interpretation: Partial<HumanInterpretationJson> = {};
  let primaryProvider: PremiumLlmProvider | null = null;

  const structured: HumanPremiumReportStructured = {
    ...template,
  };

  const mark = (
    sectionId: string,
    provider: PremiumLlmProvider | null,
    ok: boolean,
    error?: string
  ) => {
    meta[sectionId] =
      ok && provider
        ? { source: provider }
        : { source: "template", error: error ?? null };
    if (ok && provider && !primaryProvider) primaryProvider = provider;
  };

  const structureResult = await generateSajuStructure(ctx);
  if (structureResult.value) {
    interpretation.sajuStructure = structureResult.value;
    mark("section-structure", structureResult.provider, true);
  } else {
    mark("section-structure", null, false, "llm_failed");
  }

  const skipDeepLlm = ctx.reportType === "daily";
  const narrativeResult = await generateMasterNarrative(ctx);
  const narrative = narrativeResult.narrative ?? "";
  if (narrativeResult.narrative) {
    interpretation.masterNarrative = narrativeResult.narrative;
  }

  if (narrativeResult.scores?.length) {
    structured.scores = narrativeResult.scores;
    interpretation.scores = narrativeResult.scores;
    mark("section-metrics", narrativeResult.provider, true);
  } else {
    console.error("[SCORES_TEMPLATE_FALLBACK]", {
      reportType: ctx.reportType,
      reason: narrativeResult.narrative
        ? "scores_parse_failed_or_missing"
        : "master_narrative_failed",
      provider: narrativeResult.provider,
    });
    interpretation.scores = structured.scores;
    meta["section-metrics"] = { source: "template" };
  }

  if (skipDeepLlm) {
    mark("section-depth", null, true);
  } else {
    const deepAnalysisResult = await generateDeepAnalysis(ctx, narrative);
    if (deepAnalysisResult.value) {
      const parsed = deepAnalysisResult.value;
      if (parsed.intro) {
        interpretation.deepAnalysis = parsed.intro;
      }
      if (parsed.domains?.length) {
        structured.domainScores = parsed.domains;
        interpretation.domainScores = parsed.domains;
      }
      if (parsed.luckyDates?.length) {
        structured.luckyDates = parsed.luckyDates;
        interpretation.luckyDates = parsed.luckyDates;
      }
      if (parsed.sections?.length) {
        structured.deepSections = parsed.sections;
        interpretation.deepSections = parsed.sections;
      }
      if (parsed.yearCards?.length) {
        structured.yearCards = parsed.yearCards;
        interpretation.yearCards = parsed.yearCards;
      }
      if (parsed.cycles?.length) {
        structured.lifeCycles = parsed.cycles;
        interpretation.lifeCycles = parsed.cycles;
      }
      const ok = Boolean(
        parsed.intro ||
          parsed.domains?.length ||
          parsed.sections?.length ||
          parsed.yearCards?.length ||
          parsed.cycles?.length
      );
      if (!ok) {
        logDeepAnalysisFailure({
          reportType: ctx.reportType,
          failStage: "empty_payload",
          stopReason: deepAnalysisResult.stopReason,
          provider: deepAnalysisResult.provider,
          raw: deepAnalysisResult.raw,
        });
      }
      mark(
        "section-depth",
        deepAnalysisResult.provider,
        ok,
        ok ? undefined : "llm_failed"
      );
    } else {
      logDeepAnalysisFailure({
        reportType: ctx.reportType,
        failStage: deepAnalysisResult.provider ? "parse_null" : "call_null",
        stopReason: deepAnalysisResult.stopReason,
        provider: deepAnalysisResult.provider,
        raw: deepAnalysisResult.raw,
      });
      mark("section-depth", null, false, "llm_failed");
    }
  }

  const [oppResult, riskResult, roadmapResult] = await Promise.all([
    generateOpportunities(ctx, narrative),
    generateRisks(ctx, narrative),
    generateRoadmap(ctx, narrative),
  ]);

  if (oppResult.value?.length) {
    structured.opportunities = oppResult.value;
    interpretation.opportunities = oppResult.value;
    mark("section-opportunity", oppResult.provider, true);
  } else {
    mark("section-opportunity", null, false, "llm_failed");
  }

  if (riskResult.value?.length) {
    structured.risks = riskResult.value;
    interpretation.risks = riskResult.value;
    mark("section-risk", riskResult.provider, true);
  } else {
    mark("section-risk", null, false, "llm_failed");
  }

  if (roadmapResult.roadmap?.length) {
    structured.roadmap = roadmapResult.roadmap;
    interpretation.roadmap = roadmapResult.roadmap;
    mark("section-roadmap", roadmapResult.provider, true);
  } else {
    mark("section-roadmap", null, false, "llm_failed");
  }
  if (roadmapResult.decisionMoments?.length) {
    structured.decisionMoments = roadmapResult.decisionMoments;
    interpretation.decisionMoments = roadmapResult.decisionMoments;
  }

  meta["section-cover"] = { source: "template" };

  const prophecyResult = await generateProphecyBundle(ctx, narrative);
  if (prophecyResult.prophecy) {
    structured.prophecy = prophecyResult.prophecy;
    interpretation.prophecy = prophecyResult.prophecy;
    mark("section-prophecy", prophecyResult.provider, true);
  } else {
    mark("section-prophecy", null, false, "llm_failed");
  }
  if (prophecyResult.cohortInsight?.body) {
    structured.cohortInsight = prophecyResult.cohortInsight;
    interpretation.cohortInsight = prophecyResult.cohortInsight;
    mark(
      "section-cohort-insight",
      prophecyResult.cohortInsightProvider ?? prophecyResult.provider,
      true
    );
  } else {
    console.error("[COHORT_INSIGHT_FALLBACK]", {
      callKind: "cohortInsight",
      reason: "parse_failed_or_empty",
      reportType: ctx.reportType,
      prophecyParsed: Boolean(prophecyResult.prophecy),
      provider: prophecyResult.provider ?? null,
      retried: prophecyResult.cohortRetried,
    });
    structured.cohortInsight = generateCohortInsight(
      ctx.saju,
      ctx.locale,
      ctx.reportType
    );
    mark("section-cohort-insight", null, false, "parse_failed_or_empty");
  }

  return { structured, interpretation, meta, primaryProvider };
}
