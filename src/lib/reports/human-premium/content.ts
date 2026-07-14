import { ELEMENT_META, charToElement, formatStemBranchLabels } from "@/lib/saju/elements";
import {
  computeManAge,
  pickCurrentAndUpcomingCycles,
} from "@/lib/saju/daewoon-current";
import {
  computeDaewoonCandidates,
  computeSeunNatalInteractions,
  computeSeunPillar,
  describeLuckPillar,
} from "@/lib/saju/luck-pillars";
import { computeRepresentativeShinsal } from "@/lib/saju/shinsal";
import { computeChartSipseong } from "@/lib/saju/sipseong";
import type { ZiweiChart } from "@/lib/saju/ksaju-engine";
import type { ElementKey, Locale, PillarDisplay, SajuBasicResponse } from "@/lib/saju/types";
import type {
  HumanPremiumReportChapter,
  HumanPremiumReportSection,
  HumanPremiumReportStructured,
  ReportCohortInsight,
  ReportDecisionMoment,
  ReportDeepSection,
  ReportOpportunity,
  ReportProphecy,
  ReportRisk,
  ReportRoadmapItem,
  ReportScore,
  ReportType,
} from "./types";
import {
  DEFAULT_REPORT_TYPE,
  REPORT_TYPE_LABELS,
  REPORT_TYPE_LABELS_EN,
} from "./types";
import { buildZiweiSections } from "./ziwei-narratives";
import {
  COHORT_INSIGHT_TITLE_EN,
  COHORT_INSIGHT_TITLE_KO,
  stripCohortBodyPrefix,
} from "./cohort-insight-labels";
import { normalizeDecisionScriptQuotes } from "@/lib/saju/llm/slot-output-sanitize";
import { sanitizeLlmSlotText } from "@/lib/saju/llm/slot-output-sanitize";

/** When true, embed ziwei section titles into cover bullets (legacy / future ziwei product). */
const EMBED_ZIWEI_IN_SAJU_COVER = false;

const SCORE_LABELS_KO = [
  "재물운",
  "직업운",
  "애정운",
  "건강운",
  "대인관계운",
  "종합운",
] as const;

const SCORE_LABELS_EN = [
  "Wealth",
  "Career",
  "Love",
  "Health",
  "Relationships",
  "Overall",
] as const;

/** Daily compact labels (No.06) — match daily-action-plan-report-prompt. */
const DAILY_SCORE_LABELS_KO = [
  "현재운세강도",
  "시기적합도",
  "기회포착력",
  "위기회피력",
  "관계운",
  "재물흐름",
] as const;

const DAILY_SCORE_LABELS_EN = [
  "Current fortune strength",
  "Timing fit",
  "Opportunity catch",
  "Crisis avoidance",
  "Relationship luck",
  "Wealth flow",
] as const;

/** Monthly spaced labels (No.09) — match monthly-life-architecture-report-prompt. */
const MONTHLY_SCORE_LABELS_KO = [
  "현재 운세 강도",
  "시기 적합도",
  "기회 포착력",
  "위기 회피력",
  "관계 운",
  "재물 흐름",
] as const;

const MONTHLY_SCORE_LABELS_EN = [
  "Current fortune strength",
  "Timing fit",
  "Opportunity catch",
  "Crisis avoidance",
  "Relationship luck",
  "Wealth flow",
] as const;

function scoreLabelsForReportType(
  reportType: ReportType | undefined,
  locale: Locale
): readonly string[] {
  // Compact 6 labels (daily set) for all new-gen products except monthly (spaced).
  if (reportType === "monthly") {
    return locale === "ko" ? MONTHLY_SCORE_LABELS_KO : MONTHLY_SCORE_LABELS_EN;
  }
  if (
    reportType === "daily" ||
    reportType === "career" ||
    reportType === "wealth" ||
    reportType === "mental" ||
    reportType === "business" ||
    reportType === "love" ||
    reportType === "yearly" ||
    reportType === "decade" ||
    reportType === "lifetime"
  ) {
    return locale === "ko" ? DAILY_SCORE_LABELS_KO : DAILY_SCORE_LABELS_EN;
  }
  return locale === "ko" ? SCORE_LABELS_KO : SCORE_LABELS_EN;
}

const MIN_SCORE = 40;
const MAX_SCORE = 95;

const REPORT_FOCUS_KO: Record<ReportType, string> = {
  daily: "오늘 하루의 행동과 타이밍",
  decade: "10년 대운 전략과 인생 로드맵",
  monthly: "이달의 전략과 에너지 배분",
  yearly: "올해의 로드맵과 핵심 테마",
  mental: "심리·건강·회복력과 에너지 관리",
  love: "연애·결혼·관계의 온도",
  career: "직장·성장·성과의 방향",
  business: "협업·네트워크·파트너십",
  wealth: "자산 흐름과 재테크 설계",
  lifetime: "평생 대운과 인생 설계",
};

const REPORT_FOCUS_EN: Record<ReportType, string> = {
  daily: "today's actions and timing",
  decade: "10-year major-luck strategy and life roadmap",
  monthly: "this month's strategy and energy",
  yearly: "this year's roadmap and themes",
  mental: "mental health, recovery, and energy",
  love: "romance, partnership, and bonds",
  career: "work, growth, and recognition",
  business: "collaboration, network, and partners",
  wealth: "asset flow and wealth design",
  lifetime: "major luck cycles and life design",
};

function elLabel(el: ElementKey, locale: Locale): string {
  const meta = ELEMENT_META[el];
  return locale === "ko"
    ? `${meta.hangul}(${meta.hanja})`
    : `${meta.meaning} (${meta.hanja})`;
}

function section(
  partial: Omit<HumanPremiumReportSection, "pageEstimate"> & { pageEstimate?: number }
): HumanPremiumReportSection {
  return { pageEstimate: 1, ...partial };
}

function chapter(
  id: string,
  title: string,
  sections: HumanPremiumReportSection[],
  subtitle?: string
): HumanPremiumReportChapter {
  return {
    id,
    title,
    subtitle,
    sections,
    pageEstimate: sections.reduce((sum, item) => sum + item.pageEstimate, 0),
  };
}

/** Compact seun/pillar label: KO 丙午(병오); EN 丙午 (ByeongO) — no Hangul on EN. */
function pillarText(pillar: PillarDisplay, locale: Locale = "ko"): string {
  if (locale === "en") {
    const { stemLabel, branchLabel } = formatStemBranchLabels(
      pillar.stemHanja || pillar.stem,
      pillar.branchHanja || pillar.branch,
      "en"
    );
    const stemR = stemLabel.match(/\(([^)]+)\)/)?.[1]?.trim() ?? "";
    const branchR = branchLabel.match(/\(([^)]+)\)/)?.[1]?.trim() ?? "";
    // e.g. Mu + Jin → Mujin (match requested EN form)
    const roman =
      stemR && branchR ? `${stemR}${branchR.toLowerCase()}` : `${stemR}${branchR}`;
    return roman ? `${pillar.pillar} (${roman})` : pillar.pillar;
  }
  const stemHangul = pillar.stemLabel.replace(/\([^)]*\)/g, "").trim();
  const branchHangul = pillar.branchLabel.replace(/\([^)]*\)/g, "").trim();
  if (stemHangul && branchHangul) {
    return `${pillar.pillar}(${stemHangul}${branchHangul})`;
  }
  return pillar.pillar;
}

