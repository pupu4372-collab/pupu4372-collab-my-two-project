import { ELEMENT_META, ELEMENT_ORDER } from "@/lib/saju/elements";
import {
  computeDaewoonCandidates,
  computeMonthLuckPillar,
  computeSeunNatalInteractions,
  computeSeunPillar,
  describeLuckPillar,
} from "@/lib/saju/luck-pillars";
import { computeRepresentativeShinsal } from "@/lib/saju/shinsal";
import type { ElementKey, Locale, PillarDisplay, SajuBasicResponse } from "@/lib/saju/types";
import { getZodiacSignFromBirthDate } from "@/lib/saju/zodiac/signs";
import type { ZodiacSignKey } from "@/lib/saju/zodiac/signs";
import type {
  HumanPremiumReportChapter,
  HumanPremiumReportSection,
} from "./types";

const LIFE_DOMAINS: Array<{ id: string; ko: string; en: string }> = [
  { id: "career", ko: "커리어와 일", en: "Career & Work" },
  { id: "wealth", ko: "재물과 기회", en: "Wealth & Opportunity" },
  { id: "health", ko: "건강과 리듬", en: "Health & Rhythm" },
  { id: "love", ko: "연애와 설렘", en: "Love & Romance" },
  { id: "marriage", ko: "결혼과 동행", en: "Partnership & Marriage" },
  { id: "family", ko: "가족과 뿌리", en: "Family & Roots" },
  { id: "friendship", ko: "인간관계", en: "Friendship & Network" },
  { id: "growth", ko: "내면 성장", en: "Inner Growth" },
  { id: "creativity", ko: "창의와 표현", en: "Creativity & Expression" },
  { id: "travel", ko: "이동과 변화", en: "Travel & Change" },
];

const PILLAR_IDS = ["year", "month", "day", "hour"] as const;

const PILLAR_LABEL: Record<
  (typeof PILLAR_IDS)[number],
  { ko: string; en: string }
> = {
  year: { ko: "년주", en: "Year Pillar" },
  month: { ko: "월주", en: "Month Pillar" },
  day: { ko: "일주", en: "Day Pillar" },
  hour: { ko: "시주", en: "Hour Pillar" },
};

const ZODIAC_HUMAN: Record<
  ZodiacSignKey,
  {
    ko: { headline: string; temperament: string; bond: string; growth: string };
    en: { headline: string; temperament: string; bond: string; growth: string };
  }
