import type { DaewoonCycle, DaewoonCandidate } from "@/lib/saju/luck-pillars";
import type { DaewoonItem } from "@/lib/saju/ksaju-engine/saju";

function kstNow(): { year: number; month: number; day: number } {
  const kst = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  return {
    year: kst.getFullYear(),
    month: kst.getMonth() + 1,
    day: kst.getDate(),
  };
}

export type DaewoonPhase = "past" | "current" | "future";

export interface DaewoonAgeSpan {
  startAge: number;
  endAge: number;
  /** Optional calendar year anchors when known from engine. */
  startYear?: number;
  endYear?: number;
  label?: string;
  pillar?: string;
}

/**
 * Man age (만 나이) at a KST calendar date — same basis as premium issue calendar.
 */
export function computeManAge(
  solarBirthDate: string,
  asOf: { year: number; month: number; day: number } = kstNow()
): number {
  const [birthYear, birthMonth, birthDay] = solarBirthDate.split("-").map(Number);
  let age = asOf.year - birthYear;
  if (
    asOf.month < birthMonth ||
    (asOf.month === birthMonth && asOf.day < birthDay)
  ) {
    age -= 1;
  }
  return Math.max(0, age);
}

/**
 * Index of the cycle that contains `currentAge`.
 * Returns -1 if none (before first / after last).
 */
export function findCurrentDaewoonIndex(
  cycles: Array<{ startAge: number; endAge: number }>,
  currentAge: number
): number {
  return cycles.findIndex(
    (c) => c.startAge <= currentAge && currentAge <= c.endAge
  );
}

/**
 * Index by calendar year when cycles expose startYear (ksaju-engine list).
 * End year is next.startYear - 1, or startYear + 9 for the last cycle.
 */
export function findCurrentDaewoonIndexByYear(
  cycles: Array<{ startYear: number }>,
  asOfYear: number
): number {
  return cycles.findIndex((c, i) => {
    const next = cycles[i + 1];
    const endYear = next ? next.startYear - 1 : c.startYear + 9;
    return c.startYear <= asOfYear && asOfYear <= endYear;
  });
}

export function phaseForDaewoonCycle(
  cycle: { startAge: number; endAge: number },
  currentAge: number
): DaewoonPhase {
  if (cycle.endAge < currentAge) return "past";
  if (cycle.startAge <= currentAge && currentAge <= cycle.endAge) return "current";
  return "future";
}

/** Slice current + following cycles (default 3) from a ksaju-engine daewoon list. */
export function pickCurrentAndUpcomingDaewoon(
  list: DaewoonItem[],
  asOfYear: number = kstNow().year,
  count = 3
): DaewoonItem[] {
  if (!list.length) return [];
  let idx = findCurrentDaewoonIndexByYear(list, asOfYear);
  if (idx < 0) {
    // Before first cycle → from start; after last → last only
    idx = asOfYear < list[0].startYear ? 0 : list.length - 1;
  }
  return list.slice(idx, idx + count);
}

/** From luck-pillars candidate cycles: current + following. */
export function pickCurrentAndUpcomingCycles(
  cycles: DaewoonCycle[],
  currentAge: number,
  count = 3
): DaewoonCycle[] {
  if (!cycles.length) return [];
  let idx = findCurrentDaewoonIndex(cycles, currentAge);
  if (idx < 0) {
    idx = currentAge < cycles[0].startAge ? 0 : cycles.length - 1;
  }
  return cycles.slice(idx, idx + count);
}

export function primaryDaewoonCandidate(
  candidates: DaewoonCandidate[]
): DaewoonCandidate | undefined {
  return candidates[0];
}

/**
 * Detail policy for roadmap prompts:
 * past → 10y summary; current + next → 5y halves; later → 10y summary.
 */
export function buildDaewoonRoadmapDetailBlock(options: {
  locale: "ko" | "en";
  currentAge: number;
  birthYear: number;
  cycles: Array<{ startAge: number; endAge: number; pillar?: string }>;
}): string {
  const { locale, currentAge, birthYear, cycles } = options;
  const idx = findCurrentDaewoonIndex(cycles, currentAge);
  const lines: string[] = [];

  if (locale === "ko") {
    lines.push("\n【대운 상세도 규칙 · 코드 산출】");
    lines.push(`- 현재 나이(만): ${currentAge}세`);
    if (idx < 0) {
      lines.push("- 현재 대운: (해당 없음)");
    } else {
      const cur = cycles[idx];
      const next = cycles[idx + 1];
      lines.push(
        `- 현재 대운: ${cur.startAge}~${cur.endAge}세 (${birthYear + cur.startAge}~${birthYear + cur.endAge}년)${cur.pillar ? ` · ${cur.pillar}` : ""}`
      );
      if (next) {
        lines.push(
          `- 다음 대운: ${next.startAge}~${next.endAge}세 (${birthYear + next.startAge}~${birthYear + next.endAge}년)${next.pillar ? ` · ${next.pillar}` : ""}`
        );
      }
      lines.push(
        "- ★ 세분화: 현재 대운 + 다음 대운만 5년 단위(전반/후반). 이미 끝난 과거 대운·그 이후 먼 대운은 10년 통짜 요약."
      );
      lines.push(
        "- ★ '현재 대운'은 위 구간만 지칭. 배열 앞쪽·첫 블록을 현재로 쓰지 말 것."
      );
    }
  } else {
    lines.push("\n【Daewoon detail rules — code-computed】");
    lines.push(`- Current age: ${currentAge}`);
    if (idx < 0) {
      lines.push("- Current cycle: (none)");
    } else {
      const cur = cycles[idx];
      const next = cycles[idx + 1];
      lines.push(
        `- Current cycle: ages ${cur.startAge}–${cur.endAge} (${birthYear + cur.startAge}–${birthYear + cur.endAge})`
      );
      if (next) {
        lines.push(
          `- Next cycle: ages ${next.startAge}–${next.endAge} (${birthYear + next.startAge}–${birthYear + next.endAge})`
        );
      }
      lines.push(
        "- ★ Split only current + next into 5-year halves. Fully past and far-future cycles stay 10-year summaries."
      );
      lines.push(
        "- ★ Do not treat the first array block as current."
      );
    }
  }

  return lines.join("\n");
}