function clampScore(value: number): number {
  return Math.max(MIN_SCORE, Math.min(MAX_SCORE, Math.round(value)));
}

function dayPillarNickname(saju: SajuBasicResponse, locale: Locale): string {
  const day = saju.pillars.day;
  if (locale === "ko") {
    return `${day.pillar} 일주`;
  }
  return `${day.pillar} day pillar`;
}

export function resolveReportType(reportType?: ReportType): ReportType {
  return reportType ?? DEFAULT_REPORT_TYPE;
}

function reportTypeLabel(reportType: ReportType, locale: Locale): string {
  return locale === "ko" ? REPORT_TYPE_LABELS[reportType] : REPORT_TYPE_LABELS_EN[reportType];
}

function reportFocus(reportType: ReportType, locale: Locale): string {
  return locale === "ko" ? REPORT_FOCUS_KO[reportType] : REPORT_FOCUS_EN[reportType];
}

function humanElementStory(
  name: string,
  element: ElementKey,
  locale: Locale
): { headline: string; story: string; traits: string[] } {
  const meta = ELEMENT_META[element];
  if (locale === "ko") {
    const elementName = `${meta.hangul}(${meta.hanja})`;
    const stories: Record<ElementKey, string> = {
      wood: `${name}님의 핵심 기운은 ${elementName}입니다. 성장, 확장, 새로운 시작의 흐름이 평생 테마로 이어집니다.`,
      fire: `${name}님의 핵심 기운은 ${elementName}입니다. 열정, 표현, 영향력이 삶의 중심축이 됩니다.`,
      earth: `${name}님의 핵심 기운은 ${elementName}입니다. 안정, 신뢰, 중심을 지키는 힘이 인생의 기반이 됩니다.`,
      metal: `${name}님의 핵심 기운은 ${elementName}입니다. 정리, 기준, 결단력이 평생 자산이 됩니다.`,
      water: `${name}님의 핵심 기운은 ${elementName}입니다. 직관, 공감, 유연함이 삶의 윤활유 역할을 합니다.`,
    };
    const traits: Record<ElementKey, string[]> = {
      wood: ["성장 지향", "탐색형 결단", "유연한 회복력"],
      fire: ["표현력", "추진력", "사람을 모으는 기운"],
      earth: ["안정감", "실행력", "꾸준한 누적"],
      metal: ["정리력", "판단력", "집중의 날카로움"],
      water: ["직관", "공감", "적응력"],
    };
    return {
      headline: `${name} · ${meta.hangul}(${meta.hanja}) 평생 에너지`,
      story: stories[element],
      traits: traits[element],
    };
  }

  const elementName = `${meta.meaning} (${meta.hanja})`;
  const stories: Record<ElementKey, string> = {
    wood: `${name}'s core tone is ${elementName}. Growth and renewal stay with you.`,
    fire: `${name}'s core tone is ${elementName}. Passion and expression shape your path.`,
    earth: `${name}'s core tone is ${elementName}. Stability and responsibility anchor you.`,
    metal: `${name}'s core tone is ${elementName}. Clarity and decisive focus become assets.`,
    water: `${name}'s core tone is ${elementName}. Intuition and adaptability keep your flow alive.`,
  };
  const traits: Record<ElementKey, string[]> = {
    wood: ["Growth-minded", "Exploratory", "Resilient"],
    fire: ["Expressive", "Driven", "Magnetic"],
    earth: ["Grounded", "Steady", "Patient"],
    metal: ["Organized", "Decisive", "Focused"],
    water: ["Intuitive", "Empathic", "Adaptive"],
  };
  return {
    headline: `${name} · Lifetime ${meta.meaning} (${meta.hanja}) energy`,
    story: stories[element],
    traits: traits[element],
  };
}

