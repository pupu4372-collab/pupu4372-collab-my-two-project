import type { HumanPremiumFactsBlock } from "@/lib/reports/human-premium/facts";
import type {
  HumanPremiumLlmSectionMeta,
  HumanPremiumReportStructured,
  ReportCohortInsight,
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
  buildOpportunitiesPrompts,
  buildProphecyPrompts,
  buildRisksPrompts,
  buildRoadmapPrompts,
  buildSajuStructurePrompts,
  type PremiumPromptContext,
} from "./prompts/human-prompt";
import {
  callClaudeJsonParsed,
  isClaudeEnabled,
} from "./providers/claude-provider";
import {
  callOpenAiJsonParsed,
  isOpenAiEnabled,
} from "./providers/openai-provider";
import {
  parseCohortInsight,
  parseDeepAnalysis,
  parseDecisionMoments,
  parseOpportunities,
  parseProphecy,
  parseRisks,
  parseRoadmap,
  parseSajuStructure,
} from "./human-interpretation-parse";
import type { HumanInterpretationJson, LlmPromptPair } from "./types";

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
): Promise<unknown> {
  if (provider === "claude") return callClaudeJsonParsed(prompts, maxTokens);
  if (provider === "openai") return callOpenAiJsonParsed(prompts, maxTokens);
  return callGeminiJsonParsed(prompts, maxTokens);
}

function providerOrder(): PremiumLlmProvider[] {
  const order: PremiumLlmProvider[] = [];
  if (isClaudeEnabled()) order.push("claude");
  if (isOpenAiEnabled()) order.push("openai");
  if (isGeminiEnabled()) order.push("gemini");
  return order;
}

async function callPremiumJsonCached(options: {
  callKind: string;
  ctx: PremiumLlmContext;
  prompts: LlmPromptPair;
  maxTokens: number;
  narrative?: string;
}): Promise<{ data: unknown; provider: PremiumLlmProvider } | null> {
  const providers = providerOrder();
  if (!providers.length) return null;

  for (const provider of providers) {
    const model =
      provider === "gemini" ? resolveGeminiModel() : resolveProviderModel(provider);
    const cacheKey = buildHumanPremiumCallCacheKey({
      callKind: options.callKind,
      reportType: options.ctx.reportType,
      locale: options.ctx.locale,
      analysisMode: options.ctx.analysisMode,
      mapping: options.ctx.mapping,
      model,
      provider,
      narrative: options.narrative,
    });

    const cached = await getCachedPremiumCallResult(cacheKey);
    if (cached) {
      return { data: cached.data, provider: cached.provider as PremiumLlmProvider };
    }

    const inFlight = getPremiumCallInFlight(cacheKey);
    if (inFlight) {
      const result = await inFlight;
      if (result) {
        return { data: result.data, provider: result.provider as PremiumLlmProvider };
      }
      continue;
    }

    const promise = (async () => {
      try {
        const data = await callProviderJson(provider, options.prompts, options.maxTokens);
        const result = { data, provider };
        await setCachedPremiumCallResult(
          cacheKey,
          options.ctx.locale,
          provider,
          model,
          result
        );
        return result;
      } catch {
        return null;
      }
    })().finally(() => {
      clearPremiumCallInFlight(cacheKey);
    });

    setPremiumCallInFlight(cacheKey, promise);
    const result = await promise;
    if (result) return result;
  }

  return null;
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
    maxTokens: 2000,
  });
  if (!result) return { value: null, provider: null };
  return { value: parseDeepAnalysis(result.data), provider: result.provider };
}

async function generateOpportunities(ctx: PremiumLlmContext, narrative: string) {
  const result = await callPremiumJsonCached({
    callKind: "opportunities",
    ctx,
    prompts: buildOpportunitiesPrompts(ctx, narrative),
    maxTokens: 1500,
    narrative,
  });
  if (!result) return { value: null, provider: null };
  return { value: parseOpportunities(result.data), provider: result.provider };
}

async function generateRisks(ctx: PremiumLlmContext, narrative: string) {
  const result = await callPremiumJsonCached({
    callKind: "risks",
    ctx,
    prompts: buildRisksPrompts(ctx, narrative),
    maxTokens: 1500,
    narrative,
  });
  if (!result) return { value: null, provider: null };
  return { value: parseRisks(result.data), provider: result.provider };
}

async function generateRoadmap(ctx: PremiumLlmContext, narrative: string) {
  const result = await callPremiumJsonCached({
    callKind: "roadmap",
    ctx,
    prompts: buildRoadmapPrompts(ctx, narrative),
    maxTokens: 1500,
    narrative,
  });
  if (!result) return { roadmap: null, decisionMoments: null, provider: null };
  return {
    roadmap: parseRoadmap(result.data),
    decisionMoments: parseDecisionMoments(result.data),
    provider: result.provider,
  };
}

async function generateProphecyBundle(ctx: PremiumLlmContext, narrative: string) {
  const result = await callPremiumJsonCached({
    callKind: "prophecy",
    ctx,
    prompts: buildProphecyPrompts(ctx, narrative),
    maxTokens: 1000,
    narrative,
  });
  if (!result) return { prophecy: null, cohortInsight: null, provider: null };
  return {
    prophecy: parseProphecy(result.data, ctx.reportType),
    cohortInsight: parseCohortInsight(result.data),
    provider: result.provider,
  };
}

async function runParallelOrSequential<T extends unknown[]>(
  tasks: { [K in keyof T]: () => Promise<T[K]> }
): Promise<T> {
  try {
    const results = await Promise.all(tasks.map((task) => task()));
    return results as T;
  } catch {
    const results: unknown[] = [];
    for (const task of tasks) {
      results.push(await task());
    }
    return results as T;
  }
}

function generateScores(saju: SajuBasicResponse, locale: Locale): ReportScore[] {
  return buildHumanPremiumStructured(saju, locale, "lifetime").scores;
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
    scores: generateScores(ctx.saju, ctx.locale),
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

  const narrativeResult = await generateMasterNarrative(ctx);
  const narrative = narrativeResult.value ?? "";
  if (narrativeResult.value) {
    interpretation.deepAnalysis = narrativeResult.value;
    mark("section-depth", narrativeResult.provider, true);
  } else {
    mark("section-depth", null, false, "llm_failed");
  }

  const [oppResult, riskResult, roadmapResult] = await runParallelOrSequential([
    () => generateOpportunities(ctx, narrative),
    () => generateRisks(ctx, narrative),
    () => generateRoadmap(ctx, narrative),
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

  interpretation.scores = structured.scores;
  meta["section-metrics"] = { source: "template" };
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
  } else {
    structured.cohortInsight = generateCohortInsight(
      ctx.saju,
      ctx.locale,
      ctx.reportType
    );
  }

  return { structured, interpretation, meta, primaryProvider };
}
