import type { Locale, Species } from "../types";
import type { ZodiacSignKey } from "./signs";

export interface DailyFortuneSlice {
  luckScore: number;
  keyword: string;
  keywords: string[];
  today: string;
  luckySnack: string;
  caution: string;
  ownerTip: string;
}

type FortuneBank = Record<
  ZodiacSignKey,
  {
    keywords: string[];
    today: string[];
    snacks: string[];
    cautions: string[];
    ownerTips: string[];
  }
>;

const BANK_KO: FortuneBank = {
  aries: {
    keywords: ["질주", "첫발", "승부"],
    today: [
      "오늘은 산책 리드가 주인 손에 있어요. 새 냄새에 반응이 빠르니 목줄 체크!",
      "낯선 소리에 귀가 먼저 반응해요. 칭찬 한 마디면 바로 팀플레이 모드.",
    ],
    snacks: ["닭가슴살 트릿", "당근 스틱"],
    cautions: ["성급한 점프 — 미끄러운 바닥 주의"],
    ownerTips: ["짧고 강한 놀이 15분이 오늘의 럭키 루틴"],
  },
  taurus: {
    keywords: ["안정", "간식", "포근"],
    today: [
      "소파와 담요가 행운 존. 루틴 지키면 기분이 쑥 올라가요.",
      "새 간식은 천천히 맡아보는 타입 — 인내심이 오늘의 무기.",
    ],
    snacks: ["고구마 칩", "저지방 요거트"],
    cautions: ["과식 — 한 끼 양 체크"],
    ownerTips: ["같은 시간에 밥 주면 신뢰도 MAX"],
  },
  gemini: {
    keywords: ["호기심", "수다", "변화"],
    today: [
      "창밖 관찰 시간이 곧 힐링. 새 장난감 하나면 대화량 폭발.",
      "두 가지 이상 선택지를 주면 눈이 반짝여요.",
    ],
    snacks: ["작은 트릿 여러 종", "냉동 블루베리"],
    cautions: ["산만함 — 소음 많은 곳은 피하기"],
    ownerTips: ["짧은 트릭 교습이 오늘 컨디션 업"],
  },
  cancer: {
    keywords: ["무릎", "애착", "포근"],
    today: [
      "주인 옆이 최고의 성지. 부드러운 톤으로 말 걸면 꼬리가 먼저 답해요.",
      "비 오는 날엔 이불 캠프 추천 — 감정이 섬세한 날.",
    ],
    snacks: ["따뜻한 수프", "연어 큐브"],
    cautions: ["낯선 방문자 — 천천히 소개"],
    ownerTips: ["조용한 쓰다듬기 5분이 행운의 열쇠"],
  },
  leo: {
    keywords: ["주인공", "자신감", "스포트라이트"],
    today: [
      "카메라 각도가 좋은 날! 칭찬받으면 걸음걸이가 달라져요.",
      "공원 한가운데가 무대 — 산책 코스에 작은 이벤트를 넣어보세요.",
    ],
    snacks: ["프리미엄 트릿", "치킨 한 조각(소량)"],
    cautions: ["과열 — 그늘 휴식 필수"],
    ownerTips: ["하이파이브 성공 시 과시… 아니 축하 타임"],
  },
  virgo: {
    keywords: ["관찰", "루틴", "깔끔"],
    today: [
      "발톱·털 상태 체크하기 좋은 날. 정돈된 공간이 마음을 편하게 해요.",
      "새 사료는 소량 테스트 후 반응 관찰!",
    ],
    snacks: ["현미 스틱", "사과 슬라이스(무매실)"],
    cautions: ["낯선 냄새 스트레스"],
    ownerTips: ["브러싱 3분이 오늘의 케어 럭키"],
  },
  libra: {
    keywords: ["조화", "사교", "밸런스"],
    today: [
      "다른 반려동물과 조용한 인사가 통할 수 있어요.",
      "대칭적인 장난감, 양쪽에서 같이 놀기 좋아요.",
    ],
    snacks: ["치즈 큐브", "오이 슬라이스"],
    cautions: ["선택 장애 — 메뉴는 두 개만"],
    ownerTips: ["균형 잡힌 산책 코스 추천"],
  },
  scorpio: {
    keywords: ["집중", "직감", "깊이"],
    today: [
      "눈빛이 날카로운 날 — 숨겨둔 간식을 찾아낼지도.",
      "조용한 코너에서 관찰하다가 갑자기 애정 폭발.",
    ],
    snacks: ["동결건조 간식", "불고기 트릿"],
    cautions: ["낯선 손길 — 서두르지 않기"],
    ownerTips: ["1:1 집중 놀이가 신뢰 포인트"],
  },
  sagittarius: {
    keywords: ["모험", "활력", "탐험"],
    today: [
      "새 산책로가 행운 코스. 냄새 탐험 시간을 넉넉히!",
      "멀리 보는 시선 — 창가 자리 추천.",
    ],
    snacks: ["에너지 바(펫용)", "고단백 트릿"],
    cautions: ["충동 질주 — 리드 확인"],
    ownerTips: ["조금 긴 산책이 오늘의 만족도 UP"],
  },
  capricorn: {
    keywords: ["책임", "인내", "목표"],
    today: [
      "훈련 집중력이 좋은 날. 한 가지 커맨드만 반복해도 성과가 나요.",
      "느긋하지만 끝까지 해내는 타입 — 칭찬 타이밍이 중요.",
    ],
    snacks: ["뼈간식(안전 사이즈)", "저염 스틱"],
    cautions: ["딱딱한 바닥 — 관절 부담"],
    ownerTips: ["짧은 목표 달성 후 보상"],
  },
  aquarius: {
    keywords: ["개성", "반전", "아이디어"],
    today: [
      "평소와 다른 장난감이 통할 수 있어요. 예측 불가 귀여움 주의.",
      "혼자만의 시간도 필요 — 존중해 주면 더 다가와요.",
    ],
    snacks: ["퍼즐 간식", "냉동 요거트"],
    cautions: ["갑작스런 소음"],
    ownerTips: ["새로운 놀이 아이디어 한 가지 시도"],
  },
  pisces: {
    keywords: ["몽글", "공감", "힐링"],
    today: [
      "낮잠 퀄리티가 행운 지수. 잔잔한 음악이 기분을 부드럽게.",
      "주인 감정을 먼저 읽는 날 — 같이 쉬어주면 최고.",
    ],
    snacks: ["연어", "호박 퓨레"],
    cautions: ["큰 소리 — 안전한 방으로"],
    ownerTips: ["느린 마사지가 오늘의 힐링"],
  },
};

