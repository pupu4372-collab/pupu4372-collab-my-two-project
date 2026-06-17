import type { Locale } from "@/lib/saju/types";

export const FORTUNE_MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);

interface LuckReading {
  stemTenGod: string;
  branchTenGod: string;
}

const TEN_GOD_THEME_KO: Record<string, string> = {
  비견: "자기 주도와 동료 협력",
  겁재: "경쟁·분배 속 경계 설정",
  식신: "생산·표현·편안한 성취",
  상관: "창의적 돌파와 재정립",
  편재: "기회 포착과 빠른 순환",
  정재: "안정적 수입과 꾸준한 관리",
  편관: "압박·책임 속 성장",
  정관: "질서·신뢰·사회적 역할",
  편인: "학습·직관·내면 탐색",
  정인: "보호·지원·정서적 안식",
};

const TEN_GOD_THEME_EN: Record<string, string> = {
  Peer: "self-direction and peer collaboration",
  Rob: "competition and fair boundaries",
  "Eating God": "production, expression, and ease",
  "Hurting Officer": "creative breakthrough and reset",
  "Indirect Wealth": "opportunity and quick circulation",
  "Direct Wealth": "steady income and stewardship",
  "Seven Killings": "pressure, duty, and growth",
  "Direct Officer": "order, trust, and social role",
  "Indirect Resource": "study, intuition, and inner search",
  "Direct Resource": "protection, support, and rest",
};

const MONTH_FLAVOR_KO: Record<number, string> = {
  1: "새해 루틴을 정리하고 방향을 고르기 좋은 달입니다.",
  2: "관계 연결과 작은 약속의 신뢰가 쌓이는 달입니다.",
  3: "봄기운 속 실행력이 오르나 서두르지 말고 우선순위를 정하세요.",
  4: "일·학습의 밀도가 높아지니 컨디션 관리가 성과를 좌우합니다.",
  5: "대외 활동과 네트워크가 늘어나는 달, 말투를 부드럽게 유지하세요.",
  6: "상반기를 점검하며 불필요한 약속을 줄이면 여유가 생깁니다.",
  7: "감정 기복이 커질 수 있어 휴식과 수분·수면 리듬을 챙기세요.",
  8: "성과가 드러나는 달, 겸손한 확인 한 번이 오해를 막아 줍니다.",
  9: "정리·수납·계약 검토에 유리한 달, 서명 전에 다시 읽으세요.",
  10: "관계와 일의 균형을 재조정하기 좋은 가을의 숨 고르기입니다.",
  11: "내면 정리와 학습·자격 준비에 에너지를 모으기 좋습니다.",
  12: "한 해를 마무리하며 감사와 다음 해의 씨앗을 남기는 달입니다.",
};

const MONTH_FLAVOR_EN: Record<number, string> = {
  1: "A good month to reset routines and choose direction.",
  2: "Trust builds through small commitments and warm contact.",
  3: "Spring momentum rises—prioritize before you accelerate.",
  4: "Work density increases; rhythm protects your results.",
  5: "Networking expands—keep your tone gentle and clear.",
  6: "Review the first half and trim nonessential promises.",
  7: "Mood swings may surface—guard rest, sleep, and hydration.",
  8: "Results surface—one humble check prevents misunderstanding.",
  9: "Favorable for sorting papers and re-reading contracts.",
  10: "Autumn pause to rebalance relationships and work.",
  11: "Gather energy for study, credentials, and inner order.",
  12: "Close the year with gratitude and seeds for the next.",
};

const TEN_GOD_WORK_KO: Record<string, string> = {
  비견: "동료와 역할을 나누며 주도권을 지키는 것",
  겁재: "경쟁을 자극하지 않도록 분배와 선을 분명히 하는 것",
  식신: "꾸준한 생산과 표현으로 성과를 쌓는 것",
  상관: "기존 방식을 다듬되 충돌 없이 제안하는 것",
  편재: "기회를 빠르게 보되 검증 후 움직이는 것",
  정재: "수입·지출을 정리하고 약속을 지키는 것",
  편관: "책임을 나누고 무리한 확장을 피하는 것",
  정관: "규칙과 신뢰를 지키며 평판을 쌓는 것",
  편인: "학습·정보 수집으로 판단을 보완하는 것",
  정인: "휴식과 지지를 받으며 컨디션을 회복하는 것",
};

