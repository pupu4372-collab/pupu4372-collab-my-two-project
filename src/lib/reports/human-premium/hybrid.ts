import { computeBasicSaju } from "@/lib/saju/engine";
import {
  applyHumanInterpretationToPremiumReport,
  HUMAN_INTERPRET_SECTION_IDS,
} from "@/lib/saju/llm/apply-human-to-premium";
import { interpretSaju, isSajuInterpretLlmEnabled } from "@/lib/saju/llm/interpret";
import { computeHumanSajuMappingFromPremiumBirth } from "@/lib/saju/ksaju-adapter";
import { resolveSolarBirthDate } from "./birth-basis";
import { buildHumanPremiumFacts } from "./facts";
import { FORTUNE_MONTHS } from "./luck-narratives";
import { buildHumanPremiumReport } from "./generator";
import {
  generateHumanPremiumSectionBody,
  isGeminiHumanPremiumEnabled,
  isHumanPremiumLlmEnabled,
} from "./llm";
import { HUMAN_PREMIUM_LLM_SECTIONS } from "./prompts";
import { findSectionBody, patchSectionBody } from "./section-patch";
import type {
  HumanPremiumLlmMeta,
  HumanPremiumReportInput,
  HumanPremiumReportPayload,
} from "./types";

const INTERPRET_SECTION_SET = new Set<string>(HUMAN_INTERPRET_SECTION_IDS);

export async function buildHumanPremiumReportHybrid(
  input: HumanPremiumReportInput
): Promise<HumanPremiumReportPayload> {
  const payload = buildHumanPremiumReport(input);

  if (!isHumanPremiumLlmEnabled()) {
    return payload;
  }

  const solarBirthDate = resolveSolarBirthDate(input);
  const saju = computeBasicSaju({
    petName: input.personName.trim(),
    species: "other",
    birthDate: solarBirthDate,
    birthTime: input.birthTime,
    birthTimeUnknown: input.birthTimeUnknown,
    timezone: input.timezone,
    locale: input.locale,
    privacyConsent: input.privacyConsent,
    petGender: input.gender ?? null,
  });

  const facts = buildHumanPremiumFacts(
    saju,
    payload.analysisMode,
    input.personName,
    input.locale,
    {
      timezone: input.timezone,
      fortuneYear: new Date().getFullYear(),
      fortuneMonths: FORTUNE_MONTHS,
      gender: input.gender ?? payload.birthBasis.gender ?? null,
    }
  );

  const llmMeta: HumanPremiumLlmMeta = {
    enabled: true,
    sections: {},
  };

  const filledSections = new Set<string>();

  if (isSajuInterpretLlmEnabled()) {
    try {
      const mapping = computeHumanSajuMappingFromPremiumBirth({
        birthDate: solarBirthDate,
        birthTime: input.birthTime,
        birthTimeUnknown: input.birthTimeUnknown,
        gender: input.gender ?? payload.birthBasis.gender ?? null,
        locale: input.locale,
      });
      const interpretation = await interpretSaju({
        tier: "human",
        mapping,
        locale: input.locale,
        subjectName: input.personName.trim(),
      });
      if (interpretation.tier === "human") {
        const applied = applyHumanInterpretationToPremiumReport(
          payload,
          interpretation.data,
          interpretation.provider
        );
        Object.assign(llmMeta.sections, applied);
        for (const sectionId of Object.keys(applied)) {
          filledSections.add(sectionId);
        }
      }
    } catch (error) {
      for (const sectionId of HUMAN_INTERPRET_SECTION_IDS) {
        llmMeta.sections[sectionId] = {
          source: "template",
          error: error instanceof Error ? error.message : "interpret_saju_failed",
        };
      }
    }
  }

  const geminiEnabled = isGeminiHumanPremiumEnabled();

  for (const config of HUMAN_PREMIUM_LLM_SECTIONS) {
    if (filledSections.has(config.sectionId)) continue;

    const templateBody = findSectionBody(payload, config.sectionId);
    if (!templateBody) continue;

    if (!geminiEnabled) {
      llmMeta.sections[config.sectionId] = { source: "template" };
      continue;
    }

    try {
      const body = await generateHumanPremiumSectionBody({
        sectionKey: config.key,
        facts,
        locale: input.locale,
        targetChars: config.targetChars[input.locale],
        minChars: config.minChars[input.locale],
        month: config.month,
      });

      if (body) {
        patchSectionBody(payload, config.sectionId, body);
        llmMeta.sections[config.sectionId] = { source: "gemini" };
      } else {
        llmMeta.sections[config.sectionId] = {
          source: "template",
          error: "empty_or_short_response",
        };
      }
    } catch (error) {
      llmMeta.sections[config.sectionId] = {
        source: "template",
        error: error instanceof Error ? error.message : "llm_failed",
      };
    }
  }

  payload.llm = llmMeta;
  return payload;
}
