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

/** No.10 · 올해의 인생 청사진 (yearly) */
export const FOCUS_KO =
  "올해의 인생 청사진 — 올해 로드맵과 분기별 행동을 세운·월운 안에서 설계한다. 올해 안에 실행 가능한 조언으로.";
export const FOCUS_EN =
  "This Year's Major-Luck Plan — design this year's roadmap and quarterly moves within annual luck. Advice must be executable this year.";

export const SLOTS: ReportSlotPromptMap = {
  "saju-structure": `■ S2 사주 구조 해석 · 올해

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${ELEMENT_DEFICIENCY_RULE}

출력 스키마:
{ "sajuStructure": "string" }

총 600자. 자연 문단만. 우세/결핍(최저 %만)·대운·세운·올해 전략.
${CARE_STYLE}`,

  "master-narrative": `■ S3 핵심 운세 지표 + narrative · 올해

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${ELEMENT_DEFICIENCY_RULE}
${SCORE_CITATION_RULE}

출력 스키마:
${S3_SCORES_SCHEMA}

${S3_SCORE_RULES_BLOCK}

scores label 6종 그대로. description 각 40자.
narrative 200자: 대운 맥락→올해 위치→전반/후반. 분기 N/10 언급 금지.`,

  "deep-analysis": `■ S4 심층 분석 · 올해의 인생 청사진

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${SCORE_CITATION_RULE}

출력 스키마:
{
  "intro": "string",
  "domains": [
    { "domain": "1분기", "score": number, "analysis": "string" },
    { "domain": "2분기", "score": number, "analysis": "string" },
    { "domain": "3분기", "score": number, "analysis": "string" },
    { "domain": "4분기", "score": number, "analysis": "string" }
  ],
  "luckyMonths": ["string", "string"]
}

{{narrative}}

intro: 올해 핵심 구도만 (100자). 분기 점수·황금의 달 몰아넣기 금지.
domains: 정확히 4개. domain 이름 위 그대로. score 10점 만점 정수(6~9, 2분기 상대 높게·4분기 상대 낮게 권장).
analysis 각 90자.
luckyMonths: 운기 강한 달 1~2개 (예: "3월", "9월").`,

  opportunities: `■ S5 포착할 기회 5가지 · 올해

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${SCORE_CITATION_RULE}

출력 스키마:
{ "opportunities": [{ "title": "string", "body": "string", "tip": "string" }] }

{{narrative}}

정확히 5개 (직업/재물/인맥/건강/자기계발). tip에 "잡는 법:" 금지. 시기 명시.`,

  risks: `■ S6 예측 리스크 4가지 · 올해

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}

출력 스키마:
{ "risks": [{ "title": "string", "body": "string", "countermeasure": "string" }] }

{{narrative}}

정확히 4개. countermeasure에 "대비책:" 금지.`,

  roadmap: `■ S7 시간 로드맵 · 월 구간

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${SCORE_CITATION_RULE}

출력 스키마:
{
  "roadmap": [{ "period": "string", "label": "string", "body": "string" }],
  "decisionMoments": [{ "situation": "string", "script": "string" }]
}

{{narrative}}

roadmap 6: 1~3월 / 4~6월 / 7~8월 / 9~10월 / 11~12월 / 대운 전체
decisionMoments 4. script 따옴표 없이 구어만.`,

  prophecy: `■ S8 잠겨진 천명 · 올해

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}

출력 스키마:
{
  "prophecy": { "short": "string", "full": "string" },
  "cohortInsight": { "body": "string" }
}

{{narrative}}

prophecy.short: 행운 요소 + 만트라 요약
prophecy.full: 미래 연도 2개 포함 조건부 예언 (120자). {{currentYear}} 이후만.
${COHORT_RULE}`,
};