const BANK_EN: FortuneBank = {
  aries: {
    keywords: ["sprint", "first step", "bold"],
    today: [
      "Leash luck is high—new scents ahead! Check the collar before walkies.",
      "Ears react fast to new sounds; one praise word flips team-play mode on.",
    ],
    snacks: ["chicken treat", "carrot stick"],
    cautions: ["hasty jumps on slippery floors"],
    ownerTips: ["15 minutes of intense play = today's lucky routine"],
  },
  taurus: {
    keywords: ["cozy", "snack", "steady"],
    today: [
      "Sofa + blanket = luck zone. Keeping mealtime steady lifts the mood.",
      "New snacks? Sniff slowly—patience is today's superpower.",
    ],
    snacks: ["sweet potato chip", "low-fat yogurt"],
    cautions: ["over-treating—watch portion size"],
    ownerTips: ["Same feeding time = trust MAX"],
  },
  gemini: {
    keywords: ["curious", "chatty", "switch"],
    today: [
      "Window watch time heals. One new toy sparks a chatter burst.",
      "Offer two choices—eyes sparkle instantly.",
    ],
    snacks: ["mixed mini treats", "frozen blueberry"],
    cautions: ["distraction in noisy places"],
    ownerTips: ["Short trick session boosts today's vibe"],
  },
  cancer: {
    keywords: ["lap", "bond", "soft"],
    today: [
      "By your side is sacred ground. Soft voice = tail answers first.",
      "Rainy day blanket camp recommended—feelings run tender today.",
    ],
    snacks: ["warm soup", "salmon cube"],
    cautions: ["strangers—introduce slowly"],
    ownerTips: ["5 minutes quiet petting = lucky key"],
  },
  leo: {
    keywords: ["star", "confident", "spotlight"],
    today: [
      "Camera angles are kind today! Praise changes the whole strut.",
      "Park center stage—add a mini event on the walk route.",
    ],
    snacks: ["premium treat", "tiny chicken bite"],
    cautions: ["overheating—shade breaks required"],
    ownerTips: ["Victory high-five celebration time"],
  },
  virgo: {
    keywords: ["observe", "routine", "neat"],
    today: [
      "Good day for paw/coat check. Tidy space = calm mind.",
      "New food? Trial a small portion and watch the reaction.",
    ],
    snacks: ["brown rice stick", "apple slice (seedless)"],
    cautions: ["stress from unfamiliar smells"],
    ownerTips: ["3-minute brushing = care luck"],
  },
  libra: {
    keywords: ["harmony", "social", "balance"],
    today: [
      "Quiet hellos with other pets may work today.",
      "Symmetric toys—play from both sides feels fair.",
    ],
    snacks: ["cheese cube", "cucumber slice"],
    cautions: ["too many choices—limit to two"],
    ownerTips: ["Balanced walk route recommended"],
  },
  scorpio: {
    keywords: ["focus", "intuition", "depth"],
    today: [
      "Sharp eye day—might find hidden treats.",
      "Watch from a quiet corner, then sudden affection burst.",
    ],
    snacks: ["freeze-dried snack", "beef treat"],
    cautions: ["rushed touch from strangers"],
    ownerTips: ["1:1 focused play builds trust"],
  },
  sagittarius: {
    keywords: ["adventure", "vibe", "explore"],
    today: [
      "New walk path = luck route. Extra sniff exploration time!",
      "Long gaze out the window—window seat recommended.",
    ],
    snacks: ["pet energy bar", "high-protein treat"],
    cautions: ["impulse dash—check the lead"],
    ownerTips: ["Slightly longer walk = satisfaction UP"],
  },
  capricorn: {
    keywords: ["duty", "patience", "goal"],
    today: [
      "Training focus is strong. One command repeated still scores.",
      "Slow but finishes—praise timing matters.",
    ],
    snacks: ["safe-size chew", "low-salt stick"],
    cautions: ["hard floor joint strain"],
    ownerTips: ["Small goal + reward after"],
  },
  aquarius: {
    keywords: ["unique", "plot twist", "idea"],
    today: [
      "Unusual toy might click today. Unpredictable cuteness alert.",
      "Solo time needed too—respect space, they come closer.",
    ],
    snacks: ["puzzle treat", "frozen yogurt"],
    cautions: ["sudden loud noise"],
    ownerTips: ["Try one fresh play idea"],
  },
  pisces: {
    keywords: ["dreamy", "empathy", "heal"],
    today: [
      "Nap quality drives luck. Soft music smooths the mood.",
      "Reads your feelings first—rest together is best.",
    ],
    snacks: ["salmon", "pumpkin puree"],
    cautions: ["loud noise—move to safe room"],
    ownerTips: ["Slow massage = today's healing"],
  },
};

