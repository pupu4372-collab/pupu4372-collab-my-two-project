import type { HumanSajuMapping } from "@/lib/saju/human-trait-mapping";
import type { PetSajuMapping } from "@/lib/saju/pet-trait-mapping";
import type { Locale } from "@/lib/saju/types";

export type InterpretationTier = "pet" | "human";
export type LlmProviderName = "claude" | "openai";

export interface PetInterpretationJson {
  characterIntro: string;
  personality: string;
  healthNote: string;
  compatibility: string;
}

export interface HumanInterpretationJson {
  personality: string;
  tenGodAnalysis: string;
  daewoonOutlook: string;
}

export type InterpretSajuInput =
  | {
      tier: "pet";
      mapping: PetSajuMapping;
      locale: Locale;
      petName?: string;
    }
  | {
      tier: "human";
      mapping: HumanSajuMapping;
      locale: Locale;
      subjectName?: string;
    };

export type InterpretSajuResult =
  | { tier: "pet"; provider: LlmProviderName; data: PetInterpretationJson }
  | { tier: "human"; provider: LlmProviderName; data: HumanInterpretationJson };

export interface LlmPromptPair {
  system: string;
  user: string;
}

export class SajuInterpretationError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown
  ) {
    super(message);
    this.name = "SajuInterpretationError";
  }
}

export function isPetInterpretationJson(value: unknown): value is PetInterpretationJson {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<PetInterpretationJson>;
  return (
    typeof v.characterIntro === "string" &&
    v.characterIntro.trim().length > 0 &&
    typeof v.personality === "string" &&
    v.personality.trim().length > 0 &&
    typeof v.healthNote === "string" &&
    v.healthNote.trim().length > 0 &&
    typeof v.compatibility === "string" &&
    v.compatibility.trim().length > 0
  );
}

export function isHumanInterpretationJson(value: unknown): value is HumanInterpretationJson {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<HumanInterpretationJson>;
  return (
    typeof v.personality === "string" &&
    v.personality.trim().length > 0 &&
    typeof v.tenGodAnalysis === "string" &&
    v.tenGodAnalysis.trim().length > 0 &&
    typeof v.daewoonOutlook === "string" &&
    v.daewoonOutlook.trim().length > 0
  );
}
