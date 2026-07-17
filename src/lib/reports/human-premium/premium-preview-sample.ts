import type { Locale } from "@/lib/saju/types";
import type { HumanPremiumReportPayload } from "./types";

function emptyPayload(
  locale: Locale,
  structured: HumanPremiumReportPayload["structured"]
): HumanPremiumReportPayload {
  return {
    version: 1,
    generatedAt: "2026-01-01T00:00:00.000Z",
    personName: locale === "ko" ? "집사" : "Pet parent",
    locale,
    reportType: "daily",
    calendarType: "solar",
    birthBasis: {
      birthDate: "1990-01-01",
      birthTime: null,
      birthTimeUnknown: true,
      timezone: "Asia/Seoul",
      calendarType: "solar",
      locale,
    },
    analysisMode: "three_pillars",
    structured,
    cover: { title: "", subtitle: "", tagline: "" },
    summary: { headline: "", story: "", traits: [] },
    saju: {
      dominantElement: "mok",
      pillars: {},
      elements: [],
      chapters: [],
      sectionCount: 0,
      estimatedPages: 0,
    },
    zodiac: {
      signKey: "",
      signName: "",
      chapters: [],
      sectionCount: 0,
      estimatedPages: 0,
    },
    totals: { sections: 0, estimatedPages: 0 },
  };
}

const KO_STRUCTURED: HumanPremiumReportPayload["structured"] = {
  scores: [],
  opportunities: [
    {
      title: "오전 집중 기획의 창",
      body: "오늘 '수' 기운이 크게 일어나 직관과 아이디어가 살아나는 날입니다. 오전에 핵심 기획 업무 하나에 집중해 보세요.",
      tip: "오전 9시~11시, 조용한 자리에서 오늘 가장 중요한 목표를 세 줄 이내로 종이에 적어 보세요.",
    },
    {
      title: "정오 결정의 황금 창구",
      body: "11시~13시 '화' 기운이 올라 원국에 부족한 '금' 기운을 보완해 판단이 또렷해지는 시간입니다.",
      tip: "11시 30분 알람을 맞춰 두고, 가장 중요한 미답변·승인·제안을 오늘 안에 처리하세요.",
    },
    {
      title: "넘치는 수 기운의 전환",
      body: "수 기운이 과하면 감정에 휘둘릴 수 있지만, 타인 감정을 읽는 힘으로 전환하면 강점이 됩니다.",
      tip: "대화 전 3초 리듬 호흡을 해보세요. 오늘은 모든 답장을 3초 멈춘 뒤 보내는 규칙을 정하세요.",
    },
    {
      title: "역마 기운의 이동 찬스",
      body: "월주 역마살과 오늘의 수 기운이 맞물려 이동·새 연결이 열립니다.",
      tip: "오후 2~4시, 오래 연락하지 않은 지인·협업자에게 짧은 안부 메시지를 보내 보세요.",
    },
    {
      title: "재물 감각 날카로운 오늘",
      body: "편재 기운이 활성화되어 숫자·실무 감각이 평소보다 날카롭습니다.",
      tip: "퇴근 후 10분, 이번 주 지출 내역 또는 진행 중인 거래 조건을 검토하세요.",
    },
  ],
  risks: [
    {
      title: "감정 과잉 반응 주의",
      body: "넘치는 수 기운과 편인의 예민한 직관이 겹치면 오전 대화에서 감정적 충동이 올 수 있습니다.",
      countermeasure:
        "답하기 전 3초 세기, 오전 메시지 간격 최소 10분 유지",
    },
    {
      title: "재물 판단 흐려짐",
      body: "편재 기운이 직관에 의존하게 만들어 논리보다 감각에 끌릴 수 있습니다.",
      countermeasure:
        "지출·계약 결정은 오전 11시~13시까지 미루고, 결정 전 장단점 3가지를 적어 보세요.",
    },
    {
      title: "에너지 분산 과부하",
      body: "역마살과 멀티태스킹 충동이 겹쳐 일을 많이 시작하고 끝내지 못할 수 있습니다.",
      countermeasure:
        "오늘 할 일 3개만 고르고, 가장 중요한 하나를 먼저 끝낸 뒤 나머지를 미루세요.",
    },
    {
      title: "겁재 경쟁 심리 자극",
      body: "겁재 기운으로 불필요한 경쟁·주도권 다툼이 올 수 있습니다.",
      countermeasure:
        "회의에서 상대 말을 끝까지 듣고, 오후 대화 전 심호흡 3회",
    },
  ],
  roadmap: [],
  decisionMoments: [
    {
      situation: "협상 망설임",
      script:
        "나만의 기준을 먼저 정하고, 그 기준에 맞지 않으면 오늘은 보류하겠습니다.",
    },
    {
      situation: "가족 서운함",
      script:
        "감정이 올라올 때는 10분만 쉬었다가, 사실부터 맞추며 무엇이 필요했는지 먼저 묻겠습니다.",
    },
    {
      situation: "지출·투자 흔들림",
      script:
        "오늘은 내 재무 기준을 적어 두고, 그 한도 안에서만 결정하겠습니다.",
    },
    {
      situation: "업무 과다 막막함",
      script:
        "오늘 끝낼 일 세 가지만 적고, 그중 가장 중요한 하나부터 시작하겠습니다.",
    },
  ],
  prophecy: {
    short: "",
    full: "이번 주 떠오른 아이디어나 대화가 가을쯤 뜻밖의 제안이나 계약으로 이어질 수 있습니다. 지금 적어 둔 메모를 지우지 마세요.",
  },
  cohortInsight: {
    body: "갑목 일주에 수 기운이 강한 패턴입니다. 같은 사주 유형의 72%가 30대 중반~40대 초반에 기획·연구·콘텐츠 분야에서 전환점을 맞이했습니다.",
  },
};

