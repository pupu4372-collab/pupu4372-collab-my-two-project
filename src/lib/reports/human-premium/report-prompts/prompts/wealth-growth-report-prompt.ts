import type { ReportSlotPromptMap } from "../prompt-definition";
import {
  CARE_STYLE,
  COHORT_RULE,
  ELEMENT_DEFICIENCY_RULE,
  HANGUL_ONLY_RULE,
  NUMERIC_RANGE_RULE,
  OUTPUT_FORMAT_RULES,
  JSON_OUTPUT_FORCE_RULE,
  PROPHECY_TWO_MOMENTS_RULE,
  ROADMAP_DAEWOON_RULE,
  S3_SCORE_RULES_BLOCK,
  S3_SCORES_SCHEMA,
  SCORE_CITATION_RULE,
} from "../newgen-common";

/** No.02 · 자산과 재테크 (wealth) */
export const FOCUS_KO =
  "자산과 재테크 — 자산 흐름과 재테크를 대운 단위로 설계한다. 수치·규칙이 있는 실행 조언으로.";
export const FOCUS_EN =
  "Assets & Wealth — design asset flow and wealth strategy across major-luck cycles with rule-based actions.";

export const SLOTS: ReportSlotPromptMap = {
  "saju-structure": `■ S2 사주 구조 해석 · 재물

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${ELEMENT_DEFICIENCY_RULE}

출력 스키마:
{ "sajuStructure": "string" }

총 600자. 자연 문단만. 우세/결핍(최저 %만)·재물 강약·현재→다음 대운.
${CARE_STYLE}`,

  "master-narrative": `■ S3 핵심 운세 지표 + narrative · 재물

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${ELEMENT_DEFICIENCY_RULE}
${SCORE_CITATION_RULE}

출력 스키마:
${S3_SCORES_SCHEMA}

${S3_SCORE_RULES_BLOCK}

scores description 각 40자, 재물 맥락:
현재운세강도 / 시기적합도(확장 vs 수성) / 기회포착력(투자·정보) /
위기회피력(50~72, 과도 베팅) / 관계운(관계 속 돈) / 재물흐름

narrative 200자: 대운별 재물 3단 서사. 영역 N/10 언급 금지.`,

  "deep-analysis": `■ S4 심층 분석 · 자산과 재테크

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${JSON_OUTPUT_FORCE_RULE}
${SCORE_CITATION_RULE}
${NUMERIC_RANGE_RULE}

출력 스키마:
{
  "intro": "string",
  "sections": [{ "title": "string", "body": "string" }]
}

{{narrative}}

intro: 재물 서두만 (80~100자).
sections 정확히 4개, title 고정:
1) "재물 3단 구조" — 정보→전략→자산화 공식 (80자)
2) "자산 유형별 전략" — 부동산·금융·부업·연금, 비중·기간은 범위형 (200자)
3) "대운별 재물 로드맵" — 현재~그다음 대운 (250자)
4) "재물 경보 원칙" — 규칙 3가지, 수치는 범위형 (100자)`,

  opportunities: `■ S5 포착할 기회 5가지 · 재물

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${JSON_OUTPUT_FORCE_RULE}
${SCORE_CITATION_RULE}
${NUMERIC_RANGE_RULE}

출력 스키마:
{ "opportunities": [{ "title": "string", "body": "string", "tip": "string" }] }

{{narrative}}

정확히 5개. tip에 "잡는 법:" 금지.`,

  risks: `■ S6 예측 리스크 4가지 · 재물

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${JSON_OUTPUT_FORCE_RULE}
${NUMERIC_RANGE_RULE}

출력 스키마:
{ "risks": [{ "title": "string", "body": "string", "countermeasure": "string" }] }

{{narrative}}

정확히 4개. countermeasure에 "대비책:" 금지. 비중·기간은 범위형.`,

  roadmap: `■ S7 시간 로드맵 · 대운 단위

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${JSON_OUTPUT_FORCE_RULE}
${SCORE_CITATION_RULE}
${NUMERIC_RANGE_RULE}
${ROADMAP_DAEWOON_RULE}

출력 스키마:
{
  "roadmap": [{ "period": "string", "label": "string", "body": "string" }],
  "decisionMoments": [{ "situation": "string", "script": "string" }]
}

{{narrative}}

roadmap 5~7항목 (과거 요약 1 + 현재·다음 세분 + 이후 요약).
decisionMoments 4. script 따옴표 없이 구어만.`,

  prophecy: `■ S8 잠겨진 천명 · 재물

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${JSON_OUTPUT_FORCE_RULE}

출력 스키마:
{
  "prophecy": { "short": "string", "full": "string" },
  "cohortInsight": { "body": "string" }
}

{{narrative}}

prophecy.short: 반드시 아래 고정값을 그대로 (창작 금지):
{{luckyKeywordsShort}}
prophecy.full: 현금흐름·버티는 힘, 서로 다른 미래 시점 2개 분리 (120자).
${PROPHECY_TWO_MOMENTS_RULE}
${COHORT_RULE}`,
};
