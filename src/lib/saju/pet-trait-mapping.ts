/**
 * 펫 사주 오행(五行) 매핑 테이블
 *
 * 사주 엔진(ksaju-engine)에서 산출한 오행 분포를 입력받아,
 * 동물군(강아지/고양이/파충류)별로 다른 펫 친화적 특성 카테고리로 변환한다.
 *
 * 설계 원칙:
 * - 이 모듈은 결정론적 "매핑"만 수행한다 (LLM 호출 없음, 항상 같은 입력 → 같은 출력)
 * - 실제 자연어 해석 문장은 이 결과를 LLM 프롬프트에 구조화 데이터로 넘겨서 생성한다
 * - 오행 인간 명리학 용어(인성/관성 등)는 쓰지 않고, 펫 보호자가 바로 이해할 수 있는
 *   카테고리(활동성, 사회성, 주의 체질 등)로 변환한다
 */
import type { FiveElement, Stem } from "./ksaju-engine/core-tables";
import { STEM_META } from "./ksaju-engine/core-tables";
import {
  DAYMASTER_TABLES_EN,
  TRAIT_TABLES_EN,
} from "./pet-trait-mapping-en";
import type { Locale } from "./types";

export type AnimalGroup = 'dog' | 'cat' | 'reptile';

export interface ElementDistribution {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
}

export interface ElementRatio extends ElementDistribution {
  total: number;
}

/** 사주 8글자(년/월/일/시의 천간+지지)의 오행 분포 계산 */
export function calcElementDistribution(elements: FiveElement[]): ElementRatio {
  const dist: ElementDistribution = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  for (const el of elements) dist[el] += 1;
  const total = elements.length;
  return { ...dist, total };
}

/**
 * 가장 비중이 큰 오행(주도 오행)과 가장 적은(결핍) 오행 판별.
 * 동점일 경우 wood > fire > earth > metal > water 순으로 먼저 나온 것을 채택한다
 * (전통 상생 순환 순서를 동점 타이브레이커로 사용 — 항상 결정론적 결과 보장).
 */
export function dominantAndWeak(dist: ElementDistribution): { dominant: FiveElement; weak: FiveElement } {
  const keys: FiveElement[] = ['wood', 'fire', 'earth', 'metal', 'water'];
  const entries = keys.map((k): [FiveElement, number] => [k, dist[k]]);
  const sorted = [...entries].sort((a, b) => b[1] - a[1]);
  return { dominant: sorted[0][0], weak: sorted[sorted.length - 1][0] };
}

// =============================================
// 동물군별 오행 → 특성 카테고리 매핑
// =============================================

export interface TraitMapping {
  personality: string[];   // 성격 키워드 (2~4개)
  healthFocus: string[];   // 건강 주의 포인트
  compatibilityTag: string; // 주인-반려동물 궁합 태그
}

/** 강아지: 활동성·사회성 중심 매핑 */
const DOG_TRAITS: Record<FiveElement, TraitMapping> = {
  wood: {
    personality: ['호기심 많음', '성장 욕구 강함', '훈련 습득 빠름'],
    healthFocus: ['관절·인대', '성장기 영양 관리'],
    compatibilityTag: '함께 운동하고 도전하는 활동형 보호자와 잘 맞음',
  },
  fire: {
    personality: ['활발함', '애정 표현이 큼', '에너지 넘침'],
    healthFocus: ['심장·순환기', '과흥분 시 체온 관리'],
    compatibilityTag: '적극적으로 놀아주는 보호자와 케미가 좋음',
  },
  earth: {
    personality: ['안정적', '느긋함', '충직함'],
    healthFocus: ['소화기', '체중 관리'],
    compatibilityTag: '꾸준하고 규칙적인 생활 패턴의 보호자와 잘 맞음',
  },
  metal: {
    personality: ['독립적', '경계심 있음', '단호함'],
    healthFocus: ['호흡기', '피모(피부·털) 건강'],
    compatibilityTag: '존중하며 거리를 지켜주는 보호자와 신뢰가 쌓임',
  },
  water: {
    personality: ['영리함', '관찰력 좋음', '낯가림 있을 수 있음'],
    healthFocus: ['신장·비뇨기', '수분 섭취'],
    compatibilityTag: '차분하고 인내심 있는 보호자에게 마음을 천천히 엶',
  },
};

