import type { Locale } from "@/lib/saju/types";
import {
  formatFactsBlockForPrompt,
  getMonthlyLuckFact,
  type HumanPremiumFactsBlock,
} from "./facts";

export type HumanPremiumLlmSectionKey =
  | "life-blueprint"
  | "lifetime-fortune"
  | "daewoon"
  | "shinsal"
  | "annual-seun"
  | "monthly-fortune";

export interface HumanPremiumLlmSectionConfig {
  key: HumanPremiumLlmSectionKey;
  sectionId: string;
  targetChars: Record<Locale, number>;
  minChars: Record<Locale, number>;
  month?: number;
}

export const HUMAN_PREMIUM_LLM_SECTIONS: HumanPremiumLlmSectionConfig[] = [
  {
    key: "life-blueprint",
    sectionId: "preface",
    targetChars: { ko: 2000, en: 1200 },
    minChars: { ko: 800, en: 500 },
  },
  {
    key: "lifetime-fortune",
    sectionId: "result-lifetime",
    targetChars: { ko: 2000, en: 1200 },
    minChars: { ko: 800, en: 500 },
  },
  {
    key: "daewoon",
    sectionId: "cycle-daewoon",
    targetChars: { ko: 1200, en: 800 },
    minChars: { ko: 400, en: 300 },
  },
  {
    key: "shinsal",
    sectionId: "cycle-shinsal",
    targetChars: { ko: 1000, en: 700 },
    minChars: { ko: 350, en: 250 },
  },
  {
    key: "annual-seun",
    sectionId: "cycle-annual-seun",
    targetChars: { ko: 1200, en: 800 },
    minChars: { ko: 400, en: 300 },
  },
  {
    key: "monthly-fortune",
    sectionId: "cycle-month-6",
    month: 6,
    targetChars: { ko: 700, en: 500 },
    minChars: { ko: 250, en: 200 },
  },
  {
    key: "monthly-fortune",
    sectionId: "cycle-month-7",
    month: 7,
    targetChars: { ko: 700, en: 500 },
    minChars: { ko: 250, en: 200 },
  },
  {
    key: "monthly-fortune",
    sectionId: "cycle-month-8",
    month: 8,
    targetChars: { ko: 700, en: 500 },
    minChars: { ko: 250, en: 200 },
  },
];

function systemPromptKo(): string {
  return [
    "당신은 지관재(知觀齋)의 심원(心院)입니다.",
    "전통 사주 해석을 바탕으로, 제공된 [계산값 블록]만 사용해 조언형 본문을 작성합니다.",
    "계산값 블록에 없는 신살·대운 세부 항목은 언급하거나 추정하지 마세요.",
    "의학·투자·법률 등 확정적 미래나 전문 조언을 단정하지 마세요.",
    "마크다운, 제목, 번호 목록 없이 본문만 작성하세요. 섹션 제목은 서버가 별도 제공합니다.",
    "따뜻하고 절제된 어조로, 독자가 스스로 선택할 수 있게 안내하세요.",
  ].join("\n");
}

function systemPromptEn(): string {
  return [
    "You are Simwon of Jigwanjae (知觀齋), writing premium human saju guidance.",
    "Use only the provided [Calculated facts block]. Do not invent spirit stars, major luck cycle details, or events.",
    "Do not give medical, financial, or guaranteed predictions.",
    "Plain body text only — no markdown, headings, or numbered lists.",
    "Warm, measured advisory tone.",
  ].join("\n");
}

export function buildHumanPremiumSystemPrompt(locale: Locale): string {
  return locale === "ko" ? systemPromptKo() : systemPromptEn();
}

