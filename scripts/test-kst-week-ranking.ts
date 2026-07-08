import {
  getKstWeekEndUtc,
  getKstWeekStartUtc,
  isCreatedAtInKstWeek,
} from "../src/lib/time/kst-week";

/** Reference instant: Monday 2024-07-08 10:00 KST */
const REFERENCE_NOW = new Date("2024-07-08T10:00:00+09:00");

const sundayLate = new Date("2024-07-07T23:59:00+09:00");
const mondayEarly = new Date("2024-07-08T00:01:00+09:00");

console.log("=== KST week boundaries (reference: Mon 2024-07-08 10:00 KST) ===");
console.log("Current week start:", getKstWeekStartUtc(REFERENCE_NOW).toISOString());
console.log("Current week end:  ", getKstWeekEndUtc(REFERENCE_NOW).toISOString());
console.log("Last week start:   ", getKstWeekStartUtc(REFERENCE_NOW, 1).toISOString());
console.log("Last week end:     ", getKstWeekEndUtc(REFERENCE_NOW, 1).toISOString());

console.log("\n=== Sunday 23:59 vs Monday 00:01 (KST-UTC edge) ===");
console.log("Sun 2024-07-07 23:59 KST →", sundayLate.toISOString());
console.log("  in current week (w=0)?", isCreatedAtInKstWeek(sundayLate, REFERENCE_NOW, 0));
console.log("  in last week (w=1)?   ", isCreatedAtInKstWeek(sundayLate, REFERENCE_NOW, 1));

console.log("Mon 2024-07-08 00:01 KST →", mondayEarly.toISOString());
console.log("  in current week (w=0)?", isCreatedAtInKstWeek(mondayEarly, REFERENCE_NOW, 0));
console.log("  in last week (w=1)?   ", isCreatedAtInKstWeek(mondayEarly, REFERENCE_NOW, 1));

console.log("\n=== Fallback scenarios (display-only logic) ===");
console.log(
  "Case A — this week dog=0, last week dog>0: show last week rows + isLastWeekFallback.dog=true",
);
console.log(
  "Case B — this week dog=0, last week dog=0: keep empty + rankingEmptyDogWeek copy",
);
