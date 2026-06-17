import { computeBasicSaju } from "@/lib/saju/engine";
import { resolveSolarBirthDate } from "./birth-basis";
import { buildHumanPremiumFacts } from "./facts";
import { FORTUNE_MONTHS } from "./luck-narratives";
import { buildHumanPremiumReport } from "./generator";
import { generateHumanPremiumSectionBody, isHumanPremiumLlmEnabled } from "./llm";
import { HUMAN_PREMIUM_LLM_SECTIONS } from "./prompts";
import type {
  HumanPremiumLlmMeta,
  HumanPremiumReportInput,
  HumanPremiumReportPayload,
} from "./types";

function findSectionBody(
  payload: HumanPremiumReportPayload,
  sectionId: string
): string | null {
  for (const chapter of payload.saju.chapters) {
    const section = chapter.sections.find((s) => s.id === sectionId);
    if (section) return section.body;
  }
  for (const chapter of payload.zodiac.chapters) {
    const section = chapter.sections.find((s) => s.id === sectionId);
    if (section) return section.body;
  }
  return null;
}

function patchSectionBody(
  payload: HumanPremiumReportPayload,
  sectionId: string,
  body: string
): boolean {
  for (const chapter of payload.saju.chapters) {
    const section = chapter.sections.find((s) => s.id === sectionId);
    if (section) {
      section.body = body;
      return true;
    }
  }
  for (const chapter of payload.zodiac.chapters) {
    const section = chapter.sections.find((s) => s.id === sectionId);
    if (section) {
      section.body = body;
      return true;
    }
  }
  return false;
}

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

  for (const config of HUMAN_PREMIUM_LLM_SECTIONS) {
    const templateBody = findSectionBody(payload, config.sectionId);
    if (!templateBody) continue;

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
