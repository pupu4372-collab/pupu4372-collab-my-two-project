import fs from "node:fs";
import path from "node:path";
import { buildHumanPremiumReport } from "../src/lib/reports/human-premium/generator";
import { renderHumanPremiumReportPdf } from "../src/lib/reports/human-premium/pdf";

async function main() {
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
  });

  const pdf = await renderHumanPremiumReportPdf(report);
  const outDir = path.join(process.cwd(), "tmp");
  const outFile = path.join(outDir, "human-premium-sample.pdf");

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, pdf);

  console.log(`Wrote ${outFile} (${pdf.length} bytes)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
