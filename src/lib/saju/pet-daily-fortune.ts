import { computeBasicSaju, computeKstDayPillar } from "@/lib/saju/engine";
import { firstNarrativeStoryParagraph } from "@/lib/saju/narratives";
import {
  charToElement,
  ELEMENT_META,
  formatBranchSign,
  formatElementLabelForLocale,
} from "@/lib/saju/elements";
import {
  getElementRelation,
  scoreFromRelation,
} from "@/lib/saju/compatibility/elements-cycle";
import { getTodayKstDateString } from "@/lib/saju/zodiac/fortunes";
import type { ElementDisplay, ElementKey, Locale, Species } from "@/lib/saju/types";

export interface PetFortuneCategory {
  icon: string;
  label: string;
  score: number;
  color: string;
}

export interface PetFortuneMessage {
  icon: string;
  label: string;
  body: string;
}

export interface PetFortuneLucky {
  type: "color" | "food" | "act";
  icon: string;
  text: string;
}

export interface PetFortuneWeekDay {
  dayLabel: string;
  icon: string;
  stars: number;
  isToday: boolean;
}

export interface PetFortuneTip {
  icon: string;
  text: string;
}

export interface PetFortunePetMeta {
  id: string;
  name: string;
  species: Species;
  speciesLabel: string;
  icon: string;
  dayBranchSign: string;
  profileImageUrl: string | null;
  photoUrl: string | null;
  dominantElement: ElementKey;
  elements: ElementDisplay[];
}

export interface PetDailyFortune {
  dateLabel: string;
  overall: number;
  title: string;
  subtitle: string;
  dayBranchSign: string;
  elementLabel: string;
  innatePersonality: string;
  categories: PetFortuneCategory[];
  messages: PetFortuneMessage[];
  lucky: PetFortuneLucky[];
  week: PetFortuneWeekDay[];
  tips: PetFortuneTip[];
  disclaimer: string;
}

export interface CommonPetDailyFortune {
  dateLabel: string;
  scopeLabel: string;
  headline: string;
  body: string;
  cta: string;
}

export interface PetProfileForFortune {
  id: string;
  name: string;
  species: Species;
  birthDate: string;
  birthTime: string | null;
  birthTimeUnknown: boolean;
  birthTimezone: string;
  profileImageUrl?: string | null;
  photoUrl?: string | null;
}

const CATEGORY_COLORS = {
  health: "#D4537E",
  appetite: "#EF9F27",
  activity: "#1D9E75",
  sleep: "#534AB7",
};

const SPECIES_META: Record<
  Species,
  { icon: string; ko: string; en: string }
> = {
  dog: { icon: "🐕", ko: "강아지", en: "Dog" },
  cat: { icon: "🐱", ko: "고양이", en: "Cat" },
  reptile: { icon: "🦎", ko: "렙타일", en: "Reptile" },
  other: { icon: "🐾", ko: "그외친구들", en: "Other friends" },
};

const COMMON_FORTUNES = [
  {
    koHeadline: "기분 좋은 루틴이 행운을 불러요",
    koBody:
      "오늘은 평소 좋아하던 산책길, 놀이, 간식처럼 익숙한 리듬이 아이의 마음을 편안하게 해주는 날이에요. 작은 칭찬을 자주 건네면 교감이 더 깊어집니다.",
    enHeadline: "A familiar rhythm brings luck",
    enBody:
      "Today, pets feel steadier with familiar walks, play, and gentle routines. Offer small praise often, and the bond will feel warmer.",
  },
  {
    koHeadline: "새로운 냄새와 소리에 호기심이 커져요",
    koBody:
      "아이들이 주변 변화를 더 민감하게 느낄 수 있어요. 낯선 자극은 천천히 보여주고, 편히 쉴 수 있는 자리를 먼저 챙겨주세요.",
    enHeadline: "Curiosity rises with new sounds and scents",
    enBody:
      "Pets may notice small changes more strongly today. Introduce new stimuli slowly and make sure they have a calm place to rest.",
  },
  {
    koHeadline: "부드러운 말투가 최고의 케어예요",
    koBody:
      "오늘은 큰 변화보다 안정감이 중요해요. 이름을 다정하게 불러주고 눈을 맞춰주면 아이가 보호자의 마음을 더 잘 느낍니다.",
    enHeadline: "A soft voice is the best care",
    enBody:
      "Stability matters more than big changes today. Call your pet gently and meet their eyes so they can feel your care clearly.",
  },
  {
    koHeadline: "놀이 시간이 마음을 환하게 해요",
    koBody:
      "짧아도 집중해서 놀아주는 시간이 좋은 운을 만들어줘요. 장난감, 노즈워크, 가벼운 움직임으로 에너지를 예쁘게 풀어주세요.",
    enHeadline: "Playtime brightens the mood",
    enBody:
      "Even a short, focused play session can lift the day. Toys, scent games, or light movement help pets release energy in a happy way.",
  },
  {
    koHeadline: "천천히 쉬어가는 날도 좋아요",
    koBody:
      "컨디션을 살피며 무리한 외출이나 훈련은 줄여도 괜찮아요. 포근한 자리와 깨끗한 물이 오늘의 작은 행운입니다.",
    enHeadline: "A slower day can be lucky too",
    enBody:
      "It is okay to keep outings or training light while you watch their condition. A cozy spot and fresh water are today's small luck.",
  },
];

