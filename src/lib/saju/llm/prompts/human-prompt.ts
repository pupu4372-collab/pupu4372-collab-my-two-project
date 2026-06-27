import type { HumanPremiumFactsBlock } from "@/lib/reports/human-premium/facts";
import type { ReportType } from "@/lib/reports/human-premium/types";
import {
  REPORT_TYPE_LABELS,
  REPORT_TYPE_LABELS_EN,
} from "@/lib/reports/human-premium/types";
import {
  buildSlotPrompt,
  resolveReportTypeFocus,
} from "@/lib/reports/human-premium/report-prompts";
import type { HumanPremiumPromptSlotKey } from "@/lib/reports/human-premium/report-prompts/types";
import type { HumanSajuMapping } from "@/lib/saju/human-trait-mapping";
import { dominantElementLabel } from "@/lib/saju/pet-lucky-scores";
import type { Locale, SajuBasicResponse } from "@/lib/saju/types";
import type { LlmPromptPair } from "../types";
import type { PremiumPromptContext } from "./premium-context";

export type { PremiumPromptContext } from "./premium-context";

const TYPE_FOCUS_KO: Record<ReportType, string> = {
  daily: "오늘 하루 행동 지침, 시간대별 조언",
  decade: "10년 대운 전략, 대운별 인생 로드맵",
  monthly: "이달 전략, 월간 리스크",
  yearly: "올해의 인생 청사진, 분기별 행동과 연간 전략",
  mental: "심리·건강·에너지·회복력, 오행 중 건강 연관 해석 강조",
  love: "연애·결혼·관계, 일주별 궁합 성향",
  career: "직업·직장·성장, 십신 중 관성·식상 강조",
  business: "협업·네트워크·파트너, 비견·겁재 관계 해석",
  wealth: "자산 흐름·재테크 설계, 십신 중 재성·편재·정재 강조",
  lifetime: "대운 전체 타임라인, 봉인된 예언 풀버전, COHORT INSIGHT",
};

const TYPE_FOCUS_EN: Record<ReportType, string> = {
  daily: "today's actions and time-of-day guidance",
  decade: "10-year major-luck strategy and cycle roadmap",
  monthly: "this month's strategy and monthly risks",
  yearly: "this year's roadmap and quarterly actions",
  mental: "mind, health, energy, resilience; emphasize health-linked elements",
  love: "romance, marriage, bonds; day-pillar compatibility tendencies",
  career: "job, workplace, growth; emphasize Officer and Output stars",
  business: "collaboration, network, partners; Peer/Rob Wealth dynamics",
  wealth: "asset flow, wealth design; emphasize Indirect/Direct Wealth stars",
  lifetime: "full major-luck timeline, full sealed prophecy, cohort insight",
};

function commonRules(locale: Locale): string {
  if (locale === "ko") {
    return [
      "공통 지침:",
      `- 호칭: 이름 대신 "${"{dayPillarLabel}"}" 일주 별명 사용`,
      "- 단점은 조건부 강점으로 재프레이밍",
      "- 점수는 최저 40점, 절대 부정적 단정 금지",
      "- 현재 대운 = '지금이 기회' 구조 유지",
      "- 입력 사실만 사용, 확정적 미래 예언 금지",
      "- 전문가 톤, ko locale",
    ].join("\n");
  }
  return [
    "Common rules:",
    '- Address by day pillar nickname, never personal name',
    "- Reframe weaknesses as conditional strengths",
    "- Scores floor at 40; no harsh negativity",
    "- Current major luck = 'now is the opportunity'",
    "- Use only provided facts; avoid definitive predictions",
    "- Professional tone in English",
  ].join("\n");
}

function typeFocus(ctx: PremiumPromptContext): string {
  const custom = resolveReportTypeFocus(ctx);
  if (custom) return custom;
  return ctx.locale === "ko"
    ? TYPE_FOCUS_KO[ctx.reportType]
    : TYPE_FOCUS_EN[ctx.reportType];
}

