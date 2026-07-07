import { createHash } from "node:crypto";
import type { HumanPremiumFactsBlock } from "@/lib/reports/human-premium/facts";
import type { HumanPremiumLlmSectionKey } from "@/lib/reports/human-premium/prompts";
import {
  DEFAULT_REPORT_TYPE,
  type ReportType,
} from "@/lib/reports/human-premium/types";
import type { HumanSajuMapping } from "@/lib/saju/human-trait-mapping";
import type { Locale } from "@/lib/saju/types";
import type { InterpretSajuInput, LlmProviderName } from "./types";

/** Bump when interpret prompts or mapping shape changes materially */
export const LLM_CACHE_PROMPT_VERSION = 1;

/** Bump when human premium section prompts change materially */
export const HUMAN_PREMIUM_PROMPT_VERSION = 19;

function stableStringify(value: unknown): string {
  return JSON.stringify(value, (_key, current) => {
    if (current && typeof current === "object" && !Array.isArray(current)) {
      const sorted: Record<string, unknown> = {};
      for (const key of Object.keys(current as Record<string, unknown>).sort()) {
        sorted[key] = (current as Record<string, unknown>)[key];
      }
      return sorted;
    }
    return current;
  });
}

function sha256Hex(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export function resolveProviderModel(provider: LlmProviderName): string {
  if (provider === "claude") {
    return process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-4-20250514";
  }
  return process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
}

export function resolveGeminiModel(): string {
  return process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
}

export function buildInterpretCacheKey(
  input: InterpretSajuInput,
  provider: LlmProviderName,
  model: string
): string {
  const context =
    input.tier === "pet"
      ? { petName: input.petName?.trim() ?? "" }
      : { subjectName: input.subjectName?.trim() ?? "" };

  return sha256Hex(
    stableStringify({
      v: LLM_CACHE_PROMPT_VERSION,
      tier: input.tier,
      locale: input.locale,
      provider,
      model,
      mapping: input.mapping,
      context,
    })
  );
}

export function buildHumanPremiumCallCacheKey(options: {
  callKind: string;
  reportType: ReportType;
  promptProduct?: string;
  locale: Locale;
  analysisMode: "three_pillars" | "four_pillars";
  mapping: HumanSajuMapping;
  model: string;
  provider: string;
  narrative?: string;
  reportInputFacet?: string | null;
}): string {
  return sha256Hex(
    stableStringify({
      v: HUMAN_PREMIUM_PROMPT_VERSION,
      callKind: options.callKind,
      reportType: options.reportType,
      promptProduct: options.promptProduct ?? options.reportType,
      locale: options.locale,
      analysisMode: options.analysisMode,
      provider: options.provider,
      model: options.model,
      narrativeHash: options.narrative
        ? sha256Hex(options.narrative.slice(0, 500))
        : null,
      reportInputFacet: options.reportInputFacet ?? null,
      mapping: {
        pillars: options.mapping.pillars,
        dayMaster: options.mapping.dayMaster,
        balanceScore: options.mapping.balanceScore,
        daewoonUpcoming: options.mapping.daewoonUpcoming,
      },
    })
  );
}

export function buildHumanPremiumSectionCacheKey(options: {
  sectionKey: HumanPremiumLlmSectionKey;
  locale: Locale;
  model: string;
  facts: HumanPremiumFactsBlock;
  month?: number;
  reportType?: ReportType;
}): string {
  return sha256Hex(
    stableStringify({
      v: HUMAN_PREMIUM_PROMPT_VERSION,
      reportType: options.reportType ?? DEFAULT_REPORT_TYPE,
      sectionKey: options.sectionKey,
      locale: options.locale,
      model: options.model,
      month: options.month ?? null,
      facts: {
        analysisMode: options.facts.analysisMode,
        ilganStem: options.facts.ilganStem,
        dominantElement: options.facts.dominantElement,
        elements: options.facts.elements,
        pillars: options.facts.pillars,
        sipseong: options.facts.sipseong,
        daewoon: options.facts.daewoon,
        shinsal: options.facts.shinsal,
        seun: options.facts.seun,
        monthlyLuck: options.facts.monthlyLuck,
      },
    })
  );
}