const OVERALL_TITLES = {
  ko: ["쉬어가는 하루", "조심스런 하루", "느긋한 하루예요", "활기 넘치는 하루!", "최고의 하루!"],
  en: ["Rest day", "Take it slow", "A calm, easy day", "A lively day!", "Best day ever!"],
};

const OVERALL_SUBS = {
  ko: [
    "오늘은 충분히 쉬어도 괜찮아요",
    "무리하지 않고 천천히 보내요",
    "실내에서 편안히 쉬는 날이에요",
    "산책하기 딱 좋은 날이에요",
    "모든 운이 상승하는 날이에요",
  ],
  en: [
    "Plenty of rest is lucky today",
    "Keep the pace gentle",
    "A cozy indoor day fits well",
    "Great day for a walk",
    "Luck is on your pet's side",
  ],
};

const ELEMENT_LUCKY = {
  ko: {
    wood: { color: "초록색", colorIcon: "🟢", snacks: ["당근", "사과 슬라이스"], acts: ["숲길 산책", "노즈워크"] },
    fire: { color: "노란색", colorIcon: "🟡", snacks: ["닭가슴살", "고구마 칩"], acts: ["공 놀이", "짧은 달리기"] },
    earth: { color: "베이지", colorIcon: "🟤", snacks: ["고구마", "현미 스틱"], acts: ["담요 낮잠", "브러싱"] },
    metal: { color: "흰색", colorIcon: "⚪", snacks: ["치즈 큐브", "저지방 요거트"], acts: ["트릭 연습", "정돈된 놀이"] },
    water: { color: "파란색", colorIcon: "🔵", snacks: ["참치", "수분 많은 간식"], acts: ["물그릇 교체", "조용한 쓰다듬기"] },
  },
  en: {
    wood: { color: "green", colorIcon: "🟢", snacks: ["carrot", "apple slice"], acts: ["forest walk", "scent work"] },
    fire: { color: "yellow", colorIcon: "🟡", snacks: ["chicken breast", "sweet potato chip"], acts: ["ball play", "short sprint"] },
    earth: { color: "beige", colorIcon: "🟤", snacks: ["sweet potato", "brown rice stick"], acts: ["blanket nap", "brushing"] },
    metal: { color: "white", colorIcon: "⚪", snacks: ["cheese cube", "low-fat yogurt"], acts: ["trick practice", "tidy playtime"] },
    water: { color: "blue", colorIcon: "🔵", snacks: ["tuna", "hydrating treat"], acts: ["fresh water", "quiet petting"] },
  },
};

const SPECIES_SNACK: Record<Species, { ko: string[]; en: string[] }> = {
  dog: { ko: ["닭가슴살", "당근"], en: ["chicken treat", "carrot stick"] },
  cat: { ko: ["참치", "츄르"], en: ["tuna", "cat treat"] },
  reptile: { ko: ["곤충 사료", "칼슘 보충"], en: ["insect feed", "calcium supplement"] },
  other: { ko: ["좋아하는 간식", "신선한 채소"], en: ["favorite treat", "fresh greens"] },
};

const SPECIES_ACT: Record<Species, { ko: string[]; en: string[] }> = {
  dog: { ko: ["산책", "공 놀이", "드라이브"], en: ["walk", "ball play", "car ride"] },
  cat: { ko: ["낮잠", "캣타워", "레이저 포인터"], en: ["nap", "cat tower", "laser play"] },
  reptile: { ko: ["온욕", "은신처 점검", "UVB 램프 확인"], en: ["warm soak", "hide check", "UVB lamp check"] },
  other: { ko: ["온욕", "손길 케어", "조용한 관찰"], en: ["warm soak", "gentle handling", "quiet watch"] },
};