function pillarBlock(ctx: PremiumPromptContext): string {
  const { mapping, analysisMode, locale } = ctx;
  const dominantEl = dominantElementLabel(mapping.dominantElement, locale);
  const weakEl = dominantElementLabel(mapping.weakElement, locale);
  const hourLine =
    analysisMode === "three_pillars"
      ? locale === "ko"
        ? "시주: 미상(삼주 해석) — 시주 관련 해석 제외"
        : "Hour pillar: unknown (three-pillar reading) — omit hour interpretations"
      : locale === "ko"
        ? `시주: ${mapping.pillars.hour}`
        : `Hour: ${mapping.pillars.hour}`;

  const tenGodLines = mapping.tenGods
    .map((tg) => `${tg.label} ${tg.ganzi}: ${tg.tenGod}`)
    .join("\n");
  const daewoonLines = mapping.daewoonUpcoming
    .map((d) =>
      locale === "ko"
        ? `${d.ganzi} (${d.startAge}세~ / ${d.startYear}년~)`
        : `${d.ganzi} (from age ${d.startAge} / ${d.startYear}~)`
    )
    .join("\n");

  if (locale === "ko") {
    return [
      `- 일주 별명: ${ctx.dayPillarLabel}`,
      `- 리포트 타입: ${REPORT_TYPE_LABELS[ctx.reportType]}`,
      `- 분석 모드: ${analysisMode === "three_pillars" ? "삼주" : "사주"}`,
      `- 년주 ${mapping.pillars.year} / 월주 ${mapping.pillars.month} / 일주 ${mapping.pillars.day}`,
      `- ${hourLine}`,
      `- 일간: ${mapping.dayMaster} (${mapping.dayMasterElement}, ${mapping.dayMasterYinYang})`,
      `- 주도/결핍 오행: ${dominantEl} / ${weakEl}`,
      `- 균형 점수: ${mapping.balanceScore}/100`,
      `- 십신:\n${tenGodLines}`,
      `- 신살: ${mapping.specialSalSummary.join(", ") || "특이 신살 없음"}`,
      `- 향후 대운:\n${daewoonLines}`,
      `- 포커스: ${typeFocus(ctx)}`,
    ].join("\n");
  }

  return [
    `- Day pillar: ${ctx.dayPillarLabel}`,
    `- Report type: ${REPORT_TYPE_LABELS_EN[ctx.reportType]}`,
    `- Mode: ${analysisMode === "three_pillars" ? "three pillars" : "four pillars"}`,
    `- Year ${mapping.pillars.year} / Month ${mapping.pillars.month} / Day ${mapping.pillars.day}`,
    `- ${hourLine}`,
    `- Day master: ${mapping.dayMaster} (${mapping.dayMasterElement}, ${mapping.dayMasterYinYang})`,
    `- Dominant/weak: ${dominantEl} / ${weakEl}`,
    `- Balance: ${mapping.balanceScore}/100`,
    `- Ten gods:\n${tenGodLines}`,
    `- Special sal: ${mapping.specialSalSummary.join(", ") || "none"}`,
    `- Upcoming daewoon:\n${daewoonLines}`,
    `- Focus: ${typeFocus(ctx)}`,
  ].join("\n");
}

function withCommon(system: string, ctx: PremiumPromptContext): string {
  return system.replace("{dayPillarLabel}", ctx.dayPillarLabel) + "\n\n" + commonRules(ctx.locale);
}

function resolveSlotOrDefault(
  slotKey: HumanPremiumPromptSlotKey,
  ctx: PremiumPromptContext,
  defaults: LlmPromptPair,
  options: { pillarBlock: string; focus: string; narrative?: string }
): LlmPromptPair {
  return buildSlotPrompt(slotKey, ctx, options) ?? defaults;
}

export function buildSajuStructurePrompts(ctx: PremiumPromptContext): LlmPromptPair {
  const focus = typeFocus(ctx);
  const block = pillarBlock(ctx);
  const defaults: LlmPromptPair = {
    system: withCommon(
      ctx.locale === "ko"
        ? "사주 구조 해석 전문가. 오행·십신·명리 진단 본문을 작성합니다.\nJSON만: { \"sajuStructure\": \"string\" }"
        : "Chart structure expert. Write structure interpretation body.\nJSON only: { \"sajuStructure\": \"string\" }",
      ctx
    ),
    user:
      (ctx.locale === "ko"
        ? "사주 구조 해석 본문(4~6문단)을 작성하세요.\n"
        : "Write chart structure body (4–6 paragraphs).\n") + block,
  };
  return resolveSlotOrDefault("saju-structure", ctx, defaults, {
    pillarBlock: block,
    focus,
  });
}