> = {
  aries: {
    ko: {
      headline: "먼저 움직이는 용기의 별자리",
      temperament: "새로운 자극에 빠르게 반응하고, 결정을 미루기보다 직접 부딪혀 길을 여는 타입입니다.",
      bond: "관계에서는 솔직한 호감 표현과 함께하는 행동이 신뢰를 키웁니다.",
      growth: "속도를 조절하는 호흡 루틴이 장기적인 성취를 지켜줍니다.",
    },
    en: {
      headline: "A constellation of first moves",
      temperament: "You respond quickly to new signals and prefer action over hesitation.",
      bond: "Trust grows through honest affection and shared momentum.",
      growth: "Pacing rituals protect long-term wins from burnout.",
    },
  },
  taurus: {
    ko: {
      headline: "느리지만 깊은 안정의 별자리",
      temperament: "익숙한 리듬과 예측 가능한 환경에서 힘을 회복하는 타입입니다.",
      bond: "시간이 쌓일수록 깊어지는 신뢰형 관계를 선호합니다.",
      growth: "작은 변화를 천천히 받아들이면 안정과 확장을 동시에 잡을 수 있습니다.",
    },
    en: {
      headline: "Slow, deep stability",
      temperament: "You recharge through familiar rhythm and dependable surroundings.",
      bond: "Relationships deepen through patience and repeated care.",
      growth: "Gradual change keeps comfort and expansion in balance.",
    },
  },
  gemini: {
    ko: {
      headline: "호기심이 연결을 만드는 별자리",
      temperament: "정보, 대화, 아이디어 교환이 삶의 에너지를 올립니다.",
      bond: "가벼운 대화와 유연한 만남이 인연을 넓혀줍니다.",
      growth: "집중 시간을 따로 두면 산만함 대신 다재다능함이 살아납니다.",
    },
    en: {
      headline: "Curiosity that connects",
      temperament: "Ideas, conversation, and variety fuel your momentum.",
      bond: "Light dialogue and flexible meetups expand your circle.",
      growth: "Protected focus time turns scatter into versatility.",
    },
  },
  cancer: {
    ko: {
      headline: "감정의 온도를 읽는 별자리",
      temperament: "분위기와 안전감에 민감하며, 마음이 열린 공간을 소중히 여깁니다.",
      bond: "곁에 머무는 시간과 세심한 배려가 애정의 언어입니다.",
      growth: "감정을 기록하고 회복 루틴을 만들면 예민함이 통찰로 바뀝니다.",
    },
    en: {
      headline: "A reader of emotional weather",
      temperament: "Atmosphere and safety matter deeply to how you move.",
      bond: "Presence and thoughtful care are your love language.",
      growth: "Journaling and recovery rituals turn sensitivity into insight.",
    },
  },
  leo: {
    ko: {
      headline: "빛을 나누는 별자리",
      temperament: "인정받고 존재감을 드러낼 때 에너지가 커집니다.",
      bond: "진심 어린 칭찬과 함께하는 축하가 관계를 단단하게 합니다.",
      growth: "스포트라이트와 휴식을 번갈아 두면 카리스마가 오래갑니다.",
    },
    en: {
      headline: "A sign that shares the light",
      temperament: "Recognition and visible expression raise your energy.",
      bond: "Sincere praise and shared celebration strengthen bonds.",
      growth: "Alternating spotlight and rest keeps charisma sustainable.",
    },
  },
  virgo: {
    ko: {
      headline: "디테일로 삶을 다듬는 별자리",
      temperament: "정리, 점검, 개선 루프에서 안정감을 얻습니다.",
      bond: "실질적인 도움과 꾸준한 신뢰가 관계의 핵심입니다.",
      growth: "완벽보다 '충분히 좋음'을 허용하면 부담이 줄어듭니다.",
    },
    en: {
      headline: "Refining life through detail",
      temperament: "Order, review, and improvement loops calm your mind.",
      bond: "Practical support and steady reliability define trust.",
      growth: "Allowing 'good enough' eases perfection pressure.",
    },
  },
  libra: {
    ko: {
      headline: "균형과 조화를 찾는 별자리",
      temperament: "관계의 온도와 미적 균형에 민감합니다.",
      bond: "서로를 존중하는 대화와 공정한 분위기가 마음을 엽니다.",
      growth: "결정을 미루지 않도록 작은 선택 연습이 도움이 됩니다.",
    },
    en: {
      headline: "Seeking balance and harmony",
      temperament: "You sense relational tone and aesthetic balance keenly.",
      bond: "Respectful dialogue and fair atmosphere open your heart.",
      growth: "Small decision drills reduce hesitation.",
    },
  },
  scorpio: {
    ko: {
      headline: "깊이를 파고드는 별자리",
      temperament: "겉보다 속, 진실보다 신뢰를 중시합니다.",
      bond: "얕은 관계보다 깊고 단단한 연결을 선호합니다.",
      growth: "감정을 안전하게 배출하는 루틴이 집착을 완화합니다.",
    },
    en: {
      headline: "Depth over surface",
      temperament: "You value trust and truth more than appearances.",
      bond: "You prefer few bonds that run deep.",
      growth: "Safe emotional release routines soften fixation.",
    },
  },
  sagittarius: {
    ko: {
      headline: "확장과 탐색의 별자리",
      temperament: "새로운 시야, 여행, 배움이 삶의 연료입니다.",
      bond: "함께 배우고 웃는 경험이 인연을 키웁니다.",
      growth: "자유와 약속의 경계를 분명히 하면 관계가 더 편안해집니다.",
    },
    en: {
      headline: "Expansion and exploration",
      temperament: "New horizons, travel, and learning fuel you.",
      bond: "Shared laughter and learning deepen connection.",
      growth: "Clear boundaries between freedom and commitment help.",
    },
  },
  capricorn: {
    ko: {
      headline: "구조와 책임의 별자리",
      temperament: "목표, 계획, 장기적 성과에 강점이 있습니다.",
      bond: "약속을 지키는 모습이 신뢰의 기반이 됩니다.",
      growth: "성과 사이에 쉼을 넣으면 냉정함이 지혜로 바뀝니다.",
    },
    en: {
      headline: "Structure and responsibility",
      temperament: "Goals, planning, and long arcs suit your nature.",
      bond: "Keeping promises builds durable trust.",
      growth: "Rest between milestones turns discipline into wisdom.",
    },
  },
  aquarius: {
    ko: {
      headline: "독립과 아이디어의 별자리",
      temperament: "자유로운 사고와 독창적 관점이 매력 포인트입니다.",
      bond: "친구 같은 거리감과 존중이 편안한 관계를 만듭니다.",
      growth: "감정 표현을 조금 더 구체화하면 친밀감이 깊어집니다.",
    },
    en: {
      headline: "Independence and ideas",
      temperament: "Original thinking and freedom define your charm.",
      bond: "Friend-like respect creates comfortable closeness.",
      growth: "More concrete emotional expression deepens intimacy.",
    },
  },
  pisces: {
    ko: {
      headline: "공감과 상상의 별자리",
      temperament: "감정의 흐름과 직관을 잘 읽는 편입니다.",
      bond: "부드러운 공감과 예술적 교감이 마음을 열어줍니다.",
      growth: "경계를 세우는 작은 습관이 에너지 소모를 줄입니다.",
    },
    en: {
      headline: "Empathy and imagination",
      temperament: "You read emotional currents and intuition well.",
      bond: "Gentle empathy and creative resonance open your heart.",
      growth: "Small boundary habits reduce emotional drain.",
    },
  },
};

