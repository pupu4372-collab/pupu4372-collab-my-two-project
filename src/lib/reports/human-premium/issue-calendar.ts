import type { Locale } from "@/lib/saju/types";

export interface KstDateParts {
  year: number;
  month: number;
  day: number;
}

/** Calendar parts in Asia/Seoul. */
export function kstDateParts(date = new Date()): KstDateParts {
  const kst = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  return {
    year: kst.getFullYear(),
    month: kst.getMonth() + 1,
    day: kst.getDate(),
  };
}

function monthListLabel(months: number[], locale: Locale): string {
  if (!months.length) return locale === "ko" ? "(없음)" : "(none)";
  return locale === "ko"
    ? months.map((m) => `${m}월`).join(", ")
    : months.map((m) => String(m)).join(", ");
}

export interface YearlyIssueCalendar {
  issueYear: number;
  issueMonth: number;
  issueDay: number;
  issueDateLabel: string;
  pastMonths: number[];
  currentMonth: number;
  remainingMonths: number[];
  remainingMonthCount: number;
  nextYear: number;
  yearAfterNext: number;
  promptBlock: string;
}

/** Yearly report: past / current / remaining months (KST). */
export function buildYearlyIssueCalendar(
  locale: Locale,
  date = new Date()
): YearlyIssueCalendar {
  const { year, month, day } = kstDateParts(date);
  const pastMonths = Array.from({ length: month - 1 }, (_, i) => i + 1);
  const remainingMonths = Array.from({ length: 12 - month }, (_, i) => month + 1 + i);
  const issueDateLabel =
    locale === "ko"
      ? `${year}년 ${month}월 ${day}일`
      : `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const promptBlock =
    locale === "ko"
      ? [
          "\n【리포트 특수 입력 · 연간 시제】",
          `- 발행일(KST): ${issueDateLabel}`,
          `- 현재 달: ${month}월`,
          `- 지나간 달: ${monthListLabel(pastMonths, locale)}`,
          `- 남은 달(현재 달 이후): ${monthListLabel(remainingMonths, locale)}`,
          `- 남은 달 수: ${remainingMonths.length}`,
          `- 내년: ${year + 1}년 / 내후년: ${year + 2}년`,
          "- ★ 시제·황금의 달·행동 지시 날짜는 위 목록만 기준으로 할 것 (LLM 자체 계산 금지)",
        ].join("\n")
      : [
          "\n【Report-specific · yearly tense】",
          `- Issue date (KST): ${issueDateLabel}`,
          `- Current month: ${month}`,
          `- Past months: ${monthListLabel(pastMonths, locale)}`,
          `- Remaining months (after current): ${monthListLabel(remainingMonths, locale)}`,
          `- Remaining count: ${remainingMonths.length}`,
          `- Next year: ${year + 1} / Year after next: ${year + 2}`,
          "- ★ Use only these lists for tense, golden months, and action dates (do not recompute).",
        ].join("\n");

  return {
    issueYear: year,
    issueMonth: month,
    issueDay: day,
    issueDateLabel,
    pastMonths,
    currentMonth: month,
    remainingMonths,
    remainingMonthCount: remainingMonths.length,
    nextYear: year + 1,
    yearAfterNext: year + 2,
    promptBlock,
  };
}

export interface MonthlyIssueCalendar {
  issueYear: number;
  issueMonth: number;
  issueDay: number;
  issueDateLabel: string;
  remainingDaysLabel: string;
  promptBlockExtra: string;
}

/** Monthly: issue day + remaining days in month for action dating. */
export function buildMonthlyIssueCalendar(
  locale: Locale,
  date = new Date()
): MonthlyIssueCalendar {
  const { year, month, day } = kstDateParts(date);
  const lastDay = new Date(year, month, 0).getDate();
  const issueDateLabel =
    locale === "ko"
      ? `${year}년 ${month}월 ${day}일`
      : `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const remainingDaysLabel =
    locale === "ko"
      ? `${day}일~${lastDay}일`
      : `${day}–${lastDay}`;

  const promptBlockExtra =
    locale === "ko"
      ? [
          `- 발행일(KST): ${issueDateLabel}`,
          `- 이달 남은 날짜 범위: ${remainingDaysLabel}`,
          "- ★ 행동 지시(tip·대비책·로드맵·결정 스크립트)는 발행일 이후 날짜만 사용할 것",
        ].join("\n")
      : [
          `- Issue date (KST): ${issueDateLabel}`,
          `- Remaining days this month: ${remainingDaysLabel}`,
          "- ★ Action tips/countermeasures/roadmap/scripts: dates on/after issue date only",
        ].join("\n");

  return {
    issueYear: year,
    issueMonth: month,
    issueDay: day,
    issueDateLabel,
    remainingDaysLabel,
    promptBlockExtra,
  };
}

