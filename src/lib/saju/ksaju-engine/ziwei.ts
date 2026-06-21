/**
 * 자미두수(紫微斗數) 명반 계산
 *
 * 명궁/신궁 산출, 오행국 결정, 자미성계·천부성계 14주성 배치, 12궁 구성을
 * 전통 자미두수 이론에 따라 독자적으로 구현한다.
 */
import { Solar, Lunar } from "lunar-javascript";
import { STEMS, BRANCHES, type Stem, type Branch } from "./core-tables";

function stemIdx(s: string): number { return STEMS.indexOf(s as Stem); }
function branchIdx(b: string): number { return BRANCHES.indexOf(b as Branch); }
function stemAt(i: number): Stem { return STEMS[((i % 10) + 10) % 10]; }
function branchAt(i: number): Branch { return BRANCHES[((i % 12) + 12) % 12]; }

/** 시각(0~23시) → 십이지시 인덱스. 23시·0시는 모두 子시(0) */
function hourToBranchIdx(hour: number): number {
  return Math.floor(((hour + 1) % 24) / 2);
}

// 오행국 표: (오행, 국수)
const ELEMENT_BUREAU: Record<string, { name: string; number: number }> = {
  wood: { name: '木三局', number: 3 },
  fire: { name: '火六局', number: 6 },
  earth: { name: '土五局', number: 5 },
  metal: { name: '金四局', number: 4 },
  water: { name: '水二局', number: 2 },
};

// 납음오행 산출표 (60갑자 → 오행) — 전통 납음표를 직접 정리
const NAYIN_PAIRS: Array<[string[], string]> = [
  [['甲子', '乙丑'], 'metal'], [['丙寅', '丁卯'], 'fire'],
  [['戊辰', '己巳'], 'wood'], [['庚午', '辛未'], 'earth'],
  [['壬申', '癸酉'], 'metal'], [['甲戌', '乙亥'], 'fire'],
  [['丙子', '丁丑'], 'water'], [['戊寅', '己卯'], 'earth'],
  [['庚辰', '辛巳'], 'metal'], [['壬午', '癸未'], 'wood'],
  [['甲申', '乙酉'], 'water'], [['丙戌', '丁亥'], 'earth'],
  [['戊子', '己丑'], 'fire'], [['庚寅', '辛卯'], 'wood'],
  [['壬辰', '癸巳'], 'water'], [['甲午', '乙未'], 'metal'],
  [['丙申', '丁酉'], 'fire'], [['戊戌', '己亥'], 'wood'],
  [['庚子', '辛丑'], 'earth'], [['壬寅', '癸卯'], 'metal'],
  [['甲辰', '乙巳'], 'fire'], [['丙午', '丁未'], 'water'],
  [['戊申', '己酉'], 'earth'], [['庚戌', '辛亥'], 'metal'],
  [['壬子', '癸丑'], 'wood'], [['甲寅', '乙卯'], 'water'],
  [['丙辰', '丁巳'], 'earth'], [['戊午', '己未'], 'fire'],
  [['庚申', '辛酉'], 'wood'], [['壬戌', '癸亥'], 'water'],
];

function getNayinElement(ganzi: string): string {
  for (const [pair, el] of NAYIN_PAIRS) {
    if (pair.includes(ganzi)) return el;
  }
  return 'water';
}

// 오호둔(五虎遁): 연간 → 인궁(寅宮) 천간 시작점
const WUHU_DUN: Record<Stem, Stem> = {
  '甲': '丙', '己': '丙',
  '乙': '戊', '庚': '戊',
  '丙': '庚', '辛': '庚',
  '丁': '壬', '壬': '壬',
  '戊': '甲', '癸': '甲',
};

/** 寅궁부터 시작하는 각 지지궁의 천간 (오호둔법) */
function palaceStem(yearStem: Stem, branch: Branch): Stem {
  const startStem = WUHU_DUN[yearStem];
  const offset = (branchIdx(branch) - branchIdx('寅') + 12) % 12;
  return stemAt(stemIdx(startStem) + offset);
}

export interface ZiweiInput {
  year: number; month: number; day: number; hour: number; minute: number;
  gender: 'M' | 'F';
  isLunar?: boolean;
  isLeapMonth?: boolean;
}

export interface ZiweiPalace {
  name: string;     // 12궁 이름 (命宮, 兄弟宮 ...)
  branch: Branch;
  stem: Stem;
  mainStars: string[]; // 14주성 중 이 궁에 있는 것
  auxStars: string[];  // 보조성
  isBodyPalace: boolean;
}

export interface ZiweiChart {
  lunarYear: number; lunarMonth: number; lunarDay: number; isLeapMonth: boolean;
  yearStem: Stem; yearBranch: Branch;
  lifePalaceBranch: Branch;
  bodyPalaceBranch: Branch;
  bureau: { name: string; number: number };
  palaces: ZiweiPalace[]; // 命宮부터 시계반대 순서 12개
}

