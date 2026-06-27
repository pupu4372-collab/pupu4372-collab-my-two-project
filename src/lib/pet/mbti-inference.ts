export type MbtiAxis = "EI" | "SN" | "TF" | "JP";

export type MbtiLetter = "E" | "I" | "S" | "N" | "T" | "F" | "J" | "P";

export type PetMbtiType =
  | "ISTJ"
  | "ISFJ"
  | "INFJ"
  | "INTJ"
  | "ISTP"
  | "ISFP"
  | "INFP"
  | "INTP"
  | "ESTP"
  | "ESFP"
  | "ENFP"
  | "ENTP"
  | "ESTJ"
  | "ESFJ"
  | "ENFJ"
  | "ENTJ";

export interface PetMbtiQuestionOption {
  id: string;
  labelKo: string;
  labelEn: string;
  letter: MbtiLetter;
}

export interface PetMbtiQuestion {
  id: string;
  axis: MbtiAxis;
  promptKo: string;
  promptEn: string;
  options: [PetMbtiQuestionOption, PetMbtiQuestionOption];
}

export interface PetMbtiScores {
  E: number;
  I: number;
  S: number;
  N: number;
  T: number;
  F: number;
  J: number;
  P: number;
}

export interface PetMbtiResult {
  type: PetMbtiType;
  scores: PetMbtiScores;
  titleKo: string;
  titleEn: string;
  summaryKo: string;
  summaryEn: string;
}

export const PET_MBTI_PREMIUM_PRICE = 3900;