const OVERALL_MSG: Record<ElementKey, { ko: string[]; en: string[] }> = {
  wood: {
    ko: [
      "오늘은 새로운 자극을 천천히 받아들이면 컨디션이 올라가요. {name}에게 익숙한 루틴 속 작은 변화를 넣어보세요.",
      "{name}의 호기심이 살아나는 날이에요. 산책이나 탐색 시간을 조금 늘려주면 기분이 좋아져요.",
    ],
    en: [
      "New stimuli work best in small doses today. Try a tiny change inside {name}'s familiar routine.",
      "Curiosity is up for {name}. A little extra exploration time can lift the mood.",
    ],
  },
  fire: {
    ko: [
      "에너지가 넘치는 날이에요. {name}와 함께하는 활동 시간이 행운을 불러옵니다.",
      "활동 욕구가 커질 수 있어요. 짧고 재미있는 놀이로 기운을 예쁘게 풀어주세요.",
    ],
    en: [
      "Energy runs high today. Active time with {name} brings good luck.",
      "Activity drive may spike. Short, fun play helps release energy safely.",
    ],
  },
  earth: {
    ko: [
      "안정감이 행운의 열쇠예요. {name}가 좋아하는 자리와 루틴을 지켜주면 마음이 편해져요.",
      "차분히 쉬어가도 좋은 날이에요. 무리한 일정보다 편안한 휴식이 더 도움이 됩니다.",
    ],
    en: [
      "Steady routines are lucky today. Keep {name}'s favorite spot and schedule calm.",
      "A slower pace fits well. Rest beats a packed schedule for {name} today.",
    ],
  },
  metal: {
    ko: [
      "집중력이 좋아지는 날이에요. {name}에게 한 가지 놀이나 훈련만 반복해도 성과가 나요.",
      "정돈된 환경이 기분을 좋게 해요. 공간을 정리하고 조용히 케어해 주세요.",
    ],
    en: [
      "Focus is strong today. One repeated game or cue works well for {name}.",
      "A tidy space lifts the mood. Clear the area and offer calm care.",
    ],
  },
  water: {
    ko: [
      "감정이 섬세한 날이에요. {name} 옆에서 천천히 시간을 보내면 유대감이 깊어져요.",
      "조용한 휴식이 행운이에요. 큰 소리나 낯선 환경은 피해 주세요.",
    ],
    en: [
      "Feelings run tender today. Quiet time beside {name} deepens the bond.",
      "Restful calm is lucky. Avoid loud noise and unfamiliar spaces.",
    ],
  },
};

const HEALTH_MSG: Record<ElementKey, { ko: string; en: string }> = {
  wood: {
    ko: "활력이 서서히 올라와요. 가벼운 움직임과 충분한 수분 섭취를 챙겨 주세요.",
    en: "Vitality rises gently. Light movement and fresh water help.",
  },
  fire: {
    ko: "체온과 에너지 관리가 중요해요. 그늘 휴식과 물 자주 주기를 잊지 마세요.",
    en: "Watch heat and energy. Offer shade breaks and water often.",
  },
  earth: {
    ko: "소화가 편한 편이에요. 평소 사료와 비슷한 양을 유지하면 좋아요.",
    en: "Digestion looks steady. Keep portions close to the usual routine.",
  },
  metal: {
    ko: "피부·털 상태를 살피기 좋은 날이에요. 짧은 그루밍이 도움이 됩니다.",
    en: "Good day for coat and skin checks. A short grooming session helps.",
  },
  water: {
    ko: "컨디션이 예민할 수 있어요. 식사량과 수면 패턴을 가볍게 기록해 두면 좋아요.",
    en: "Condition may feel sensitive. Note appetite and sleep lightly.",
  },
};

const CAUTION_MSG: Record<
  "owner_controls_pet" | "pet_controls_owner" | "neutral" | "same" | "owner_nourishes_pet" | "pet_nourishes_owner",
  { ko: string; en: string }
