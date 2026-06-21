/**
 * luck-pillars + birth-basis smoke test (ksaju-engine calendar)
 * Run: npm run test:luck-pillars
 */
import { convertLunarYmdToSolar } from "@/lib/saju/ksaju-engine";
import {
  computeMonthLuckPillar,
  computeSeunNatalInteractions,
  computeSeunPillar,
} from "@/lib/saju/luck-pillars";
import { computeBasicSaju } from "@/lib/saju/engine";

let pass = 0;
let fail = 0;

function check(label: string, ok: boolean, detail?: string) {
  console.log(`${ok ? "✓" : "✗"} ${label}${detail ? ` — ${detail}` : ""}`);
  if (ok) pass++;
  else fail++;
}

const seun2024 = computeSeunPillar(2024);
check("세운 2024", seun2024.pillar === "甲辰", seun2024.pillar);

const monthJun = computeMonthLuckPillar(2024, 6, "Asia/Seoul");
check("월운 2024-06", monthJun.pillar === "庚午", monthJun.pillar);

const lunarSolar = convertLunarYmdToSolar(1971, 10, 6);
check("음력→양력 1971-10-06", lunarSolar === "1971-11-23", lunarSolar);

const saju = computeBasicSaju({
  petName: "나비",
  species: "cat",
  birthDate: "2022-06-15",
  birthTime: "14:00",
  birthTimeUnknown: false,
  timezone: "Asia/Seoul",
  locale: "ko",
  privacyConsent: true,
});
const interactions = computeSeunNatalInteractions(
  computeSeunPillar(2022).branchHanja,
  saju.pillars,
  "ko"
);
check("세운-원국 상호작용 배열", Array.isArray(interactions));

console.log(`\n--- Summary: ${pass} pass, ${fail} fail ---`);
process.exit(fail > 0 ? 1 : 0);