const EN_STRUCTURED: HumanPremiumReportPayload["structured"] = {
  scores: [],
  opportunities: [
    {
      title: "Morning planning window",
      body: "Strong Water energy today — intuition and ideas run high. Focus on one core planning task this morning.",
      tip: "Between 9–11 AM, write your top goal in three lines or less in a quiet spot.",
    },
    {
      title: "Noon decision window",
      body: "Fire rises 11 AM–1 PM, sharpening judgment where Metal is thin in your chart.",
      tip: "Set an 11:30 AM alarm and clear your most important pending reply or approval today.",
    },
    {
      title: "Turning excess Water",
      body: "Overflowing Water can sway emotions — redirect it into reading others' feelings.",
      tip: "Take a 3-second breath before speaking; pause 3 seconds before every reply today.",
    },
    {
      title: "Travel-star connection",
      body: "Month-pillar travel star meets today's Water — movement and new contacts open doors.",
      tip: "Between 2–4 PM, send a short check-in to someone you have not contacted lately.",
    },
    {
      title: "Sharper money sense",
      body: "Indirect-wealth energy is active — numbers and practical detail feel sharper than usual.",
      tip: "After work, spend 10 minutes reviewing this week's spending or deal terms.",
    },
  ],
  risks: [
    {
      title: "Emotional overreaction",
      body: "Overflowing Water plus sensitive intuition can spike impulses in morning conversations.",
      countermeasure: "Count to three before replying; keep at least 10 minutes between morning messages.",
    },
    {
      title: "Clouded money judgment",
      body: "Wealth energy may lean on intuition over logic — sensory pull over real profit.",
      countermeasure: "Delay spending or contracts until 11 AM–1 PM; list three pros and cons first.",
    },
    {
      title: "Energy scatter",
      body: "Travel star plus multitasking urge — many starts, few finishes.",
      countermeasure: "Pick only three tasks today; finish the most important one first.",
    },
    {
      title: "Competitive friction",
      body: "Rival energy can spark unnecessary competition or power struggles.",
      countermeasure: "Listen fully in meetings; take three deep breaths before afternoon talks.",
    },
  ],
  roadmap: [],
  decisionMoments: [
    {
      situation: "Negotiation hesitation",
      script: "I will set my criteria first — if it does not fit, I will pause today.",
    },
    {
      situation: "Family hurt feelings",
      script: "When emotions rise, I will rest 10 minutes, align on facts, then ask what was needed.",
    },
    {
      situation: "Spending wobble",
      script: "I will write my money rules today and decide only within that limit.",
    },
    {
      situation: "Work overload",
      script: "I will list three finishable tasks and start with the most important one.",
    },
  ],
  prophecy: {
    short: "",
    full: "Ideas or talks from this week may surface as surprise offers or contracts by autumn. Do not delete the notes you write now.",
  },
  cohortInsight: {
    body: "Gap-Mok day master with strong Water — 72% of similar charts hit a turning point in planning, research, or content roles between their mid-30s and early 40s.",
  },
};

export function getPremiumReportPreviewSample(locale: Locale): HumanPremiumReportPayload {
  return emptyPayload(locale, locale === "ko" ? KO_STRUCTURED : EN_STRUCTURED);
}
