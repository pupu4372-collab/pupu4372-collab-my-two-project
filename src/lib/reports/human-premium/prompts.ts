import type { Locale } from "@/lib/saju/types";
import {
  formatFactsBlockForPrompt,
  getMonthlyLuckFact,
  type HumanPremiumFactsBlock,
} from "./facts";
import { yearFortuneTitle } from "./year-fortune-narratives";

export type HumanPremiumLlmSectionKey =
  | "life-blueprint"
  | "year-fortune"
  | "temperament"
  | "gyeokguk-yongsin"
  | "wealth"
  | "career"
  | "love"
  | "health-risk"
  | "lucky-items"
  | "final-advice"
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

const YEAR_FORTUNE_LLM_SECTIONS: HumanPremiumLlmSectionConfig[] = [
  {
    key: "year-fortune",
    sectionId: "result-year-fortune",
    targetChars: { ko: 600, en: 400 },
    minChars: { ko: 480, en: 320 },
  },
  {
    key: "temperament",
    sectionId: "result-temperament",
    targetChars: { ko: 800, en: 550 },
    minChars: { ko: 600, en: 420 },
  },
  {
    key: "gyeokguk-yongsin",
    sectionId: "result-gyeokguk-yongsin",
    targetChars: { ko: 800, en: 550 },
    minChars: { ko: 600, en: 420 },
  },
  {
    key: "wealth",
    sectionId: "result-wealth",
    targetChars: { ko: 700, en: 480 },
    minChars: { ko: 520, en: 360 },
  },
  {
    key: "career",
    sectionId: "result-career",
    targetChars: { ko: 700, en: 480 },
    minChars: { ko: 520, en: 360 },
  },
  {
    key: "love",
    sectionId: "result-love",
    targetChars: { ko: 700, en: 480 },
    minChars: { ko: 520, en: 360 },
  },
  {
    key: "health-risk",
    sectionId: "result-health-risk",
    targetChars: { ko: 700, en: 480 },
    minChars: { ko: 520, en: 360 },
  },
  {
    key: "lucky-items",
    sectionId: "result-lucky-items",
    targetChars: { ko: 450, en: 320 },
    minChars: { ko: 350, en: 250 },
  },
  {
    key: "final-advice",
    sectionId: "result-final-advice",
    targetChars: { ko: 200, en: 140 },
    minChars: { ko: 120, en: 90 },
  },
];

const HUMAN_PREMIUM_LLM_BASE_SECTIONS: HumanPremiumLlmSectionConfig[] = [
  {
    key: "life-blueprint",
    sectionId: "preface",
    targetChars: { ko: 2000, en: 1200 },
    minChars: { ko: 800, en: 500 },
  },
  ...YEAR_FORTUNE_LLM_SECTIONS,
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
    targetChars: { ko: 500, en: 350 },
    minChars: { ko: 420, en: 280 },
  },
];

const HUMAN_PREMIUM_LLM_MONTHLY_SECTIONS: HumanPremiumLlmSectionConfig[] =
  Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    return {
      key: "monthly-fortune" as const,
      sectionId: `cycle-month-${month}`,
      month,
      targetChars: { ko: 200, en: 160 },
      minChars: { ko: 170, en: 135 },
    };
  });