/** 고양이: 독립성·예민도 중심 매핑 */
const CAT_TRAITS: Record<FiveElement, TraitMapping> = {
  wood: {
    personality: ['탐험을 좋아함', '높은 곳 선호', '자기주장 뚜렷'],
    healthFocus: ['관절', '근육 발달'],
    compatibilityTag: '캣타워 등 환경을 충분히 제공하는 보호자와 잘 맞음',
  },
  fire: {
    personality: ['감정 기복 있음', '애교와 도도함 공존', '순간 폭발적 에너지'],
    healthFocus: ['심장', '스트레스성 질환'],
    compatibilityTag: '기분 변화를 읽어주는 섬세한 보호자와 잘 맞음',
  },
  earth: {
    personality: ['느긋함', '집순이 성향', '안정 추구'],
    healthFocus: ['비만', '소화기'],
    compatibilityTag: '조용하고 일정한 루틴을 지키는 보호자와 편안함',
  },
  metal: {
    personality: ['도도함', '선 긋기 분명', '관찰 후 행동'],
    healthFocus: ['호흡기', '치아·구강'],
    compatibilityTag: '먼저 다가오길 기다려주는 보호자와 신뢰 형성이 빠름',
  },
  water: {
    personality: ['신중함', '낯가림', '한번 마음 열면 깊은 애착'],
    healthFocus: ['신장(고양이 취약 부위)', '수분 섭취 관리'],
    compatibilityTag: '조급해하지 않고 기다려주는 보호자에게 깊이 의지함',
  },
};

/** 파충류: 환경 민감도·생체리듬 중심 매핑 */
const REPTILE_TRAITS: Record<FiveElement, TraitMapping> = {
  wood: {
    personality: ['환경 적응력 양호', '활동 반경 넓힘'],
    healthFocus: ['탈피 주기 관리', '서식 공간 크기'],
    compatibilityTag: '사육 환경을 꾸준히 개선해주는 보호자와 잘 맞음',
  },
  fire: {
    personality: ['온도 민감', '활동성 변화 큼'],
    healthFocus: ['온도·조명(바스킹) 관리'],
    compatibilityTag: '온습도 관리에 세심한 보호자와 컨디션이 안정됨',
  },
  earth: {
    personality: ['안정적 생체리듬', '루틴 선호'],
    healthFocus: ['소화 및 배변 주기'],
    compatibilityTag: '규칙적인 급여·관리 패턴을 지키는 보호자와 잘 맞음',
  },
  metal: {
    personality: ['경계심 높음', '핸들링 시 예민할 수 있음'],
    healthFocus: ['피부·탈피 상태'],
    compatibilityTag: '핸들링을 서두르지 않는 보호자에게 서서히 적응함',
  },
  water: {
    personality: ['습도 민감', '은신 선호'],
    healthFocus: ['습도 관리', '수분 공급'],
    compatibilityTag: '은신처와 습도를 세심히 챙기는 보호자와 잘 맞음',
  },
};

const TRAIT_TABLES: Record<AnimalGroup, Record<FiveElement, TraitMapping>> = {
  dog: DOG_TRAITS,
  cat: CAT_TRAITS,
  reptile: REPTILE_TRAITS,
};

// =============================================
// 일간(日干) 기반 캐릭터 원형
// =============================================
//
// 일간은 사주에서 '나 자신'에 해당하는 글자로, 같은 오행이라도
// 양간(陽干)/음간(陰干)에 따라 결이 다르다는 것이 전통 명리학의 핵심 이론이다.
// 오행 분포가 "전체적인 기질의 큰 그림"이라면, 일간은 그 동물의 가장 또렷한
// "한 줄 캐릭터 정체성"을 잡아주는 역할을 한다.