export function buildMasterNarrativePrompts(ctx: PremiumPromptContext): LlmPromptPair {
  const focus = typeFocus(ctx);
  const block = pillarBlock(ctx);
  const defaults: LlmPromptPair = {
    system: withCommon(
      ctx.locale === "ko"
        ? "마스터 내러티브 전문가. 리포트 전체 서사의 기준 본문을 작성합니다.\n현재 대운을 '지금이 기회'로 연결.\nJSON만: { \"narrative\": \"string\" }"
        : "Master narrative expert. Write the anchor narrative for downstream sections.\nLink current major luck to 'now is the opportunity'.\nJSON only: { \"narrative\": \"string\" }",
      ctx
    ),
    user:
      (ctx.locale === "ko"
        ? "마스터 내러티브 본문 5~8문단.\n"
        : "Master narrative body, 5–8 paragraphs.\n") + block,
  };
  return resolveSlotOrDefault("master-narrative", ctx, defaults, {
    pillarBlock: block,
    focus,
  });
}

export function buildDeepAnalysisPrompts(
  ctx: PremiumPromptContext,
  narrative: string
): LlmPromptPair {
  const focus = typeFocus(ctx);
  const block = pillarBlock(ctx);
  const narrativeBlock =
    ctx.locale === "ko"
      ? `\n\n[마스터 내러티브]\n${narrative.slice(0, 1200)}`
      : `\n\n[Master narrative]\n${narrative.slice(0, 1200)}`;
  const defaults: LlmPromptPair = {
    system: withCommon(
      ctx.locale === "ko"
        ? "심층 분석(S4) 전문가. 마스터 내러티브를 바탕으로 심층 분석 본문을 작성합니다.\nJSON만: { \"deepAnalysis\": \"string\" }"
        : "Deep analysis (S4) expert. Expand the master narrative into the depth section.\nJSON only: { \"deepAnalysis\": \"string\" }",
      ctx
    ),
    user:
      (ctx.locale === "ko"
        ? "심층 분석 본문 5~8문단.\n"
        : "Deep analysis body, 5–8 paragraphs.\n") +
      block +
      narrativeBlock,
  };
  return resolveSlotOrDefault("deep-analysis", ctx, defaults, {
    pillarBlock: block,
    focus,
    narrative,
  });
}

export function buildOpportunitiesPrompts(
  ctx: PremiumPromptContext,
  narrative: string
): LlmPromptPair {
  const focus = typeFocus(ctx);
  const block = pillarBlock(ctx);
  const narrativeBlock =
    ctx.locale === "ko"
      ? `\n\n[마스터 내러티브]\n${narrative.slice(0, 1200)}`
      : `\n\n[Master narrative]\n${narrative.slice(0, 1200)}`;
  const defaults: LlmPromptPair = {
    system: withCommon(
      ctx.locale === "ko"
        ? "기회 5개를 JSON 배열로. 각 항목 title, body, tip.\nJSON: { \"opportunities\": [{\"title\",\"body\",\"tip\"} x5] }"
        : "Five opportunities as JSON. Each: title, body, tip.\nJSON: { \"opportunities\": [{\"title\",\"body\",\"tip\"} x5] }",
      ctx
    ),
    user:
      (ctx.locale === "ko" ? "포착할 기회 5개.\n" : "Five opportunities to catch.\n") +
      block +
      narrativeBlock,
  };
  return resolveSlotOrDefault("opportunities", ctx, defaults, {
    pillarBlock: block,
    focus,
    narrative,
  });
}

