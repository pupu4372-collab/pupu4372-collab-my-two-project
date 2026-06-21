/**
 * 사람(집사) 사주 해석용 매핑
 *
 * pet-trait-mapping.ts와 평행한 구조를 갖되, 펫용 친근한 카테고리 대신
 * 전통 명리학의 십신/오행/대운 흐름을 그대로 활용한다 (유료 콘텐츠).
 * 이 모듈도 결정론적 매핑만 수행하며 LLM을 호출하지 않는다.
 */
import type { SajuResult, PillarInfo } from "./ksaju-engine/saju";
import type { FiveElement, Stem } from "./ksaju-engine/core-tables";
import { STEM_META } from "./ksaju-engine/core-tables";
import { extractElementsFromSaju } from "./extract-elements";
import {
  calcBalanceScore,
  calcElementDistribution,
  dominantAndWeak,
  type ElementRatio,
} from "./pet-trait-mapping";

export interface TenGodSummary {
  label: string;       // 년/월/일/시
  ganzi: string;
  tenGod: string;       // 십신 한자
}

export interface DaewoonSummary {
  index: number;
  ganzi: string;
  startAge: number;
  startYear: number;
}

export interface HumanSajuMapping {
  pillars: { year: string; month: string; day: string; hour: string }; // 60갑자 4주
  dayMaster: Stem;
  dayMasterElement: FiveElement;
  dayMasterYinYang: 'yang' | 'yin';
  elementRatio: ElementRatio;
  dominantElement: FiveElement;
  weakElement: FiveElement;
  tenGods: TenGodSummary[];        // 년/월/시주의 천간 십신 (일주 제외 — 일간이 기준점이므로)
  specialSalSummary: string[];     // 신살 한글 요약 (예: "일주에 양인살")
  gongmangBranches: string[];
  daewoonUpcoming: DaewoonSummary[]; // 향후 3개 대운
  balanceScore: number;
}

const SAL_LABELS: Record<string, string> = {
  yangin: '양인살', dohwa: '도화살', yeokma: '역마살', hwagae: '화개살',
  cheoneul: '천을귀인', munchang: '문창귀인', baekho: '백호살', goegang: '괴강살',
};

const PILLAR_LABEL_KR = ['년주', '월주', '일주', '시주'];

function summarizeSpecialSal(saju: SajuResult): string[] {
  const sal = saju.specialSal;
  const summary: string[] = [];

  for (const key of ['yangin', 'dohwa', 'yeokma', 'hwagae', 'cheoneul', 'munchang'] as const) {
    const indices = sal[key] as number[];
    if (indices.length > 0) {
      const where = indices.map(i => PILLAR_LABEL_KR[i]).join(', ');
      summary.push(`${where}에 ${SAL_LABELS[key]}`);
    }
  }
  if (sal.baekho) summary.push('일주에 백호살');
  if (sal.goegang) summary.push('일주에 괴강살');

  return summary;
}

/**
 * SajuResult를 입력받아 사람(집사)용 해석 매핑 결과를 반환.
 * 순수 함수(결정론적), LLM 호출 없음.
 */
export function mapToHumanInterpretation(saju: SajuResult): HumanSajuMapping {
  const elements = extractElementsFromSaju(saju);
  const elementRatio = calcElementDistribution(elements);
  const { dominant, weak } = dominantAndWeak(elementRatio);

  const dayMaster = saju.dayMaster;
  const dayMasterMeta = STEM_META[dayMaster];

  // 일주를 제외한 년/월/시주의 천간 십신만 요약 (일간 자신은 기준점이라 제외)
  const tenGods: TenGodSummary[] = saju.pillars
    .map((p: PillarInfo, i: number) => ({ label: PILLAR_LABEL_KR[i], ganzi: p.ganzi, tenGod: p.stemTenGod }))
    .filter((_, i) => i !== 2);

  const daewoonUpcoming = saju.daewoon.list.slice(0, 3).map(d => ({
    index: d.index, ganzi: d.ganzi, startAge: d.startAge, startYear: d.startYear,
  }));

  return {
    pillars: {
      year: saju.pillars[0].ganzi,
      month: saju.pillars[1].ganzi,
      day: saju.pillars[2].ganzi,
      hour: saju.pillars[3].ganzi,
    },
    dayMaster,
    dayMasterElement: dayMasterMeta.element,
    dayMasterYinYang: dayMasterMeta.yy,
    elementRatio,
    dominantElement: dominant,
    weakElement: weak,
    tenGods,
    specialSalSummary: summarizeSpecialSal(saju),
    gongmangBranches: saju.gongmangBranches,
    daewoonUpcoming,
    balanceScore: calcBalanceScore(elementRatio),
  };
}