const TEN_GOD_RELATION_KO: Record<string, string> = {
  비견: "비슷한 성향의 사람과 협력하되 경계를 유지하는 것",
  겁재: "친밀함과 거리감의 균형을 의식하는 것",
  식신: "편안한 대화와 작은 배려로 관계를 풀어 가는 것",
  상관: "말 한마디의 날카로움을 줄이고 경청하는 것",
  편재: "새로운 인연을 열되 깊이를 확인하는 것",
  정재: "약속과 신뢰를 지키며 관계를 단단히 하는 것",
  편관: "압박을 주고받지 않도록 기대치를 조율하는 것",
  정관: "예의와 책임을 지키며 관계를 정리하는 것",
  편인: "혼자만의 시간을 확보해 감정을 가라앉히는 것",
  정인: "도움을 구하고 받아들이는 유연함을 갖는 것",
};

const TEN_GOD_WORK_EN: Record<string, string> = {
  Peer: "sharing roles while keeping your lead",
  Rob: "clarifying boundaries in competition",
  "Eating God": "building results through steady output",
  "Hurting Officer": "refining ideas without needless conflict",
  "Indirect Wealth": "moving on opportunities after verification",
  "Direct Wealth": "tidying income, spending, and commitments",
  "Seven Killings": "sharing duty and avoiding overextension",
  "Direct Officer": "protecting trust and reputation",
  "Indirect Resource": "supporting judgment with study",
  "Direct Resource": "recovering rhythm through rest and support",
};

const TEN_GOD_RELATION_EN: Record<string, string> = {
  Peer: "cooperating with peers while keeping boundaries",
  Rob: "balancing closeness and distance",
  "Eating God": "easing ties through warm, simple care",
  "Hurting Officer": "softening words and listening more",
  "Indirect Wealth": "opening new ties while checking depth",
  "Direct Wealth": "keeping promises to strengthen trust",
  "Seven Killings": "adjusting expectations to reduce pressure",
  "Direct Officer": "holding courtesy and responsibility",
  "Indirect Resource": "securing quiet time to settle emotions",
  "Direct Resource": "accepting help with flexibility",
};

function tenGodHint(
  god: string,
  table: Record<string, string>,
  fallback: string
): string {
  const hit = Object.entries(table).find(([key]) => god.includes(key));
  return hit?.[1] ?? fallback;
}

function tenGodTheme(god: string, locale: Locale): string {
  const table = locale === "ko" ? TEN_GOD_THEME_KO : TEN_GOD_THEME_EN;
  return tenGodHint(
    god,
    table,
    locale === "ko" ? "균형과 조율" : "balance and adjustment"
  );
}

export function monthLuckLabel(year: number, month: number, locale: Locale): string {
  if (locale === "ko") return `${year}년 ${month}월`;
  return new Date(year, month - 1, 15).toLocaleString("en", {
    month: "long",
    year: "numeric",
  });
}

