import { charToElement, ELEMENT_META } from "@/lib/saju/elements";
import {
  computeDaewoonCandidates,
  computeMonthLuckPillar,
  computeSeunNatalInteractions,
  computeSeunPillar,
  describeLuckPillar,
  type DaewoonCandidate,
  type DaewoonGender,
} from "@/lib/saju/luck-pillars";
import {
  computeRepresentativeShinsal,
  type ShinsalFact,
} from "@/lib/saju/shinsal";
import { computeChartSipseong, type PillarSlot } from "@/lib/saju/sipseong";
import type { ElementKey, Locale } from "@/lib/saju/types";
import type { PillarDisplay, SajuBasicResponse } from "@/lib/saju/types";

const YANG_STEMS = new Set(["甲", "丙", "戊", "庚", "壬"]);

const PILLAR_SLOT_LABEL: Record<PillarSlot, { ko: string; en: string }> = {
  year: { ko: "년주", en: "Year" },
  month: { ko: "월주", en: "Month" },
  day: { ko: "일주", en: "Day" },
  hour: { ko: "시주", en: "Hour" },
};

export interface HumanPremiumElementFact {
  key: string;
  label: string;
  count: number;
  percent: number;
}

export interface HumanPremiumSipseongFact {
  slot: PillarSlot;
  stem: string;
  branch: string;
}

export interface HumanPremiumSeunFact {
  year: number;
  pillar: string;
  stemTenGod: string;
  branchTenGod: string;
  natalInteractions: string[];
}

export interface HumanPremiumMonthlyLuckFact {
  year: number;
  month: number;
  label: string;
  pillar: string;
  stemTenGod: string;
  branchTenGod: string;
}

export interface HumanPremiumDaewoonFact {
  candidates: Array<{
    direction: DaewoonCandidate["direction"];
    directionLabel: string;
    startAge: number;
    startAgeNote: string;
    cycles: Array<{
      ageRange: string;
      pillar: string;
      stemTenGod: string;
      branchTenGod: string;
    }>;
  }>;
  note: string;
}

export interface HumanPremiumFactsBlock {
  userName: string;
  locale: Locale;
  analysisMode: "three_pillars" | "four_pillars";
  ilganStem: string;
  ilganLabel: string;
  ilganOhang: string;
  ilganEumyang: string;
  dominantElement: string;
  weakElements: string[];
  strongElements: string[];
  elements: HumanPremiumElementFact[];
  pillars: {
    year: string;
    month: string;
    day: string;
    hour: string | null;
  };
  sipseong: HumanPremiumSipseongFact[];
  daewoon: HumanPremiumDaewoonFact;
  shinsal: ShinsalFact[];
  seun: HumanPremiumSeunFact;
  monthlyLuck: HumanPremiumMonthlyLuckFact[];
  unavailable: string[];
}

export interface BuildHumanPremiumFactsOptions {
  timezone: string;
  fortuneYear?: number;
  summerMonths?: number[];
  gender?: DaewoonGender | null;
}

function pillarLine(pillar: PillarDisplay): string {
  return `${pillar.pillar} (${pillar.stemLabel}, ${pillar.branchLabel})`;
}

function stemEumyang(stem: string, locale: Locale): string {
  const isYang = YANG_STEMS.has(stem);
  if (locale === "ko") return isYang ? "양(陽)" : "음(陰)";
  return isYang ? "Yang" : "Yin";
}

function elementLabel(key: ElementKey, locale: Locale): string {
  const meta = ELEMENT_META[key];
  if (locale === "ko") return `${meta.hangul}(${meta.hanja})`;
  return `${meta.romanized} (${meta.hanja})`;
}

function pickStrongWeak(
  elements: HumanPremiumElementFact[]
): { strong: string[]; weak: string[] } {
  if (!elements.length) return { strong: [], weak: [] };
  const max = Math.max(...elements.map((e) => e.count));
  const min = Math.min(...elements.map((e) => e.count));
  return {
    strong: elements.filter((e) => e.count === max).map((e) => e.label),
    weak: elements.filter((e) => e.count === min).map((e) => e.label),
  };
}

function monthLabel(year: number, month: number, locale: Locale): string {
  if (locale === "ko") return `${year}년 ${month}월`;
  return new Date(year, month - 1, 15).toLocaleString("en", {
    month: "long",
    year: "numeric",
  });
}