export const PET_MBTI_QUESTIONS: PetMbtiQuestion[] = [
  {
    id: "q1",
    axis: "EI",
    promptKo: "낯선 사람이 왔을 때?",
    promptEn: "When a stranger visits?",
    options: [
      { id: "q1a", labelKo: "먼저 다가간다", labelEn: "Approaches first", letter: "E" },
      { id: "q1b", labelKo: "숨거나 관찰한다", labelEn: "Hides or watches", letter: "I" },
    ],
  },
  {
    id: "q2",
    axis: "EI",
    promptKo: "혼자 있을 때?",
    promptEn: "When left alone?",
    options: [
      { id: "q2a", labelKo: "계속 관심을 요구한다", labelEn: "Keeps asking for attention", letter: "E" },
      { id: "q2b", labelKo: "혼자 잘 논다", labelEn: "Plays well alone", letter: "I" },
    ],
  },
  {
    id: "q3",
    axis: "EI",
    promptKo: "산책/외출 시?",
    promptEn: "On walks or outings?",
    options: [
      { id: "q3a", labelKo: "적극적으로 탐색한다", labelEn: "Explores actively", letter: "E" },
      { id: "q3b", labelKo: "집사 옆에 붙어있다", labelEn: "Stays close to you", letter: "I" },
    ],
  },
  {
    id: "q4",
    axis: "EI",
    promptKo: "다른 동물을 만나면?",
    promptEn: "Meeting other animals?",
    options: [
      { id: "q4a", labelKo: "먼저 다가간다", labelEn: "Approaches first", letter: "E" },
      { id: "q4b", labelKo: "거리를 둔다", labelEn: "Keeps distance", letter: "I" },
    ],
  },
  {
    id: "q5",
    axis: "SN",
    promptKo: "장난감에 대한 반응?",
    promptEn: "Reaction to toys?",
    options: [
      { id: "q5a", labelKo: "냄새/촉감 먼저 확인", labelEn: "Checks scent and texture first", letter: "S" },
      { id: "q5b", labelKo: "움직임/소리에 반응", labelEn: "Reacts to motion and sound", letter: "N" },
    ],
  },
  {
    id: "q6",
    axis: "SN",
    promptKo: "루틴이 바뀌면?",
    promptEn: "When routine changes?",
    options: [
      { id: "q6a", labelKo: "금방 적응한다", labelEn: "Adapts quickly", letter: "N" },
      { id: "q6b", labelKo: "불안해한다", labelEn: "Gets anxious", letter: "S" },
    ],
  },
  {
    id: "q7",
    axis: "SN",
    promptKo: "새 환경에서?",
    promptEn: "In a new environment?",
    options: [
      { id: "q7a", labelKo: "바로 탐색 시작", labelEn: "Starts exploring right away", letter: "N" },
      { id: "q7b", labelKo: "익숙한 냄새를 찾는다", labelEn: "Seeks familiar scents", letter: "S" },
    ],
  },
  {
    id: "q8",
    axis: "TF",
    promptKo: "집사가 슬플 때?",
    promptEn: "When you seem sad?",
    options: [
      { id: "q8a", labelKo: "다가와 위로한다", labelEn: "Comes to comfort you", letter: "F" },
      { id: "q8b", labelKo: "평소와 다름없다", labelEn: "Acts as usual", letter: "T" },
    ],
  },
  {
    id: "q9",
    axis: "TF",
    promptKo: "훈련/규칙에 대해?",
    promptEn: "About training and rules?",
    options: [
      { id: "q9a", labelKo: "보상 없어도 따른다", labelEn: "Follows even without treats", letter: "T" },
      { id: "q9b", labelKo: "집사 반응 보며 행동", labelEn: "Watches your reaction", letter: "F" },
    ],
  },
  {
    id: "q10",
    axis: "TF",
    promptKo: "다른 동물과 갈등 시?",
    promptEn: "Conflict with another pet?",
    options: [
      { id: "q10a", labelKo: "단호하게 대응", labelEn: "Responds firmly", letter: "T" },
      { id: "q10b", labelKo: "피하거나 양보", labelEn: "Avoids or yields", letter: "F" },
    ],
  },
  {
    id: "q11",
    axis: "TF",
    promptKo: "관심받을 때?",
    promptEn: "When getting attention?",
    options: [
      { id: "q11a", labelKo: "좋아하지만 금방 떠난다", labelEn: "Enjoys then moves on", letter: "T" },
      { id: "q11b", labelKo: "계속 붙어있으려 한다", labelEn: "Wants to stay close", letter: "F" },
    ],
  },
  {
    id: "q12",
    axis: "JP",
    promptKo: "식사 패턴?",
    promptEn: "Meal pattern?",
    options: [
      { id: "q12a", labelKo: "정해진 시간에 먹는다", labelEn: "Eats at set times", letter: "J" },
      { id: "q12b", labelKo: "불규칙하게 먹는다", labelEn: "Eats irregularly", letter: "P" },
    ],
  },
  {
    id: "q13",
    axis: "JP",
    promptKo: "잠자리?",
    promptEn: "Sleeping spot?",
    options: [
      { id: "q13a", labelKo: "항상 같은 자리", labelEn: "Always the same spot", letter: "J" },
      { id: "q13b", labelKo: "매번 다른 곳", labelEn: "Different place each time", letter: "P" },
    ],
  },
  {
    id: "q14",
    axis: "JP",
    promptKo: "놀이 방식?",
    promptEn: "Play style?",
    options: [
      { id: "q14a", labelKo: "한 가지 장난감에 집중", labelEn: "Focuses on one toy", letter: "J" },
      { id: "q14b", labelKo: "여러 장난감 번갈아", labelEn: "Rotates many toys", letter: "P" },
    ],
  },
  {
    id: "q15",
    axis: "JP",
    promptKo: "집사 일과에 반응?",
    promptEn: "Reaction to your daily routine?",
    options: [
      { id: "q15a", labelKo: "패턴 파악하고 기다린다", labelEn: "Learns pattern and waits", letter: "J" },
      { id: "q15b", labelKo: "매번 새롭게 반응", labelEn: "Reacts freshly each time", letter: "P" },
    ],
  },
];

const TYPE_COPY: Record<
  PetMbtiType,
  { titleKo: string; titleEn: string; summaryKo: string; summaryEn: string }
