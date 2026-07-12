import type { ReportSlotPromptMap } from "../prompt-definition";
import {
  CARE_STYLE,
  COHORT_RULE,
  ELEMENT_DEFICIENCY_RULE,
  HANGUL_ONLY_RULE,
  OUTPUT_FORMAT_RULES,
  JSON_OUTPUT_FORCE_RULE,
  S3_SCORE_RULES_BLOCK,
  S3_SCORES_SCHEMA,
  SCORE_CITATION_RULE,
} from "../newgen-common";

/** No.04 · 비즈니스 파트너 플랜 (business) */
export const FOCUS_KO =
  "비즈니스 파트너 플랜 — 협업·네트워크·파트너십을 대운 단위로 설계한다. 역할·KPI·철수 조건이 있는 실행 조언으로.";
export const FOCUS_EN =
  "Business Partner Plan — design collaboration, network, and partnership across major-luck cycles with roles, KPIs, and exit rules.";

export const SLOTS: ReportSlotPromptMap = {
  "saju-structure": `■ S2 사주 구조 해석 · 비즈니스

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${ELEMENT_DEFICIENCY_RULE}

출력 스키마:
{ "sajuStructure": "string" }

총 600자. 자연 문단만. 우세/결핍(최저 %만)·사업 역할·현재→다음 대운.
${CARE_STYLE}`,

  "master-narrative": `■ S3 핵심 운세 지표 + narrative · 비즈니스

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${ELEMENT_DEFICIENCY_RULE}
${SCORE_CITATION_RULE}

출력 스키마:
${S3_SCORES_SCHEMA}

${S3_SCORE_RULES_BLOCK}

scores description 각 40자, 비즈 맥락:
현재운세강도 / 시기적합도(확장 vs 안정) / 기회포착력(시장·의도) /
위기회피력(50~72, 과신·직설) / 관계운(파트너·고객) / 재물흐름

narrative 200자. 영역 N/10 언급 금지.`,

  "deep-analysis": `■ S4 심층 분석 · 비즈니스 파트너 플랜

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${JSON_OUTPUT_FORCE_RULE}
${SCORE_CITATION_RULE}

출력 스키마:
{
  "intro": "string",
  "sections": [{ "title": "string", "body": "string" }]
}

{{narrative}}

intro: 비즈 서두만 (80~100자).
sections 정확히 5개, title 고정:
1) "나의 비즈니스 역할" — 설계·전략 vs 실행 분담 (80자)
2) "이상적 파트너 유형" — 보완 성향·역할 시너지 (100자)
3) "파트너십 구조 설계" — 역할·KPI·의사결정·철수 (150자)
4) "대운별 사업 로드맵" — 현재~다음 대운 (200자)
5) "파트너십 경보 신호" — 위험 신호 3 (100자)`,

  opportunities: `■ S5 포착할 기회 5가지 · 비즈니스

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${JSON_OUTPUT_FORCE_RULE}
${SCORE_CITATION_RULE}

출력 스키마:
{ "opportunities": [{ "title": "string", "body": "string", "tip": "string" }] }

{{narrative}}

정확히 5개. tip에 "잡는 법:" 금지.`,

  risks: `■ S6 예측 리스크 4가지 · 비즈니스

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${JSON_OUTPUT_FORCE_RULE}

출력 스키마:
{ "risks": [{ "title": "string", "body": "string", "countermeasure": "string" }] }

{{narrative}}

정확히 4개. countermeasure에 "대비책:" 금지.`,

  roadmap: `■ S7 시간 로드맵 · 대운 단위

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${JSON_OUTPUT_FORCE_RULE}
${SCORE_CITATION_RULE}

출력 스키마:
{
  "roadmap": [{ "period": "string", "label": "string", "body": "string" }],
  "decisionMoments": [{ "situation": "string", "script": "string" }]
}

{{narrative}}

roadmap: 5~6항목
  - 과거 대운: 10년 요약
  - ★현재 대운 + 다음 대운: 전반·후반(5년) 세분화
  - 이후: 10년 요약
  입력 ★현재 대운만 현재로 지칭.
decisionMoments 4. script 따옴표 없이 구어만.`,

  prophecy: `■ S8 잠겨진 천명 · 비즈니스

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
prophecy.full: 파트너십·역할 유지 조건·연도 (120자). {{currentYear}} 이후만.
${COHORT_RULE}`,
};
