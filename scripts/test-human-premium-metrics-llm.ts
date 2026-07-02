/**
 * Smoke test: No.06 daily scores from LLM vs No.01 yearly template fallback.
 * Run: npx tsx scripts/test-human-premium-metrics-llm.ts
 */
import { config } from "dotenv";
import { computeBasicSaju } from "../src/lib/saju/engine";
import { buildHumanPremiumFacts } from "../src/lib/reports/human-premium/facts";
import { resolveSolarBirthDate } from "../src/lib/reports/human-premium/birth-basis";
import { computeHumanSajuMappingFromPremiumBirth } from "../src/lib/saju/ksaju-adapter";
import {
  buildHumanPremiumStructuredWithLlm,
  isHumanPremiumOrchestratorEnabled,
} from "../src/lib/saju/llm/human-premium-orchestrator";
import type { ReportType } from "../src/lib/reports/human-premium/types";

config({ path: ".env.local" });
config({ path: ".env" });

const baseInput = {
  personName: "테스트",
  email: "test@example.com",
  birthDate: "1990-05-15",
  birthTime: "14:30",
  birthTimeUnknown: false,
  timezone: "Asia/Seoul",
  calendarType: "solar" as const,
  locale: "ko" as const,
  privacyConsent: true,
  gender: "male" as const,
};

async function runCase(reportType: ReportType) {
  const solarBirthDate = resolveSolarBirthDate(baseInput);
  const saju = computeBasicSaju({
    petName: baseInput.personName,
    species: "other",
    birthDate: solarBirthDate,
    birthTime: baseInput.birthTime,
    birthTimeUnknown: baseInput.birthTimeUnknown,
    timezone: baseInput.timezone,
    locale: baseInput.locale,
    privacyConsent: true,
    petGender: baseInput.gender,
  });

  const facts = buildHumanPremiumFacts(
    saju,
    "four_pillars",
    baseInput.personName,
    baseInput.locale,
    { timezone: baseInput.timezone, gender: baseInput.gender }
  );

  const mapping = computeHumanSajuMappingFromPremiumBirth({
    birthDate: solarBirthDate,
    birthTime: baseInput.birthTime,
    birthTimeUnknown: baseInput.birthTimeUnknown,
    gender: baseInput.gender,
    locale: baseInput.locale,
  });

  const day = saju.pillars.day;
  const dayPillarLabel = `${day.pillar} 일주`;

  const result = await buildHumanPremiumStructuredWithLlm({
    mapping,
    saju,
    facts,
    locale: baseInput.locale,
    reportType,
    promptProduct: reportType,
    analysisMode: "four_pillars",
    dayPillarLabel,
    solarBirthDate,
    birthTime: baseInput.birthTime,
    birthTimeUnknown: baseInput.birthTimeUnknown,
    gender: baseInput.gender,
  });

  const metricsSource = result.meta["section-metrics"]?.source;
  const labels = result.structured.scores.map((s) => s.label);
  const sampleDesc = result.structured.scores[0]?.description.slice(0, 60);

  console.log(`\n=== ${reportType} ===`);
  console.log("section-metrics source:", metricsSource);
  console.log("score labels:", labels.join(" | "));
  console.log("first description:", sampleDesc);

  return { reportType, metricsSource, labels };
}

async function main() {
  if (!isHumanPremiumOrchestratorEnabled()) {
    console.log("SKIP: LLM orchestrator not enabled (no API keys). Parser unit tests still apply.");
    process.exit(0);
  }

  const daily = await runCase("daily");
  const yearly = await runCase("yearly");

  const dailyOk =
    daily.metricsSource !== "template" &&
    daily.labels.includes("현재운세강도") &&
    !daily.labels.includes("재물운");
  const yearlyOk =
    yearly.metricsSource === "template" &&
    yearly.labels.includes("재물운") &&
    !yearly.labels.includes("현재운세강도");

  console.log("\n--- assertions ---");
  console.log(dailyOk ? "OK No.06 daily LLM scores" : "FAIL No.06 daily LLM scores");
  console.log(yearlyOk ? "OK yearly template fallback" : "FAIL yearly template fallback");

  if (!dailyOk || !yearlyOk) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