> = {
  ISTJ: {
    titleKo: "책임감 있는 수호자",
    titleEn: "Responsible guardian",
    summaryKo: "루틴을 지키며 조용히 집을 지키는 타입이에요.",
    summaryEn: "Keeps routines and quietly guards the home.",
  },
  ISFJ: {
    titleKo: "다정한 돌봄이",
    titleEn: "Gentle caretaker",
    summaryKo: "집사 곁을 지키며 세심하게 반응하는 타입이에요.",
    summaryEn: "Stays close and responds with gentle care.",
  },
  INFJ: {
    titleKo: "섬세한 공감가",
    titleEn: "Sensitive empath",
    summaryKo: "분위기를 잘 읽고 깊이 애착하는 타입이에요.",
    summaryEn: "Reads moods deeply and bonds with care.",
  },
  INTJ: {
    titleKo: "독립적인 전략가",
    titleEn: "Independent strategist",
    summaryKo: "혼자만의 방식으로 환경을 파악하는 타입이에요.",
    summaryEn: "Maps the environment in their own way.",
  },
  ISTP: {
    titleKo: "냉정한 문제해결사",
    titleEn: "Cool problem-solver",
    summaryKo: "호기심은 크지만 감정 표현은 절제하는 타입이에요.",
    summaryEn: "Curious yet restrained in expression.",
  },
  ISFP: {
    titleKo: "온화한 예술가",
    titleEn: "Soft artist",
    summaryKo: "부드럽게 다가오며 편안한 자리를 좋아해요.",
    summaryEn: "Approaches softly and loves cozy spots.",
  },
  INFP: {
    titleKo: "따뜻한 이상주의자",
    titleEn: "Warm idealist",
    summaryKo: "애정 표현이 깊고 집사와의 유대를 소중히 해요.",
    summaryEn: "Deep affection and values your bond.",
  },
  INTP: {
    titleKo: "호기심 탐험가",
    titleEn: "Curious explorer",
    summaryKo: "새 자극을 좋아하지만 혼자만의 시간도 필요해요.",
    summaryEn: "Likes novelty and solo recharge time.",
  },
  ESTP: {
    titleKo: "대담한 모험가",
    titleEn: "Bold adventurer",
    summaryKo: "바로 행동하며 에너지가 넘치는 타입이에요.",
    summaryEn: "Acts fast with overflowing energy.",
  },
  ESFP: {
    titleKo: "밝은 연예인",
    titleEn: "Bright entertainer",
    summaryKo: "관심과 놀이를 사랑하는 분위기 메이커예요.",
    summaryEn: "Loves attention and playtime fun.",
  },
  ENFP: {
    titleKo: "활발한 친구",
    titleEn: "Lively friend",
    summaryKo: "사람과 동물 모두에게 다가가는 사교형이에요.",
    summaryEn: "Social with people and pets alike.",
  },
  ENTP: {
    titleKo: "재치 있는 장난꾸러기",
    titleEn: "Witty trickster",
    summaryKo: "새 놀이와 변화를 즐기는 자유로운 타입이에요.",
    summaryEn: "Enjoys new games and playful change.",
  },
  ESTJ: {
    titleKo: "질서 있는 리더",
    titleEn: "Orderly leader",
    summaryKo: "규칙과 시간표를 잘 기억하는 타입이에요.",
    summaryEn: "Remembers rules and daily rhythms well.",
  },
  ESFJ: {
    titleKo: "사랑받는 동반자",
    titleEn: "Beloved companion",
    summaryKo: "집사 반응에 맞춰 행동하는 협력형이에요.",
    summaryEn: "Cooperative and tuned to your reactions.",
  },
  ENFJ: {
    titleKo: "따뜻한 중재자",
    titleEn: "Warm mediator",
    summaryKo: "가족 분위기를 살피며 관계를 잘 이어가요.",
    summaryEn: "Reads family mood and keeps harmony.",
  },
  ENTJ: {
    titleKo: "당당한 리더",
    titleEn: "Confident leader",
    summaryKo: "영역과 루틴을 주도하는 카리스마형이에요.",
    summaryEn: "Leads territory and routine with confidence.",
  },
};