export function buildAnnualSeunNarrative(input: {
  year: number;
  pillarLabel: string;
  reading: LuckReading;
  interactions: string[];
  locale: Locale;
}): string {
  const { year, pillarLabel, reading, interactions, locale } = input;
  const stemTheme = tenGodTheme(reading.stemTenGod, locale);
  const branchTheme = tenGodTheme(reading.branchTenGod, locale);

  if (locale === "ko") {
    const interactionPara =
      interactions.length > 0
        ? `원국과 만나는 신호로는 ${interactions.join(", ")} 등이 눈에 띕니다. 한 해 내내 특정 영역에서 자극과 조율이 반복될 수 있으니, 반응 속도를 늦추고 사실 관계를 확인하는 습관이 도움이 됩니다.`
        : `원국과 세운 사이에 뚜렷한 충·합 신호는 약해, 올해는 외부 변수보다 스스로 정한 리듬을 지키는 것이 더 중요합니다. 큰 변화를 서두르기보다 기반을 다지는 해로 활용하세요.`;

    return [
      `${year}년 세운은 ${pillarLabel}로, 한 해 전체의 큰 줄기를 이룹니다. 천간에는 ${reading.stemTenGod}의 기운이 겉으로 드러나는 방향과 속도를, 지지에는 ${reading.branchTenGod}의 결을 삶의 바탕과 현실 감각에 실어 줍니다.`,
      `천간 십성은 ${stemTheme}를 강조하고, 지지 십성은 ${branchTheme} 쪽으로 무게가 실립니다. 상반기에는 대외 선택과 실행, 하반기에는 관계의 질과 내면 정리를 점검하는 흐름이 자연스럽습니다.`,
      `일과 재물에서는 ${reading.stemTenGod} 성향에 맞게 기회를 고를 때 속도 조절이 핵심이고, 관계에서는 ${reading.branchTenGod} 에너지가 거리감과 기대치를 좌우합니다. 약속과 말투를 의식하면 불필요한 마찰을 줄일 수 있습니다.`,
      interactionPara,
      `건강과 컨디션은 무리한 확장보다 규칙적인 휴식이 안전장치입니다. 올해는 앞서 나가기보다 반복 가능한 루틴을 쌓아 두면 다음 해로 이어질 자산이 됩니다. 길흉을 단정하기보다 세운의 기운을 알고 선택권을 넓히는 태도가 지관재가 권하는 읽는 법입니다.`,
    ].join("\n\n");
  }

  const interactionPara =
    interactions.length > 0
      ? `Natal signals include ${interactions.join("; ")}. Expect recurring themes of adjustment—slow reactions and verify facts before you commit.`
      : `No strong clash or harmony signals appear between seun and natal pillars. This year favors the rhythm you choose over outside noise—build foundations instead of rushing change.`;

  return [
    `${year} annual luck (seun) is ${pillarLabel}, setting the year's main stem. The stem carries ${reading.stemTenGod} (${stemTheme}); the branch carries ${reading.branchTenGod} (${branchTheme}).`,
    `The first half favors outward choices and execution; the second half invites review of relationship quality and inner order.`,
    `In work and resources, pace your opportunities through ${reading.stemTenGod} energy. In relationships, ${reading.branchTenGod} shapes distance and expectations—mind your tone and commitments.`,
    interactionPara,
    `Guard health through steady rest rather than overextension. Repeatable routines this year become assets for the next. Jigwanjae reads seun not as fixed fate but as a map for widening your choices.`,
  ].join("\n\n");
}

export function buildMonthlyLuckNarrative(input: {
  year: number;
  month: number;
  pillarLabel: string;
  reading: LuckReading;
  locale: Locale;
}): string {
  const { year, month, pillarLabel, reading, locale } = input;
  const label = monthLuckLabel(year, month, locale);
  const stemTheme = tenGodTheme(reading.stemTenGod, locale);
  const branchTheme = tenGodTheme(reading.branchTenGod, locale);
  const monthFlavor =
    locale === "ko" ? MONTH_FLAVOR_KO[month] : MONTH_FLAVOR_EN[month];

  const workHint = tenGodHint(
    reading.stemTenGod,
    locale === "ko" ? TEN_GOD_WORK_KO : TEN_GOD_WORK_EN,
    locale === "ko" ? "무리한 확장을 피하고 우선순위를 정하는 것" : "prioritizing and avoiding overextension"
  );
  const relationHint = tenGodHint(
    reading.branchTenGod,
    locale === "ko" ? TEN_GOD_RELATION_KO : TEN_GOD_RELATION_EN,
    locale === "ko" ? "말투와 약속을 부드럽게 지키는 것" : "keeping tone and commitments gentle and clear"
  );

  if (locale === "ko") {
    return `${label} 월운은 ${pillarLabel}입니다. 천간 ${reading.stemTenGod}은 ${stemTheme}의 기운으로 일과 대외 활동의 방향을, 지지 ${reading.branchTenGod}은 ${branchTheme}의 결로 관계와 컨디션의 밑바탕을 만듭니다. ${monthFlavor} 일에서는 ${workHint}에, 관계·건강 리듬에서는 ${relationHint}에 무게를 두면 한 달의 운을 고르게 쓸 수 있습니다. 작은 약속을 지키고 서두른 결정은 한 번 더 확인하세요.`;
  }

  return `${label} monthly luck is ${pillarLabel}. Stem ${reading.stemTenGod} (${stemTheme}) shapes work and outward moves; branch ${reading.branchTenGod} (${branchTheme}) grounds relationships and rhythm. ${monthFlavor} Favor ${workHint} at work and ${relationHint} in ties. Keep small promises and double-check rushed choices.`;
}
