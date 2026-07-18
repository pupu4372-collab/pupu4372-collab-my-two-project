import { computeBasicSaju } from "@/lib/saju/engine";
import { formatDayPillarAddress } from "@/lib/saju/elements";
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
import { runWithHanjaSanitizeLocale } from "@/lib/saju/llm/slot-output-sanitize-server";
import { resolveSolarBirthDate } from "./birth-basis";
import { buildHumanPremiumFacts } from "./facts";
import { kstDateParts } from "./issue-calendar";
import { buildLuckyKeywords } from "./lucky-keywords";
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
  return formatDayPillarAddress(saju.pillars.day.pillar, locale);
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
      solarBirthDate,
    }
  );

  const mapping = computeHumanSajuMappingFromPremiumBirth({
    birthDate: solarBirthDate,
    birthTime: input.birthTime,
    birthTimeUnknown: input.birthTimeUnknown,
    gender: input.gender ?? payload.birthBasis.gender ?? null,
    locale: input.locale,
  });

  const { year: currentYear } = kstDateParts();
  const luckyKeywords = buildLuckyKeywords(saju, input.locale);
  console.info("[LUCKY_KEYWORDS_INJECT]", {
    reportType: payload.reportType,
    shortCard: luckyKeywords.shortCard,
    yongsinKey: luckyKeywords.yongsinKey,
  });

  const ctx: PremiumLlmContext = {
    mapping,
    saju,
    facts,
    locale: input.locale,
    reportType: payload.reportType,
    promptProduct: payload.reportType,
    deliveryMode: input.deliveryMode,
    analysisMode: payload.analysisMode,
    dayPillarLabel: dayPillarLabel(saju, input.locale),
    solarBirthDate,
    birthTime: input.birthTime,
    birthTimeUnknown: input.birthTimeUnknown,
    gender: input.gender ?? payload.birthBasis.gender ?? null,
    currentYear,
    luckyKeywords,
  };

  const llmMeta: HumanPremiumLlmMeta = {
    enabled: true,
    sections: {},
  };

  try {
    const { interpretation, meta } = await runWithHanjaSanitizeLocale(
      input.locale,
      () => buildHumanPremiumStructuredWithLlm(ctx)
    );

    applyHumanInterpretationToPremiumReport(payload, interpretation);

    Object.assign(llmMeta.sections, meta);
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
