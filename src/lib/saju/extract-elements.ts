/**
 * SajuResult → 오행 배열 추출 헬퍼
 *
 * 사주 8글자(년/월/일/시 × 천간/지지)에서 각 글자의 오행을 뽑아
 * pet-trait-mapping의 입력 형식으로 변환한다.
 */
import type { SajuResult } from "./ksaju-engine/saju";
import { STEM_META, BRANCH_ELEMENT, type FiveElement, type Stem } from "./ksaju-engine/core-tables";

/** 사주 결과(4주)에서 8글자의 오행을 모두 추출 (천간 4개 + 지지 4개) */
export function extractElementsFromSaju(saju: SajuResult): FiveElement[] {
  const elements: FiveElement[] = [];
  for (const pillar of saju.pillars) {
    elements.push(STEM_META[pillar.stem].element);
    elements.push(BRANCH_ELEMENT[pillar.branch]);
  }
  return elements;
}

/** 사주 결과에서 일간(日干) 추출 — 일주(日柱)의 천간 */
export function extractDayMaster(saju: SajuResult): Stem {
  return saju.dayMaster;
}
