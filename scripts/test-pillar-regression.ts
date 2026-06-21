/**
 * Verify computeBasicSaju (ksaju-engine) matches direct ksaju pillars.
 * Run: npm run test:pillar-regression
 *
 * Legacy lunisolar comparison (pre-migration, 4/10 pass):
 * - KST 일반 케이스: 일치
 * - 입춘·자시·해외 TZ: ksaju(절기·현지시)가 八字 기준에 더 맞음 → ksaju로 통일
 */
import { computeBasicSaju } from "@/lib/saju/engine";
import { computeKsajuFromRequest } from "@/lib/saju/ksaju-adapter";
import type { SajuBasicRequest } from "@/lib/saju/types";

type PillarKey = "year" | "month" | "day" | "hour";

const CASES: { label: string; request: SajuBasicRequest }[] = [
  {
    label: "뭉치 1971-10-06 00:30 KST",
    request: {
      petName: "뭉치",
      species: "dog",
      petGender: "male",
      birthDate: "1971-10-06",
      birthTime: "00:30",
      birthTimeUnknown: false,
      timezone: "Asia/Seoul",
      locale: "ko",
      privacyConsent: true,
    },
  },
  {
    label: "나비 2022-06-15 14:00 KST",
    request: {
      petName: "나비",
      species: "cat",
      petGender: "female",
      birthDate: "2022-06-15",
      birthTime: "14:00",
      birthTimeUnknown: false,
      timezone: "Asia/Seoul",
      locale: "ko",
      privacyConsent: true,
    },
  },
  {
    label: "도도 2023-03-03 09:00 KST",
    request: {
      petName: "도도",
      species: "other",
      petGender: "male",
      birthDate: "2023-03-03",
      birthTime: "09:00",
      birthTimeUnknown: false,
      timezone: "Asia/Seoul",
      locale: "ko",
      privacyConsent: true,
    },
  },
  {
    label: "시간 미상 (정오 12:00)",
    request: {
      petName: "미상",
      species: "dog",
      birthDate: "2020-01-15",
      birthTime: null,
      birthTimeUnknown: true,
      timezone: "Asia/Seoul",
      locale: "ko",
      privacyConsent: true,
    },
  },
  {
    label: "입춘 전 2024-02-03 23:30 KST",
    request: {
      petName: "입춘",
      species: "cat",
      birthDate: "2024-02-03",
      birthTime: "23:30",
      birthTimeUnknown: false,
      timezone: "Asia/Seoul",
      locale: "ko",
      privacyConsent: true,
    },
  },
  {
    label: "입춘 후 2024-02-04 12:00 KST",
    request: {
      petName: "입춘후",
      species: "cat",
      birthDate: "2024-02-04",
      birthTime: "12:00",
      birthTimeUnknown: false,
      timezone: "Asia/Seoul",
      locale: "ko",
      privacyConsent: true,
    },
  },
  {
    label: "자시 경계 2023-05-01 23:45 KST",
    request: {
      petName: "자시",
      species: "dog",
      birthDate: "2023-05-01",
      birthTime: "23:45",
      birthTimeUnknown: false,
      timezone: "Asia/Seoul",
      locale: "ko",
      privacyConsent: true,
    },
  },
  {
    label: "America/New_York 2019-07-04 08:00",
    request: {
      petName: "USpet",
      species: "dog",
      birthDate: "2019-07-04",
      birthTime: "08:00",
      birthTimeUnknown: false,
      timezone: "America/New_York",
      locale: "en",
      privacyConsent: true,
    },
  },
  {
    label: "America/Los_Angeles 2019-07-04 08:00",
    request: {
      petName: "USwest",
      species: "cat",
      birthDate: "2019-07-04",
      birthTime: "08:00",
      birthTimeUnknown: false,
      timezone: "America/Los_Angeles",
      locale: "en",
      privacyConsent: true,
    },
  },
  {
    label: "Europe/London 2018-12-31 23:30",
    request: {
      petName: "London",
      species: "dog",
      birthDate: "2018-12-31",
      birthTime: "23:30",
      birthTimeUnknown: false,
      timezone: "Europe/London",
      locale: "en",
      privacyConsent: true,
    },
  },
];

function pillarRows(
  basic: ReturnType<typeof computeBasicSaju>["pillars"],
  ksaju: ReturnType<typeof computeKsajuFromRequest>["pillars"],
  includeHour: boolean
): { key: PillarKey; basic: string; ksaju: string }[] {
  const keys: PillarKey[] = includeHour
    ? ["year", "month", "day", "hour"]
    : ["year", "month", "day"];
  const idx: Record<PillarKey, number> = { year: 0, month: 1, day: 2, hour: 3 };

  return keys.map((key) => ({
    key,
    basic: key === "hour" ? basic.hour?.pillar ?? "—" : basic[key].pillar,
    ksaju: ksaju[idx[key]].ganzi,
  }));
}

let pass = 0;
let fail = 0;

console.log("=== Pillar regression: computeBasicSaju vs ksaju-engine ===\n");

for (const { label, request } of CASES) {
  const basic = computeBasicSaju(request);
  const ksaju = computeKsajuFromRequest(request);
  const includeHour = !request.birthTimeUnknown;
  const rows = pillarRows(basic.pillars, ksaju.pillars, includeHour);
  const mismatches = rows.filter((r) => r.basic !== r.ksaju);
  const ok = mismatches.length === 0;

  if (ok) pass++;
  else fail++;

  console.log(`${ok ? "✓" : "✗"} ${label}`);
  for (const r of rows) {
    const mark = r.basic === r.ksaju ? " " : "!";
    console.log(`  ${mark} ${r.key}: ${r.basic}`);
  }
  console.log();
}

console.log(`--- Summary: ${pass} pass, ${fail} fail / ${CASES.length} cases ---`);
process.exit(fail > 0 ? 1 : 0);
