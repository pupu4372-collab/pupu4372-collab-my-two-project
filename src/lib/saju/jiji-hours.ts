import type { ElementKey, Locale } from "./types";

/** Korean Standard Time (KST) 12 double-hours — 30 min offset boundaries */
export const KST_TIMEZONE = "Asia/Seoul";

export interface JijiHourInfo {
  branchHanja: string;
  branchHangul: string;
  romanized: string;
  siNameKo: string;
  siNameEn: string;
  animalKo: string;
  animalEn: string;
  element: ElementKey;
  kstRange: string;
}

const JIJI_SLOTS: Array<JijiHourInfo & { startMin: number; endMin: number }> = [
  {
    branchHanja: "子",
    branchHangul: "자",
    romanized: "Ja",
    siNameKo: "자시",
    siNameEn: "Ja-si",
    animalKo: "쥐",
    animalEn: "Rat",
    element: "water",
    kstRange: "23:30 ~ 01:30",
    startMin: 1410,
    endMin: 90,
  },
  {
    branchHanja: "丑",
    branchHangul: "축",
    romanized: "Chuk",
    siNameKo: "축시",
    siNameEn: "Chuk-si",
    animalKo: "소",
    animalEn: "Ox",
    element: "earth",
    kstRange: "01:30 ~ 03:30",
    startMin: 90,
    endMin: 210,
  },
  {
    branchHanja: "寅",
    branchHangul: "인",
    romanized: "In",
    siNameKo: "인시",
    siNameEn: "In-si",
    animalKo: "호랑이",
    animalEn: "Tiger",
    element: "wood",
    kstRange: "03:30 ~ 05:30",
    startMin: 210,
    endMin: 330,
  },
  {
    branchHanja: "卯",
    branchHangul: "묘",
    romanized: "Myo",
    siNameKo: "묘시",
    siNameEn: "Myo-si",
    animalKo: "토끼",
    animalEn: "Rabbit",
    element: "wood",
    kstRange: "05:30 ~ 07:30",
    startMin: 330,
    endMin: 450,
  },
  {
    branchHanja: "辰",
    branchHangul: "진",
    romanized: "Jin",
    siNameKo: "진시",
    siNameEn: "Jin-si",
    animalKo: "용",
    animalEn: "Dragon",
    element: "earth",
    kstRange: "07:30 ~ 09:30",
    startMin: 450,
    endMin: 570,
  },
  {
    branchHanja: "巳",
    branchHangul: "사",
    romanized: "Sa",
    siNameKo: "사시",
    siNameEn: "Sa-si",
    animalKo: "뱀",
    animalEn: "Snake",
    element: "fire",
    kstRange: "09:30 ~ 11:30",
    startMin: 570,
    endMin: 690,
  },
  {
    branchHanja: "午",
    branchHangul: "오",
    romanized: "O",
    siNameKo: "오시",
    siNameEn: "O-si",
    animalKo: "말",
    animalEn: "Horse",
    element: "fire",
    kstRange: "11:30 ~ 13:30",
    startMin: 690,
    endMin: 810,
  },
  {
    branchHanja: "未",
    branchHangul: "미",
    romanized: "Mi",
    siNameKo: "미시",
    siNameEn: "Mi-si",
    animalKo: "양",
    animalEn: "Sheep",
    element: "earth",
    kstRange: "13:30 ~ 15:30",
    startMin: 810,
    endMin: 930,
  },
  {
    branchHanja: "申",
    branchHangul: "신",
    romanized: "Sin",
    siNameKo: "신시",
    siNameEn: "Sin-si",
    animalKo: "원숭이",
    animalEn: "Monkey",
    element: "metal",
    kstRange: "15:30 ~ 17:30",
    startMin: 930,
    endMin: 1050,
  },
  {
    branchHanja: "酉",
    branchHangul: "유",
    romanized: "Yu",
    siNameKo: "유시",
    siNameEn: "Yu-si",
    animalKo: "닭",
    animalEn: "Rooster",
    element: "metal",
    kstRange: "17:30 ~ 19:30",
    startMin: 1050,
    endMin: 1170,
  },
  {
    branchHanja: "戌",
    branchHangul: "술",
    romanized: "Sul",
    siNameKo: "술시",
    siNameEn: "Sul-si",
    animalKo: "개",
    animalEn: "Dog",
    element: "earth",
    kstRange: "19:30 ~ 21:30",
    startMin: 1170,
    endMin: 1290,
  },
  {
    branchHanja: "亥",
    branchHangul: "해",
    romanized: "Hae",
    siNameKo: "해시",
    siNameEn: "Hae-si",
    animalKo: "돼지",
    animalEn: "Pig",
    element: "water",
    kstRange: "21:30 ~ 23:30",
    startMin: 1290,
    endMin: 1410,
  },
];