export interface DayMasterArchetype {
  keyword: string;        // 캐릭터를 한 단어로
  description: string;    // 한 줄 캐릭터 설명
}

/** 강아지: 일간별 캐릭터 원형 */
const DOG_DAYMASTER: Record<Stem, DayMasterArchetype> = {
  '甲': { keyword: '리더형', description: '무리의 앞장을 서고 싶어하는 우두머리 기질' },
  '乙': { keyword: '순둥형', description: '유연하게 잘 적응하고 사람 옆에 붙어있길 좋아함' },
  '丙': { keyword: '태양형', description: '존재만으로 분위기를 밝히는 에너지 뿜뿜형' },
  '丁': { keyword: '은은형', description: '겉은 차분해도 마음 속 애정이 깊은 따뜻한 타입' },
  '戊': { keyword: '든든형', description: '집을 지키는 든든한 존재감, 변화보다 안정 선호' },
  '己': { keyword: '살림형', description: '보호자 옆에서 묵묵히 함께하는 생활밀착형' },
  '庚': { keyword: '결단형', description: '한번 정하면 흔들리지 않는 단호한 성격' },
  '辛': { keyword: '예민형', description: '섬세하고 깔끔한 걸 좋아하는 까다로운 미식가' },
  '壬': { keyword: '자유형', description: '넓은 활동 반경을 원하는 모험심 강한 타입' },
  '癸': { keyword: '관찰형', description: '조용히 상황을 지켜본 뒤 움직이는 신중파' },
};

/** 고양이: 일간별 캐릭터 원형 */
const CAT_DAYMASTER: Record<Stem, DayMasterArchetype> = {
  '甲': { keyword: '대장묘형', description: '집안 서열 1순위를 자처하는 당당한 카리스마' },
  '乙': { keyword: '애교형', description: '부드럽게 휘감기며 곁을 잘 내주는 친화형' },
  '丙': { keyword: '인싸묘형', description: '손님이 와도 먼저 나서는 사교적인 태양 같은 존재' },
  '丁': { keyword: '잔잔형', description: '조용히 곁에 앉아있길 좋아하는 은근한 애정파' },
  '戊': { keyword: '집사바라기형', description: '한곳에 자리잡으면 잘 안 움직이는 안정 지향' },
  '己': { keyword: '느긋형', description: '서두르는 법이 없는 마이페이스 살림꾼' },
  '庚': { keyword: '도도형', description: '선을 명확히 긋는 시크한 매력의 소유자' },
  '辛': { keyword: '까칠형', description: '예민하지만 그만큼 섬세하게 보호자를 살핌' },
  '壬': { keyword: '탐험형', description: '집안 구석구석 탐색하길 즐기는 호기심 대장' },
  '癸': { keyword: '은신형', description: '낯선 상황엔 숨고 보는 신중한 관찰자' },
};

/** 파충류: 일간별 캐릭터 원형 */
const REPTILE_DAYMASTER: Record<Stem, DayMasterArchetype> = {
  '甲': { keyword: '개척형', description: '서식 공간을 적극적으로 탐색하는 활동파' },
  '乙': { keyword: '적응형', description: '환경 변화에 비교적 유연하게 적응하는 편' },
  '丙': { keyword: '활동형', description: '바스킹 타임을 즐기듯 활기찬 모습을 자주 보임' },
  '丁': { keyword: '온건형', description: '자극에 과민반응하지 않는 차분한 성향' },
  '戊': { keyword: '터줏대감형', description: '익숙한 자리에서 잘 벗어나지 않는 안정형' },
  '己': { keyword: '루틴형', description: '정해진 생활 패턴을 선호하는 규칙적인 타입' },
  '庚': { keyword: '경계형', description: '핸들링에 신중하고 거리두기를 분명히 함' },
  '辛': { keyword: '민감형', description: '환경 변화에 예민하게 반응하는 섬세한 개체' },
  '壬': { keyword: '은신선호형', description: '넓은 공간보다 은신처를 더 편안해함' },
  '癸': { keyword: '습윤선호형', description: '습도와 환경 변화에 특히 민감하게 반응' },
};

