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

/** No.11 · 10년 인생 청사진 (decade) */
export const FOCUS_KO =
  "10년 인생 청사진 — 10년 대운 전략과 연도별 로드맵을 설계한다. 슬로건: 확장보다 정리, 전면전보다 선택과 집중.";
export const FOCUS_EN =
  "10-Year Life Blueprint — design a decade major-luck strategy and year-by-year roadmap. Prefer focus over expansion.";

const DECADE_TENSE_RULES = `★ 시제·날짜 규칙 (입력의 발행일·지금 지나고 있는 해 기준, 자체 계산 금지)
- 현재 연도(=지금 지나고 있는 해): 현재형. "지금 ~한 해를 지나고 있습니다" 톤.
- 다가올 해: 실행 지시형.
- 기회 tip·리스크 대비책·로드맵 실행 지시·결정의 순간은 발행일 이후 날짜/기간만.
- yearCards·roadmap의 첫 해(현재 연도)에 과거형 회고나 이미 지난 달의 행동 지시 금지.`;

export const SLOTS: ReportSlotPromptMap = {
  "saju-structure": `■ S2 사주 구조 해석 · 10년

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${ELEMENT_DEFICIENCY_RULE}

★ 연도 명시 필수. pillarBlock·decade_sewun_list 참조.

출력 스키마:
{ "sajuStructure": "string" }

총 600자. 자연 문단만. 우세/결핍(최저 %만)·현재 대운 10년 전반/후반.
${CARE_STYLE}`,

  "master-narrative": `■ S3 핵심 운세 지표 + narrative · 10년

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${ELEMENT_DEFICIENCY_RULE}
${SCORE_CITATION_RULE}

출력 스키마:
${S3_SCORES_SCHEMA}

${S3_SCORE_RULES_BLOCK}

scores description 각 40자. 재물흐름에 재성 강화 연도 언급 가능.
narrative 200자: 10년 4구간 흐름. 연도 카드 점수 나열 금지.
${DECADE_TENSE_RULES}`,

  "deep-analysis": `■ S4 심층 분석 · 10년 인생 청사진

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${SCORE_CITATION_RULE}

출력 스키마:
{
  "intro": "string",
  "yearCards": [
    { "year": "string", "score": number, "summary": "string" }
  ],
  "sections": [
    { "title": "주요 전환점", "body": "string" }
  ]
}

{{narrative}}

intro: 10년 성격 + "확장보다 정리" (100자). yearCards 몰아넣기 금지.
yearCards: 발행 연도 기준 정확히 10개.
  year: "YYYY" 또는 "YYYY년". score: 65~88 정수(/100). summary: 50자, 세운·과제.
  ★ 첫 해(현재 연도) summary는 현재형, 이후 해는 미래·실행형.
sections: 1개 — title "주요 전환점", body에 전환 3개(연도범위+과제) 150자.
${DECADE_TENSE_RULES}`,

  opportunities: `■ S5 포착할 기회 5가지 · 10년

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${JSON_OUTPUT_FORCE_RULE}
${SCORE_CITATION_RULE}

출력 스키마:
{ "opportunities": [{ "title": "string", "body": "string", "tip": "string" }] }

{{narrative}}

정확히 5개. title에 연도 범위. tip에 "잡는 법:" 금지. 연도 언급 2회 이상.
tip는 발행일 이후만.
${DECADE_TENSE_RULES}`,

  risks: `■ S6 예측 리스크 4가지 · 10년

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${JSON_OUTPUT_FORCE_RULE}

출력 스키마:
{ "risks": [{ "title": "string", "body": "string", "countermeasure": "string" }] }

{{narrative}}

정확히 4개. countermeasure에 "대비책:" 금지. 연도 명시.
대비책은 발행일 이후만.
${DECADE_TENSE_RULES}`,

  roadmap: `■ S7 시간 로드맵 · 연·세운 7단계

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

roadmap 7항목 (연도·세운, 대운 단위 아님).
현재 연도 구간은 현재형, 이후는 실행 지시형. 행동 지시는 발행일 이후만.
decisionMoments 4. script 따옴표 없이 구어만.
${DECADE_TENSE_RULES}`,

  prophecy: `■ S8 잠겨진 천명 · 10년

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
prophecy.full: 미래 연도 2개 + 각 구체 장면 (120자). {{currentYear}} 이후만.
${DECADE_TENSE_RULES}
${COHORT_RULE}`,
};