> = {
  owner_nourishes_pet: {
    ko: "오늘 기운이 {name}에게 잘 맞아요. 다만 과한 자극은 피하고 편안한 속도를 유지하세요.",
    en: "Today's energy suits {name} well. Skip overstimulation and keep a gentle pace.",
  },
  pet_nourishes_owner: {
    ko: "{name}가 보호자에게 기운을 주는 날이에요. 아이의 리듬을 존중해 주세요.",
    en: "{name} brings warmth to you today. Follow their natural rhythm.",
  },
  same: {
    ko: "에너지가 고르게 흐르는 날이에요. 평소 루틴을 크게 바꾸지 않아도 괜찮아요.",
    en: "Energy flows evenly today. No need for big routine changes.",
  },
  owner_controls_pet: {
    ko: "오후에 다소 흥분하기 쉬운 기운이에요. 낯선 환경은 피하고 익숙한 공간에서 쉬게 해주세요.",
    en: "Afternoon excitement may rise. Stick to familiar spaces and calm rest.",
  },
  pet_controls_owner: {
    ko: "컨디션 변화에 민감할 수 있어요. 무리한 외출이나 훈련은 줄여도 괜찮아요.",
    en: "Mood may shift quickly. It is fine to keep outings and training light.",
  },
  neutral: {
    ko: "작은 변화에 주의해 주세요. 간식·놀이·휴식의 균형을 맞추면 하루가 편해져요.",
    en: "Watch small shifts in mood. Balance treats, play, and rest for a smoother day.",
  },
};

const TIPS: Record<Species, { ko: string[][]; en: string[][] }> = {
  dog: {
    ko: [
      ["🌿", "오전 산책 20분 이상 추천해요."],
      ["💧", "물 그릇을 깨끗이 교체해 주세요."],
      ["🤗", "오후엔 조용히 옆에서 쉬어주세요."],
    ],
    en: [
      ["🌿", "Take a 20+ minute morning walk."],
      ["💧", "Refresh the water bowl."],
      ["🤗", "Quiet afternoon cuddle time."],
    ],
  },
  cat: {
    ko: [
      ["🛋️", "좋아하는 자리에 담요를 깔아주세요."],
      ["🔇", "조용한 환경을 만들어주세요."],
      ["🐟", "좋아하는 간식으로 기분을 업 시켜주세요."],
    ],
    en: [
      ["🛋️", "Lay a blanket in their favorite spot."],
      ["🔇", "Keep the room calm and quiet."],
      ["🐟", "A favorite snack lifts the mood."],
    ],
  },
  reptile: {
    ko: [
      ["🌡️", "온도와 습도를 평소보다 꼼꼼히 확인해 주세요."],
      ["💡", "UVB 램프 교체 주기를 확인해 주세요."],
      ["👀", "탈피·식욕 변화를 가볍게 기록해 두세요."],
    ],
    en: [
      ["🌡️", "Check temperature and humidity carefully."],
      ["💡", "Review your UVB lamp replacement cycle."],
      ["👀", "Note shedding or appetite changes."],
    ],
  },
  other: {
    ko: [
      ["🧼", "케이지·사육 공간 청결을 유지해 주세요."],
      ["🎵", "조용한 환경과 규칙적인 급여를 유지해 주세요."],
      ["👀", "식사·활동량 변화를 가볍게 기록해 두세요."],
    ],
    en: [
      ["🧼", "Keep the habitat or cage clean."],
      ["🎵", "Keep a calm room and regular feeding routine."],
      ["👀", "Note any appetite or activity changes."],
    ],
  },
};