function sectionInstruction(
  key: HumanPremiumLlmSectionKey,
  locale: Locale,
  targetChars: number,
  facts: HumanPremiumFactsBlock,
  month?: number
): string {
  if (locale === "ko") {
    if (key === "life-blueprint") {
      return [
        `「내 인생의 설계도」 본문을 약 ${targetChars}자 내외로 작성하세요.`,
        "일간·음양·오행·원국 십성·사주주를 연결해 성격, 관계, 일·재물의 기본 틀을 설명하세요.",
        "강한 오행은 재능과 과잉 주의, 약한 오행은 보완 습관을 제안하세요.",
      ].join("\n");
    }
    if (key === "lifetime-fortune") {
      return [
        `「평생사주」 본문을 약 ${targetChars}자 내외로 작성하세요.`,
        "원국 사주·십성·오행 균형을 중심으로 평생의 큰 흐름, 직업·재물·관계의 장기 패턴을 해석하세요.",
        "시주가 없으면 삼주 중심으로 말하고, 말년·자녀운은 단정하지 마세요.",
      ].join("\n");
    }
    if (key === "daewoon") {
      return [
        `「대운」 본문을 약 ${targetChars}자 내외로 작성하세요.`,
        "계산값 블록의 대운 후보만 사용하세요. 성별 미입력으로 순행·역행 후보가 모두 있으면 단정하지 말고 두 흐름의 차이를 안내하세요.",
        "각 대운의 간지·십성을 기반으로 장기적인 성장 과제와 활용법을 조언하세요.",
      ].join("\n");
    }
    if (key === "shinsal") {
      return [
        `「대표 신살」 본문을 약 ${targetChars}자 내외로 작성하세요.`,
        "계산값 블록에 있는 천을귀인·도화·역마·화개·문창 결과만 사용하세요.",
        "신살은 길흉 단정이 아니라 성향과 활용 포인트로 설명하세요.",
      ].join("\n");
    }
    if (key === "annual-seun") {
      return [
        `「${facts.seun.year}년 세운」 본문을 약 ${targetChars}자 내외로 작성하세요.`,
        "세운 간지·십성·세운-원국 상호작용만 사용해 한 해의 큰 흐름과 주의·기회를 설명하세요.",
        "월별 세부 일정이나 사건은 단정하지 마세요.",
      ].join("\n");
    }
    const monthly = month ? getMonthlyLuckFact(facts, month) : undefined;
    return [
      `「${monthly?.label ?? `${facts.seun.year}년 ${month}월`} 월운」 본문을 약 ${targetChars}자 내외로 작성하세요.`,
      "해당 월의 월운 간지·십성만 사용해 그달의 리듬, 관계·일·건강(일반적) 포인트를 조언하세요.",
      "다른 달 운세는 쓰지 마세요.",
    ].join("\n");
  }

  if (key === "life-blueprint") {
    return [
      `Write a "life blueprint" body of about ${targetChars} characters.`,
      "Connect day master, polarity, element mix, natal Ten Gods, and pillars.",
    ].join("\n");
  }
  if (key === "lifetime-fortune") {
    return [
      `Write a lifetime saju reading body of about ${targetChars} characters.`,
      "Focus on long-term patterns from pillars, Ten Gods, and element balance.",
    ].join("\n");
  }
  if (key === "daewoon") {
    return [
      `Write the major luck cycle body of about ${targetChars} characters.`,
      "Use only the daewoon candidates in the facts block. If both directions are listed, do not choose one; explain the difference.",
    ].join("\n");
  }
  if (key === "shinsal") {
    return [
      `Write the representative spirit-star body of about ${targetChars} characters.`,
      "Use only the listed Heavenly Noble, Peach Blossom, Traveling Horse, Canopy, and Literary Noble results.",
    ].join("\n");
  }
  if (key === "annual-seun") {
    return [
      `Write the ${facts.seun.year} annual luck (seun) body of about ${targetChars} characters.`,
      "Use seun pillar, Ten Gods, and seun–natal interactions only.",
    ].join("\n");
  }
  const monthly = month ? getMonthlyLuckFact(facts, month) : undefined;
  return [
    `Write the monthly luck body for ${monthly?.label ?? `month ${month}`} (~${targetChars} characters).`,
    "Use only that month's pillar and Ten Gods from the facts block.",
  ].join("\n");
}

export function buildHumanPremiumSectionUserPrompt(
  key: HumanPremiumLlmSectionKey,
  facts: HumanPremiumFactsBlock,
  locale: Locale,
  targetChars: number,
  month?: number
): string {
  return [
    sectionInstruction(key, locale, targetChars, facts, month),
    "",
    formatFactsBlockForPrompt(facts),
    "",
    locale === "ko"
      ? 'JSON으로 { "body": "본문" } 만 반환하세요.'
      : 'Return JSON only: { "body": "..." }.',
  ].join("\n");
}
