import { ELEMENT_META } from "./elements";
import { computeBasicSaju } from "./engine";
import type { Locale, SajuBasicRequest, Species } from "./types";

export interface PremiumReportInput {
  petName: string;
  species: Species;
  birthDate: string;
  birthTime: string | null;
  birthTimeUnknown: boolean;
  timezone: string;
  locale: Locale;
}

export interface PremiumReport {
  basic: ReturnType<typeof computeBasicSaju>;
  lifetimeHeadline: string;
  lifetimeStory: string;
  yearlyThemes: string[];
  careGuide: string[];
  luckyColors: string[];
  characterTitle: string;
}

const YEARLY_KO: Record<string, string[]> = {
  wood: ["성장과 탐험", "인연 확장", "건강 루틴"],
  fire: ["에너지 피크", "사회성 UP", "열 관리"],
  earth: ["안정 수확", "가족 유대", "루틴 강화"],
  metal: ["정리와 습득", "집중력", "시크한 휴식"],
  water: ["힐링", "직감 신뢰", "감정 케어"],
};

const YEARLY_EN: Record<string, string[]> = {
  wood: ["Growth & explore", "Bond expansion", "Health routine"],
  fire: ["Energy peak", "Social sparkle", "Heat balance"],
  earth: ["Stable harvest", "Family bond", "Routine power"],
  metal: ["Declutter & learn", "Focus time", "Chic rest"],
  water: ["Healing", "Trust intuition", "Emotional care"],
};

const COLORS: Record<string, { ko: string[]; en: string[] }> = {
  wood: { ko: ["민트", "숲록"], en: ["mint", "forest green"] },
  fire: { ko: ["코랄", "선셋 오렌지"], en: ["coral", "sunset orange"] },
  earth: { ko: ["베이지", "테라코타"], en: ["beige", "terracotta"] },
  metal: { ko: ["실버", "라벤더"], en: ["silver", "lavender"] },
  water: { ko: ["스카이블루", "딥 네이비"], en: ["sky blue", "deep navy"] },
};

export function buildPremiumReport(input: PremiumReportInput): PremiumReport {
  const request: SajuBasicRequest = {
    ...input,
    privacyConsent: true,
  };

  const basic = computeBasicSaju(request);
  const meta = ELEMENT_META[basic.dominantElement];
  const isKo = input.locale === "ko";

  const yearlyThemes = isKo
    ? YEARLY_KO[basic.dominantElement]
    : YEARLY_EN[basic.dominantElement];

  const luckyColors = isKo
    ? COLORS[basic.dominantElement].ko
    : COLORS[basic.dominantElement].en;

  const lifetimeHeadline = isKo
    ? `${input.petName} · ${meta.meaning}(${meta.hangul}) 평생 에너지 리포트`
    : `${input.petName} · Lifetime ${meta.meaning} (${meta.hanja}) Energy Report`;

  const lifetimeStory = isKo
    ? `${input.petName}의 핵심 오행은 ${meta.meaning}(${meta.hangul}, ${meta.hanja})예요. 평생 리듬은 '크게 사랑받고, 자기만의 속도로 성장'하는 흐름. 집사님이 ${meta.hangul} 기운에 맞는 환경을 만들어주면 ${input.species === "dog" ? "꼬리" : "곁"}이 더 자주 움직여요.`
    : `${input.petName}'s core element is ${meta.meaning} (${meta.hanja}). Lifetime theme: deeply loved, growing at their own pace. Match the home vibe to ${meta.meaning} energy and tails (or paws) move more often.`;

  const careGuide = isKo
    ? [
        `${meta.meaning} 기운에 맞는 산책·놀이 밸런스 유지`,
        `스트레스 신호(꼬리·귀·수면) 주 1회 체크`,
        `간식은 소량·고품질 — 오행 밸런스 유지`,
      ]
    : [
        `Match walk/play to ${meta.meaning} energy`,
        `Weekly stress check: tail, ears, sleep`,
        `Small, high-quality treats for balance`,
      ];

  const characterTitle = isKo
    ? `Cosmic ${meta.meaning} ${input.species === "dog" ? "댕댕" : "냥냥"}`
    : `Cosmic ${meta.meaning} ${input.species === "dog" ? "Pup" : "Cat"}`;

  return {
    basic,
    lifetimeHeadline,
    lifetimeStory,
    yearlyThemes,
    careGuide,
    luckyColors,
    characterTitle,
  };
}