const PALACE_NAMES = [
  '命宮', '兄弟宮', '夫妻宮', '子女宮', '財帛宮', '疾厄宮',
  '遷移宮', '交友宮', '官祿宮', '田宅宮', '福德宮', '父母宮',
];

// 자미성계 배치 오프셋(자미 위치 기준, 역행 방향)
const ZIWEI_SERIES: Array<[string, number]> = [
  ['紫微', 0], ['天機', -1], ['太陽', -3], ['武曲', -4], ['天同', -5], ['廉貞', -8],
];
// 천부성계 배치 오프셋(천부 위치 기준, 순행 방향)
const TIANFU_SERIES: Array<[string, number]> = [
  ['天府', 0], ['太陰', 1], ['貪狼', 2], ['巨門', 3], ['天相', 4],
  ['天梁', 5], ['七殺', 6], ['破軍', 10],
];

/** 자미성 위치 산출 (생일 일수 + 오행국 수 기준) */
function locateZiwei(lunarDay: number, bureauNumber: number): Branch {
  const q = Math.floor(lunarDay / bureauNumber);
  const r = lunarDay % bureauNumber;
  let pos: number;
  if (r === 0) {
    pos = q;
  } else {
    const remain = bureauNumber - r;
    pos = remain % 2 === 1 ? q + 1 - remain : q + 1 + remain;
  }
  // pos: 1=寅궁 기준 순번 → 지지 인덱스로 변환 (寅=index 2)
  let idx = ((pos - 1) % 12 + 12) % 12;
  return branchAt(idx + branchIdx('寅'));
}

function locateTianfu(ziweiBranch: Branch): Branch {
  // 전통 공식: (자미 지지 인덱스 + 천부 지지 인덱스) mod 12 = 4
  const zi = branchIdx(ziweiBranch);
  const fu = ((4 - zi) % 12 + 12) % 12;
  return branchAt(fu);
}

export function createZiweiChart(input: ZiweiInput): ZiweiChart {
  let solar;
  if (input.isLunar) {
    const lm = input.isLeapMonth ? -input.month : input.month;
    solar = Lunar.fromYmd(input.year, lm, input.day).getSolar();
  } else {
    solar = Solar.fromYmd(input.year, input.month, input.day);
  }
  const lunar = solar.getLunar();
  const lunarYear: number = lunar.getYear();
  const lunarMonth: number = Math.abs(lunar.getMonth());
  const lunarDay: number = lunar.getDay();
  const isLeap = lunar.getMonth() < 0;

  const yearStem = stemAt(((lunarYear - 4) % 10 + 10) % 10);
  const yearBranch = branchAt(((lunarYear - 4) % 12 + 12) % 12);

  const hourIdx = hourToBranchIdx(input.hour);

  // 명궁: 寅궁에서 시작해 (월-1)만큼 순행 후 시지만큼 역행
  const monthStartIdx = (branchIdx('寅') + lunarMonth - 1) % 12;
  const lifeIdx = ((monthStartIdx - hourIdx) % 12 + 12) % 12;
  const lifePalaceBranch = branchAt(lifeIdx);

  // 신궁: 월 순행 위치에서 시지만큼 추가 순행
  const bodyIdx = (monthStartIdx + hourIdx) % 12;
  const bodyPalaceBranch = branchAt(bodyIdx);

  // 명궁 천간 → 오행국
  const lifeStem = palaceStem(yearStem, lifePalaceBranch);
  const nayinEl = getNayinElement(lifeStem + lifePalaceBranch);
  const bureau = ELEMENT_BUREAU[nayinEl];

  const ziweiBranch = locateZiwei(lunarDay, bureau.number);
  const tianfuBranch = locateTianfu(ziweiBranch);

  const mainStarPlacement: Record<string, Branch> = {};
  for (const [star, offset] of ZIWEI_SERIES) {
    mainStarPlacement[star] = branchAt(branchIdx(ziweiBranch) + offset);
  }
  for (const [star, offset] of TIANFU_SERIES) {
    mainStarPlacement[star] = branchAt(branchIdx(tianfuBranch) + offset);
  }

  // 12궁: 명궁부터 시계 반대 방향(지지 역순)으로 배치
  const palaces: ZiweiPalace[] = PALACE_NAMES.map((name, i) => {
    const branch = branchAt(lifeIdx - i);
    const stem = palaceStem(yearStem, branch);
    const mainStars = Object.entries(mainStarPlacement)
      .filter(([, b]) => b === branch)
      .map(([star]) => star);
    return {
      name, branch, stem, mainStars, auxStars: [],
      isBodyPalace: branch === bodyPalaceBranch,
    };
  });

  return {
    lunarYear, lunarMonth, lunarDay, isLeapMonth: isLeap,
    yearStem, yearBranch,
    lifePalaceBranch, bodyPalaceBranch,
    bureau,
    palaces,
  };
}
