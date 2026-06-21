/**
 * Human premium Ziwei chart smoke test
 * Run: npm run test:human-ziwei
 */
import { buildHumanPremiumReport } from "../src/lib/reports/human-premium/generator";

const report = buildHumanPremiumReport({
  personName: "홍길동",
  email: "test@example.com",
  birthDate: "1990-05-15",
  birthTime: "14:30",
  birthTimeUnknown: false,
  timezone: "Asia/Seoul",
  calendarType: "solar",
  locale: "ko",
  privacyConsent: true,
  gender: "male",
});

const ziweiChapter = report.saju.chapters.find((c) => c.id === "ziwei-chart");
if (!ziweiChapter) {
  console.error("Missing ziwei-chart chapter");
  process.exit(1);
}

console.log("ziwei chapter:", ziweiChapter.title);
console.log("sections:", ziweiChapter.sections.map((s) => s.id).join(", "));
console.log("bureau:", (report.saju.ziwei as { bureau?: string })?.bureau);
console.log(
  "life palace stars:",
  ziweiChapter.sections[0]?.bullets?.[0] ?? "(none)"
);
console.log("\n--- overview (first 300 chars) ---");
console.log(ziweiChapter.sections[0]?.body.slice(0, 300));

process.exit(0);
