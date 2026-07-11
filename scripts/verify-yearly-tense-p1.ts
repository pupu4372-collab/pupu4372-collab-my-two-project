/**
 * Verify yearly tense + lucky keywords + no internal scores / wrapper labels.
 * Usage: LLM_CACHE=0 npx tsx scripts/verify-yearly-tense-p1.ts
 */
import fs from "node:fs";
import path from "node:path";
import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

import { buildHumanPremiumReportHybrid } from "../src/lib/reports/human-premium/hybrid";
import {
  buildMonthlyIssueCalendar,
  buildYearlyIssueCalendar,
} from "../src/lib/reports/human-premium/issue-calendar";
import { buildLuckyKeywords } from "../src/lib/reports/human-premium/lucky-keywords";
import { computeBasicSaju } from "../src/lib/saju/engine";
import type { ReportType } from "../src/lib/reports/human-premium/types";

const baseInput = {
  personName: "검증집사",
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

function flattenText(report: Awaited<ReturnType<typeof buildHumanPremiumReportHybrid>>): string {
  const parts: string[] = [];
  for (const chapter of report.chapters ?? []) {
    for (const section of chapter.sections ?? []) {
      parts.push(section.title ?? "", section.subtitle ?? "", section.body ?? "");
    }
  }
  const s = report.structured;
  if (!s) return parts.join("\n");
  parts.push(s.sajuStructure ?? "", s.deepIntro ?? "", s.prophecy?.short ?? "", s.prophecy?.full ?? "");
  for (const d of s.domainScores ?? []) parts.push(d.domain, d.analysis);
  for (const o of s.opportunities ?? []) parts.push(o.title, o.body, o.tip);
  for (const r of s.risks ?? []) parts.push(r.title, r.body, r.countermeasure);
  for (const m of s.roadmap ?? []) parts.push(m.period, m.label, m.body);
  for (const dm of s.decisionMoments ?? []) parts.push(dm.situation, dm.script);
  for (const sec of s.deepSections ?? []) parts.push(sec.title, sec.body);
  return parts.join("\n");
}

async function run(reportType: ReportType) {
  const yearlyCal = buildYearlyIssueCalendar("ko");
  const monthlyCal = buildMonthlyIssueCalendar("ko");
  const saju = computeBasicSaju({
    petName: baseInput.personName,
    species: "other",
    birthDate: baseInput.birthDate,
    birthTime: baseInput.birthTime,
    birthTimeUnknown: false,
    timezone: baseInput.timezone,
    locale: "ko",
    privacyConsent: true,
    petGender: "male",
  });
  const lucky = buildLuckyKeywords(saju, "ko");

  console.log(`\n========== ${reportType} ==========`);
  if (reportType === "yearly") {
    console.log("issue:", yearlyCal.issueDateLabel);
    console.log("past:", yearlyCal.pastMonths.join(","));
    console.log("remaining:", yearlyCal.remainingMonths.join(","));
  } else {
    console.log("issue:", monthlyCal.issueDateLabel);
    console.log("remaining days:", monthlyCal.remainingDaysLabel);
  }
  console.log("lucky inject:", lucky.shortCard);

  const report = await buildHumanPremiumReportHybrid({ ...baseInput, reportType });
  const text = flattenText(report);
  const outDir = path.join(process.cwd(), "tmp", "tense-p1");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `${reportType}.json`);
  fs.writeFileSync(
    outFile,
    JSON.stringify(
      {
        issue: reportType === "yearly" ? yearlyCal : monthlyCal,
        luckyInject: lucky,
        prophecy: report.structured?.prophecy,
        luckyMonths: report.structured?.luckyDates,
        domainScores: report.structured?.domainScores,
        opportunities: report.structured?.opportunities,
        risks: report.structured?.risks,
        roadmap: report.structured?.roadmap,
        decisionMoments: report.structured?.decisionMoments,
        deepSections: report.structured?.deepSections,
        llm: report.llm,
      },
      null,
      2
    ),
    "utf8"
  );
  console.log("wrote", outFile);

  const checks: Array<[string, boolean, string]> = [];

  if (reportType === "yearly") {
    const pastMonths = yearlyCal.pastMonths;
    const rem = yearlyCal.remainingMonths;
    const luckyMonths = report.structured?.luckyDates ?? [];
    const goldenOk =
      luckyMonths.length === 0 ||
      luckyMonths.every((m) => {
        const num = Number(String(m).replace(/[^0-9]/g, ""));
        return rem.includes(num);
      });
    checks.push(["golden months from remaining", goldenOk, JSON.stringify(luckyMonths)]);

    const full = report.structured?.prophecy?.full ?? "";
    const hasNext = full.includes(String(yearlyCal.nextYear)) || full.includes("내년");
    const hasAfter = full.includes(String(yearlyCal.yearAfterNext)) || full.includes("내후년");
    checks.push(["prophecy Y+1/Y+2", hasNext && hasAfter, full.slice(0, 200)]);

    const short = report.structured?.prophecy?.short ?? "";
    checks.push(["prophecy.short == inject", short === lucky.shortCard, `got=${short}`]);

    // Imperatives tied to past months only (avoid matching 12월 as 2월)
    const earlyAction =
      /(?<![0-9])[1-6]월[^.\n]{0,40}(하십시오|하세요|권합니다)/.test(text) ||
      /이달 초반[^.\n]{0,20}(하십시오|하세요)/.test(text);
    checks.push(["no past-month imperatives (heuristic)", !earlyAction, ""]);

    const pastRetro =
      pastMonths.length === 0 ||
      /(흐름이었습니다|있었습니다|발현입니다|지나온)/.test(text);
    checks.push(["retro markers present", pastRetro, ""]);
  }

  if (reportType === "monthly") {
    const tipBlob = (report.structured?.opportunities ?? [])
      .map((o) => o.tip)
      .join("\n");
    const dayMentions = [...tipBlob.matchAll(/(?<![0-9])([1-9]|[12][0-9]|3[01])일/g)].map((m) =>
      Number(m[1])
    );
    const earlyDays = dayMentions.filter((d) => d < monthlyCal.issueDay);
    checks.push([
      "monthly tip days on/after issue",
      earlyDays.length === 0,
      earlyDays.length ? `early=${earlyDays.join(",")}` : tipBlob.slice(0, 200),
    ]);
    const short = report.structured?.prophecy?.short ?? "";
    checks.push(["prophecy.short == inject", short === lucky.shortCard, `got=${short}`]);
  }

  const internalScore = /균형\s*점수\s*\d+|balanceScore\s*[:=]?\s*\d+|오행\s*count\s*\d+/i.test(
    text
  );
  checks.push(["no internal raw scores", !internalScore, ""]);

  const wrapper = /핵심 섹션/.test(text) || (report.structured?.deepSections ?? []).some((s) =>
    /핵심 섹션/.test(s.title)
  );
  checks.push(["no 핵심 섹션 wrapper", !wrapper, ""]);

  let fail = 0;
  for (const [name, ok, detail] of checks) {
    console.log(ok ? `PASS ${name}` : `FAIL ${name}`, detail ? `— ${detail}` : "");
    if (!ok) fail += 1;
  }
  return fail;
}

async function main() {
  const only = process.env.VERIFY_ONLY?.trim();
  let fails = 0;
  if (only !== "monthly") {
    fails = await run("yearly");
  }
  if (fails === 0 && only !== "yearly") {
    fails += await run("monthly");
  } else if (fails > 0) {
    console.log("\nSkipping monthly until yearly passes.");
  }
  process.exit(fails > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