export function buildRisksPrompts(ctx: PremiumPromptContext, narrative: string): LlmPromptPair {
  const focus = typeFocus(ctx);
  const block = pillarBlock(ctx);
  const narrativeBlock = `\n\n[Master narrative]\n${narrative.slice(0, 1200)}`;
  const defaults: LlmPromptPair = {
    system: withCommon(
      ctx.locale === "ko"
        ? "리스크 4개. 단점은 조건부 강점으로. countermeasure 필수.\nJSON: { \"risks\": [{\"title\",\"body\",\"countermeasure\"} x4] }"
        : "Four risks. Reframe as conditional strengths. countermeasure required.\nJSON: { \"risks\": [{\"title\",\"body\",\"countermeasure\"} x4] }",
      ctx
    ),
    user:
      (ctx.locale === "ko" ? "주의 리스크 4개.\n" : "Four caution risks.\n") +
      block +
      (ctx.locale === "ko"
        ? `\n\n[마스터 내러티브]\n${narrative.slice(0, 1200)}`
        : narrativeBlock),
  };
  return resolveSlotOrDefault("risks", ctx, defaults, {
    pillarBlock: block,
    focus,
    narrative,
  });
}

export function buildRoadmapPrompts(ctx: PremiumPromptContext, narrative: string): LlmPromptPair {
  const focus = typeFocus(ctx);
  const block = pillarBlock(ctx);
  const defaults: LlmPromptPair = {
    system: withCommon(
      ctx.locale === "ko"
        ? "로드맵 항목 + 결정의 순간.\nJSON: { \"roadmap\": [{\"period\",\"label\",\"body\"}], \"decisionMoments\": [{\"situation\",\"script\"}] }"
        : "Roadmap items + decision moments.\nJSON: { \"roadmap\": [{\"period\",\"label\",\"body\"}], \"decisionMoments\": [{\"situation\",\"script\"}] }",
      ctx
    ),
    user:
      (ctx.locale === "ko" ? "대운/기간별 로드맵과 결정 스크립트.\n" : "Cycle roadmap and decision scripts.\n") +
      block +
      `\n\n[Master narrative]\n${narrative.slice(0, 1200)}`,
  };
  return resolveSlotOrDefault("roadmap", ctx, defaults, {
    pillarBlock: block,
    focus,
    narrative,
  });
}

export function buildProphecyPrompts(ctx: PremiumPromptContext, narrative: string): LlmPromptPair {
  const isLifetime = ctx.reportType === "lifetime";
  const focus = typeFocus(ctx);
  const block = pillarBlock(ctx);
  const defaults: LlmPromptPair = {
    system: withCommon(
      ctx.locale === "ko"
        ? [
            "봉인된 예언 + COHORT INSIGHT.",
            isLifetime
              ? "full 패턴 5~7줄: [연도범위] 사이 [방향/영역] [기회/제안] [미래] [추가 예언] [기간/전략] [비유]"
              : "short 패턴 2~3줄: [연도]년 [계절/시기] [방향/영역] [기회] 전환점",
            "COHORT: [일주 오행] 일간 [특징] 구조 → [나이대] [경향], 약 [X]% [선택] 시 [결과]",
            isLifetime
              ? 'JSON: { "prophecy": { "short": "...", "full": "..." }, "cohortInsight": { "body": "..." } }'
              : 'JSON: { "prophecy": { "short": "..." }, "cohortInsight": { "body": "..." } }',
          ].join("\n")
        : [
            "Sealed prophecy + COHORT INSIGHT.",
            isLifetime ? "full pattern 5–7 lines" : "short pattern 2–3 lines",
            "Cohort statistical insight pattern",
            isLifetime
              ? 'JSON: { "prophecy": { "short": "...", "full": "..." }, "cohortInsight": { "body": "..." } }'
              : 'JSON: { "prophecy": { "short": "..." }, "cohortInsight": { "body": "..." } }',
          ].join("\n"),
      ctx
    ),
    user:
      (ctx.locale === "ko"
        ? `봉인된 예언과 코호트 인사이트.\n현재 연도: ${ctx.currentYear ?? new Date().getFullYear()}년\n`
        : `Sealed prophecy and cohort insight.\nCurrent year: ${ctx.currentYear ?? new Date().getFullYear()}\n`) +
      block +
      `\n\n[Master narrative]\n${narrative.slice(0, 1200)}`,
  };
  return resolveSlotOrDefault("prophecy", ctx, defaults, {
    pillarBlock: block,
    focus,
    narrative,
  });
}