/** FNV-1a style deterministic hash — no Math.random. */
function hashSeed(...parts: Array<string | number>): number {
  let h = 2166136261;
  const text = parts.join("|");
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deterministic offset in [-4, +4] from chart + topic + metric index. */
function topicMetricOffset(seed: number, index: number): number {
  const x = (seed + Math.imul(index + 1, 2654435761)) >>> 0;
  return (x % 9) - 4;
}

/**
 * Topic bias for compact 6-metric labels:
 * [현재운세강도, 시기적합도, 기회포착력, 위기회피력, 관계운, 재물흐름]
 */
function topicBiasOffsets(reportType: ReportType | undefined): number[] {
  switch (reportType) {
    case "wealth":
      return [0, -1, 4, -3, -2, 5];
    case "business":
      return [1, 1, 3, -2, 5, 0];
    case "love":
      return [0, 1, 1, -2, 5, -2];
    case "career":
      return [2, 3, 4, -2, 1, 0];
    case "mental":
      return [1, 3, 0, 3, 1, -2];
    case "yearly":
      return [2, 4, 2, -2, 1, 1];
    case "decade":
      return [3, 1, 2, -2, 1, 2];
    case "lifetime":
      return [4, 1, 1, -2, 2, 1];
    case "daily":
      return [2, 4, 2, -2, 1, 1];
    case "monthly":
      return [1, 4, 2, -2, 1, 1];
    default:
      return [0, 0, 0, 0, 0, 0];
  }
}

function sajuBalance(saju: SajuBasicResponse): number {
  const dominant =
    saju.elements.find((e) => e.key === saju.dominantElement)?.count ?? 1;
  const total = saju.elements.reduce((sum, e) => sum + e.count, 0) || 1;
  return dominant / total;
}

function chartFingerprint(saju: SajuBasicResponse): string {
  const pillars = saju.pillars;
  return [
    pillars.year.pillar,
    pillars.month.pillar,
    pillars.day.pillar,
    pillars.hour?.pillar ?? "none",
    saju.dominantElement,
  ].join("/");
}

function isCrisisAvoidanceLabel(label: string): boolean {
  return (
    label === "위기회피력" ||
    label.toLowerCase().includes("crisis") ||
    label.includes("회피")
  );
}

function enforceScoreRules(
  scores: number[],
  labels: readonly string[]
): number[] {
  const next = scores.map((s, i) => {
    if (isCrisisAvoidanceLabel(labels[i] ?? "")) {
      return Math.max(50, Math.min(72, s));
    }
    return Math.max(50, Math.min(90, s));
  });

  const nonCrisisIdx = next
    .map((_, i) => i)
    .filter((i) => !isCrisisAvoidanceLabel(labels[i] ?? ""));
  const maxNonCrisis = Math.max(...nonCrisisIdx.map((i) => next[i]), 0);
  if (maxNonCrisis < 80 && nonCrisisIdx.length > 0) {
    const boostTarget = nonCrisisIdx.reduce((best, i) =>
      next[i] >= next[best] ? i : best
    );
    next[boostTarget] = 80 + (next[boostTarget] % 5);
  }

  return next.map((s) => clampScore(s));
}

function scoreSeed(
  saju: SajuBasicResponse,
  index: number,
  reportType?: ReportType
): number {
  const balance = sajuBalance(saju);
  const baseOffsets = [4, 2, -1, 0, 3, 1];
  const base = 58 + balance * 22 + (baseOffsets[index] ?? 0);
  const seed = hashSeed(
    chartFingerprint(saju),
    reportType ?? "default",
    index
  );
  const topicBias = topicBiasOffsets(reportType)[index] ?? 0;
  const jitter = topicMetricOffset(seed, index);
  return clampScore(base + topicBias + jitter);
}

function buildTemplateScores(
  saju: SajuBasicResponse,
  locale: Locale,
  reportType?: ReportType
): ReportScore[] {
  const labels = scoreLabelsForReportType(reportType, locale);
  const nickname = dayPillarNickname(saju, locale);
  const dominant = elLabel(saju.dominantElement, locale);

  const descriptionsKoLegacy = [
    `${nickname}의 재물 흐름은 ${dominant} 기운과 맞물려 있습니다. 무리한 확장보다 누적형 선택이 점수를 올립니다.`,
    `직업·성과 영역은 월주와 일주의 리듬이 핵심입니다. 지금은 속도보다 방향 정렬이 유리합니다.`,
    `애정운은 표현의 온도가 관건입니다. 상대의 속도를 존중하면 관계 점수가 안정됩니다.`,
    `건강·에너지는 약한 오행을 보완하는 루틴이 곧 점수입니다. 수면과 호흡을 우선하세요.`,
    `대인관계는 신뢰의 반복이 자산입니다. 깊은 인연 몇 명이 넓은 네트워크보다 강합니다.`,
    `종합운은 현재 대운 구간에서 '준비된 선택'이 기회로 보이는 흐름입니다. 지금이 정렬의 시기입니다.`,
  ];

  const descriptionsEnLegacy = [
    `${nickname} wealth rhythm aligns with ${dominant}. Steady stacking beats oversized bets.`,
    `Career lanes follow month and day pillars. Align direction before chasing speed.`,
    `Love scores rise when expression stays warm and paced with your partner.`,
    `Health reflects weak-element care. Sleep and breath routines lift this score.`,
    `Relationships reward repeated trust. A few deep bonds outweigh wide shallow ties.`,
    `Overall luck favors prepared choices in the current major cycle. Now is alignment season.`,
  ];

  const descriptionsKoMetric = [
    `지금 흐름의 강도는 ${dominant} 기운과 맞물려 있습니다. 무리한 확장보다 정렬된 선택이 점수를 올립니다.`,
    `행동·정리·대기 중 어디에 둘지 고르는 감각이 핵심입니다. 속도보다 타이밍이 유리합니다.`,
    `기회가 스칠 때 붙잡는 힘이 점수입니다. 작은 제안·연락을 놓치지 마세요.`,
    `리스크를 미리 줄이는 습관이 점수입니다. 원칙을 먼저 세우면 흔들림이 줄어듭니다.`,
    `관계의 온도는 표현의 리듬이 관건입니다. 상대 속도를 존중하면 안정됩니다.`,
    `재물 흐름은 누적형 선택이 유리합니다. 충동보다 기준이 점수를 올립니다.`,
  ];

  const descriptionsEnMetric = [
    `Current strength tracks with ${dominant}. Aligned choices beat oversized bets.`,
    `Timing fit is about act, tidy, or wait. Pace beats haste.`,
    `Opportunity catch rises when small offers and messages are not missed.`,
    `Crisis avoidance improves when rules come before impulse.`,
    `Relationship luck follows warm, paced expression.`,
    `Wealth flow favors stacking habits over impulse spends.`,
  ];

  const useMetricCopy =
    reportType === "daily" ||
    reportType === "monthly" ||
    reportType === "career" ||
    reportType === "wealth" ||
    reportType === "mental" ||
    reportType === "business" ||
    reportType === "love" ||
    reportType === "yearly" ||
    reportType === "decade" ||
    reportType === "lifetime";
  const baseDescriptions = useMetricCopy
    ? locale === "ko"
      ? descriptionsKoMetric
      : descriptionsEnMetric
    : locale === "ko"
      ? descriptionsKoLegacy
      : descriptionsEnLegacy;

  const rawScores = labels.map((_, index) =>
    scoreSeed(saju, index, reportType)
  );
  const scores = enforceScoreRules(rawScores, labels);

  const order = scores
    .map((score, index) => ({ score, index }))
    .sort((a, b) => b.score - a.score || a.index - b.index);
  const rankByIndex = new Map<number, number>();
  order.forEach((row, rank) => rankByIndex.set(row.index, rank));

  return labels.map((label, index) => {
    const rank = rankByIndex.get(index) ?? index;
    const base = baseDescriptions[index] ?? baseDescriptions[0];
    const rankNote =
      locale === "ko"
        ? rank === 0
          ? " 이 리포트 주제에서 가장 두드러진 축입니다."
          : rank === labels.length - 1
            ? " 상대적으로 보완이 필요한 축입니다."
            : ""
        : rank === 0
          ? " This is the strongest axis for this report topic."
          : rank === labels.length - 1
            ? " This axis needs relatively more support."
            : "";
    return {
      label,
      score: scores[index],
      description: `${base}${rankNote}`,
    };
  });
}

function buildTemplateOpportunities(
  saju: SajuBasicResponse,
  locale: Locale,
  reportType: ReportType
): ReportOpportunity[] {
  const focus = reportFocus(reportType, locale);
  const year = new Date().getFullYear();

  if (locale === "ko") {
    return [
      {
        title: `${year}년 흐름에 맞는 창`,
        body: `${focus}에 맞춰 작은 확신을 쌓을 때입니다. 한 번에 크게 베팅하기보다 반복 가능한 루틴이 흐름을 살립니다.`,
        tip: "이번 주 안에 15분짜리 확인 루틴 하나를 고정하세요.",
      },
      {
        title: "강한 기운을 살리는 협업",
        body: `${elLabel(saju.dominantElement, locale)} 기운이 드러나는 역할에 서면 성과가 빨리 보입니다.`,
        tip: "맡고 싶은 일을 한 문장으로 정리해 먼저 제안하세요.",
      },
      {
        title: "관계의 온도 조절",
        body: "상대의 속도를 읽고 한 박자 늦게 반응하면 갈등이 줄고 신뢰가 쌓입니다.",
        tip: "중요한 대화 전에 지금 괜찮은 타이밍인지 한 번만 확인하세요.",
      },
      {
        title: "학습·정비의 계절",
        body: "무거운 구간일수록 공부와 정리가 다음 도약의 연료가 됩니다.",
        tip: "주 1회, 쌓인 일을 30분만 정리하는 습관을 만드세요.",
      },
      {
        title: "지금 구간에서 열리는 문",
        body: "현재 흐름은 기반 다지기 → 작은 성과 → 확장 순서가 안전합니다.",
        tip: "다음 달까지 유지할 최소 루틴 2가지만 고르세요.",
      },
    ];
  }

  return [
    {
      title: `${year} timing window`,
      body: `Align with ${focus}. Repeatable routines beat one oversized bet.`,
      tip: "Lock one 15-minute weekly check-in ritual.",
    },
    {
      title: "Collaboration that uses your strong tone",
      body: `Roles that express ${elLabel(saju.dominantElement, locale)} lift results faster.`,
      tip: "Pitch one role you want in a single clear sentence.",
    },
    {
      title: "Relationship pacing",
      body: "Reading the other person's tempo reduces friction and builds trust.",
      tip: "Ask once if timing is right before a heavy conversation.",
    },
    {
      title: "Season for study and repair",
      body: "Heavier stretches reward learning and decluttering as fuel for the next leap.",
      tip: "Spend 30 minutes weekly clearing one backlog pile.",
    },
    {
      title: "Door opening in the current stretch",
      body: "Safe order: foundation → small win → expansion.",
      tip: "Pick only two minimum routines to hold through next month.",
    },
  ];
}

function buildTemplateRisks(saju: SajuBasicResponse, locale: Locale): ReportRisk[] {
  const shinsal = computeRepresentativeShinsal(saju.pillars, locale);
  const weak = [...saju.elements].sort((a, b) => a.count - b.count)[0];
  const weakLabel = weak ? elLabel(weak.key, locale) : elLabel(saju.dominantElement, locale);
  const salNote = shinsal
    .filter((s) => s.matchedSlots.length > 0)
    .map((s) => s.name)
    .slice(0, 2)
    .join(locale === "ko" ? ", " : ", ");

  if (locale === "ko") {
    return [
      {
        title: "속도 과잉",
        body: "기회가 보일 때 한꺼번에 몰아치면 에너지 소모가 커질 수 있습니다.",
        countermeasure: "결정 전 24시간 숙성 룰을 두고, 주 1회만 '큰 선택'을 허용하세요.",
      },
      {
        title: "약한 오행 취약",
        body: `${weakLabel} 기운이 부족할 때 피로·불안·집중 저하가 겹치기 쉽습니다.`,
        countermeasure: "약한 오행에 맞는 색·음식·산책 루틴을 주 3회 이상 고정하세요.",
      },
      {
        title: salNote ? `신살 주의 (${salNote})` : "관계 마찰",
        body: salNote
          ? "신살은 단정이 아니라 과잉 반응을 키우는 촉매로 읽으면 됩니다."
          : "기대치 불일치가 관계를 소모시킬 수 있습니다.",
        countermeasure: "감정이 올라올 때는 사실 확인 → 요청 한 가지 순으로 말하세요.",
      },
      {
        title: "완벽주의 함정",
        body: "기준이 높을수록 시작이 늦어지고 기회 창이 닫힐 수 있습니다.",
        countermeasure: "'충분히 좋음' 기준을 미리 적고 70% 완성도로 먼저 실행하세요.",
      },
    ];
  }

  return [
    {
      title: "Speed overload",
      body: "Chasing every opening at once can drain energy quickly.",
      countermeasure: "Use a 24-hour pause rule and allow one big decision per week.",
    },
    {
      title: "Weak-element vulnerability",
      body: `Low ${weakLabel} tone can stack fatigue, anxiety, or focus dips.`,
      countermeasure: "Anchor color, food, and walk routines for the weak element 3× weekly.",
    },
    {
      title: salNote ? `Spirit-star friction (${salNote})` : "Relationship friction",
      body: salNote
        ? "Stars are catalysts for overreaction—not fixed verdicts."
        : "Mismatched expectations can quietly drain bonds.",
      countermeasure: "When heated, verify facts first, then state one clear request.",
    },
    {
      title: "Perfection trap",
      body: "High standards can delay starts and close opportunity windows.",
      countermeasure: "Predefine 'good enough' and ship at 70% completion.",
    },
  ];
}

function buildTemplateDailyRoadmap(
  locale: Locale
): { roadmap: ReportRoadmapItem[]; decisionMoments: ReportDecisionMoment[] } {
  const roadmapKo: ReportRoadmapItem[] = [
    {
      period: "07~13시",
      label: "오전 · 기획·정리",
      body: "辰~午(진·오) — 오늘 할 일을 정리하고 중요한 연락·기획에 쓰기 좋은 시간입니다.",
    },
    {
      period: "13~19시",
      label: "오후 · 실행·협업",
      body: "未~酉(미·유) — 미뤄둔 실행·협업·대면 일을 오늘 안에 밀어붙이기 좋습니다.",
    },
    {
      period: "19~23시",
      label: "밤 · 관계·대화",
      body: "戌~亥(술·해) — 가까운 사람과의 대화·정리·감사 표현에 유리합니다.",
    },
    {
      period: "23~01시",
      label: "심야 · 사색·전략",
      body: "子(자) — 오늘 배운 것을 짧게 기록하고 내일 첫 행동 한 가지를 정하세요.",
    },
    {
      period: "01~03시",
      label: "새벽 · 휴식·회복",
      body: "丑(축) — 수면·스트레칭·디지털 디톡스로 내일 컨디션을 지키세요.",
    },
    {
      period: "오늘 한 줄",
      label: "오늘의 정렬",
      body: "대운이 아닌 오늘 일진 기준 — 작은 루틴 하나만 지키면 오늘의 흐름이 정돈됩니다.",
    },
  ];

  const roadmapEn: ReportRoadmapItem[] = [
    {
      period: "07:00–13:00",
      label: "Morning · plan & sort",
      body: "Chen–Wu hours — list today's tasks and handle key planning or outreach.",
    },
    {
      period: "13:00–19:00",
      label: "Afternoon · execute",
      body: "Wei–You hours — push deferred execution, collaboration, and face-to-face work today.",
    },
    {
      period: "19:00–23:00",
      label: "Evening · bonds",
      body: "Xu–Hai hours — conversations, gratitude, and relationship check-ins land well.",
    },
    {
      period: "23:00–01:00",
      label: "Late night · reflect",
      body: "Zi hour — jot one lesson from today and name tomorrow's first action.",
    },
    {
      period: "01:00–03:00",
      label: "Pre-dawn · recovery",
      body: "Chou hour — protect tomorrow with sleep, stretch, and a short digital break.",
    },
    {
      period: "Today",
      label: "Today's alignment",
      body: "From today's day pillar, not major luck — one small routine kept steadies the whole day.",
    },
  ];

  const decisionMomentsKo: ReportDecisionMoment[] = [
    {
      situation: "상황 1. 협상·제안을 망설일 때",
      script: "오늘은 결론보다 정보를 한 가지 더 모으겠습니다. 밤 9시 전에 예·아니오만 정하겠습니다.",
    },
    {
      situation: "상황 2. 가족·가까운 사람이 서운해할 때",
      script: "오늘 저녁에 10분만 사실부터 맞추겠습니다. 감정보다 '무엇이 필요했는지'를 먼저 묻겠습니다.",
    },
    {
      situation: "상황 3. 지출·투자가 흔들릴 때",
      script: "오늘은 결제를 24시간 미루겠습니다. 필요 목록과 선택 목록을 나눠 적고 내일 다시 보겠습니다.",
    },
    {
      situation: "상황 4. 업무가 과다해 막막할 때",
      script: "지금 당장 25분만 한 가지에 집중하겠습니다. 오늘 끝낼 일은 최대 3개로 줄이겠습니다.",
    },
  ];

  const decisionMomentsEn: ReportDecisionMoment[] = [
    {
      situation: "Moment 1. Hesitating on a deal or offer",
      script: "Today I'll gather one more fact before deciding. Yes or no by 9 p.m.",
    },
    {
      situation: "Moment 2. When someone close feels hurt",
      script: "I'll spend ten minutes tonight aligning on facts before feelings.",
    },
    {
      situation: "Moment 3. When spending or investing wobbles",
      script: "I'll pause payment 24 hours and split needs vs wants on paper.",
    },
    {
      situation: "Moment 4. When work feels overwhelming",
      script: "I'll focus 25 minutes on one task and cap today's must-finish list at three.",
    },
  ];

  return {
    roadmap: locale === "ko" ? roadmapKo : roadmapEn,
    decisionMoments: locale === "ko" ? decisionMomentsKo : decisionMomentsEn,
  };
}

function buildTemplateRoadmap(
  saju: SajuBasicResponse,
  locale: Locale
): { roadmap: ReportRoadmapItem[]; decisionMoments: ReportDecisionMoment[] } {
  const daewoon = computeDaewoonCandidates({
    birthUtc: saju.birthUtc,
    yearStem: saju.pillars.year.stemHanja,
    monthPillar: saju.pillars.month,
    dayStem: saju.pillars.day.stemHanja,
    locale,
    gender: null,
  });

  const primary = daewoon[0];
  const currentAge = computeManAge(saju.birthDate);
  const cycles = pickCurrentAndUpcomingCycles(
    primary?.cycles ?? [],
    currentAge,
    4
  );

  const roadmap: ReportRoadmapItem[] = cycles.map((cycle, index) => {
    const period =
      locale === "ko"
        ? `${cycle.startAge}~${cycle.endAge}세`
        : `Age ${cycle.startAge}–${cycle.endAge}`;
    const labelsKo = ["현재 대운", "다음 대운", "그다음 대운", "이후 전환"];
    const labelsEn = ["Current cycle", "Next cycle", "Following cycle", "Later pivot"];
    const bodiesKo = [
      "지금 진행 중인 대운입니다. 네트워크와 역할 확장이 열려 있으니 과로만 주의하세요.",
      "다음 대운을 위해 자격·루틴·관계를 준비하면 전환이 부드러워집니다.",
      "그동안 쌓은 것을 성과로 바꾸기 좋은 구간이 다가옵니다. 욕심은 절반만.",
      "정리·이동·전환을 검토할 시기입니다. 무리한 확장은 피하세요.",
    ];
    const bodiesEn = [
      "This is the active major cycle—network and role expansion open; watch burnout.",
      "Prep credentials, routines, and bonds for the next cycle.",
      "A harvest window approaches; take half the greed.",
      "Review pivots and decluttering; avoid forced expansion.",
    ];
    return {
      period,
      label: locale === "ko" ? labelsKo[index] ?? "전환" : labelsEn[index] ?? "Shift",
      body:
        locale === "ko"
          ? `${pillarText(cycle.pillar)} 대운: ${bodiesKo[index] ?? bodiesKo[0]}`
          : `${pillarText(cycle.pillar, "en")} cycle: ${bodiesEn[index] ?? bodiesEn[0]}`,
    };
  });

  if (roadmap.length === 0) {
    roadmap.push({
      period: locale === "ko" ? "현재~3년" : "Now–3 years",
      label: locale === "ko" ? "정렬의 시기" : "Alignment phase",
      body:
        locale === "ko"
          ? "대운 후보가 제한적이어도 일·관계·건강 루틴을 맞추면 흐름이 부드러워집니다."
          : "Even with limited cycle data, aligning work, bonds, and health routines smooths the flow.",
    });
  }

  const decisionMomentsKo: ReportDecisionMoment[] = [
    {
      situation: "상황 1. 제안이 동시에 들어올 때",
      script: "지금은 하나만 선택합니다. 3개월 뒤를 기준으로 되돌아봤을 때 후회가 적은 쪽을 택하겠습니다.",
    },
    {
      situation: "상황 2. 관계가 예민해질 때",
      script: "감정보다 사실부터 맞추겠습니다. 오늘은 결론보다 이해하는 시간을 먼저 갖고 싶습니다.",
    },
    {
      situation: "상황 3. 큰 지출·투자를 고민할 때",
      script: "생활비 6개월 방어막을 유지한 뒤에만 실행하겠습니다. 기회는 다음에도 옵니다.",
    },
    {
      situation: "상황 4. 방향을 바꿔야 할 때",
      script: "지금은 속도를 줄이고 기록을 남기겠습니다. 한 달 뒤 데이터를 보고 전환 여부를 결정하겠습니다.",
    },
  ];

  const decisionMomentsEn: ReportDecisionMoment[] = [
    {
      situation: "Moment 1. Multiple offers at once",
      script: "I'll choose one. I'll pick what I'd regret least if I revisit this in three months.",
    },
    {
      situation: "Moment 2. When tension rises in a bond",
      script: "Facts before feelings today. I'd like understanding time before any final decision.",
    },
    {
      situation: "Moment 3. Large spend or investment",
      script: "I'll act only after a six-month living-cost buffer. Opportunities return.",
    },
    {
      situation: "Moment 4. When a pivot is needed",
      script: "I'll slow down and log data. I'll decide on a shift after one month of evidence.",
    },
  ];

  return {
    roadmap,
    decisionMoments: locale === "ko" ? decisionMomentsKo : decisionMomentsEn,
  };
}

function buildTemplateProphecy(
  saju: SajuBasicResponse,
  locale: Locale,
  reportType: ReportType
): ReportProphecy {
  const daewoon = computeDaewoonCandidates({
    birthUtc: saju.birthUtc,
    yearStem: saju.pillars.year.stemHanja,
    monthPillar: saju.pillars.month,
    dayStem: saju.pillars.day.stemHanja,
    locale,
    gender: null,
  });
  const next = daewoon[0]?.cycles[1];
  const birthYear = new Date(saju.birthUtc).getUTCFullYear();
  const currentYear = new Date().getFullYear();
  const daewoonStartYear = birthYear + (next?.startAge ?? 30);
  const startYear = daewoonStartYear > currentYear ? daewoonStartYear : currentYear + 1;
  const endYear = startYear + 4;
  const nickname = dayPillarNickname(saju, locale);
  const directionKo = elLabel(saju.dominantElement, locale);
  const directionEn = elLabel(saju.dominantElement, locale);
  const dominantMeta = ELEMENT_META[saju.dominantElement];

  const keywordShortKo = `${dominantMeta.hangul} · 집중·정리`;
  const keywordShortEn = `${dominantMeta.meaning} · focus & sort`;

  const sealedNarrativeKo = `이번 주 안에, 미뤄둔 일 하나가 연락이나 제안으로 이어질 수 있습니다. 그리고 다음 달쯤, 가볍게 나눈 대화가 새 흐름의 계기가 됩니다.`;
  const sealedNarrativeEn = `This week, one deferred task may turn into a call or offer. Next month, a light conversation could become the start of a new flow.`;

  const rangeNarrativeKo = `${startYear}년~${endYear}년 사이, ${directionKo} 방향에서 오는 기회가 ${nickname}의 다음 장면을 바꾸는 계기가 됩니다.`;
  const rangeNarrativeEn = `Between ${startYear} and ${endYear}, an opening aligned with ${directionEn} can reshape ${nickname}'s next chapter.`;

  const fullKo = `${rangeNarrativeKo}

이 구간은 겉으로는 평범해 보여도, 루틴과 인연의 질이 바뀌는 '조용한 전환점'입니다. 준비된 사람에게는 기회처럼, 준비되지 않은 사람에게는 조정처럼 보입니다. 지금부터 쌓는 기록과 신뢰가 그때의 선택을 넓혀 줍니다.`;

  const fullEn = `${rangeNarrativeEn}

Outwardly ordinary, this span is a quiet pivot where routine and bond quality shift. Prepared readers meet opportunity; unprepared ones meet adjustment. Records and trust you build now widen choices later.`;

  return {
    short: locale === "ko" ? keywordShortKo : keywordShortEn,
    full:
      reportType === "lifetime"
        ? locale === "ko"
          ? fullKo
          : fullEn
        : locale === "ko"
          ? sealedNarrativeKo
          : sealedNarrativeEn,
  };
}

function buildTemplateCohortInsight(
  saju: SajuBasicResponse,
  locale: Locale,
  reportType: ReportType
): ReportCohortInsight {
  const nickname = dayPillarNickname(saju, locale);
  const elementLabel = elLabel(saju.dominantElement, locale);

  if (locale === "ko") {
    return {
      body: `${elementLabel} 기운이 두드러진 ${nickname}과 같은 명식 구조를 가진 사람들은 '속도를 절반으로, 깊이를 두 배로' 전략을 가장 많이 성공시킵니다. 같은 시기에 태어난 사람들도 선택의 질에서 갈리며, ${elementLabel} 기운을 일상 루틴에 녹였을 때 만족도가 높은 경향을 보입니다.`,
    };
  }

  return {
    body: `People with a chart structure like ${nickname}, where ${elementLabel} is prominent, most often succeed with "half the speed, double the depth." Those born in the same era diverge by choice quality; weaving ${elementLabel} into daily routines tends to raise satisfaction.`,
  };
}

export function buildHumanPremiumStructured(
  saju: SajuBasicResponse,
  locale: Locale,
  reportType: ReportType
): HumanPremiumReportStructured {
  const { roadmap, decisionMoments } =
    reportType === "daily"
      ? buildTemplateDailyRoadmap(locale)
      : buildTemplateRoadmap(saju, locale);

  return {
    scores: buildTemplateScores(saju, locale, reportType),
    opportunities: buildTemplateOpportunities(saju, locale, reportType),
    risks: buildTemplateRisks(saju, locale),
    roadmap,
    decisionMoments,
    prophecy: buildTemplateProphecy(saju, locale, reportType),
    cohortInsight: buildTemplateCohortInsight(saju, locale, reportType),
    deepSections: buildTemplateDeepSections(saju, locale, reportType),
  };
}

export function formatScoresBody(scores: ReportScore[], locale: Locale): string {
  const header =
    locale === "ko"
      ? "핵심 운세 지표는 6개 영역 각각 100점 만점으로 읽습니다. 최저 40점은 '조건부 강점'으로 해석합니다."
      : "Six domains are scored out of 100. Scores at or above 40 are read as conditional strengths.";
  return [header, ...scores.map((s) => `${s.label} ${s.score}/100 — ${s.description}`)].join(
    "\n\n"
  );
}

export function formatOpportunitiesBody(opportunities: ReportOpportunity[]): string {
  return opportunities
    .map((item, index) =>
      [`${index + 1}. ${item.title}`, item.body, `→ ${item.tip}`].join("\n")
    )
    .join("\n\n");
}

export function formatRisksBody(risks: ReportRisk[]): string {
  return risks
    .map((item, index) =>
      [`${index + 1}. ${item.title}`, item.body, `→ ${item.countermeasure}`].join("\n")
    )
    .join("\n\n");
}

export function formatRoadmapBody(
  roadmap: ReportRoadmapItem[],
  moments: ReportDecisionMoment[],
  locale: Locale,
  reportType?: ReportType
): string {
  const header =
    reportType === "daily"
      ? locale === "ko"
        ? "오늘 하루 시간대별 루틴과 결정의 순간을 함께 봅니다."
        : "Today's time-band routine paired with decision moments."
      : locale === "ko"
        ? "대운별 행동 전략과 결정의 순간을 함께 봅니다."
        : "Major-cycle strategies paired with decision moments.";
  const phases = roadmap
    .map((item) => `· ${item.period} · ${item.label}\n${item.body}`)
    .join("\n\n");
  const decisions = moments
    .map((m) => `${m.situation}\n"${normalizeDecisionScriptQuotes(m.script)}"`)
    .join("\n\n");
  return [header, phases, decisions].join("\n\n");
}

export function formatProphecyBody(
  prophecy: ReportProphecy,
  cohort: ReportCohortInsight,
  reportType: ReportType,
  locale: Locale
): string {
  const sealed = prophecy.full ?? prophecy.short;
  const cohortBody = stripCohortBodyPrefix(cohort.body, locale);
  return [sealed, cohortBody].filter((part) => part.trim()).join("\n\n");
}

export function formatStructuredSectionBodies(
  structured: HumanPremiumReportStructured,
  locale: Locale,
  reportType: ReportType,
  bodies: {
    sajuStructure?: string;
    deepAnalysis?: string;
  } = {}
): Partial<Record<string, string>> {
  // Do not flatten deepSections into section-depth body — PDF/web already
  // render deepSections as cards. Flattening caused duplicate plain+card copy
  // when deepAnalysis was empty (daily template fallback).
  const depthBody = bodies.deepAnalysis?.trim() || undefined;

  const raw: Partial<Record<string, string>> = {
    "section-structure": bodies.sajuStructure,
    "section-metrics": formatScoresBody(structured.scores, locale),
    "section-depth": depthBody,
    "section-opportunity": formatOpportunitiesBody(structured.opportunities),
    "section-risk": formatRisksBody(structured.risks),
    "section-roadmap": formatRoadmapBody(
      structured.roadmap,
      structured.decisionMoments,
      locale,
      reportType
    ),
    "section-prophecy": formatProphecyBody(
      structured.prophecy,
      structured.cohortInsight,
      reportType,
      locale
    ),
  };

  const cleaned: Partial<Record<string, string>> = {};
  for (const [sectionId, text] of Object.entries(raw)) {
    if (!text?.trim()) continue;
    const sanitized = sanitizeLlmSlotText(`assemble:${sectionId}`, text);
    cleaned[sectionId] =
      locale === "en"
        ? sanitized
            .replace(/[\uac00-\ud7a3]+/g, "")
            .replace(/[ \t]{2,}/g, " ")
            .replace(/\s+([,.;:!?])/g, "$1")
            .trim()
        : sanitized;
  }
  return cleaned;
}

function buildStructureBody(
  saju: SajuBasicResponse,
  locale: Locale,
  reportType: ReportType
): string {
  const nickname = dayPillarNickname(saju, locale);
  const focus = reportFocus(reportType, locale);
  const chart = computeChartSipseong(saju.pillars.day.stemHanja, saju.pillars, locale);
  const slots = (["year", "month", "day", "hour"] as const)
    .filter((slot) => slot !== "hour" || (saju.pillars.hour && !saju.birthTimeUnknown))
    .map((slot) => {
      const labels = chart[slot];
      if (!labels) return null;
      const pillarLabel =
        locale === "ko"
          ? { year: "년주", month: "월주", day: "일주", hour: "시주" }[slot]
          : { year: "Year", month: "Month", day: "Day", hour: "Hour" }[slot];
      return `${pillarLabel}: 천간 ${labels.stem}, 지지 ${labels.branch}`;
    })
    .filter(Boolean)
    .join("\n");

  if (locale === "ko") {
    return `${nickname}의 사주 구조는 ${focus}를 읽는 열쇠입니다.

일간 ${saju.pillars.day.stemLabel} · 일간 오행 ${elLabel(dayMasterElement(saju), locale)} (분포 최다 오행 ${elLabel(saju.dominantElement, locale)})
${saju.birthTimeUnknown ? "시주 미상 — 삼주(년·월·일) 중심으로 해석합니다." : `시주 ${pillarText(saju.pillars.hour!)} 포함 사주(四柱) 해석입니다.`}

${slots || "십성 데이터를 표준 축으로 정리했습니다."}

단점은 결핍이 아니라 '조건부 강점'으로 읽습니다. 기운이 강하면 과잉 주의, 약하면 보완 루틴이 답입니다.`;
  }

  return `${nickname} chart structure keys into ${focus}.

Day master ${saju.pillars.day.stemLabel} (${saju.pillars.day.stemHanja}) · day-master element ${elLabel(dayMasterElement(saju), locale)} (chart-dominant ${elLabel(saju.dominantElement, locale)})
${saju.birthTimeUnknown ? "Hour unknown — three-pillar reading (year, month, day)." : `Four pillars including hour ${pillarText(saju.pillars.hour!, "en")}.`}

${slots || "Ten-God axes are organized on standard pillars."}

Apparent weaknesses are conditional strengths—balance excess with pacing and deficits with routines.`;
}

function buildTemplateDeepSections(
  saju: SajuBasicResponse,
  locale: Locale,
  reportType: ReportType
): ReportDeepSection[] {
  const focus = reportFocus(reportType, locale);
  const dayEl = elLabel(dayMasterElement(saju), locale);
  const nickname = dayPillarNickname(saju, locale);

  if (locale === "ko") {
    return [
      {
        title: "지금의 축",
        body: `${nickname}의 일간 기운(${dayEl})을 ${focus} 관점에서 읽으면, 속도보다 역할·기준을 먼저 정렬하는 편이 안정적입니다. 작은 루틴이 다음 구간의 기반이 됩니다.`,
      },
      {
        title: "다음 구간 준비",
        body: `지금 구간에서는 확장보다 정리·연습·관계의 질이 우선입니다. ${focus}에서 당장 실행 가능한 한 가지를 정해 2주간 반복하면, 다음 전환이 덜 흔들립니다.`,
      },
    ];
  }

  return [
    {
      title: "Present axis",
      body: `Reading ${nickname}'s day-master tone (${dayEl}) through ${focus}, align role and standards before speed. Small routines seed the next stretch.`,
    },
    {
      title: "Prep the next stretch",
      body: `Favor clarity, practice, and bond quality over forced expansion. Pick one executable move in ${focus} and repeat it for two weeks so the next pivot stays steadier.`,
    },
  ];
}

function buildDepthBody(
  saju: SajuBasicResponse,
  name: string,
  locale: Locale,
  reportType: ReportType,
  _summaryStory: string
): string {
  const focus = reportFocus(reportType, locale);
  const dayEl = elLabel(dayMasterElement(saju), locale);
  const nickname = dayPillarNickname(saju, locale);

  if (locale === "ko") {
    return `${name}님의 ${REPORT_TYPE_LABELS[reportType]} 심층 요약입니다.

${nickname}의 일간 기운은 ${dayEl}입니다. ${focus} 관점에서는 '정렬 후 확장'이 유리합니다. 좋은 흐름은 준비된 선택에 기회처럼 보이고, 무거운 흐름은 루틴을 손보는 계절로 읽습니다.

지금 구간은 막힘이 아니라 방향을 다듬는 시간입니다. 작은 선택의 누적이 다음 구간의 크기를 결정합니다.`;
  }

  return `${name}'s ${REPORT_TYPE_LABELS_EN[reportType]} depth summary.

${nickname} day-master tone is ${dayEl}. Through ${focus}, alignment before expansion works best. Favorable stretches look like opportunity to the prepared; heavier stretches ask for routine repair.

This phase refines direction—not blockage. Small choices now size the next stretch.`;
}

function dayMasterElement(saju: SajuBasicResponse): ElementKey {
  return (
    charToElement(saju.pillars.day.stemHanja) ??
    charToElement(saju.pillars.day.stem) ??
    saju.dominantElement
  );
}

export function buildHumanSummary(
  name: string,
  saju: SajuBasicResponse,
  locale: Locale
) {
  return humanElementStory(name, dayMasterElement(saju), locale);
}

export function buildSajuChapters(
  saju: SajuBasicResponse,
  locale: Locale,
  options?: {
    ziweiChart?: ZiweiChart;
    birthTimeUnknown?: boolean;
    reportType?: ReportType;
  }
): HumanPremiumReportChapter[] {
  const name = saju.petName;
  const reportType = resolveReportType(options?.reportType);
  const summary = humanElementStory(name, dayMasterElement(saju), locale);
  const structured = buildHumanPremiumStructured(saju, locale, reportType);
  const typeLabel = reportTypeLabel(reportType, locale);
  const nickname = dayPillarNickname(saju, locale);
  const hour = saju.pillars.hour;
  const includeHour = !saju.birthTimeUnknown && hour;
  const dayElementLabel = elLabel(dayMasterElement(saju), locale);

  const ziweiSections =
    EMBED_ZIWEI_IN_SAJU_COVER && options?.ziweiChart != null
      ? buildZiweiSections(
          options.ziweiChart,
          name,
          locale,
          options.birthTimeUnknown ?? false
        )
      : [];
  const ziweiBullets = ziweiSections.map((z) => z.title);

  const coverBodyKo = `${name}님의 ${typeLabel} 리포트입니다.

만세력: 년주 ${pillarText(saju.pillars.year)}, 월주 ${pillarText(saju.pillars.month)}, 일주 ${pillarText(saju.pillars.day)}${includeHour ? `, 시주 ${pillarText(hour)}` : " (시주 미상, 삼주 해석)"}.

${summary.story}

핵심 오행은 ${dayElementLabel}입니다. 사주는 단정이 아니라 삶의 지도로 읽어 주세요.`;

  const coverBodyEn = `${name}'s ${typeLabel} report.

Pillars: Year ${pillarText(saju.pillars.year, "en")}, Month ${pillarText(saju.pillars.month, "en")}, Day ${pillarText(saju.pillars.day, "en")}${includeHour ? `, Hour ${pillarText(hour, "en")}` : " (hour unknown, three-pillar reading)"}.

${summary.story}

Day-master element: ${dayElementLabel}. Read the chart as a map, not a verdict.`;

  const sections: Array<{ id: string; kind: HumanPremiumReportSection["kind"]; title: string; subtitle?: string; body: string; bullets?: string[]; pageEstimate?: number }> = [
    {
      id: "section-cover",
      kind: "cover",
      title: locale === "ko" ? "표지 & 사주" : "Cover & pillars",
      subtitle: typeLabel,
      body: locale === "ko" ? coverBodyKo : coverBodyEn,
      bullets: [
        ...(locale === "ko"
          ? [`${nickname}`, `분석 모드: ${includeHour ? "사주(四柱)" : "삼주(三柱)"}`]
          : [`${nickname}`, `Mode: ${includeHour ? "Four pillars" : "Three pillars"}`]),
        ...summary.traits,
        ...ziweiBullets.slice(0, 3),
      ],
      pageEstimate: 2,
    },
    {
      id: "section-structure",
      kind: "structure",
      title: locale === "ko" ? "사주 구조 해석" : "Chart structure",
      subtitle: locale === "ko" ? "오행 · 십신 · 명리 진단" : "Elements · Ten Gods · frame",
      body: buildStructureBody(saju, locale, reportType),
      pageEstimate: 3,
    },
    {
      id: "section-metrics",
      kind: "metrics",
      title: locale === "ko" ? "핵심 운세 지표" : "Key fortune indicators",
      subtitle: locale === "ko" ? "6개 영역 /100" : "Six domains /100",
      body: formatScoresBody(structured.scores, locale),
      bullets: structured.scores.map((s) => `${s.label} ${s.score}/100`),
      pageEstimate: 2,
    },
    {
      id: "section-depth",
      kind: "depth",
      title: locale === "ko" ? "심층 분석" : "Deep analysis",
      subtitle: locale === "ko" ? "서사 · 핵심 축" : "Narrative · core axes",
      body: reportType === "daily" ? "" : buildDepthBody(saju, name, locale, reportType, summary.story),
      pageEstimate: 4,
    },
    {
      id: "section-opportunity",
      kind: "opportunity",
      title: locale === "ko" ? "포착할 기회" : "Opportunities to catch",
      subtitle: locale === "ko" ? "5가지 + 잡는 법" : "Five openings + how to catch them",
      body: formatOpportunitiesBody(structured.opportunities),
      pageEstimate: 3,
    },
    {
      id: "section-risk",
      kind: "risk",
      title: locale === "ko" ? "예측 리스크" : "Forecast risks",
      subtitle: locale === "ko" ? "4가지 + 대비책" : "Four risks + countermeasures",
      body: formatRisksBody(structured.risks),
      pageEstimate: 3,
    },
    {
      id: "section-roadmap",
      kind: "roadmap",
      title: locale === "ko" ? "시간 로드맵" : "Time roadmap",
      subtitle:
        reportType === "daily"
          ? locale === "ko"
            ? "오늘 시간대별 루틴 · 결정의 순간"
            : "Today's time bands · decision moments"
          : locale === "ko"
            ? "대운별 전략 · 결정의 순간"
            : "Cycle strategy · decision moments",
      body: formatRoadmapBody(
        structured.roadmap,
        structured.decisionMoments,
        locale,
        reportType
      ),
      pageEstimate: 4,
    },
    {
      id: "section-prophecy",
      kind: "prophecy",
      title: locale === "ko" ? "잠겨진 천명" : "Locked destiny",
      subtitle:
        reportType === "lifetime"
          ? locale === "ko"
            ? "풀버전"
            : "Full version"
          : "",
      body: formatProphecyBody(
        structured.prophecy,
        structured.cohortInsight,
        reportType,
        locale
      ),
      pageEstimate: reportType === "lifetime" ? 3 : 2,
    },
  ];

  return sections.map((item) =>
    chapter(
      item.id,
      item.title,
      [
        section({
          id: item.id,
          chapterId: item.id,
          chapterTitle: item.title,
          kind: item.kind,
          title: item.title,
          subtitle: item.subtitle,
          body: item.body,
          bullets: item.bullets,
          pageEstimate: item.pageEstimate,
        }),
      ],
      item.subtitle
    )
  );
}

export function flattenChapterSections(
  chapters: HumanPremiumReportChapter[]
): HumanPremiumReportSection[] {
  return chapters.flatMap((item) => item.sections);
}

export function sumChapterPages(chapters: HumanPremiumReportChapter[]): number {
  return chapters.reduce((sum, chapter) => sum + chapter.pageEstimate, 0);
}

export interface DayPillarFreePillarRow {
  slot: string;
  label: string;
  pillar: string;
  detail: string;
}

export interface DayPillarFreeFullView {
  headline: string;
  pillars: DayPillarFreePillarRow[];
  elements: Array<{ label: string; count: number; percent: number }>;
  dayInsight: string;
  structureBody: string;
  analysisModeLabel: string;
}

export function buildDayPillarFreeFullView(
  name: string,
  saju: SajuBasicResponse,
  locale: Locale
): DayPillarFreeFullView {
  const summary = humanElementStory(name, saju.dominantElement, locale);
  const includeHour = !saju.birthTimeUnknown && Boolean(saju.pillars.hour);
  const slotLabelsKo = { year: "년주", month: "월주", day: "일주", hour: "시주" };
  const slotLabelsEn = { year: "Year", month: "Month", day: "Day", hour: "Hour" };

  const pillars = (["year", "month", "day", "hour"] as const)
    .filter((slot) => slot !== "hour" || includeHour)
    .map((slot) => {
      const pillar = saju.pillars[slot]!;
      return {
        slot,
        label: locale === "ko" ? slotLabelsKo[slot] : slotLabelsEn[slot],
        pillar: pillar.pillar,
        detail: `${pillar.stemLabel} · ${pillar.branchLabel}`,
      };
    });

  return {
    headline: summary.headline,
    pillars,
    elements: saju.elements.map((item) => ({
      label: elLabel(item.key, locale),
      count: item.count,
      percent: item.percent,
    })),
    dayInsight: summary.story,
    structureBody: buildStructureBody(saju, locale, "lifetime"),
    analysisModeLabel:
      locale === "ko"
        ? includeHour
          ? "사주(四柱) · 시주 포함"
          : "삼주(三柱) · 시주 미상"
        : includeHour
          ? "Four pillars · hour included"
          : "Three pillars · hour unknown",
  };
}
