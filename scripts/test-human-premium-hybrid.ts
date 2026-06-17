import fs from "node:fs";
import path from "node:path";
import { config } from "dotenv";
import { buildHumanPremiumReportHybrid } from "../src/lib/reports/human-premium/hybrid";
import { isHumanPremiumLlmEnabled } from "../src/lib/reports/human-premium/llm";

config({ path: ".env.local" });
config({ path: ".env" });

async function main() {
  const input = {
    personName: "홍길동",
    email: "test@example.com",
    birthDate: "1990-05-15",
    birthTime: "14:30",
    birthTimeUnknown: false,
    timezone: "Asia/Seoul",
    calendarType: "solar" as const,
    locale: "ko" as const,
    privacyConsent: true,
  };

  console.log("LLM enabled:", isHumanPremiumLlmEnabled());
  console.log("Generating hybrid report…");

  const report = await buildHumanPremiumReportHybrid(input);

  const sectionIds = [
    "preface",
    "result-year-fortune",
    "result-temperament",
    "result-gyeokguk-yongsin",
    "result-wealth",
    "result-final-advice",
    "cycle-annual-seun",
    "cycle-month-1",
    "cycle-month-12",
  ] as const;
  for (const id of sectionIds) {
    for (const chapter of report.saju.chapters) {
      const section = chapter.sections.find((s) => s.id === id);
      if (section) {
        console.log(`\n--- ${id} (${section.body.length} chars) ---`);
        console.log(section.body.slice(0, 400) + (section.body.length > 400 ? "…" : ""));
      }
    }
  }

  console.log("\nLLM meta:", JSON.stringify(report.llm, null, 2));

  const outDir = path.join(process.cwd(), "tmp");
  const outFile = path.join(outDir, "human-premium-hybrid-sample.json");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2), "utf8");
  console.log(`\nWrote ${outFile}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