function elLabel(el: ElementKey, locale: Locale): string {
  const meta = ELEMENT_META[el];
  return locale === "ko"
    ? `${meta.romanized}(${meta.hangul}, ${meta.hanja})`
    : `${meta.romanized} (${meta.hanja})`;
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

function humanElementStory(
  name: string,
  element: ElementKey,
  locale: Locale
): { headline: string; story: string; traits: string[] } {
  const meta = ELEMENT_META[element];
  if (locale === "ko") {
    const stories: Record<ElementKey, string> = {
      wood: `${name}님의 핵심 기운은 ${meta.romanized}(${meta.hangul})입니다. 성장, 확장, 새로운 시작의 흐름이 평생 테마로 이어집니다. 막힘이 있어도 다시 길을 찾는 힘이 강한 편이에요.`,
      fire: `${name}님의 핵심 기운은 ${meta.romanized}(${meta.hangul})입니다. 열정, 표현, 영향력이 삶의 중심축이 됩니다. 에너지가 살아날 때 주변 분위기까지 밝아지는 타입이에요.`,
      earth: `${name}님의 핵심 기운은 ${meta.romanized}(${meta.hangul})입니다. 안정, 루틴, 책임감이 인생의 기반이 됩니다. 흔들릴 때일수록 중심을 잡는 힘이 돋보여요.`,
      metal: `${name}님의 핵심 기운은 ${meta.romanized}(${meta.hangul})입니다. 정리, 기준, 결단력이 평생 자산이 됩니다. 감정보다 원칙이 먼저 서는 순간이 많아요.`,
      water: `${name}님의 핵심 기운은 ${meta.romanized}(${meta.hangul})입니다. 직관, 공감, 유연함이 삶의 윤활유 역할을 합니다. 조용하지만 깊은 흐름을 타는 타입이에요.`,
    };
    const traits: Record<ElementKey, string[]> = {
      wood: ["성장 지향", "탐색형 결단", "유연한 회복력"],
      fire: ["표현력", "추진력", "사람을 모으는 기운"],
      earth: ["안정감", "실행력", "꾸준한 누적"],
      metal: ["정리력", "판단력", "집중의 날카로움"],
      water: ["직관", "공감", "적응력"],
    };
    return {
      headline: `${name} · ${meta.romanized}(${meta.hangul}, ${meta.hanja}) 평생 에너지`,
      story: stories[element],
      traits: traits[element],
    };
  }

  const stories: Record<ElementKey, string> = {
    wood: `${name}'s core tone is ${meta.romanized} (${meta.hanja}). Growth, expansion, and renewal stay with you across life chapters.`,
    fire: `${name}'s core tone is ${meta.romanized} (${meta.hanja}). Passion, expression, and influence shape your long arc.`,
    earth: `${name}'s core tone is ${meta.romanized} (${meta.hanja}). Stability, routine, and responsibility anchor your path.`,
    metal: `${name}'s core tone is ${meta.romanized} (${meta.hanja}). Clarity, standards, and decisive focus become lifetime assets.`,
    water: `${name}'s core tone is ${meta.romanized} (${meta.hanja}). Intuition, empathy, and adaptability keep your flow alive.`,
  };
  const traits: Record<ElementKey, string[]> = {
    wood: ["Growth-minded", "Exploratory", "Resilient reset"],
    fire: ["Expressive", "Driven", "Magnetic"],
    earth: ["Grounded", "Steady builder", "Patient stacker"],
    metal: ["Organized", "Decisive", "Focused"],
    water: ["Intuitive", "Empathic", "Adaptive"],
  };
  return {
    headline: `${name} · Lifetime ${meta.romanized} (${meta.hanja}) energy`,
    story: stories[element],
    traits: traits[element],
  };
}

function pillarSections(
  saju: SajuBasicResponse,
  locale: Locale
): HumanPremiumReportSection[] {
  const sections: HumanPremiumReportSection[] = [];
  const includeHour = !saju.birthTimeUnknown && saju.pillars.hour;

  for (const pillarId of PILLAR_IDS) {
    if (pillarId === "hour" && !includeHour) continue;
    const pillar = saju.pillars[pillarId] as PillarDisplay;
    const label = PILLAR_LABEL[pillarId][locale];
    const topics =
      locale === "ko"
        ? ["개요", "천간 해석", "지지 해석", "오행 연결", "생활 테마"]
        : ["Overview", "Stem", "Branch", "Element link", "Life theme"];

    topics.forEach((topic, index) => {
      sections.push(
        section({
          id: `pillar-${pillarId}-${index}`,
          chapterId: `pillar-${pillarId}`,
          chapterTitle: label,
          kind: "pillar",
          title: `${label} · ${topic}`,
          body:
            locale === "ko"
              ? `${saju.petName}님의 ${label}는 ${pillar.pillar}(${pillar.stemLabel}·${pillar.branchLabel})입니다. ${topic} 관점에서 보면, 이 기둥은 ${elLabel(saju.dominantElement, locale)} 흐름과 맞물려 평생 리듬의 한 축을 담당합니다.`
              : `${saju.petName}'s ${label} is ${pillar.pillar} (${pillar.stemLabel} · ${pillar.branchLabel}). Through the lens of ${topic}, this pillar supports your lifetime rhythm alongside ${elLabel(saju.dominantElement, locale)} energy.`,
          bullets:
            locale === "ko"
              ? [
                  `천간: ${pillar.stemLabel}`,
                  `지지: ${pillar.branchLabel}`,
                  `핵심 오행: ${elLabel(saju.dominantElement, locale)}`,
                ]
              : [
                  `Stem: ${pillar.stemLabel}`,
                  `Branch: ${pillar.branchLabel}`,
                  `Core element: ${elLabel(saju.dominantElement, locale)}`,
                ],
        })
      );
    });
  }

  return sections;
}

function elementSections(
  saju: SajuBasicResponse,
  locale: Locale
): HumanPremiumReportSection[] {
  const sections: HumanPremiumReportSection[] = [];

  for (const element of ELEMENT_ORDER) {
    const meta = ELEMENT_META[element];
    const count =
      saju.elements.find((item) => item.key === element)?.count ?? 0;
    const topics =
      locale === "ko"
        ? ["존재감", "강점", "주의점", "밸런스 팁"]
        : ["Presence", "Strength", "Caution", "Balance tip"];

    topics.forEach((topic, index) => {
      sections.push(
        section({
          id: `element-${element}-${index}`,
          chapterId: `element-${element}`,
          chapterTitle:
            locale === "ko"
              ? `${meta.romanized}(${meta.hangul}) 오행`
              : `${meta.romanized} element`,
          kind: "element",
          title: `${locale === "ko" ? meta.hangul : meta.romanized} · ${topic}`,
          body:
            locale === "ko"
              ? `${meta.romanized}(${meta.hangul}, ${meta.hanja}) 기운은 차트에서 ${count}회 등장합니다. ${topic} 측면에서 ${saju.petName}님은 ${count >= 2 ? "이 기운을 자주 활용하는" : "이 기운을 보완하면 좋은"} 흐름을 가집니다.`
              : `${meta.romanized} (${meta.hanja}) appears ${count} time(s) in your chart. For ${topic}, you ${count >= 2 ? "often lean on this tone" : "benefit from strengthening this tone"}.`,
        })
      );
    });
  }

  return sections;
}

function domainSections(
  name: string,
  dominant: ElementKey,
  locale: Locale
): HumanPremiumReportSection[] {
  const sections: HumanPremiumReportSection[] = [];

  for (const domain of LIFE_DOMAINS) {
    const angles =
      locale === "ko"
        ? ["현재 흐름", "강점 활용", "주의 신호", "실천 팁", "3년 전망", "10년 전망"]
        : [
            "Current flow",
            "Strength use",
            "Watch signal",
            "Practice tip",
            "3-year view",
            "10-year view",
          ];

    angles.forEach((angle, index) => {
      const title = locale === "ko" ? domain.ko : domain.en;
      sections.push(
        section({
          id: `domain-${domain.id}-${index}`,
          chapterId: `domain-${domain.id}`,
          chapterTitle: title,
          kind: "domain",
          title: `${title} · ${angle}`,
          body:
            locale === "ko"
              ? `${name}님의 ${title} 영역은 ${elLabel(dominant, locale)} 기운과 연결되어 있습니다. ${angle}에서는 속도보다 리듬, 완벽보다 지속 가능성을 우선하면 운의 흐름이 부드럽게 이어집니다.`
              : `Your ${title} lane connects to ${elLabel(dominant, locale)} energy. For ${angle}, favor rhythm over rush and sustainability over perfection.`,
        })
      );
    });
  }

  return sections;
}

function luckCycleSections(
  saju: SajuBasicResponse,
  locale: Locale
): HumanPremiumReportSection[] {
  const year = new Date().getFullYear();
  const dayStem = saju.pillars.day.stemHanja;
  const seunPillar = computeSeunPillar(year);
  const seun = describeLuckPillar(dayStem, seunPillar, locale);
  const daewoonCandidates = computeDaewoonCandidates({
    birthUtc: saju.birthUtc,
    yearStem: saju.pillars.year.stemHanja,
    monthPillar: saju.pillars.month,
    dayStem,
    locale,
  });
  const shinsal = computeRepresentativeShinsal(saju.pillars, locale);
  const interactions = computeSeunNatalInteractions(
    seunPillar.branchHanja,
    saju.pillars,
    locale
  );

  const summerMonths = [6, 7, 8];
  const monthSections = summerMonths.map((month) => {
    const monthPillar = computeMonthLuckPillar(year, month, saju.timezone);
    const reading = describeLuckPillar(dayStem, monthPillar, locale);
    const label =
      locale === "ko"
        ? `${year}년 ${month}월`
        : new Date(year, month - 1, 15).toLocaleString("en", {
            month: "long",
            year: "numeric",
          });

    return section({
      id: `cycle-month-${month}`,
      chapterId: "luck-cycles",
      chapterTitle: locale === "ko" ? "대운·신살·세운" : "Daewoon, spirit stars & seun",
      kind: "cycle",
      title: locale === "ko" ? `${label} 월운` : `${label} monthly luck`,
      body:
        locale === "ko"
          ? `${label} 월운은 ${pillarText(monthPillar)}입니다. 천간 십성 ${reading.stemTenGod}, 지지 십성 ${reading.branchTenGod}의 흐름으로 한 달의 리듬을 읽습니다.`
          : `${label} monthly luck is ${pillarText(monthPillar)}. Stem ${reading.stemTenGod}, branch ${reading.branchTenGod}.`,
      pageEstimate: 2,
    });
  });

  return [
    section({
      id: "cycle-daewoon",
      chapterId: "luck-cycles",
      chapterTitle: locale === "ko" ? "대운·신살·세운" : "Daewoon, spirit stars & seun",
      kind: "cycle",
      title: locale === "ko" ? "대운의 큰 흐름" : "Major luck cycles",
      body:
        locale === "ko"
          ? `대운은 한 사람의 삶에서 10년 단위로 바뀌는 큰 계절을 보는 좌표입니다. 현재 입력값에는 성별이 없어 전통 방식의 순행·역행을 하나로 단정하지 않고 두 후보를 함께 봅니다. ${daewoonCandidates
              .map(
                (candidate) =>
                  `${candidate.directionLabel}은 약 ${candidate.startAge}세에 시작하며, 첫 대운은 ${pillarText(candidate.cycles[0].pillar)}입니다`
              )
              .join(" / ")}.

순행 후보는 바깥으로 펼치고 확장하는 흐름을, 역행 후보는 안쪽으로 정리하고 되짚는 흐름을 보여주는 참고선으로 사용할 수 있습니다. 실제 상담에서는 성별과 절기 기준을 확정해 한 방향을 선택하지만, 지금 단계에서는 두 흐름을 비교하면서 어느 시기에 어떤 십성이 반복되는지 살피는 것이 좋습니다. 대운은 사건을 단정하는 표식이 아니라 긴 호흡의 환경 변화입니다. 좋은 시기에는 기회를 크게 쓰고, 무거운 시기에는 공부와 정비로 기반을 다지는 방식으로 활용해야 합니다.`
          : `Daewoon is the ten-year seasonal rhythm of a life. Gender is not provided, so this report does not force one traditional direction. ${daewoonCandidates
              .map(
                (candidate) =>
                  `${candidate.directionLabel} starts around age ${candidate.startAge}, with the first cycle at ${pillarText(candidate.cycles[0].pillar)}`
              )
              .join(" / ")}.

Use the forward and reverse candidates as comparison lines until direction is confirmed. Daewoon does not guarantee events; it shows the broader environment in which choices mature.`,
      bullets: daewoonCandidates.flatMap((candidate) =>
        candidate.cycles.slice(0, 3).map((cycle) =>
          locale === "ko"
            ? `${candidate.directionLabel} ${cycle.startAge}~${cycle.endAge}세: ${pillarText(cycle.pillar)}`
            : `${candidate.directionLabel} age ${cycle.startAge}-${cycle.endAge}: ${pillarText(cycle.pillar)}`
        )
      ),
      pageEstimate: 3,
    }),
    section({
      id: "cycle-shinsal",
      chapterId: "luck-cycles",
      chapterTitle: locale === "ko" ? "대운·신살·세운" : "Daewoon, spirit stars & seun",
      kind: "cycle",
      title: locale === "ko" ? "대표 신살" : "Representative spirit stars",
      body:
        locale === "ko"
          ? `${saju.petName}님의 원국에서 대표 신살은 길흉을 단정하는 표식이 아니라, 어떤 기질이 어느 자리에서 드러나는지 살피는 보조 좌표입니다.`
          : `Representative spirit stars are supporting coordinates, not fixed good-or-bad verdicts.`,
      bullets: shinsal.map((item) => {
        const matched = item.matchedSlots.length
          ? item.matchedSlots.map((slot) => slot.label).join(", ")
          : locale === "ko"
            ? "원국 지지에 없음"
            : "not present";
        return `${item.name}: ${matched}`;
      }),
      pageEstimate: 2,
    }),
    section({
      id: "cycle-annual-seun",
      chapterId: "luck-cycles",
      chapterTitle: locale === "ko" ? "대운·신살·세운" : "Daewoon, spirit stars & seun",
      kind: "cycle",
      title: locale === "ko" ? `${year}년 세운` : `${year} annual luck`,
      body:
        locale === "ko"
          ? `${year}년 세운은 ${pillarText(seunPillar)}입니다. 천간 십성 ${seun.stemTenGod}, 지지 십성 ${seun.branchTenGod}의 기운이 한 해의 큰 줄기를 만듭니다.`
          : `${year} seun is ${pillarText(seunPillar)}. Stem ${seun.stemTenGod}, branch ${seun.branchTenGod} set the year's main tone.`,
      bullets:
        interactions.length > 0
          ? interactions.map((line) => line.label)
          : locale === "ko"
            ? ["원국과 세운 간 뚜렷한 충·합 신호 없음"]
            : ["No strong clash/harmony signals with natal chart"],
      pageEstimate: 3,
    }),
    ...monthSections,
  ];
}

function monthlySections(
  name: string,
  locale: Locale
): HumanPremiumReportSection[] {
  const months =
    locale === "ko"
      ? [
          "1월",
          "2월",
          "3월",
          "4월",
          "5월",
          "6월",
          "7월",
          "8월",
          "9월",
          "10월",
          "11월",
          "12월",
        ]
      : [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];

  return months.map((month, index) =>
    section({
      id: `cycle-month-${index + 1}`,
      chapterId: "cycle-monthly",
      chapterTitle: locale === "ko" ? "월별 리듬" : "Monthly rhythm",
      kind: "cycle",
      title: `${month} ${locale === "ko" ? "운의 포인트" : "focus"}`,
      body:
        locale === "ko"
          ? `${name}님에게 ${month}은 작은 선택을 정리하고 다음 달로 넘어갈 에너지를 준비하는 타이밍입니다. 중요한 약속은 서두르기보다 확인 한 번 더.`
          : `For ${name}, ${month} favors tidying small choices and preparing energy for the next chapter. Confirm commitments before rushing.`,
    })
  );
}

function decadeSections(
  name: string,
  locale: Locale
): HumanPremiumReportSection[] {
  const decades =
    locale === "ko"
      ? ["10대", "20대", "30대", "40대", "50대", "60대", "70대+"]
      : ["Teens", "20s", "30s", "40s", "50s", "60s", "70s+"];

  return decades.map((decade, index) =>
    section({
      id: `cycle-decade-${index}`,
      chapterId: "cycle-decades",
      chapterTitle: locale === "ko" ? "연대기 흐름" : "Decade arc",
      kind: "cycle",
      title: `${decade} ${locale === "ko" ? "테마" : "theme"}`,
      body:
        locale === "ko"
          ? `${name}님의 ${decade} 흐름은 '배우고, 정리하고, 다음 문을 여는' 리듬으로 읽힙니다. 이 시기에는 무리한 확장보다 기반 다지기가 복을 부립니다.`
          : `${name}'s ${decade} arc reads as learn, refine, and open the next door. Foundation beats forced expansion here.`,
    })
  );
}

function pillarText(pillar: PillarDisplay): string {
  return `${pillar.pillar}(${pillar.stemLabel}·${pillar.branchLabel})`;
}

function dominantElementImage(element: ElementKey, locale: Locale): string {
  if (locale !== "ko") return "a lifetime rhythm shaped by your strongest element";

  const images: Record<ElementKey, string> = {
    wood: "새싹이 흙을 밀고 올라오듯, 성장과 확장의 기운을 품은 사람",
    fire: "어둠을 밝히는 불꽃처럼, 표현과 존재감으로 길을 여는 사람",
    earth: "넓은 대지처럼, 중심을 잡고 사람과 일을 품어내는 사람",
    metal: "잘 벼린 금속처럼, 기준과 결단으로 삶을 정리하는 사람",
    water: "깊고 넓은 바다처럼, 흐름을 읽고 스스로 길을 만드는 사람",
  };

  return images[element];
}

function yearLuckTheme(pillar: PillarDisplay, dominant: ElementKey, locale: Locale): string {
  if (locale !== "ko") {
    return `Your year pillar, ${pillarText(pillar)}, describes the social weather around your life path. It shows how your outer story meets your inner element.`;
  }

  return `년주는 한 사람의 사회적 배경, 바깥으로 드러나는 첫인상, 세상과 만나는 방식의 뿌리를 보여줍니다. ${pillarText(pillar)}로 놓인 이 기둥은 ${elLabel(dominant, locale)} 기운과 맞물려, 타고난 기질이 사회적 무대에서 어떤 방식으로 드러나는지를 설명합니다.`;
}

function fortuneSections(
  saju: SajuBasicResponse,
  locale: Locale
): HumanPremiumReportSection[] {
  const name = saju.petName;
  const summary = humanElementStory(name, saju.dominantElement, locale);
  const year = saju.pillars.year;
  const month = saju.pillars.month;
  const day = saju.pillars.day;
  const hour = saju.pillars.hour;
  const dominant = elLabel(saju.dominantElement, locale);
  const image = dominantElementImage(saju.dominantElement, locale);

  if (locale !== "ko") {
    return [
      section({
        id: "result-year",
        chapterId: "saju-result",
        chapterTitle: "Saju Result",
        kind: "pillar",
        title: "Year Saju",
        body: yearLuckTheme(year, saju.dominantElement, locale),
        bullets: [`Year: ${pillarText(year)}`, `Core element: ${dominant}`],
        pageEstimate: 2,
      }),
      section({
        id: "result-year-summary",
        chapterId: "saju-result",
        chapterTitle: "Saju Result",
        kind: "summary",
        title: "Year Saju Summary",
        body: `Your year pillar gives the report its first frame: how the outside world reads your energy before it knows your inner story.`,
        pageEstimate: 2,
      }),
      section({
        id: "result-lifetime",
        chapterId: "saju-result",
        chapterTitle: "Saju Result",
        kind: "domain",
        title: "Lifetime Saju",
        body: summary.story,
        bullets: summary.traits,
        pageEstimate: 3,
      }),
      section({
        id: "result-lifetime-summary",
        chapterId: "saju-result",
        chapterTitle: "Saju Result",
        kind: "summary",
        title: "Lifetime Saju Summary",
        body: `Your life is not a fixed sentence but a weather map. Read the signs, choose timing, and move before the current moves you.`,
        pageEstimate: 2,
      }),
    ];
  }

  return [
    section({
      id: "result-year",
      chapterId: "saju-result",
      chapterTitle: "사주결과",
      kind: "pillar",
      title: "년사주",
      subtitle: `${pillarText(year)}로 보는 바깥 운의 뿌리`,
      body: `${yearLuckTheme(year, saju.dominantElement, locale)}

${name}님의 년사주는 단순한 출생연도의 표시가 아니라, 어린 시절부터 사회가 ${name}님을 어떤 결로 받아들이는지를 보여주는 첫 관문입니다. 년주의 천간 ${year.stemLabel}과 지지 ${year.branchLabel}은 바깥 환경, 조상·가문적 분위기, 사회적 첫인상에 영향을 줍니다.

이 흐름은 일주 ${pillarText(day)}와 만나면서 더 선명해집니다. 바깥으로는 년주의 기운이 먼저 보이지만, 실제 선택의 중심에는 일주의 힘이 있습니다. 따라서 ${name}님은 겉으로 드러나는 모습과 실제 내면의 추진 방식 사이를 잘 이해할수록 삶의 방향을 더 안정적으로 잡을 수 있습니다.`,
      bullets: [
        `년주: ${pillarText(year)}`,
        `일주: ${pillarText(day)}`,
        `대표 오행: ${dominant}`,
      ],
      pageEstimate: 4,
    }),
    section({
      id: "result-year-summary",
      chapterId: "saju-result",
      chapterTitle: "사주결과",
      kind: "summary",
      title: "년사주 총평",
      body: `${name}님의 년사주는 세상과 처음 맞닿는 문입니다. 이 문을 통해 들어오는 운은 때로는 보호막처럼 작용하고, 때로는 사회적 기준과 책임으로 다가옵니다.

중요한 점은 년주의 운을 절대 숙명처럼만 받아들이지 않는 것입니다. 년주는 출발점이지 결론이 아닙니다. 바깥 환경이 어떠했든, 일주와 월주의 흐름이 함께 움직이며 ${name}님만의 방향을 만들어갑니다.

특히 ${dominant} 기운이 강하게 작동할 때는 스스로의 장점을 과신하기보다, 주변의 반응을 읽고 한 박자 늦춰 판단하는 태도가 좋습니다. 운명을 아는 사람은 서두르지 않습니다. 흐름을 먼저 보고, 그다음 움직입니다.`,
      pageEstimate: 3,
    }),
    section({
      id: "result-lifetime",
      chapterId: "saju-result",
      chapterTitle: "사주결과",
      kind: "domain",
      title: "평생사주",
      subtitle: `${image}`,
      body: `당신의 사주는 한마디로 '${image}'의 형상입니다.

월주 ${pillarText(month)}는 사회적 역할과 일의 무대를, 일주 ${pillarText(day)}는 가장 깊은 자기 자신과 배우자·관계의 축을 보여줍니다.${hour ? ` 시주 ${pillarText(hour)}는 말년의 방향과 숨은 재능, 자녀·후대와의 인연까지 비춥니다.` : " 출생 시간을 모르는 경우에는 시주를 제외하고 삼주 중심으로 해석하므로, 큰 흐름을 중심으로 보는 것이 좋습니다."}

${summary.story}

평생의 흐름으로 보면 ${name}님은 한 가지 모습에 고정되기보다 상황에 따라 자기 전략을 바꾸며 성장하는 타입입니다. 운이 좋을 때는 과감하게 움직이고, 운이 무거울 때는 공부와 정비로 시간을 채워야 합니다. 이것이 피흉추길, 즉 흉을 피하고 길한 흐름을 찾아가는 가장 현실적인 방법입니다.

직업과 재물에서는 '속도'보다 '깊이'가 중요합니다. 단기적인 한 방보다 오래 쌓이는 전문성, 반복 가능한 시스템, 신뢰를 만드는 태도가 결국 큰 성취로 이어집니다. 인간관계에서는 넓게 품되 선을 분명히 해야 합니다. 베풂이 지나치면 운이 흩어지고, 기준이 분명하면 좋은 인연만 남습니다.`,
      bullets: summary.traits,
      pageEstimate: 6,
    }),
    section({
      id: "result-lifetime-summary",
      chapterId: "saju-result",
      chapterTitle: "사주결과",
      kind: "summary",
      title: "평생사주 총평",
      body: `${name}님의 평생 사주는 '흐름을 읽고 먼저 정비하는 사람'에게 길이 열린다고 말합니다.

좋은 운은 갑자기 하늘에서 떨어지는 것이 아니라, 준비된 사람에게 기회처럼 보입니다. 반대로 어려운 운도 무너짐이 아니라 조정기입니다. 내가 가진 힘이 과해지거나, 방향 없이 흩어질 때 잠시 멈추고 물길을 다시 내라는 신호입니다.

앞으로의 핵심 전략은 세 가지입니다. 첫째, 유연함을 잃지 마십시오. 둘째, 전문성을 무기로 삼으십시오. 셋째, 부족한 기운은 생활 습관과 환경으로 보완하십시오. 사주는 예언이 아니라 날씨 예보입니다. 태풍이 올 때는 집을 정비하고, 햇볕이 좋을 때는 힘껏 꽃을 피우면 됩니다.

지운자무애(知運者無礙). 운명을 아는 자는 거침이 없습니다. 알고 움직이는 사람에게 운은 두려움이 아니라 길잡이가 됩니다.`,
      bullets: ["유연함", "전문성", "생활 속 보완", "선택의 주도권"],
      pageEstimate: 4,
    }),
  ];
}

export function buildHumanSummary(
  name: string,
  saju: SajuBasicResponse,
  locale: Locale
) {
  return humanElementStory(name, saju.dominantElement, locale);
}

export function buildSajuChapters(
  saju: SajuBasicResponse,
  locale: Locale
): HumanPremiumReportChapter[] {
  const name = saju.petName;
  const summary = humanElementStory(name, saju.dominantElement, locale);

  const introSections: HumanPremiumReportSection[] = [
    section({
      id: "greeting",
      chapterId: "introduction",
      chapterTitle: locale === "ko" ? "소개말" : "Introduction",
      kind: "intro",
      title: locale === "ko" ? "지관재의 인사" : "A note from Jigwanjae",
      body:
        locale === "ko"
          ? `반갑습니다. 30년 동안 수많은 분들의 삶의 궤적을 사주라는 명리학의 도구로 읽어온 지관재의 철학관장 심원입니다.

사주는 단순히 글자를 나열하는 것이 아니라, 그 사람이 태어난 순간 우주의 어떤 기운을 머금고 시작했는지를 살피는 '인생의 지도'를 그리는 작업입니다. 이 리포트는 ${name}님의 만세력과 사주 흐름을 바탕으로 평생의 방향, 주의할 시기, 활용할 기운을 차분히 풀어갑니다.`
          : `Welcome. This report reads your birth chart as a life map, not a fixed sentence. It is written to help you observe timing and respond with clarity.`,
      pageEstimate: 2,
    }),
  ];

  const prefaceSections: HumanPremiumReportSection[] = [
    section({
      id: "preface",
      chapterId: "preface",
      chapterTitle: locale === "ko" ? "서두" : "Preface",
      kind: "intro",
      title: locale === "ko" ? "운명을 읽는 첫 문장" : "First reading",
      body:
        locale === "ko"
          ? `${name}님의 사주는 한마디로 '${dominantElementImage(saju.dominantElement, locale)}'의 형상입니다.

이제부터 ${name}님의 평생 사주와 다가오는 운의 흐름을 명쾌하게 풀어드리겠습니다. 좋은 운은 어떻게 붙잡고, 무거운 운은 어떻게 비켜가야 하는지, 만세력의 기둥을 하나씩 짚으며 살펴보겠습니다.`
          : `${summary.story}

From here, we move through the calendar pillars, lifetime result, and zodiac service reading.`,
      bullets: summary.traits,
      pageEstimate: 2,
    }),
  ];

  const manseSections: HumanPremiumReportSection[] = [
    section({
      id: "manse-pillar-table",
      chapterId: "manse-calendar",
      chapterTitle: locale === "ko" ? "만세력" : "Manse Calendar",
      kind: "pillar",
      title: locale === "ko" ? "사주 원국" : "Original pillars",
      body:
        locale === "ko"
          ? `${name}님의 만세력은 년주 ${pillarText(saju.pillars.year)}, 월주 ${pillarText(saju.pillars.month)}, 일주 ${pillarText(saju.pillars.day)}${saju.pillars.hour ? `, 시주 ${pillarText(saju.pillars.hour)}` : ""}로 구성됩니다.

만세력은 운을 읽는 기본 좌표입니다. 년주는 바깥 환경과 사회적 첫인상, 월주는 직업·사회 활동의 자리, 일주는 나 자신과 관계의 중심, 시주는 말년과 숨은 재능의 결을 보여줍니다.`
          : `${name}'s pillars are Year ${pillarText(saju.pillars.year)}, Month ${pillarText(saju.pillars.month)}, Day ${pillarText(saju.pillars.day)}${saju.pillars.hour ? `, Hour ${pillarText(saju.pillars.hour)}` : ""}.`,
      bullets: [
        `${locale === "ko" ? "년주" : "Year"}: ${pillarText(saju.pillars.year)}`,
        `${locale === "ko" ? "월주" : "Month"}: ${pillarText(saju.pillars.month)}`,
        `${locale === "ko" ? "일주" : "Day"}: ${pillarText(saju.pillars.day)}`,
        ...(saju.pillars.hour
          ? [`${locale === "ko" ? "시주" : "Hour"}: ${pillarText(saju.pillars.hour)}`]
          : []),
      ],
      pageEstimate: 2,
    }),
  ];

  return [
    chapter(
      "introduction",
      locale === "ko" ? "소개말" : "Introduction",
      introSections,
      locale === "ko" ? "철학관장 심원의 안내" : "Guide note"
    ),
    chapter(
      "preface",
      locale === "ko" ? "서두" : "Preface",
      prefaceSections
    ),
    chapter(
      "manse-calendar",
      locale === "ko" ? "만세력" : "Manse Calendar",
      manseSections,
      locale === "ko" ? "년·월·일·시 원국" : "Original chart"
    ),
    chapter(
      "saju-result",
      locale === "ko" ? "사주결과" : "Saju Result",
      fortuneSections(saju, locale),
      locale === "ko" ? "년사주 · 평생사주 총평" : "Year and lifetime reading"
    ),
    chapter(
      "luck-cycles",
      locale === "ko" ? "대운·신살·세운" : "Daewoon, spirit stars & seun",
      luckCycleSections(saju, locale),
      locale === "ko" ? "대운 후보와 올해 흐름" : "Major cycles and current year"
    ),
  ];
}

export function buildZodiacChapters(
  personName: string,
  birthDate: string,
  locale: Locale
): HumanPremiumReportChapter[] {
  const sign = getZodiacSignFromBirthDate(birthDate);
  const copy = ZODIAC_HUMAN[sign.key][locale];
  const signName = locale === "ko" ? sign.nameKo : sign.nameEn;
  const element = ELEMENT_META[sign.elementAffinity];

  const sections: HumanPremiumReportSection[] = [
    section({
      id: "zodiac-cover",
      chapterId: "zodiac-core",
      chapterTitle: locale === "ko" ? "서비스 별자리 운세" : "Service Zodiac Fortune",
      kind: "zodiac",
      title: `${sign.symbol} ${signName}`,
      subtitle: copy.headline,
      body:
        locale === "ko"
          ? `${personName}님의 태양 별자리는 ${signName}(${sign.dateRangeKo})입니다. K-Saju 오행과 연결하면 ${element.romanized}(${element.hangul}) 기운과 공명합니다.`
          : `${personName}'s sun sign is ${signName} (${sign.dateRangeEn}), resonating with ${element.romanized} (${element.hanja}) in K-Saju tone.`,
      pageEstimate: 2,
    }),
    section({
      id: "zodiac-temperament",
      chapterId: "zodiac-core",
      chapterTitle: locale === "ko" ? "서비스 별자리 운세" : "Service Zodiac Fortune",
      kind: "zodiac",
      title: locale === "ko" ? "기질과 에너지" : "Temperament & energy",
      body: copy.temperament,
    }),
    section({
      id: "zodiac-bond",
      chapterId: "zodiac-core",
      chapterTitle: locale === "ko" ? "서비스 별자리 운세" : "Service Zodiac Fortune",
      kind: "zodiac",
      title: locale === "ko" ? "관계 스타일" : "Relationship style",
      body: copy.bond,
    }),
    section({
      id: "zodiac-growth",
      chapterId: "zodiac-core",
      chapterTitle: locale === "ko" ? "서비스 별자리 운세" : "Service Zodiac Fortune",
      kind: "zodiac",
      title: locale === "ko" ? "성장 포인트" : "Growth point",
      body: copy.growth,
    }),
    section({
      id: "zodiac-timing",
      chapterId: "zodiac-core",
      chapterTitle: locale === "ko" ? "서비스 별자리 운세" : "Service Zodiac Fortune",
      kind: "zodiac",
      title: locale === "ko" ? "이번 시즌 포인트" : "Season focus",
      body:
        locale === "ko"
          ? `${signName} 시즌에는 ${personName}님이 관심을 두면 좋은 영역은 '작은 확신을 쌓는 선택'입니다. 크게 베팅하기보다 반복 가능한 루틴이 운을 살립니다.`
          : `This ${signName} season favors small confident choices for ${personName}. Repeatable routines beat oversized bets.`,
      pageEstimate: 2,
    }),
  ];

  return [
    chapter(
      "zodiac-core",
      locale === "ko" ? "서비스 별자리 운세" : "Service Zodiac Fortune",
      sections,
      locale === "ko" ? "서양 별자리 + K-Saju 오행" : "Western sign + K-Saju element"
    ),
  ];
}

export function flattenChapterSections(
  chapters: HumanPremiumReportChapter[]
): HumanPremiumReportSection[] {
  return chapters.flatMap((item) => item.sections);
}

export function sumChapterPages(chapters: HumanPremiumReportChapter[]): number {
  return chapters.reduce((sum, chapter) => sum + chapter.pageEstimate, 0);
}
