/**
 * No.06 daily — cohortInsight LLM vs template over N runs (cache off).
 * Usage: LLM_CACHE=0 npx tsx scripts/test-cohort-insight-fallback.ts
 */
import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

import { buildHumanPremiumDailyRoutineReport } from "../src/lib/reports/human-premium/daily-routine";

const RUNS = 10;
const birthDates = [
  "1990-05-15",
  "1988-03-22",
  "1995-11-08",
  "1982-07-30",
  "1993-01-14",
  "1991-09-03",
  "1987-12-19",
  "1996-04-27",
  "1985-06-11",
  "1994-08-25",
];

async function main() {
  const results: Array<{
    run: number;
    cohortSource: string;
    prophecySource: string;
    cohortTemplateFingerprint: boolean;
    ms: number;
  }> = [];

  for (let i = 0; i < RUNS; i += 1) {
    const started = Date.now();
    const report = await buildHumanPremiumDailyRoutineReport({
      personName: "테스트",
      email: "",
      birthDate: birthDates[i] ?? birthDates[0]!,
      birthTime: "14:30",
      birthTimeUnknown: false,
      timezone: "Asia/Seoul",
      calendarType: "solar",
      locale: "ko",
      privacyConsent: true,
      gender: "male",
    });

    const body = report.structured.cohortInsight?.body ?? "";
    const ms = Date.now() - started;
    results.push({
      run: i + 1,
      cohortSource: report.llm?.sections["section-cohort-insight"]?.source ?? "missing",
      prophecySource: report.llm?.sections["section-prophecy"]?.source ?? "missing",
      cohortTemplateFingerprint: body.startsWith("COHORT INSIGHT ·"),
      ms,
    });
    console.log(`Run ${i + 1}:`, results[i]);
  }

  const fallbacks = results.filter((r) => r.cohortSource === "template").length;
  const avgMs = Math.round(results.reduce((sum, r) => sum + r.ms, 0) / results.length);
  console.log("\nSummary:", {
    runs: RUNS,
    cohortTemplateFallbacks: fallbacks,
    cohortLlmSuccess: RUNS - fallbacks,
    avgMs,
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