const TODAY_DETAIL_KO: Record<ZodiacSignKey, string> = {
  aries:
    "기분이 앞서기 쉬운 날이라 집사가 먼저 차분한 리듬을 잡아주면 좋아요. 산책이나 놀이를 시작하기 전 이름을 한 번 불러 눈을 맞추고, 잘 기다린 순간을 바로 칭찬해 주세요.",
  taurus:
    "익숙한 루틴이 마음을 편하게 해주는 날이에요. 밥자리, 쉬는 자리, 산책 시간이 평소와 비슷하면 안정감이 올라가고 작은 변화도 더 부드럽게 받아들일 수 있습니다.",
  gemini:
    "보고 듣고 맡고 싶은 것이 많아지는 날이에요. 호기심을 막기보다 짧은 놀이를 여러 번 나눠주고, 중간중간 조용히 쉬는 시간을 넣어주면 산만함이 귀여운 집중력으로 바뀝니다.",
  cancer:
    "집사의 목소리와 표정에 평소보다 섬세하게 반응할 수 있어요. 큰 변화보다는 가까이 앉아 천천히 쓰다듬어주고, 안심할 수 있는 자리를 마련해 주면 마음이 안정됩니다.",
  leo:
    "칭찬을 받을수록 표정이 환해지는 날이에요. 사진을 찍거나 작은 개인기를 해보는 것도 좋지만, 흥분이 올라오면 물 한 모금과 짧은 휴식으로 리듬을 부드럽게 낮춰주세요.",
  virgo:
    "작은 불편함을 빨리 알아차릴 수 있는 날이에요. 발바닥, 털 상태, 밥그릇 주변처럼 세세한 부분을 한 번 살펴주면 컨디션을 안정적으로 지켜줄 수 있습니다.",
  libra:
    "주변 분위기의 균형을 중요하게 느끼는 날이에요. 너무 많은 선택지를 주기보다 장난감이나 간식을 두 가지 정도로 좁혀주고, 다정한 말투로 결정할 시간을 주세요.",
  scorpio:
    "겉으로는 조용해 보여도 마음속 관찰은 깊어지는 날이에요. 억지로 끌어내기보다 스스로 다가올 시간을 기다려주고, 1:1로 집중해서 놀아주면 신뢰가 더 단단해집니다.",
  sagittarius:
    "새로운 길과 냄새에 마음이 열리는 날이에요. 다만 들뜬 마음이 갑작스러운 질주로 이어질 수 있으니 리드를 잘 확인하고, 탐험 후에는 충분히 쉬게 해주세요.",
  capricorn:
    "차근차근 해내는 힘이 살아나는 날이에요. 큰 목표보다 작은 커맨드 하나를 성공시키고 충분히 칭찬해주면, 자신감과 안정감이 함께 쌓입니다.",
  aquarius:
    "평소와 다른 방식으로 놀고 싶어질 수 있어요. 새로운 장난감이나 퍼즐 간식을 제안하되, 혼자 탐색하는 시간을 존중해주면 더 편안하게 다가옵니다.",
  pisces:
    "감정의 결이 부드럽고 예민해지는 날이에요. 잔잔한 음악, 낮은 목소리, 느린 쓰다듬기처럼 자극이 적은 교감이 큰 위로가 됩니다.",
};