export function createEmptyPetMbtiScores(): PetMbtiScores {
  return { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
}

export function applyPetMbtiAnswer(
  scores: PetMbtiScores,
  questionId: string,
  optionId: string
): PetMbtiScores {
  const question = PET_MBTI_QUESTIONS.find((q) => q.id === questionId);
  if (!question) return scores;

  const option = question.options.find((o) => o.id === optionId);
  if (!option) return scores;

  return { ...scores, [option.letter]: scores[option.letter] + 1 };
}

function pickAxis(
  scores: PetMbtiScores,
  positive: MbtiLetter,
  negative: MbtiLetter,
  tiePrefer: MbtiLetter
): MbtiLetter {
  const a = scores[positive];
  const b = scores[negative];
  if (a === b) return tiePrefer;
  return a > b ? positive : negative;
}

export function inferPetMbtiType(scores: PetMbtiScores): PetMbtiType {
  const eOrI = pickAxis(scores, "E", "I", "I");
  const sOrN = pickAxis(scores, "S", "N", "N");
  const tOrF = pickAxis(scores, "T", "F", "F");
  const jOrP = pickAxis(scores, "J", "P", "P");
  return `${eOrI}${sOrN}${tOrF}${jOrP}` as PetMbtiType;
}

export function buildPetMbtiResult(scores: PetMbtiScores): PetMbtiResult {
  const type = inferPetMbtiType(scores);
  const copy = TYPE_COPY[type];
  return { type, scores, ...copy };
}

export function buildPetMbtiResultFromType(type: string): PetMbtiResult | null {
  if (!(type in TYPE_COPY)) return null;
  const petType = type as PetMbtiType;
  return {
    type: petType,
    scores: createEmptyPetMbtiScores(),
    ...TYPE_COPY[petType],
  };
}

export interface PetMbtiPremiumInsight {
  sajuComboKo: string;
  sajuComboEn: string;
  butlerFitKo: string;
  butlerFitEn: string;
  healthKo: string;
  healthEn: string;
  trainingKo: string;
  trainingEn: string;
}

export function buildPetMbtiPremiumInsight(
  result: PetMbtiResult,
  petName: string
): PetMbtiPremiumInsight {
  const { type } = result;
  const isFeeler = type.includes("F");
  const isSensor = type.includes("S");
  const isJudger = type.includes("J");

  return {
    sajuComboKo: `${petName}의 ${type} 기질은 사주의 일간 에너지와 맞물리면 '표현 방식'이 더 선명해집니다. 기질은 타고난 연출이고, 사주는 타이밍과 강약의 지도예요.`,
    sajuComboEn: `${petName}'s ${type} temperament shapes how saju day-master energy is expressed—temperament is the style, saju is the timing map.`,
    butlerFitKo: isFeeler
      ? "집사님의 감정 변화에 민감해요. 훈련보다 안정적인 톤과 예측 가능한 스킨십이 궁합을 높입니다."
      : "집사님과는 명확한 규칙 공유가 잘 맞아요. 짧고 일관된 신호가 신뢰를 만듭니다.",
    butlerFitEn: isFeeler
      ? "Sensitive to your mood—steady tone and predictable affection build trust."
      : "Clear, consistent cues work best for trust and teamwork.",
    healthKo: isSensor
      ? "환경 변화·소음 스트레스를 주의하세요. 익숙한 산책 코스와 식사 루틴이 회복에 도움이 됩니다."
      : "과자극과 불규칙한 일정에 피로가 쌓일 수 있어요. 휴식 공간을 고정해 주세요.",
    healthEn: isSensor
      ? "Watch stress from noise or routine shifts—familiar walks and meals help recovery."
      : "Overstimulation and irregular schedules can drain energy—keep a fixed rest zone.",
    trainingKo: isJudger
      ? "같은 시간·같은 순서의 미니 루틴이 효과적입니다. 성공 직후 3초 칭찬을 반복하세요."
      : "짧은 세션 여러 번이 좋아요. 지루해지기 전에 놀이로 전환하면 집중이 유지됩니다.",
    trainingEn: isJudger
      ? "Mini routines at the same time and order work well—praise within 3 seconds after success."
      : "Several short sessions beat one long drill—switch to play before boredom hits.",
  };
}

export function isPetMbtiComplete(answers: Record<string, string>): boolean {
  return PET_MBTI_QUESTIONS.every((q) => Boolean(answers[q.id]));
}

export function scoresFromAnswers(answers: Record<string, string>): PetMbtiScores {
  let scores = createEmptyPetMbtiScores();
  for (const [questionId, optionId] of Object.entries(answers)) {
    scores = applyPetMbtiAnswer(scores, questionId, optionId);
  }
  return scores;
}