export const HUMAN_PREMIUM_LLM_SECTIONS: HumanPremiumLlmSectionConfig[] = [
  ...HUMAN_PREMIUM_LLM_BASE_SECTIONS,
  ...HUMAN_PREMIUM_LLM_MONTHLY_SECTIONS,
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
  const yearTitle = yearFortuneTitle(facts.seun.year, locale);

  if (locale === "ko") {
    if (key === "life-blueprint") {
      return [
        `「평생사주 총평-운명을 알아가는 긴 여정」 본문을 약 ${targetChars}자 내외로 작성하세요.`,
        "일간·음양·오행·원국 십성·사주주를 연결해 평생의 큰 흐름, 성격, 관계, 일·재물의 기본 틀을 설명하세요.",
        "강한 오행은 재능과 과잉 주의, 약한 오행은 보완 습관을 제안하세요.",
      ].join("\n");
    }
    if (key === "year-fortune") {
      return [
        `「${yearTitle}」 본문을 약 ${targetChars}자 내외로 작성하세요.`,
        `${facts.seun.year}년 세운·원국과의 상호작용을 중심으로 한 해 총평의 서두를 쓰세요.`,
      ].join("\n");
    }
    if (key === "temperament") {
      return [
        `「성격 및 기질 총평」 본문을 약 ${targetChars}자 내외로 작성하세요.`,
        "겉으로 드러나는 사회적 페르소나(년·월)와 무의식 속 내면(일·시)을 십성·사주주로 비교 분석하세요.",
      ].join("\n");
    }
    if (key === "gyeokguk-yongsin") {
      return [
        `「격국(格局)과 용신(用神)」 본문을 약 ${targetChars}자 내외로 작성하세요.`,
        "월령·일간·오행 균형만 사용해 격국의 중심 정체성과 위기 시 균형을 잡는 용신(보완 오행)을 제시하세요. 정통 격명을 단정하지 말고 조언형으로 쓰세요.",
      ].join("\n");
    }
    if (key === "wealth") {
      return [
        `「재물운 (Wealth)」 본문을 약 ${targetChars}자 내외로 작성하세요.`,
        "타고난 그릇, 직장·사업 기로, 평생 재테크 성향을 십성·오행으로 설명하세요.",
      ].join("\n");
    }
    if (key === "career") {
      return [
        `「직업/성공운 (Career)」 본문을 약 ${targetChars}자 내외로 작성하세요.`,
        "사회적 출세 시기 후보와 강력한 무기가 될 직업군을 십성·월주·일주로 조언하세요.",
      ].join("\n");
    }
    if (key === "love") {
      return [
        `「연애/결혼운 (Love)」 본문을 약 ${targetChars}자 내외로 작성하세요.`,
        "끌리는 이성의 형태, 배우자 복, 인연이 단단해지는 시기를 일지·십성·신살(제공된 것만)로 설명하세요.",
      ].join("\n");
    }
    if (key === "health-risk") {
      return [
        `「건강 및 조심해야 할 액운」 본문을 약 ${targetChars}자 내외로 작성하세요.`,
        "약한 오행·대표 신살(제공된 것만)로 선천적 취약 리듬과 구설·사고 주의를 일반적으로 조언하세요. 의학적 진단을 단정하지 마세요.",
      ].join("\n");
    }
    if (key === "lucky-items") {
      return [
        `「나만의 행운 아이템」 본문을 약 ${targetChars}자 내외로 작성하세요.`,
        "부족한 오행을 보완할 색상, 숫자, 방향, 음식 처방을 구체적으로 제시하세요.",
      ].join("\n");
    }
    if (key === "final-advice") {
      return [
        `「인생의 최종 조언」 본문을 약 ${targetChars}자 내외로 작성하세요.`,
        "심원 관장이 이 사주의 주인공에게 전하는 따뜻하고 냉철한 한 줄 평에 가까운 마무리를 쓰세요.",
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
      `「${monthly?.label ?? `${facts.seun.year}년 ${month}월`} 월운」 본문을 기준 ${targetChars}자 분량으로, 가능한 한 빈틈없이 채워 작성하세요.`,
      "해당 월의 월운 간지·십성만 사용해 그달의 리듬, 관계·일·건강(일반적) 포인트를 조언하세요.",
      "다른 달 운세는 쓰지 마세요.",
    ].join("\n");
  }

  if (key === "life-blueprint") {
    return [
      `Write the "Lifetime overview — a long journey of knowing your fate" body of about ${targetChars} characters.`,
      "Connect day master, polarity, element mix, natal Ten Gods, and pillars across the lifetime arc.",
    ].join("\n");
  }
  if (key === "year-fortune") {
    return [
      `Write the "${yearTitle}" body of about ${targetChars} characters.`,
      `Focus on ${facts.seun.year} seun and natal chart interaction.`,
    ].join("\n");
  }
  if (key === "temperament") {
    return [
      `Write the temperament overview body of about ${targetChars} characters.`,
      "Compare outer persona (year/month) and inner self (day/hour) using Ten Gods and pillars.",
    ].join("\n");
  }
  if (key === "gyeokguk-yongsin") {
    return [
      `Write the chart frame & yongsin body of about ${targetChars} characters.`,
      "Use month, day master, and element balance only; advisory tone, no rigid classical frame names.",
    ].join("\n");
  }
  if (key === "wealth") {
    return [
      `Write the Wealth body of about ${targetChars} characters.`,
      "Cover capacity, career/business forks, and lifetime money habits from Ten Gods and elements.",
    ].join("\n");
  }
  if (key === "career") {
    return [
      `Write the Career & success body of about ${targetChars} characters.`,
      "Suggest recognition windows and strong professional lanes from pillars and Ten Gods.",
    ].join("\n");
  }
  if (key === "love") {
    return [
      `Write the Love & marriage body of about ${targetChars} characters.`,
      "Describe attraction patterns, partnership luck, and bonding timing from day branch and provided stars.",
    ].join("\n");
  }
  if (key === "health-risk") {
    return [
      `Write the Health & caution stars body of about ${targetChars} characters.`,
      "Use weak elements and listed spirit stars only; no medical diagnosis.",
    ].join("\n");
  }
  if (key === "lucky-items") {
    return [
      `Write the Personal luck items body of about ${targetChars} characters.`,
      "Give color, number, direction, and food prescriptions to support weak elements.",
    ].join("\n");
  }
  if (key === "final-advice") {
    return [
      `Write the Final counsel body of about ${targetChars} characters.`,
      "Close with one warm, clear line from Simwon to this reader.",
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
    `Write the monthly luck body for ${monthly?.label ?? `month ${month}`} at about ${targetChars} characters; fill the space as fully as the facts allow.`,
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