function hashSeed(...parts: string[]): number {
  let h = 2166136261;
  for (const p of parts) {
    for (let i = 0; i < p.length; i++) {
      h ^= p.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
  }
  return h >>> 0;
}

function pick<T>(arr: T[], seed: number, offset: number): T {
  return arr[(seed + offset) % arr.length];
}

function clampScore(value: number): number {
  return Math.min(100, Math.max(40, Math.round(value)));
}

function overallFromBase(base: number, seed: number): number {
  const adjusted = base + (seed % 11) - 5;
  if (adjusted >= 90) return 5;
  if (adjusted >= 82) return 4;
  if (adjusted >= 72) return 3;
  if (adjusted >= 62) return 2;
  return 1;
}

function formatDateLabel(dateKst: string, locale: Locale): string {
  const d = new Date(`${dateKst}T12:00:00+09:00`);
  return new Intl.DateTimeFormat(locale === "ko" ? "ko-KR" : "en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(d);
}

function getWeekDates(dateKst: string): string[] {
  const anchor = new Date(`${dateKst}T12:00:00+09:00`);
  const day = anchor.getUTCDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(anchor);
  monday.setUTCDate(anchor.getUTCDate() + mondayOffset);

  return Array.from({ length: 7 }, (_, index) => {
    const d = new Date(monday);
    d.setUTCDate(monday.getUTCDate() + index);
    return d.toISOString().slice(0, 10);
  });
}

function weekDayLabel(dateKst: string, locale: Locale): string {
  const d = new Date(`${dateKst}T12:00:00+09:00`);
  return new Intl.DateTimeFormat(locale === "ko" ? "ko-KR" : "en-US", {
    timeZone: "Asia/Seoul",
    weekday: "short",
  }).format(d);
}

function weekIcon(stars: number): string {
  if (stars >= 5) return "⭐";
  if (stars >= 4) return "☀️";
  if (stars >= 3) return "⛅";
  if (stars >= 2) return "🌥️";
  return "🌙";
}

function categoryScores(
  base: number,
  petElement: ElementKey,
  seed: number,
  locale: Locale
): PetFortuneCategory[] {
  const labels =
    locale === "ko"
      ? [
          { key: "health" as const, icon: "❤️", label: "건강운" },
          { key: "appetite" as const, icon: "🍖", label: "식욕운" },
          { key: "activity" as const, icon: "🎾", label: "활동운" },
          { key: "sleep" as const, icon: "😴", label: "수면운" },
        ]
      : [
          { key: "health" as const, icon: "❤️", label: "Health" },
          { key: "appetite" as const, icon: "🍖", label: "Appetite" },
          { key: "activity" as const, icon: "🎾", label: "Activity" },
          { key: "sleep" as const, icon: "😴", label: "Sleep" },
        ];

  const weights: Record<(typeof labels)[number]["key"], number> = {
    health: petElement === "earth" || petElement === "metal" ? 6 : 0,
    appetite: petElement === "fire" || petElement === "earth" ? 6 : 0,
    activity: petElement === "fire" || petElement === "wood" ? 7 : 0,
    sleep: petElement === "water" || petElement === "earth" ? 7 : 0,
  };

  return labels.map((item) => {
    const jitter = (hashSeed(String(seed), item.key) % 25) - 12;
    return {
      icon: item.icon,
      label: item.label,
      score: clampScore(base + weights[item.key] + jitter),
      color: CATEGORY_COLORS[item.key],
    };
  });
}

export function buildCommonPetDailyFortune(
  locale: Locale = "ko",
  dateKst: string = getTodayKstDateString()
): CommonPetDailyFortune {
  const isKo = locale === "ko";
  const seed = hashSeed(dateKst, "common");
  const item = COMMON_FORTUNES[seed % COMMON_FORTUNES.length];
  const todayPillar = computeKstDayPillar(dateKst, locale);
  const todayBranch = formatBranchSign(todayPillar.branchHanja, locale);

  return {
    dateLabel: formatDateLabel(dateKst, locale),
    scopeLabel: isKo
      ? `오늘 모든 펫에게 공통운 · ${todayBranch}일`
      : `Shared fortune for every pet · ${todayBranch} day`,
    headline: isKo ? item.koHeadline : item.enHeadline,
    body: isKo ? item.koBody : item.enBody,
    cta: isKo ? "사주 보고 내 아이 등록하기" : "Read saju and register my pet",
  };
}

export function buildPetFortunePetMeta(
  pet: PetProfileForFortune,
  locale: Locale
): PetFortunePetMeta {
  const saju = computeBasicSaju({
    petName: pet.name,
    species: pet.species,
    birthDate: pet.birthDate,
    birthTime: pet.birthTime,
    birthTimeUnknown: pet.birthTimeUnknown,
    timezone: pet.birthTimezone,
    locale,
    privacyConsent: true,
  });
  const speciesMeta = SPECIES_META[pet.species];

  return {
    id: pet.id,
    name: pet.name,
    species: pet.species,
    speciesLabel: locale === "ko" ? speciesMeta.ko : speciesMeta.en,
    icon: speciesMeta.icon,
    dayBranchSign: formatBranchSign(saju.pillars.day.branchHanja, locale),
    profileImageUrl: pet.profileImageUrl ?? null,
    photoUrl: pet.photoUrl ?? null,
    dominantElement: saju.dominantElement,
    elements: saju.elements,
  };
}

export function buildPetDailyFortune(
  pet: PetProfileForFortune,
  locale: Locale = "ko",
  dateKst: string = getTodayKstDateString()
): PetDailyFortune {
  const isKo = locale === "ko";
  const saju = computeBasicSaju({
    petName: pet.name,
    species: pet.species,
    birthDate: pet.birthDate,
    birthTime: pet.birthTime,
    birthTimeUnknown: pet.birthTimeUnknown,
    timezone: pet.birthTimezone,
    locale,
    privacyConsent: true,
  });

  const todayPillar = computeKstDayPillar(dateKst, locale);
  const todayElement = charToElement(todayPillar.branchHanja) ?? "earth";
  const petElement = saju.dominantElement;
  const relation = getElementRelation(petElement, todayElement);
  const baseScore = scoreFromRelation(relation);
  const seed = hashSeed(pet.id, dateKst, saju.pillars.day.pillar, todayPillar.pillar);
  const overall = overallFromBase(baseScore, seed);
  const elementMeta = ELEMENT_META[petElement];
  const luckyBank = ELEMENT_LUCKY[locale][petElement];
  const speciesSnack = pick(SPECIES_SNACK[pet.species][locale], seed, 1);
  const speciesAct = pick(SPECIES_ACT[pet.species][locale], seed, 2);
  const categories = categoryScores(baseScore, petElement, seed, locale);
  const overallMsg = pick(OVERALL_MSG[petElement][locale], seed, 3).replaceAll("{name}", pet.name);
  const cautionMsg = CAUTION_MSG[relation][locale].replaceAll("{name}", pet.name);
  const healthMsg = HEALTH_MSG[petElement][locale];
  const thirdLabel = relation === "owner_controls_pet" || relation === "pet_controls_owner"
    ? isKo ? "주의" : "Caution"
    : isKo ? "애정운" : "Bond";
  const thirdIcon = thirdLabel === (isKo ? "주의" : "Caution") ? "⚠️" : "💜";
  const thirdBody =
    thirdLabel === (isKo ? "주의" : "Caution")
      ? cautionMsg
      : isKo
        ? `${pet.name}가 보호자의 따뜻한 손길을 원하는 날이에요. 조용히 옆에 앉아 스킨십을 나눠주세요.`
        : `${pet.name} wants gentle closeness today. Sit nearby and share calm touch.`;

  const tipsRaw = TIPS[pet.species][locale];
  const tips: PetFortuneTip[] = tipsRaw.map(([icon, text]) => ({ icon, text }));

  const weekDates = getWeekDates(dateKst);
  const week: PetFortuneWeekDay[] = weekDates.map((dayDate, index) => {
    const daySeed = hashSeed(pet.id, dayDate);
    const dayBase = scoreFromRelation(
      getElementRelation(
        petElement,
        charToElement(computeKstDayPillar(dayDate, locale).branchHanja) ?? "earth"
      )
    );
    const stars = overallFromBase(dayBase, daySeed);
    return {
      dayLabel: weekDayLabel(dayDate, locale),
      icon: weekIcon(stars),
      stars,
      isToday: dayDate === dateKst,
    };
  });

  return {
    dateLabel: formatDateLabel(dateKst, locale),
    overall,
    title: OVERALL_TITLES[locale][overall - 1],
    subtitle: OVERALL_SUBS[locale][overall - 1],
    dayBranchSign: formatBranchSign(saju.pillars.day.branchHanja, locale),
    elementLabel: isKo
      ? `${elementMeta.hangul}(${elementMeta.hanja}) 기운`
      : `${formatElementLabelForLocale(petElement, locale)} energy`,
    innatePersonality: firstNarrativeStoryParagraph(saju.story),
    categories,
    messages: [
      {
        icon: overall >= 4 ? "🌞" : overall === 3 ? "🌙" : "☁️",
        label: isKo ? "총운" : "Overall",
        body: overallMsg,
      },
      {
        icon: "🍽️",
        label: isKo ? "건강·식욕" : "Health & appetite",
        body: healthMsg,
      },
      {
        icon: thirdIcon,
        label: thirdLabel,
        body: thirdBody,
      },
    ],
    lucky: [
      {
        type: "color",
        icon: luckyBank.colorIcon,
        text: isKo ? `럭키 컬러: ${luckyBank.color}` : `Lucky color: ${luckyBank.color}`,
      },
      {
        type: "food",
        icon: pet.species === "cat" ? "🐟" : pet.species === "dog" ? "🥩" : "🥬",
        text: isKo ? `럭키 간식: ${speciesSnack}` : `Lucky snack: ${speciesSnack}`,
      },
      {
        type: "act",
        icon: pet.species === "cat" ? "😴" : "🎾",
        text: isKo ? `럭키 활동: ${speciesAct}` : `Lucky activity: ${speciesAct}`,
      },
    ],
    week,
    tips,
    disclaimer: isKo ? "운세는 재미로만 보세요~" : "For fun only.",
  };
}
