/**
 * Verify prophecy full-first UI mapping across report types.
 * Usage: LLM_CACHE=0 npx tsx scripts/test-prophecy-full-ui.ts
 */
import { config } from "dotenv";

config({ path: ".env.local" });

import { buildHumanPremiumReportHybrid } from "../src/lib/reports/human-premium/hybrid";
import type { ReportType } from "../src/lib/reports/human-premium/types";

const baseInput = {
  personName: "테스트",
  email: "",
  birthDate: "1990-05-15",
  birthTime: "14:30",
  birthTimeUnknown: false,
  timezone: "Asia/Seoul",
  calendarType: "solar" as const,
  locale: "ko" as const,
  privacyConsent: true,
  gender: "male" as const,
};

const types: ReportType[] = ["daily", "lifetime", "yearly"];

function sealedText(short?: string, full?: string) {
  return full ?? short ?? "";
}

async function main() {
  for (const reportType of types) {
    const report = await buildHumanPremiumReportHybrid({ ...baseInput, reportType });
    const { short, full } = report.structured.prophecy;
    const sealed = sealedText(short, full);
    console.log(`\n=== ${reportType} ===`);
    console.log("short:", short?.slice(0, 80));
    console.log("full:", full?.slice(0, 120));
    console.log("sealed (UI):", sealed.slice(0, 120));
    console.log("uses full:", Boolean(full && sealed === full));
    console.log("prophecy source:", report.llm?.sections["section-prophecy"]?.source);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
