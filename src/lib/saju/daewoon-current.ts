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

/** Roadmap detail roles — next is only the cycle immediately after current. */
export type DaewoonRoadmapRole = "past" | "current" | "next" | "later";

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

/**
 * Roadmap role for cycle at `cycleIndex` given the current-cycle index
 * from {@link findCurrentDaewoonIndex} (or -1 if none).
 * next = currentIndex + 1 only; later futures stay "later".
 */
export function roadmapRoleAtIndex(
  cycleIndex: number,
  currentIndex: number
): DaewoonRoadmapRole {
  if (currentIndex < 0) {
    if (cycleIndex === 0) return "current";
    if (cycleIndex === 1) return "next";
    return cycleIndex < 0 ? "past" : "later";
  }
  if (cycleIndex < currentIndex) return "past";
  if (cycleIndex === currentIndex) return "current";
  if (cycleIndex === currentIndex + 1) return "next";
  return "later";
}

/** Prompt mark for daewoon_list / facts block lines. */
export function daewoonRoadmapRoleMark(
  role: DaewoonRoadmapRole,
  locale: "ko" | "en"
): string {
  if (locale === "ko") {
    switch (role) {
      case "current":
        return " ★현재 대운";
      case "next":
        return " ★다음 대운(5년 세분)";
      case "past":
        return " (과거)";
      default:
        return " (먼 이후·10년 요약)";
    }
  }
  switch (role) {
    case "current":
      return " ★CURRENT";
    case "next":
      return " ★NEXT (5y split)";
    case "past":
      return " (past)";
    default:
      return " (far future · 10y summary)";
  }
}

/** Calendar year halves for a 10-year-style age span (전반 / 후반). */
export function daewoonFiveYearHalves(
  birthYear: number,
  cycle: { startAge: number; endAge: number }
): { first: { startYear: number; endYear: number }; second: { startYear: number; endYear: number } } {
  const startYear = birthYear + cycle.startAge;
  const endYear = birthYear + cycle.endAge;
  const mid = startYear + Math.floor((endYear - startYear) / 2);
  return {
    first: { startYear, endYear: mid },
    second: { startYear: mid + 1, endYear },
  };
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

  const halfLine = (
    labelKo: string,
    labelEn: string,
    cycle: { startAge: number; endAge: number; pillar?: string }
  ) => {
    const { first, second } = daewoonFiveYearHalves(birthYear, cycle);
    if (locale === "ko") {
      return [
        `- ${labelKo}: ${cycle.startAge}~${cycle.endAge}세 (${birthYear + cycle.startAge}~${birthYear + cycle.endAge}년)${cycle.pillar ? ` · ${cycle.pillar}` : ""}`,
        `  → 5년 세분 필수: "${first.startYear}~${first.endYear}년 (${labelKo} 전반)" / "${second.startYear}~${second.endYear}년 (${labelKo} 후반)"`,
      ];
    }
    return [
      `- ${labelEn}: ages ${cycle.startAge}–${cycle.endAge} (${birthYear + cycle.startAge}–${birthYear + cycle.endAge})`,
      `  → Must split: "${first.startYear}–${first.endYear} (${labelEn} first half)" / "${second.startYear}–${second.endYear} (${labelEn} second half)"`,
    ];
  };

  if (locale === "ko") {
    lines.push("\n【대운 상세도 규칙 · 코드 산출】");
    lines.push(`- 현재 나이(만): ${currentAge}세`);
    if (idx < 0) {
      lines.push("- 현재 대운: (해당 없음)");
    } else {
      const cur = cycles[idx];
      const next = cycles[idx + 1];
      lines.push(...halfLine("현재 대운", "Current cycle", cur));
      if (next) {
        lines.push(...halfLine("다음 대운", "Next cycle", next));
      } else {
        lines.push("- 다음 대운: (없음 — 5년 세분 대상 없음)");
      }
      lines.push(
        "- ★ 세분화: ★현재 대운 + ★다음 대운(현재 직후 1개)만 위 5년 전반/후반 period로 각각 별도 블록. 과거·먼 이후는 10년 통짜 1블록."
      );
      lines.push(
        "- ★ '다음 대운'은 위 다음 구간만. 그 이후 대운을 5년 세분하거나 다음으로 부르지 말 것."
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
      lines.push(...halfLine("현재 대운", "Current cycle", cur));
      if (next) {
        lines.push(...halfLine("다음 대운", "Next cycle", next));
      } else {
        lines.push("- Next cycle: (none — no 5-year split target)");
      }
      lines.push(
        "- ★ Split only current + next (immediate successor) into the 5-year half periods above. Past and far-future stay one 10-year block each."
      );
      lines.push(
        "- ★ Do not call later cycles \"next\" or split them into 5-year halves."
      );
      lines.push(
        "- ★ Do not treat the first array block as current."
      );
    }
  }

  return lines.join("\n");
}
