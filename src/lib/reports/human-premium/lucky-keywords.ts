import { ELEMENT_META } from "@/lib/saju/elements";
import type { ElementKey, Locale, SajuBasicResponse } from "@/lib/saju/types";

const LUCKY_BY_ELEMENT: Record<
  ElementKey,
  {
    ko: { color: string; direction: string; numbers: string };
    en: { color: string; direction: string; numbers: string };
  }
> = {
  wood: {
    ko: { color: "청록·초록", direction: "동쪽", numbers: "3, 8" },
    en: { color: "green/teal", direction: "east", numbers: "3, 8" },
  },
  fire: {
    ko: { color: "붉은·주황", direction: "남쪽", numbers: "2, 7" },
    en: { color: "red/orange", direction: "south", numbers: "2, 7" },
  },
  earth: {
    ko: { color: "베이지·황토", direction: "중앙·남서", numbers: "5, 10" },
    en: { color: "beige/ochre", direction: "center/southwest", numbers: "5, 10" },
  },
  metal: {
    ko: { color: "흰색·은색", direction: "서쪽", numbers: "4, 9" },
    en: { color: "white/silver", direction: "west", numbers: "4, 9" },
  },
  water: {
    ko: { color: "검정·남색", direction: "북쪽", numbers: "1, 6" },
    en: { color: "black/navy", direction: "north", numbers: "1, 6" },
  },
};

/** Time band aligned to supporting 지지 hours for the yongsin element. */
const LUCKY_TIME_BY_ELEMENT: Record<ElementKey, { ko: string; en: string }> = {
  wood: { ko: "오전 5~7시", en: "5–7 a.m." },
  fire: { ko: "오전 11시~오후 1시", en: "11 a.m.–1 p.m." },
  earth: { ko: "오후 1~3시", en: "1–3 p.m." },
  metal: { ko: "오후 3~5시", en: "3–5 p.m." },
  water: { ko: "오후 9~11시", en: "9–11 p.m." },
};

function pickWeakElement(saju: SajuBasicResponse): ElementKey {
  const sorted = [...saju.elements].sort((a, b) => a.count - b.count);
  const weakest = sorted.find((e) => e.count === 0)?.key ?? sorted[0]?.key;
  return weakest ?? saju.dominantElement;
}

/** Yongsin candidate — same rule as year-fortune-narratives (weak / generating cycle). */
export function pickYongsinElement(saju: SajuBasicResponse): ElementKey {
  const weak = pickWeakElement(saju);
  if (saju.elements.find((e) => e.key === weak)?.count === 0) return weak;
  const cycle: Record<ElementKey, ElementKey> = {
    wood: "water",
    fire: "wood",
    earth: "fire",
    metal: "earth",
    water: "metal",
  };
  return cycle[saju.dominantElement] ?? weak;
}

export interface LuckyKeywords {
  color: string;
  direction: string;
  timeBand: string;
  numbers: string;
  /** Compact string for prophecy.short — must be used verbatim. */
  shortCard: string;
  promptBlock: string;
  yongsinKey: ElementKey;
}

/** Deterministic lucky color / direction / time / numbers from yongsin. */
export function buildLuckyKeywords(
  saju: SajuBasicResponse,
  locale: Locale
): LuckyKeywords {
  const yongsinKey = pickYongsinElement(saju);
  const pack = LUCKY_BY_ELEMENT[yongsinKey][locale === "ko" ? "ko" : "en"];
  const time = LUCKY_TIME_BY_ELEMENT[yongsinKey][locale === "ko" ? "ko" : "en"];
  const meta = ELEMENT_META[yongsinKey];
  const yongsinLabel =
    locale === "ko" ? `${meta.hangul}(${meta.hanja})` : `${meta.meaning} (${meta.hanja})`;

  const shortCard =
    locale === "ko"
      ? `${pack.color} · ${pack.direction} · ${time} · ${pack.numbers}`
      : `${pack.color} · ${pack.direction} · ${time} · ${pack.numbers}`;

  const promptBlock =
    locale === "ko"
      ? [
          "\n【고정 행운 키워드 · 창작 금지】",
          `- 용신(보완 기운): ${yongsinLabel}`,
          `- 색: ${pack.color}`,
          `- 방향: ${pack.direction}`,
          `- 시간대: ${time}`,
          `- 숫자: ${pack.numbers}`,
          `- prophecy.short 고정값: ${shortCard}`,
          "- ★ prophecy.short는 위 고정값을 한 글자도 바꾸지 말고 그대로 출력할 것. 색·방향·시간·숫자 창작 금지.",
        ].join("\n")
      : [
          "\n【Fixed lucky keywords — do not invent】",
          `- Yongsin: ${yongsinLabel}`,
          `- Color: ${pack.color}`,
          `- Direction: ${pack.direction}`,
          `- Time band: ${time}`,
          `- Numbers: ${pack.numbers}`,
          `- prophecy.short fixed: ${shortCard}`,
          "- ★ prophecy.short must equal the fixed value exactly. Do not invent color/direction/time/numbers.",
        ].join("\n");

  return {
    color: pack.color,
    direction: pack.direction,
    timeBand: time,
    numbers: pack.numbers,
    shortCard,
    promptBlock,
    yongsinKey,
  };
}
