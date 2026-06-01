import { computeBasicSaju } from "@/lib/saju/engine";
import { ELEMENT_META } from "@/lib/saju/elements";
import type { Locale } from "@/lib/saju/types";

type Direction = "동쪽" | "서쪽" | "남쪽" | "북쪽" | "동남쪽" | "서남쪽" | "동북쪽" | "서북쪽";

export interface OwnerBirthBasis {
  [key: string]: unknown;
  ownerBirthDate: string;
  ownerBirthTime?: string | null;
  ownerBirthTimeUnknown?: boolean;
  timezone?: string;
  locale?: Locale;
}

export interface OwnerDailyFortune {
  title: string;
  message: string;
  luckyNumber: number;
  luckyColor: string;
  luckyDirection: Direction;
  dayPillar: string;
  elementLabel: string;
  disclaimer: string;
}

const COLORS = {
  ko: ["연보라", "민트", "살구", "하늘색", "크림", "라벤더", "연분홍", "올리브"],
  en: ["soft purple", "mint", "apricot", "sky blue", "cream", "lavender", "soft pink", "olive"],
};

const DIRECTIONS: Direction[] = ["동쪽", "서쪽", "남쪽", "북쪽", "동남쪽", "서남쪽", "동북쪽", "서북쪽"];

const KO_MESSAGES = {
  wood: [
    "새로운 시도를 작게 시작하면 운이 붙는 날이에요.",
    "먼저 안부를 전하면 관계운이 부드럽게 열려요.",
  ],
  fire: [
    "생각만 하던 일을 말로 꺼내면 반응이 좋아요.",
    "활기가 좋은 날이에요. 서두르기 전 한 번만 확인하세요.",
  ],
  earth: [
    "미뤄둔 일 하나를 끝내면 마음까지 가벼워져요.",
    "평소의 좋은 루틴을 지키면 행운이 따라오는 날이에요.",
  ],
  metal: [
    "선택 기준을 하나로 줄이면 답이 선명해지는 날이에요.",
    "책상이나 알림을 정리하면 좋은 기운이 들어옵니다.",
  ],
  water: [
    "조용히 생각할 시간을 만들면 좋은 아이디어가 떠올라요.",
    "계획이 바뀌어도 흐름을 따르면 더 편한 길을 찾아요.",
  ],
};

const EN_MESSAGES = {
  wood: [
    "A small new start fits today. Take the first step lightly instead of rushing the result.",
    "Relationship luck opens gently. Send a kind check-in or make a small plan.",
  ],
  fire: [
    "Your expression is bright today. Saying an idea out loud can bring a good response.",
    "Energy is up, but a quick checklist will keep the day smooth.",
  ],
  earth: [
    "Calm organization brings luck today. Finishing one delayed task will lighten your mood.",
    "Trust and routine are lucky today. Keep one good habit steady.",
  ],
  metal: [
    "Decision energy is strong. Reduce a complicated choice to one clear standard.",
    "Clearing space invites better luck. Start with your desk, bag, or phone alerts.",
  ],
  water: [
    "Your intuition flows well today. Quiet time can bring a useful idea.",
    "Flexibility is lucky. If plans shift, follow the flow and find an easier path.",
  ],
};

function hash(input: string) {
  let value = 0;
  for (const char of input) value = (value * 31 + char.charCodeAt(0)) >>> 0;
  return value;
}

function isValidOwnerBasis(value: Record<string, unknown>): value is OwnerBirthBasis {
  return typeof value.ownerBirthDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.ownerBirthDate);
}

export function buildOwnerDailyFortune(
  birthBasis: Record<string, unknown>,
  locale: Locale = "ko",
  today = new Date()
): OwnerDailyFortune | null {
  if (!isValidOwnerBasis(birthBasis)) return null;

  const timezone = typeof birthBasis.timezone === "string" ? birthBasis.timezone : "Asia/Seoul";
  const birthTime = typeof birthBasis.ownerBirthTime === "string" ? birthBasis.ownerBirthTime : null;
  const birthTimeUnknown = Boolean(birthBasis.ownerBirthTimeUnknown || !birthTime);
  const fortuneLocale = locale === "en" ? "en" : "ko";

  const saju = computeBasicSaju({
    petName: fortuneLocale === "ko" ? "집사" : "Pet parent",
    species: "dog",
    birthDate: birthBasis.ownerBirthDate,
    birthTime,
    birthTimeUnknown,
    timezone,
    locale: fortuneLocale,
    privacyConsent: true,
  });

  const dayKey = today.toISOString().slice(0, 10);
  const seed = hash(`${birthBasis.ownerBirthDate}:${saju.pillars.day.pillar}:${dayKey}`);
  const messages = fortuneLocale === "ko" ? KO_MESSAGES[saju.dominantElement] : EN_MESSAGES[saju.dominantElement];
  const message = messages[seed % messages.length];
  const color = COLORS[fortuneLocale][seed % COLORS[fortuneLocale].length];
  const direction = DIRECTIONS[seed % DIRECTIONS.length];
  const luckyNumber = (seed % 9) + 1;
  const meta = ELEMENT_META[saju.dominantElement];

  return {
    title: fortuneLocale === "ko" ? "오늘의 운세" : "Today's Fortune",
    message,
    luckyNumber,
    luckyColor: color,
    luckyDirection: direction,
    dayPillar: saju.pillars.day.pillar,
    elementLabel:
      fortuneLocale === "ko"
        ? `${meta.hangul} 기운`
        : `${meta.meaning} energy`,
    disclaimer: fortuneLocale === "ko" ? "운세는 재미로만 보세요~" : "For fun only.",
  };
}
