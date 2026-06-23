import { computeBasicSaju } from "@/lib/saju/engine";
import {
  applyHumanInterpretationToPremiumReport,
  HUMAN_INTERPRET_SECTION_IDS,
} from "@/lib/saju/llm/apply-human-to-premium";
import {
  buildHumanPremiumStructuredWithLlm,
  isHumanPremiumOrchestratorEnabled,
  type PremiumLlmContext,
} from "@/lib/saju/llm/human-premium-orchestrator";
import { computeHumanSajuMappingFromPremiumBirth } from "@/lib/saju/ksaju-adapter";
import { resolveSolarBirthDate } from "./birth-basis";
import { buildHumanPremiumFacts } from "./facts";
import { FORTUNE_MONTHS } from "./luck-narratives";
import { buildHumanPremiumReport } from "./generator";
import type {
  HumanPremiumLlmMeta,
  HumanPremiumReportInput,
  HumanPremiumReportPayload,
} from "./types";

function dayPillarLabel(
  saju: ReturnType<typeof computeBasicSaju>,
  locale: HumanPremiumReportInput["locale"]
): string {
  const day = saju.pillars.day;
  return locale === "ko" ? `${day.pillar} 일주` : `${day.pillar} day pillar`;
}

export async function buildHumanPremiumReportHybrid(
  input: HumanPremiumReportInput
): Promise<HumanPremiumReportPayload> {
  const payload = buildHumanPremiumReport(input);

  if (!isHumanPremiumOrchestratorEnabled()) {
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

  const mapping = computeHumanSajuMappingFromPremiumBirth({
    birthDate: solarBirthDate,
    birthTime: input.birthTime,
    birthTimeUnknown: input.birthTimeUnknown,
    gender: input.gender ?? payload.birthBasis.gender ?? null,
    locale: input.locale,
  });

  const ctx: PremiumLlmContext = {
    mapping,
    saju,
    facts,
    locale: input.locale,
    reportType: payload.reportType,
    analysisMode: payload.analysisMode,
    dayPillarLabel: dayPillarLabel(saju, input.locale),
  };

  const llmMeta: HumanPremiumLlmMeta = {
    enabled: true,
    sections: {},
  };

  try {
    const { interpretation, meta, primaryProvider } =
      await buildHumanPremiumStructuredWithLlm(ctx);

    const applied = applyHumanInterpretationToPremiumReport(
      payload,
      interpretation,
      primaryProvider ?? "template"
    );

    Object.assign(llmMeta.sections, meta, applied);
  } catch (error) {
    for (const sectionId of HUMAN_INTERPRET_SECTION_IDS) {
      llmMeta.sections[sectionId] = {
        source: "template",
        error: error instanceof Error ? error.message : "orchestrator_failed",
      };
    }
  }

  payload.llm = llmMeta;
  return payload;
}