export interface DecadeIssueCalendar {
  issueYear: number;
  issueDateLabel: string;
  decadeYears: number[];
  currentYear: number;
  futureYears: number[];
  promptBlockExtra: string;
}

/** Decade: current year (present) + remaining years in the 10-year window. */
export function buildDecadeIssueCalendar(
  locale: Locale,
  date = new Date()
): DecadeIssueCalendar {
  const { year, month, day } = kstDateParts(date);
  const decadeYears = Array.from({ length: 10 }, (_, i) => year + i);
  const futureYears = decadeYears.slice(1);
  const issueDateLabel =
    locale === "ko"
      ? `${year}년 ${month}월 ${day}일`
      : `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const promptBlockExtra =
    locale === "ko"
      ? [
          `- 발행일(KST): ${issueDateLabel}`,
          `- 지금 지나고 있는 해: ${year}년`,
          `- 10년 창 연도: ${decadeYears.map((y) => `${y}년`).join(", ")}`,
          `- 다가올 해: ${futureYears.map((y) => `${y}년`).join(", ") || "(없음)"}`,
          "- ★ 현재 연도(지금 지나고 있는 해)는 현재형. 행동 지시는 발행일 이후만.",
          "- ★ LLM 자체로 연도·시제를 다시 계산하지 말 것.",
        ].join("\n")
      : [
          `- Issue date (KST): ${issueDateLabel}`,
          `- Current year (present tense): ${year}`,
          `- Decade window: ${decadeYears.join(", ")}`,
          `- Upcoming years: ${futureYears.join(", ") || "(none)"}`,
          "- ★ Current year = present tense. Action dates on/after issue date only.",
          "- ★ Do not recompute years/tense yourself.",
        ].join("\n");

  return {
    issueYear: year,
    issueDateLabel,
    decadeYears,
    currentYear: year,
    futureYears,
    promptBlockExtra,
  };
}

export type LifetimeCyclePhase = "past" | "current" | "future";

export interface LifetimeCycleTenseRow {
  ageRange: string;
  startAge: number;
  endAge: number;
  startYear: number;
  endYear: number;
  phase: LifetimeCyclePhase;
  pillar: string;
}

export interface LifetimeIssueCalendar {
  issueYear: number;
  issueDateLabel: string;
  currentAge: number;
  birthYear: number;
  pastCycles: LifetimeCycleTenseRow[];
  currentCycle: LifetimeCycleTenseRow | null;
  futureCycles: LifetimeCycleTenseRow[];
  promptBlock: string;
}

/**
 * Calendar year when the person turns `age` (만 나이), using solar birth year.
 * Matches engine age basis used elsewhere in premium reports.
 */
export function calendarYearAtAge(birthYear: number, age: number): number {
  return birthYear + age;
}

export function classifyLifetimeCycles(options: {
  birthYear: number;
  currentAge: number;
  cycles: Array<{
    ageRange: string;
    startAge: number;
    endAge: number;
    pillar: string;
  }>;
}): {
  pastCycles: LifetimeCycleTenseRow[];
  currentCycle: LifetimeCycleTenseRow | null;
  futureCycles: LifetimeCycleTenseRow[];
} {
  const rows: LifetimeCycleTenseRow[] = options.cycles.map((cycle) => {
    let phase: LifetimeCyclePhase = "future";
    if (cycle.endAge < options.currentAge) phase = "past";
    else if (cycle.startAge <= options.currentAge && options.currentAge <= cycle.endAge) {
      phase = "current";
    }
    return {
      ageRange: cycle.ageRange,
      startAge: cycle.startAge,
      endAge: cycle.endAge,
      startYear: calendarYearAtAge(options.birthYear, cycle.startAge),
      endYear: calendarYearAtAge(options.birthYear, cycle.endAge),
      phase,
      pillar: cycle.pillar,
    };
  });

  return {
    pastCycles: rows.filter((r) => r.phase === "past"),
    currentCycle: rows.find((r) => r.phase === "current") ?? null,
    futureCycles: rows.filter((r) => r.phase === "future"),
  };
}

/** Lifetime: current age + past/current/future daewoon with year conversion. */
export function buildLifetimeIssueCalendar(options: {
  locale: Locale;
  solarBirthDate: string;
  currentAge: number;
  cycles: Array<{
    ageRange: string;
    startAge: number;
    endAge: number;
    pillar: string;
  }>;
  date?: Date;
}): LifetimeIssueCalendar {
  const { year, month, day } = kstDateParts(options.date);
  const birthYear = Number(options.solarBirthDate.slice(0, 4));
  const classified = classifyLifetimeCycles({
    birthYear,
    currentAge: options.currentAge,
    cycles: options.cycles,
  });
  const issueDateLabel =
    options.locale === "ko"
      ? `${year}년 ${month}월 ${day}일`
      : `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const formatRow = (row: LifetimeCycleTenseRow) =>
    options.locale === "ko"
      ? `${row.ageRange} (${row.startYear}~${row.endYear}년) · ${row.pillar}`
      : `${row.ageRange} (${row.startYear}–${row.endYear}) · ${row.pillar}`;

  const pastLabel =
    classified.pastCycles.length > 0
      ? classified.pastCycles.map((r) => `  ${formatRow(r)}`).join("\n")
      : options.locale === "ko"
        ? "  (없음)"
        : "  (none)";
  const currentLabel = classified.currentCycle
    ? `  ${formatRow(classified.currentCycle)}`
    : options.locale === "ko"
      ? "  (해당 없음)"
      : "  (none)";
  const futureLabel =
    classified.futureCycles.length > 0
      ? classified.futureCycles.map((r) => `  ${formatRow(r)}`).join("\n")
      : options.locale === "ko"
        ? "  (없음)"
        : "  (none)";

  const promptBlock =
    options.locale === "ko"
      ? [
          "\n【리포트 특수 입력 · 평생 시제】",
          `- 발행일(KST): ${issueDateLabel}`,
          `- 현재 나이(만): ${options.currentAge}세`,
          `- 출생 연도(양력): ${birthYear}년`,
          `- 나이→연도 환산: N세 시작 연도 = ${birthYear}+N (예: 54세 → ${birthYear + 54}년)`,
          `- 지나간 대운:`,
          pastLabel,
          `- 현재 대운:`,
          currentLabel,
          `- 이후 대운:`,
          futureLabel,
          "- ★ 시제·대운 전환 연도는 위 목록만 기준 (LLM 자체 계산 금지)",
        ].join("\n")
      : [
          "\n【Report-specific · lifetime tense】",
          `- Issue date (KST): ${issueDateLabel}`,
          `- Current age: ${options.currentAge}`,
          `- Birth year (solar): ${birthYear}`,
          `- Age→year: year at age N = ${birthYear}+N (e.g. age 54 → ${birthYear + 54})`,
          `- Past cycles:`,
          pastLabel,
          `- Current cycle:`,
          currentLabel,
          `- Future cycles:`,
          futureLabel,
          "- ★ Use only these lists for tense and transition years (do not recompute).",
        ].join("\n");

  return {
    issueYear: year,
    issueDateLabel,
    currentAge: options.currentAge,
    birthYear,
    pastCycles: classified.pastCycles,
    currentCycle: classified.currentCycle,
    futureCycles: classified.futureCycles,
    promptBlock,
  };
}