/** Legacy 3-field interpretSaju(human) — kept for interpret.ts */
export function buildHumanInterpretationPrompts(options: {
  mapping: HumanSajuMapping;
  locale: Locale;
  subjectName?: string;
  analysisMode?: "three_pillars" | "four_pillars";
}): LlmPromptPair {
  const { mapping, locale, subjectName } = options;
  const analysisMode = options.analysisMode ?? "four_pillars";
  const isKo = locale === "ko";
  const dominantEl = dominantElementLabel(mapping.dominantElement, locale);
  const weakEl = dominantElementLabel(mapping.weakElement, locale);
  const dayPillar = `${mapping.pillars.day} 일주`;

  const hourLine =
    analysisMode === "three_pillars"
      ? isKo
        ? "시주: 미상(삼주 해석)"
        : "Hour: unknown (three-pillar reading)"
      : isKo
        ? `시 ${mapping.pillars.hour}`
        : `Hour ${mapping.pillars.hour}`;

  const system = isKo
    ? [
        "당신은 전통 명리학 기반 사람 사주 해석 전문가입니다.",
        "입력 데이터의 십신·신살·대운 사실만 활용하고, 확정적 미래 예언은 피하고 '경향·가능성'으로 표현합니다.",
        `호칭: ${dayPillar} 일주 별명 사용.`,
        analysisMode === "three_pillars" ? "시주 미상 — 시주 관련 해석 제외." : "",
        '반드시 JSON만 출력: personality, tenGodAnalysis, daewoonOutlook (모두 string).',
      ]
        .filter(Boolean)
        .join("\n")
    : [
        "You are a traditional saju interpreter for human clients.",
        "Use only provided ten-god, sal, and daewoon facts. Avoid definitive predictions.",
        `Address by ${mapping.pillars.day} day pillar nickname.`,
        analysisMode === "three_pillars" ? "Hour unknown — omit hour interpretations." : "",
        "Return JSON only: personality, tenGodAnalysis, daewoonOutlook (all strings).",
      ].join("\n");

  const tenGodLines = mapping.tenGods
    .map((tg) => `${tg.label} ${tg.ganzi}: ${tg.tenGod}`)
    .join("\n");
  const daewoonLines = mapping.daewoonUpcoming
    .map((d) =>
      isKo
        ? `${d.ganzi} (${d.startAge}세~ / ${d.startYear}년~)`
        : `${d.ganzi} (from age ${d.startAge} / ${d.startYear}~)`
    )
    .join("\n");

  const user = isKo
    ? [
        "다음 사람 사주 매핑을 바탕으로 유료 리포트용 JSON 해석을 작성해주세요.",
        subjectName ? `- 참고: ${subjectName} (본문에는 일주 별명 사용)` : null,
        `- 사주: 년 ${mapping.pillars.year} / 월 ${mapping.pillars.month} / 일 ${mapping.pillars.day} / ${hourLine}`,
        `- 일간: ${mapping.dayMaster} (${mapping.dayMasterElement}, ${mapping.dayMasterYinYang})`,
        `- 주도/결핍 오행: ${dominantEl} / ${weakEl}`,
        `- 십신:\n${tenGodLines}`,
        `- 향후 대운:\n${daewoonLines}`,
        "",
        "personality: 성격·기질 3~5문장",
        "tenGodAnalysis: 십신 해석 3~5문장",
        "daewoonOutlook: 대운 흐름 3~5문장 (지금이 기회 구조)",
      ]
        .filter(Boolean)
        .join("\n")
    : [
        "Write premium human saju JSON interpretation.",
        subjectName ? `- Reference: ${subjectName} (use day pillar nickname in text)` : null,
        `- Pillars: ${mapping.pillars.year} / ${mapping.pillars.month} / ${mapping.pillars.day} / ${hourLine}`,
        `- Day master: ${mapping.dayMaster}`,
        `- Ten gods:\n${tenGodLines}`,
        `- Upcoming daewoon:\n${daewoonLines}`,
      ]
        .filter(Boolean)
        .join("\n");

  return { system, user };
}
