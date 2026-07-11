import type { ReportSlotPromptMap } from "../prompt-definition";
import {
  CARE_STYLE,
  COHORT_RULE,
  ELEMENT_DEFICIENCY_RULE,
  HANGUL_ONLY_RULE,
  OUTPUT_FORMAT_RULES,
  S3_SCORE_RULES_BLOCK,
  S3_SCORES_SCHEMA,
  SCORE_CITATION_RULE,
} from "../newgen-common";

/** No.05 · 로맨스시그널 (love) */
export const FOCUS_KO =
  "로맨스시그널 — 연애·결혼·관계의 온도를 대운과 일상 루틴으로 설계한다. 소통·표현 행동으로.";
export const FOCUS_EN =
  "Romance Signal — design love, marriage, and relationship warmth through major-luck timing and daily communication habits.";

export const SLOTS: ReportSlotPromptMap = {
  "saju-structure": `■ S2 사주 구조 해석 · 연애·결혼

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${ELEMENT_DEFICIENCY_RULE}

출력 스키마:
{ "sajuStructure": "string" }

총 600자. 자연 문단만. 우세/결핍(최저 %만)·관계 패턴·현재 대운 재정비.
${CARE_STYLE}`,

  "master-narrative": `■ S3 핵심 운세 지표 + narrative · 연애·결혼

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${ELEMENT_DEFICIENCY_RULE}
${SCORE_CITATION_RULE}

출력 스키마:
${S3_SCORES_SCHEMA}

${S3_SCORE_RULES_BLOCK}
★ 관계운은 75~90 상단 허용 (로맨스 상품성). 위기회피력은 반드시 50~72.
  재물흐름은 50~90 공통 범위·평균 규칙 준수 (상한 특례 없음).

scores description 각 40자, 관계 맥락:
현재운세강도 / 시기적합도(신규 vs 기존) / 기회포착력 /
위기회피력(50~72) / 관계운(75~90) / 재물흐름

narrative 200자. 영역 N/10 언급 금지.`,

  "deep-analysis": `■ S4 심층 분석 · 로맨스시그널

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${SCORE_CITATION_RULE}

출력 스키마:
{
  "intro": "string",
  "sections": [{ "title": "string", "body": "string" }]
}

{{narrative}}

intro: 관계 서두만 (80~100자).
sections 정확히 4개, title 고정:
1) "연애 스타일" — 강점·보완·편안한 환경 (120자)
2) "이상적 배우자 유형" — 보완 성향·주의 유형·활성 시기 (120자)
3) "관계 갈등 패턴" — 반복 갈등 2~3 + 해소 (150자)
4) "현재 관계 재정비" — 대운 영향·말의 전환·루틴 3 (200자)`,

  opportunities: `■ S5 포착할 기회 5가지 · 연애·결혼

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${SCORE_CITATION_RULE}

출력 스키마:
{ "opportunities": [{ "title": "string", "body": "string", "tip": "string" }] }

{{narrative}}

정확히 5개. tip에 "잡는 법:" 금지.`,

  risks: `■ S6 예측 리스크 4가지 · 연애·결혼

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}

출력 스키마:
{ "risks": [{ "title": "string", "body": "string", "countermeasure": "string" }] }

{{narrative}}

정확히 4개. countermeasure에 "대비책:" 금지.`,

  roadmap: `■ S7 시간 로드맵 · 대운+루틴 6단계

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${SCORE_CITATION_RULE}

출력 스키마:
{
  "roadmap": [{ "period": "string", "label": "string", "body": "string" }],
  "decisionMoments": [{ "situation": "string", "script": "string" }]
}

{{narrative}}

roadmap 6: 현재 대운 / 다음 대운 초·후반 / 이후 대운 / 주간·연간 루틴 등.
decisionMoments 4 (배우자·가족). script 따옴표 없이 구어만.`,

  prophecy: `■ S8 잠겨진 천명 · 연애·결혼

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}

출력 스키마:
{
  "prophecy": { "short": "string", "full": "string" },
  "cohortInsight": { "body": "string" }
}

{{narrative}}

prophecy.short: 색·방향·대화 시간·숫자 + 다짐(15자)
prophecy.full: 미래 연도 없이 대운 시기+나이 + 구체 장면 (120자)
${COHORT_RULE}`,
};
