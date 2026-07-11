/**
 * Shared new-gen prompt rules for paid reports (post No.09 pilot).
 * Do not import into daily/monthly unless intentionally aligning those packs.
 */
import { REPORT_PROMPT_SCORE_RULES } from "./base-prompt";

export const HANGUL_ONLY_RULE = `★ 한자 표기 예외 — 이 섹션은 base 규칙의 "한자 병기"를 따르지 않는다.
  십신·오행·간지를 언급할 때 한자(漢字)를 절대 쓰지 말고 한글로만
  표기할 것. 입력 데이터에 한자가 있어도 출력은 한글 표현으로 바꿀 것.`;

export const OUTPUT_FORMAT_RULES = `★ 출력 형식 공통:
  - "[라벨]:" / "[라벨]" 형태의 내부 라벨을 본문에 쓰지 말 것 — 자연 문장·JSON 필드만
  - 마크다운(**볼드**, # 헤더, 백틱) 사용 금지
  - tip·countermeasure·script 문자열 안에 UI 라벨("잡는 법:", "대비책:")을 넣지 말 것
  - decisionMoments.script는 따옴표 없이 대사 본문만 (렌더러가 감쌈)`;

/** Force machine-parseable JSON for S5/S6 (and retry correction). */
export const JSON_OUTPUT_FORCE_RULE = `★ JSON 출력 강제:
  - JSON만 출력. 마크다운 코드펜스(\`\`\`)·백틱 금지
  - 각 항목에 title / body / tip(또는 countermeasure) 필수
  - opportunities는 정확히 5개, risks는 정확히 4개
  - 문자열 값 안에 큰따옴표(")를 넣지 말 것 (JSON 깨짐 방지)`;

export const ELEMENT_DEFICIENCY_RULE = `★ 오행 정합성:
  pillarBlock의 "오행 분포(%)"와 "결핍 오행(최저 %)"를 반드시 따른다.
  결핍·부족을 말할 때는 가장 낮은 %의 오행만 지목한다.`;

export const SCORE_CITATION_RULE = `★ 지표 인용 정합성:
  이후 섹션에서 S3 점수를 언급할 때는 scores[]에 쓴 지표명·점수와
  동일한 것만 인용한다. 임의 수치·다른 지표명 창작 금지.`;

/** Compact S3 labels — same as daily (No.06). */
export const COMPACT_SCORE_LABELS_KO = [
  "현재운세강도",
  "시기적합도",
  "기회포착력",
  "위기회피력",
  "관계운",
  "재물흐름",
] as const;

export const S3_SCORES_SCHEMA = `{
  "narrative": "string",
  "scores": [
    { "label": "현재운세강도", "score": number, "description": "string" },
    { "label": "시기적합도", "score": number, "description": "string" },
    { "label": "기회포착력", "score": number, "description": "string" },
    { "label": "위기회피력", "score": number, "description": "string" },
    { "label": "관계운", "score": number, "description": "string" },
    { "label": "재물흐름", "score": number, "description": "string" }
  ]
}`;

export const S3_SCORE_RULES_BLOCK = `${REPORT_PROMPT_SCORE_RULES}
- 점수 범위: 50~90 정수. 위기회피력만 50~72.
- 위기회피력을 제외한 나머지 5종 평균 72~82.
- narrative에 영역별 점수(N점·N/10·분기 점수 등)를 쓰지 말 것 — S4 전용.
- scores label은 위 6종 이름 그대로(띄어쓰기 없이).`;

export const COHORT_RULE = `cohortInsight.body: 동일 명식 구조 코호트 통계 2줄 (120자)
  - 주어: "[성향/구조]를 가진 사람들은"
  - ★ 정수 % 수치 정확히 2개 필수
  - 상품 구매자·독자 자기지시 금지`;

export const CARE_STYLE = `★ 문체 — 케어 지향: 설명 → 실행 가능 행동으로 문단 마무리.
  십신·명리 전문용어를 본문에 그대로 노출하지 말고 풀어서 쓸 것.`;