const DAYMASTER_TABLES: Record<AnimalGroup, Record<Stem, DayMasterArchetype>> = {
  dog: DOG_DAYMASTER,
  cat: CAT_DAYMASTER,
  reptile: REPTILE_DAYMASTER,
};

// =============================================
// 종합 매핑 결과
// =============================================

export interface PetSajuMapping {
  animalGroup: AnimalGroup;
  elementRatio: ElementRatio;
  dominantElement: FiveElement;
  weakElement: FiveElement;
  dominantTraits: TraitMapping;  // 주도 오행 기반 특성 (메인 해석 축)
  weakTraits: TraitMapping;      // 결핍 오행 기반 보완 포인트
  balanceScore: number;          // 0~100, 오행이 고르게 분포할수록 높음
  dayMaster: Stem;               // 일간(日干) — 사주에서 '나 자신'에 해당하는 글자
  dayMasterElement: FiveElement; // 일간의 오행
  dayMasterYinYang: 'yang' | 'yin';
  dayMasterArchetype: DayMasterArchetype; // 일간 기반 캐릭터 원형 (가장 또렷한 정체성 한 줄)
}

/** 오행 분포의 균형도 점수 산출 (표준편차가 작을수록 균형, 100점에 가까움) */
export function calcBalanceScore(dist: ElementDistribution): number {
  const keys: (keyof ElementDistribution)[] = ['wood', 'fire', 'earth', 'metal', 'water'];
  const values = keys.map(k => dist[k]);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / values.length;
  const stdDev = Math.sqrt(variance);
  // stdDev 0(완전균형) → 100점, stdDev가 클수록(편중) 점수 하락
  const maxStdDev = 2.5; // 8글자 기준 경험적 상한
  const score = Math.max(0, 100 - (stdDev / maxStdDev) * 100);
  return Math.round(score);
}

/**
 * 사주 8글자의 오행 배열, 일간(日干), 동물군을 입력받아 펫 친화적 매핑 결과를 반환.
 * 이 함수는 순수 함수(결정론적)이며 LLM을 호출하지 않는다.
 *
 * @param elements 8글자(년/월/일/시 × 천간/지지)의 오행 배열 — 전체적인 기질의 큰 그림
 * @param dayMaster 일간(일주의 천간) — 가장 또렷한 캐릭터 정체성
 * @param animalGroup 동물군 (dog/cat/reptile)
 */
export function mapToPetTraits(
  elements: FiveElement[],
  dayMaster: Stem,
  animalGroup: AnimalGroup,
  locale: Locale = "ko"
): PetSajuMapping {
  const elementRatio = calcElementDistribution(elements);
  const { dominant, weak } = dominantAndWeak(elementRatio);
  const traitTable =
    locale === "ko" ? TRAIT_TABLES[animalGroup] : TRAIT_TABLES_EN[animalGroup];
  const dayMasterTable =
    locale === "ko" ? DAYMASTER_TABLES[animalGroup] : DAYMASTER_TABLES_EN[animalGroup];
  const dayMasterMeta = STEM_META[dayMaster];

  return {
    animalGroup,
    elementRatio,
    dominantElement: dominant,
    weakElement: weak,
    dominantTraits: traitTable[dominant],
    weakTraits: traitTable[weak],
    balanceScore: calcBalanceScore(elementRatio),
    dayMaster,
    dayMasterElement: dayMasterMeta.element,
    dayMasterYinYang: dayMasterMeta.yy,
    dayMasterArchetype: dayMasterTable[dayMaster],
  };
}