const TODAY_DETAIL_EN: Record<ZodiacSignKey, string> = {
  aries:
    "The mood may run ahead of the body, so help set a calm rhythm first. Before walks or play, call their name, make eye contact, and praise the moment they wait well.",
  taurus:
    "Familiar routines feel extra comforting today. Keeping meals, rest spots, and walk time close to normal helps them accept small changes more gently.",
  gemini:
    "There is a lot to see, hear, and sniff today. Instead of stopping the curiosity, split play into short rounds and add quiet pauses so scattered energy becomes cute focus.",
  cancer:
    "Your voice and expression may matter more than usual. Sit close, pet slowly, and prepare a safe cozy spot so the heart can settle.",
  leo:
    "Praise lights up the whole face today. Photos or tiny tricks are great, but when excitement rises, soften the rhythm with water and a short rest.",
  virgo:
    "Small discomforts may be noticed quickly today. A gentle check of paws, coat, and the feeding area can help keep the whole day stable.",
  libra:
    "Balance in the room matters today. Offer two toy or snack choices instead of many, and give time to decide with a kind voice.",
  scorpio:
    "Even if they look quiet, the inner observation is deep today. Wait for them to approach, then use focused one-on-one play to strengthen trust.",
  sagittarius:
    "New paths and scents feel inviting today. Check the lead carefully because excitement can turn into sudden dashes, then offer real rest after exploring.",
  capricorn:
    "Step-by-step progress is favored today. One small command, completed and warmly praised, builds confidence and steadiness together.",
  aquarius:
    "They may want to play in a different way today. Offer a new toy or puzzle treat, then respect solo exploration so they can come closer comfortably.",
  pisces:
    "Feelings are soft and sensitive today. Gentle music, a low voice, and slow petting can be more comforting than a busy routine.",
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

export function getTodayKstDateString(): string {
  const dtf = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return dtf.format(new Date());
}

export function buildDailyFortune(
  sign: ZodiacSignKey,
  petName: string,
  species: Species,
  locale: Locale,
  dateKst: string = getTodayKstDateString()
): DailyFortuneSlice {
  const bank = locale === "ko" ? BANK_KO : BANK_EN;
  const b = bank[sign];
  const seed = hashSeed(dateKst, sign, petName, species);

  const luckScore = (seed % 5) + 1;
  const keywords = b.keywords.map((_, index) => pick(b.keywords, seed, index));
  const todayBase = pick(b.today, seed, 2);
  const todayDetail = locale === "ko" ? TODAY_DETAIL_KO[sign] : TODAY_DETAIL_EN[sign];

  return {
    luckScore,
    keyword: keywords[0],
    keywords,
    today: `${todayBase} ${todayDetail}`,
    luckySnack: pick(b.snacks, seed, 3),
    caution: pick(b.cautions, seed, 4),
    ownerTip: pick(b.ownerTips, seed, 5),
  };
}
