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

/** No.03 · 멘탈디톡스 (mental) */
export const FOCUS_KO =
  "멘탈디톡스 — 심리·건강·에너지·회복력을 일상 루틴으로 설계한다. 오늘~이번 주 실행 가능한 케어 행동으로.";
export const FOCUS_EN =
  "Mental Detox — design mind, health, energy, and resilience as daily care routines you can act on this week.";

export const SLOTS: ReportSlotPromptMap = {
  "saju-structure": `■ S2 사주 구조 해석 · 심리·멘탈

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${ELEMENT_DEFICIENCY_RULE}

출력 스키마:
{ "sajuStructure": "string" }

총 600자. 자연 문단만. 우세/결핍(최저 %만)·감정·회복 패턴.
${CARE_STYLE}`,

  "master-narrative": `■ S3 핵심 운세 지표 + narrative · 심리

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${ELEMENT_DEFICIENCY_RULE}
${SCORE_CITATION_RULE}

출력 스키마:
${S3_SCORES_SCHEMA}

${S3_SCORE_RULES_BLOCK}

scores description 각 40자, 심리 맥락:
현재운세강도(감정 에너지) / 시기적합도(내면 탐구) / 기회포착력(직관·공감) /
위기회피력(50~72, 번아웃) / 관계운(정서 연결) / 재물흐름(심리→물질 간접)

narrative 200자. 영역 N/10 언급 금지.`,

  "deep-analysis": `■ S4 심층 분석 · 멘탈디톡스

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

intro: 심리 서두만 (80~100자).
sections 정확히 4개, title 고정:
1) "내면 심리 유형" — 유형명·강점·편안한 환경 (120자)
2) "스트레스 패턴" — 유발·신호·회복 (200자)
3) "감정 관리법" — 즉각/일상/위기 다짐(따옴표 없이)·회복 속도 (200자)
4) "대인관계 갈등 해소" — 패턴·해소 3단계 (200자)`,

  opportunities: `■ S5 포착할 기회 5가지 · 멘탈

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${JSON_OUTPUT_FORCE_RULE}
${SCORE_CITATION_RULE}

출력 스키마:
{ "opportunities": [{ "title": "string", "body": "string", "tip": "string" }] }

{{narrative}}

정확히 5개. tip에 "잡는 법:" 금지.`,

  risks: `■ S6 예측 리스크 4가지 · 멘탈

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${JSON_OUTPUT_FORCE_RULE}

출력 스키마:
{ "risks": [{ "title": "string", "body": "string", "countermeasure": "string" }] }

{{narrative}}

정확히 4개. countermeasure에 "대비책:" 금지. 심리·신체 양면 행동.`,

  roadmap: `■ S7 시간 로드맵 · 연수 6단계

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

roadmap 6항목 (연수·회복 단계). decisionMoments 4. script 따옴표 없이 구어만.`,

  prophecy: `■ S8 잠겨진 천명 · 심리

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
prophecy.full: 대운 파장·감정 관리·미래 연도 2개 (120자). {{currentYear}} 이후만.
${COHORT_RULE}`,
};