function parseTimeString(timeString: string): number {
  const match = /^(\d{1,2}):(\d{2})$/.exec(timeString.trim());
  if (!match) throw new Error(`Invalid time format: ${timeString}`);
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) throw new Error(`Invalid time: ${timeString}`);
  return hours * 60 + minutes;
}

function isInSlot(totalMinutes: number, startMin: number, endMin: number): boolean {
  if (startMin > endMin) {
    return totalMinutes >= startMin || totalMinutes < endMin;
  }
  return totalMinutes >= startMin && totalMinutes < endMin;
}

/**
 * Maps HH:mm (KST) to one of the 12 지지 double-hours with animal & element.
 * Ja-si spans 23:30–01:30 (wraps midnight).
 */
export function getZodiacSignByTime(timeString: string): JijiHourInfo {
  const totalMinutes = parseTimeString(timeString);

  for (const slot of JIJI_SLOTS) {
    if (isInSlot(totalMinutes, slot.startMin, slot.endMin)) {
      const { startMin: _s, endMin: _e, ...info } = slot;
      return info;
    }
  }

  throw new Error(`No jiji slot for time: ${timeString}`);
}

export function utcToKstTimeString(utcIso: string): string {
  const dtf = new Intl.DateTimeFormat("en-GB", {
    timeZone: KST_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(
    dtf.formatToParts(new Date(utcIso)).map((p) => [p.type, p.value])
  );
  return `${parts.hour}:${parts.minute}`;
}

export function getKstJijiFromUtc(utcIso: string): JijiHourInfo & { kstTime: string } {
  const kstTime = utcToKstTimeString(utcIso);
  return { kstTime, ...getZodiacSignByTime(kstTime) };
}

export function formatJijiDisplay(info: JijiHourInfo, locale: Locale): string {
  if (locale === "ko") {
    return `${info.siNameKo} (${info.romanized}-si) · ${info.branchHanja}${info.branchHangul} · ${info.animalKo}`;
  }
  return `${info.siNameEn} · ${info.branchHanja} ${info.branchHangul} (${info.romanized}) · ${info.animalEn}`;
}

export type JijiAnalysisMode = "four_pillars" | "three_pillars";

export type JijiResolution =
  | {
      mode: "four_pillars";
      timeString: string;
      jiji: JijiHourInfo;
      emoji: string;
    }
  | {
      mode: "three_pillars";
      message: string;
      emoji: string;
    };

export interface ResolveJijiInput {
  birthTime: string | null;
  birthTimeUnknown: boolean;
  /** When true, map via KST (traditional Korean saju). When false, use local HH:mm as-is. */
  useKstMapping?: boolean;
  utcIso?: string;
}

/**
 * Resolves 12 지지 (시지) from user input.
 * - Unknown birth time → 삼주(三柱) mode (no hour pillar).
 * - Known time + useKstMapping → convert UTC to KST then slot lookup.
 * - Known time + local → HH:mm in user's timezone directly.
 */
export function resolveJijiBranch(input: ResolveJijiInput): JijiResolution {
  if (input.birthTimeUnknown || !input.birthTime) {
    return {
      mode: "three_pillars",
      message:
        "Birth time unknown — we read year, month & day pillars only. Still cute. 🐾✨",
      emoji: "🌙",
    };
  }

  const timeString =
    input.useKstMapping && input.utcIso
      ? utcToKstTimeString(input.utcIso)
      : input.birthTime;

  return {
    mode: "four_pillars",
    timeString,
    jiji: getZodiacSignByTime(timeString),
    emoji: "⏰",
  };
}