export function buildHumanPremiumFacts(
  saju: SajuBasicResponse,
  analysisMode: "three_pillars" | "four_pillars",
  personName: string,
  locale: Locale,
  options: BuildHumanPremiumFactsOptions
): HumanPremiumFactsBlock {
  const dayStem = saju.pillars.day.stemHanja;
  const dayElement = charToElement(dayStem);
  const ilganOhang = dayElement
    ? elementLabel(dayElement, locale)
    : saju.pillars.day.stemLabel;
  const total =
    saju.elements.reduce((sum, el) => sum + el.count, 0) || 1;

  const elements: HumanPremiumElementFact[] = saju.elements.map((el) => ({
    key: el.key,
    label: elementLabel(el.key, locale),
    count: el.count,
    percent: Math.round((el.count / total) * 100),
  }));

  const { strong, weak } = pickStrongWeak(elements);
  const fortuneYear = options.fortuneYear ?? new Date().getFullYear();
  const summerMonths = options.summerMonths ?? [6, 7, 8];

  const chartSipseong = computeChartSipseong(dayStem, saju.pillars, locale);
  const sipseong: HumanPremiumSipseongFact[] = (
    ["year", "month", "day", "hour"] as const
  )
    .map((slot) => {
      const labels = chartSipseong[slot];
      if (!labels) return null;
      return { slot, stem: labels.stem, branch: labels.branch };
    })
    .filter((row): row is HumanPremiumSipseongFact => row !== null);

  const seunPillar = computeSeunPillar(fortuneYear);
  const seunReading = describeLuckPillar(dayStem, seunPillar, locale);
  const seunInteractions = computeSeunNatalInteractions(
    seunPillar.branchHanja,
    saju.pillars,
    locale
  );

  const monthlyLuck = summerMonths.map((month) => {
    const pillar = computeMonthLuckPillar(
      fortuneYear,
      month,
      options.timezone
    );
    const reading = describeLuckPillar(dayStem, pillar, locale);
    return {
      year: fortuneYear,
      month,
      label: monthLabel(fortuneYear, month, locale),
      pillar: pillarLine(pillar),
      stemTenGod: reading.stemTenGod,
      branchTenGod: reading.branchTenGod,
    };
  });

  const daewoonCandidates = computeDaewoonCandidates({
    birthUtc: saju.birthUtc,
    yearStem: saju.pillars.year.stemHanja,
    monthPillar: saju.pillars.month,
    dayStem,
    locale,
    gender: options.gender ?? null,
  });
  const daewoon: HumanPremiumDaewoonFact = {
    candidates: daewoonCandidates.map((candidate) => ({
      direction: candidate.direction,
      directionLabel: candidate.directionLabel,
      startAge: candidate.startAge,
      startAgeNote: candidate.startAgeNote,
      cycles: candidate.cycles.map((cycle) => ({
        ageRange:
          locale === "ko"
            ? `${cycle.startAge}~${cycle.endAge}세`
            : `Age ${cycle.startAge}-${cycle.endAge}`,
        pillar: pillarLine(cycle.pillar),
        stemTenGod: cycle.stemTenGod,
        branchTenGod: cycle.branchTenGod,
      })),
    })),
    note:
      options.gender == null
        ? locale === "ko"
          ? "성별 입력이 없어 순행·역행 후보를 함께 제시합니다."
          : "Gender is not provided, so both forward and reverse candidates are listed."
        : locale === "ko"
          ? "성별과 년간 음양 기준으로 순역을 산정했습니다."
          : "Direction is resolved from gender and year-stem polarity.",
  };
  const shinsal = computeRepresentativeShinsal(saju.pillars, locale);

  const unavailableKo = ["전체 신살 목록", "정밀 대운 세운 교차 판단"];
  const unavailableEn = ["Full spirit-star catalog", "Detailed daewoon-seun cross analysis"];

  return {
    userName: personName.trim(),
    locale,
    analysisMode,
    ilganStem: dayStem,
    ilganLabel: saju.pillars.day.stemLabel,
    ilganOhang,
    ilganEumyang: stemEumyang(dayStem, locale),
    dominantElement: elementLabel(saju.dominantElement, locale),
    strongElements: strong,
    weakElements: weak,
    elements,
    pillars: {
      year: pillarLine(saju.pillars.year),
      month: pillarLine(saju.pillars.month),
      day: pillarLine(saju.pillars.day),
      hour: saju.pillars.hour ? pillarLine(saju.pillars.hour) : null,
    },
    sipseong,
    daewoon,
    shinsal,
    seun: {
      year: fortuneYear,
      pillar: pillarLine(seunPillar),
      stemTenGod: seunReading.stemTenGod,
      branchTenGod: seunReading.branchTenGod,
      natalInteractions: seunInteractions.map((line) => line.label),
    },
    monthlyLuck,
    unavailable: locale === "ko" ? unavailableKo : unavailableEn,
  };
}

