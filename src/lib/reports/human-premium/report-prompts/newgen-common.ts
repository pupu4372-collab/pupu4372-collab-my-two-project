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
- scores label은 위 6종 이름 그대로(띄어쓰기 없이).
- ★ 토픽 차별화: 6개 지표 점수는 이 리포트 토픽의 성격을 반영해 분포를
  차별화하라. 같은 명식이라도 토픽이 다르면 강조 지표·점수 구성이 달라져야
  한다. 예: 재물 토픽 → 재물흐름·기회포착력 부각 / 관계·비즈 토픽 → 관계운
  부각. 기존 점수 규칙(최강 ≥80, 위기회피력 50~72, 평균 72~82)은 유지하되
  그 범위 안에서 토픽별 서로 다른 숫자 조합을 만들 것. 끝자리가 모두 짝수
  이거나 특정 숫자 세트가 반복되는 인위적 패턴을 피할 것.
- ★ description은 score 서열과 일치: 최고점 지표는 "가장 두드러진다/강하다",
  낮은 점수는 "상대적으로 보완이 필요하다" 톤. 점수와 문구 서열이 어긋나면 안 됨.`;

export const COHORT_RULE = `cohortInsight.body: 동일 명식 구조 코호트 통찰 2줄 (120자)
  - 주어: "[성향/구조]를 가진 사람들은"
  - ★ 실측 통계처럼 단정하는 퍼센트 금지
    ("~%로 나타납니다", "~%에 달합니다", "약 N%에 달합니다" 등)
  - 경향성만: "~하는 경향이 뚜렷합니다", "~한 경우가 많습니다",
    "상대적으로 높게/낮게 나타나는 편입니다"
  - 수치 비유는 '열에 일곱은' 수준 관용만 허용 (정수 % 나열 금지)
  - 상품 구매자·독자 자기지시 금지`;

/** Shared S7 daewoon roadmap period + past-summary rules. */
export const ROADMAP_DAEWOON_RULE = `★ period(블록 헤더) = 그 블록 body가 다루는 세부 연도만:
  - 올바른 예: "2030~2034년 (다음 대운 전반)", "2035~2039년 (다음 대운 후반)"
  - 금지: 10년 통짜 period("2030~2039년")를 쓰고 body만 전반/후반으로 나누기
  - 금지: 서로 다른 블록에 같은 period 문자열 중복
  - label에는 세부 구간 이름(전반/후반·지나온 길 등)을 짧게

★ 과거 요약(지나온 길):
  - 현재 대운 이전 과거가 있으면 로드맵 맨 앞 1개 블록으로 압축 (개별 과거 대운 분할 금지)
  - 회고체만 ("~한 시절이었습니다", "~이 지금의 기반이 되었습니다"). 실행 지시 금지
  - period 예: "과거~현재 대운 이전" 또는 실제 과거 연도 묶음
  - 과거 대운이 거의 없는 젊은 사용자(현재가 첫·둘째 대운 초반 등)는 이 블록 생략 가능

★ 상세도: ★현재+다음 대운만 5년(전반/후반) 세분. 먼 이후는 10년 요약.`;

export const NUMERIC_RANGE_RULE = `★ 수치 일관성:
  - 비중·퍼센트·기간은 단정 단일값보다 범위형(예: 10~20% 수준)을 우선
  - 미래 대운 자산·배분 비중 권고는 반드시 범위로
  - 앞선 narrative·심층 분석에 나온 수치와 상충하는 다른 단정값을 만들지 말 것`;

export const CARE_STYLE = `★ 문체 — 케어 지향: 설명 → 실행 가능 행동으로 문단 마무리.
  십신·명리 전문용어를 본문에 그대로 노출하지 말고 풀어서 쓸 것.`;
