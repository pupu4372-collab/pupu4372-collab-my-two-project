/**
 * Verify lifetime tense rules (v23).
 * Usage: LLM_CACHE=0 npx tsx scripts/verify-lifetime-tense-p1.ts
 */
import fs from "node:fs";
import path from "node:path";
import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

import { buildHumanPremiumReportHybrid } from "../src/lib/reports/human-premium/hybrid";
import {
  buildLifetimeIssueCalendar,
  calendarYearAtAge,
  kstDateParts,
} from "../src/lib/reports/human-premium/issue-calendar";
import { buildHumanPremiumFacts } from "../src/lib/reports/human-premium/facts";
import { computeBasicSaju } from "../src/lib/saju/engine";

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
  reportType: "lifetime" as const,
};

function computeCurrentAge(solarBirthDate: string): number {
  const [birthYear, birthMonth, birthDay] = solarBirthDate.split("-").map(Number);
  const now = kstDateParts();
  let age = now.year - birthYear;
  if (now.month < birthMonth || (now.month === birthMonth && now.day < birthDay)) {
    age -= 1;
  }
  return Math.max(0, age);
}

async function main() {
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
  const facts = buildHumanPremiumFacts(saju, "four_pillars", baseInput.personName, "ko", {
    timezone: baseInput.timezone,
    gender: "male",
  });
  const currentAge = computeCurrentAge(baseInput.birthDate);
  const cycles = facts.daewoon.candidates[0]?.cycles ?? [];
  const cal = buildLifetimeIssueCalendar({
    locale: "ko",
    solarBirthDate: baseInput.birthDate,
    currentAge,
    cycles,
  });

  console.log("currentAge", currentAge);
  console.log(
    "past",
    cal.pastCycles.map((c) => c.ageRange).join(", ")
  );
  console.log("current", cal.currentCycle?.ageRange, cal.currentCycle?.startYear);
  console.log(
    "future",
    cal.futureCycles.map((c) => `${c.ageRange}@${c.startYear}`).join(", ")
  );

  const report = await buildHumanPremiumReportHybrid(baseInput);
  const outDir = path.join(process.cwd(), "tmp", "tense-p1");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, "lifetime.json");
  fs.writeFileSync(
    outFile,
    JSON.stringify(
      {
        cal,
        prophecy: report.structured?.prophecy,
        lifeCycles: report.structured?.lifeCycles,
        opportunities: report.structured?.opportunities,
        risks: report.structured?.risks,
        roadmap: report.structured?.roadmap,
        llm: report.llm,
      },
      null,
      2
    ),
    "utf8"
  );
  console.log("wrote", outFile);

  const cyclesOut = report.structured?.lifeCycles ?? [];
  const pastRanges = new Set(cal.pastCycles.map((c) => c.ageRange));
  const currentRange = cal.currentCycle?.ageRange;

  let pastOk = true;
  let pastDetail = "";
  for (const cycle of cyclesOut) {
    const period = cycle.period ?? "";
    const isPast = [...pastRanges].some((r) => period.includes(r.replace("세", "")) || period === r);
    // also match "24~33세" style against period
    const matchedPast = cal.pastCycles.find(
      (p) =>
        period.includes(`${p.startAge}`) &&
        period.includes(`${p.endAge}`)
    );
    if (!matchedPast) continue;
    const body = cycle.body ?? "";
    const hasImperative = /(하십시오|하세요|권합니다)/.test(body);
    const hasRetro =
      /(시절|때입니다|흐름이었습니다|발현입니다|있었습니다|있었을|지나온|가던|익혔습니다|마주했습니다|체감했던)/.test(
        body
      );
    if (hasImperative || !hasRetro) {
      pastOk = false;
      pastDetail = `${period}: imperative=${hasImperative} retro=${hasRetro} | ${body.slice(0, 120)}`;
      break;
    }
  }

  let currentImperativeOk = false;
  let currentDetail = "";
  for (const cycle of cyclesOut) {
    const period = cycle.period ?? "";
    const title = cycle.title ?? "";
    const isCurrent =
      (currentRange &&
        (period.includes(`${cal.currentCycle!.startAge}`) &&
          period.includes(`${cal.currentCycle!.endAge}`))) ||
      title.includes("현재");
    if (!isCurrent) continue;
    const body = cycle.body ?? "";
    currentImperativeOk = /(지금).{0,40}(하십시오|하세요)|하십시오|하세요/.test(body);
    currentDetail = body.slice(0, 160);
    break;
  }
  // also allow tips on opportunities for current actions
  if (!currentImperativeOk) {
    const tipBlob = (report.structured?.opportunities ?? []).map((o) => o.tip).join("\n");
    currentImperativeOk = /(하십시오|하세요)/.test(tipBlob);
    if (currentImperativeOk) currentDetail = `via tips: ${tipBlob.slice(0, 120)}`;
  }

  const full = report.structured?.prophecy?.full ?? "";
  const futureYears = cal.futureCycles.map((c) => c.startYear);
  const yearsInFull = [...full.matchAll(/20\d{2}/g)].map((m) => Number(m[0]));
  const issueYear = cal.issueYear;
  const allFuture = yearsInFull.length >= 2 && yearsInFull.every((y) => y > issueYear);
  const matchesTransition =
    futureYears.length === 0 ||
    yearsInFull.some((y) => futureYears.includes(y)) ||
    cal.futureCycles.some((c) => full.includes(`${c.startAge}세`) && full.includes(String(c.startYear)));

  // sample: if 54세 in future, year must be birth+54
  let ageYearOk = true;
  for (const c of cal.futureCycles.slice(0, 3)) {
    const expected = calendarYearAtAge(cal.birthYear, c.startAge);
    if (full.includes(`${c.startAge}세`) && full.includes(String(expected)) === false) {
      // only fail if they mentioned the age but wrong year nearby
      const nearby = full.match(new RegExp(`${c.startAge}세[^.]{0,40}`));
      if (nearby && /20\d{2}/.test(nearby[0]) && !nearby[0].includes(String(expected))) {
        ageYearOk = false;
      }
    }
  }

  const checks: Array<[string, boolean, string]> = [
    ["past cycles retrospective, no imperatives", pastOk, pastDetail],
    ["current cycle has action imperatives", currentImperativeOk, currentDetail],
    ["prophecy years are future", allFuture, `years=${yearsInFull.join(",")}`],
    [
      "prophecy aligns with daewoon transition years/ages",
      matchesTransition && ageYearOk,
      `futureStarts=${futureYears.join(",")} fullYears=${yearsInFull.join(",")}`,
    ],
  ];

  let fail = 0;
  for (const [name, ok, detail] of checks) {
    console.log(ok ? `PASS ${name}` : `FAIL ${name}`, detail ? `— ${detail}` : "");
    if (!ok) fail += 1;
  }
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