export function formatFactsBlockForPrompt(facts: HumanPremiumFactsBlock): string {
  const isKo = facts.locale === "ko";
  const lines = [
    isKo ? "[계산값 블록]" : "[Calculated facts block]",
    `${isKo ? "이름" : "Name"}: ${facts.userName}`,
    `${isKo ? "해석 모드" : "Analysis mode"}: ${
      facts.analysisMode === "four_pillars"
        ? isKo
          ? "사주(四柱)"
          : "Four pillars"
        : isKo
          ? "삼주(三柱, 시주 미상)"
          : "Three pillars (hour unknown)"
    }`,
    `${isKo ? "일간" : "Day master"}: ${facts.ilganLabel} (${facts.ilganStem})`,
    `${isKo ? "일간 음양" : "Day master polarity"}: ${facts.ilganEumyang}`,
    `${isKo ? "일간 오행" : "Day master element"}: ${facts.ilganOhang}`,
    `${isKo ? "대표 오행" : "Dominant element"}: ${facts.dominantElement}`,
    `${isKo ? "강한 오행" : "Strong elements"}: ${facts.strongElements.join(", ") || "—"}`,
    `${isKo ? "약한 오행" : "Weak elements"}: ${facts.weakElements.join(", ") || "—"}`,
    `${isKo ? "오행 분포" : "Element distribution"}: ${facts.elements
      .map((e) => `${e.label} ${e.count}(${e.percent}%)`)
      .join(", ")}`,
    `${isKo ? "년주" : "Year pillar"}: ${facts.pillars.year}`,
    `${isKo ? "월주" : "Month pillar"}: ${facts.pillars.month}`,
    `${isKo ? "일주" : "Day pillar"}: ${facts.pillars.day}`,
    facts.pillars.hour
      ? `${isKo ? "시주" : "Hour pillar"}: ${facts.pillars.hour}`
      : isKo
        ? "시주: 미상(삼주 해석)"
        : "Hour pillar: unknown (three-pillar reading)",
    "",
    isKo ? "[원국 십성]" : "[Natal Ten Gods]",
    ...facts.sipseong.map((row) => {
      const slot = PILLAR_SLOT_LABEL[row.slot][facts.locale];
      return `- ${slot}: ${isKo ? "천간" : "Stem"} ${row.stem}, ${isKo ? "지지" : "Branch"} ${row.branch}`;
    }),
    "",
    isKo ? "[대운]" : "[Major luck cycles]",
    `${isKo ? "대운 산정 메모" : "Daewoon note"}: ${facts.daewoon.note}`,
    ...facts.daewoon.candidates.flatMap((candidate) => [
      `- ${candidate.directionLabel}: ${isKo ? "시작" : "starts"} ${candidate.startAge}${isKo ? "세" : ""} (${candidate.startAgeNote})`,
      ...candidate.cycles
        .slice(0, 6)
        .map(
          (cycle) =>
            `  · ${cycle.ageRange}: ${cycle.pillar} | ${isKo ? "천간" : "Stem"} ${cycle.stemTenGod}, ${isKo ? "지지" : "Branch"} ${cycle.branchTenGod}`
        ),
    ]),
    "",
    isKo ? "[대표 신살]" : "[Representative spirit stars]",
    ...facts.shinsal.map((row) => {
      const matched = row.matchedSlots.length
        ? row.matchedSlots.map((slot) => slot.label).join(", ")
        : isKo
          ? "원국 지지에 없음"
          : "not present in natal branches";
      return `- ${row.name} (${row.basis}, ${row.targetBranches.join("/")}) → ${matched}`;
    }),
    "",
    isKo ? `[${facts.seun.year}년 세운]` : `[${facts.seun.year} annual luck (seun)]`,
    `${isKo ? "세운" : "Seun"}: ${facts.seun.pillar}`,
    `${isKo ? "세운 천간 십성" : "Seun stem Ten God"}: ${facts.seun.stemTenGod}`,
    `${isKo ? "세운 지지 십성" : "Seun branch Ten God"}: ${facts.seun.branchTenGod}`,
    facts.seun.natalInteractions.length
      ? `${isKo ? "세운-원국 상호작용" : "Seun–natal interactions"}: ${facts.seun.natalInteractions.join("; ")}`
      : isKo
        ? "세운-원국 상호작용: 특이 합·충·형·해·파 없음"
        : "Seun–natal interactions: no major clash/harmony signals",
    "",
    isKo ? "[여름 월운]" : "[Summer monthly luck]",
    ...facts.monthlyLuck.map(
      (row) =>
        `- ${row.label}: ${row.pillar} | ${isKo ? "천간" : "Stem"} ${row.stemTenGod}, ${isKo ? "지지" : "Branch"} ${row.branchTenGod}`
    ),
    "",
    isKo
      ? `[미제공 데이터 — 언급·추정 금지] ${facts.unavailable.join(", ")}`
      : `[Not provided — do not mention or infer] ${facts.unavailable.join(", ")}`,
  ];
  return lines.join("\n");
}

export function getMonthlyLuckFact(
  facts: HumanPremiumFactsBlock,
  month: number
): HumanPremiumMonthlyLuckFact | undefined {
  return facts.monthlyLuck.find((row) => row.month === month);
}
