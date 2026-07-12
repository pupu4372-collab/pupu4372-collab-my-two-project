/**
 * Verify current daewoon index for sample births (KST today).
 * Run: npx tsx scripts/verify-daewoon-current-index.ts
 */
import { buildHumanPremiumFacts, formatFactsBlockForPrompt } from "../src/lib/reports/human-premium/facts";
import {
  computeManAge,
  findCurrentDaewoonIndex,
  pickCurrentAndUpcomingCycles,
  pickCurrentAndUpcomingDaewoon,
} from "../src/lib/saju/daewoon-current";
import { computeBasicSaju } from "../src/lib/saju/engine";
import { calculateSaju } from "../src/lib/saju/ksaju-engine";
import { computeDaewoonCandidates } from "../src/lib/saju/luck-pillars";

function runCase(label: string, birthDate: string, gender: "male" | "female") {
  const saju = computeBasicSaju({
    petName: "t",
    species: "other",
    birthDate,
    birthTime: "12:00",
    birthTimeUnknown: false,
    timezone: "Asia/Seoul",
    locale: "ko",
    privacyConsent: true,
    petGender: gender,
  });

  const age = computeManAge(birthDate);
  const by = Number(birthDate.slice(0, 4));
  const dw = computeDaewoonCandidates({
    birthUtc: saju.birthUtc,
    yearStem: saju.pillars.year.stemHanja,
    monthPillar: saju.pillars.month,
    dayStem: saju.pillars.day.stemHanja,
    locale: "ko",
    gender,
  });
  const cycles = dw[0]?.cycles ?? [];
  const idx = findCurrentDaewoonIndex(cycles, age);
  const cur = idx >= 0 ? cycles[idx] : null;
  const picked = pickCurrentAndUpcomingCycles(cycles, age, 3);
  const yearRange = cur
    ? `${by + cur.startAge}~${by + cur.endAge}`
    : "n/a";
  const ageRange = cur ? `${cur.startAge}~${cur.endAge}` : "n/a";

  console.log(`\n[${label}] age=${age} startAge=${dw[0]?.startAge} dir=${dw[0]?.directionLabel}`);
  console.log(`  current idx=${idx} → ${ageRange}세 (${yearRange})`);
  console.log(
    `  pick[0]=${picked[0]?.startAge}~${picked[0]?.endAge} pick[1]=${picked[1]?.startAge}~${picked[1]?.endAge}`
  );

  const [y, m, d] = birthDate.split("-").map(Number);
  const engine = calculateSaju({
    year: y,
    month: m,
    day: d,
    hour: 12,
    minute: 0,
    gender: gender === "female" ? "F" : "M",
  });
  const engPick = pickCurrentAndUpcomingDaewoon(engine.daewoon.list);
  console.log(
    `  engine pick[0]: startYear=${engPick[0]?.startYear} startAge=${engPick[0]?.startAge}`
  );

  const facts = buildHumanPremiumFacts(saju, "four_pillars", "Tester", "ko", {
    gender,
    solarBirthDate: birthDate,
    timezone: "Asia/Seoul",
  });
  const starLine = formatFactsBlockForPrompt(facts)
    .split("\n")
    .find((l) => l.includes("★현재 대운"));
  console.log(`  facts: ${starLine?.trim() ?? "MISSING ★현재"}`);

  return { age, idx, ageRange, yearRange, pick0: picked[0], starLine };
}

const female1982 = runCase("1982-09-09 female", "1982-09-09", "female");
const male1982 = runCase("1982-09-09 male", "1982-09-09", "male");
runCase("2000-01-15 male", "2000-01-15", "male");
runCase("1970-03-01 female", "1970-03-01", "female");

const expectFemale = female1982.ageRange === "41~50" && female1982.yearRange === "2023~2032";
const expectPickNotFirst =
  female1982.pick0 != null &&
  female1982.pick0.startAge === 41 &&
  (female1982.starLine?.includes("41~50") ?? false);

console.log("\n=== ASSERT ===");
console.log(
  expectFemale && expectPickNotFirst
    ? "PASS: 1982 female current = 41~50 / 2023~2032"
    : `FAIL: got ageRange=${female1982.ageRange} years=${female1982.yearRange} star=${female1982.starLine}`
);
console.log(
  `1982 male current = ${male1982.ageRange} (${male1982.yearRange}) idx=${male1982.idx}`
);

if (!(expectFemale && expectPickNotFirst)) process.exit(1);
