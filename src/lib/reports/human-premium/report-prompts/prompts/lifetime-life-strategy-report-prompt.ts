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

/** No.12 · 인생의 마스터플랜 (lifetime) */
export const FOCUS_KO =
  "인생의 마스터플랜 — 평생 대운·천명·생애 설계를 묵직하고 철학적으로 다룬다. pillarBlock 전체 대운을 빠짐없이 참조한다.";
export const FOCUS_EN =
  "Life Master Plan — lifetime major luck, destiny, and life design in a grounded philosophical tone. Cover every major-luck cycle in the input.";

export const SLOTS: ReportSlotPromptMap = {
  "saju-structure": `■ S2 사주 구조 해석 · 평생

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${ELEMENT_DEFICIENCY_RULE}

★ 톤: 묵직·철학적. pillarBlock 전체 대운 목록 참조.

출력 스키마:
{ "sajuStructure": "string" }

총 600자. 자연 문단만. 우세/결핍(최저 %만)·전반부 vs 후반부.
${CARE_STYLE}`,

  "master-narrative": `■ S3 핵심 운세 지표 + narrative · 평생

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${ELEMENT_DEFICIENCY_RULE}
${SCORE_CITATION_RULE}

출력 스키마:
${S3_SCORES_SCHEMA}

${S3_SCORE_RULES_BLOCK}

scores description 각 40자, 평생·현재 대운 맥락.
narrative 250~300자: {{dayPillarLabel}} 1회 + 인생 곡선 + 지금 위치.
대운 사이클 목록·영역 점수를 narrative에 나열하지 말 것.`,

  "deep-analysis": `■ S4 대운별 생애 지도 · 인생의 마스터플랜

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${SCORE_CITATION_RULE}

출력 스키마:
{
  "intro": "string",
  "cycles": [
    { "period": "string", "title": "string", "body": "string" }
  ],
  "sections": [
    { "title": "전환점 3", "body": "string" }
  ]
}

{{narrative}}

intro: 인생 전체 조망만 (120~150자, {{dayPillarLabel}}). cycles 몰아넣기 금지.
cycles: pillarBlock 전체 대운을 빠짐없이.
  period: 나이구간 (예: "28~37세"). title: 시대별칭 8~12자. 현재 대운 title에 "(현재)" 포함.
  body: 에너지·인생과제·핵심행동 (150자 내외).
sections: 1개 — title "전환점 3", body에 전환 3개(나이+근거) 각 60자 합산.`,

  opportunities: `■ S5 포착할 기회 5가지 · 평생

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${SCORE_CITATION_RULE}

출력 스키마:
{ "opportunities": [{ "title": "string", "body": "string", "tip": "string" }] }

{{narrative}}

정확히 5개. 평생 관점 + 현재 대운에서 잡을 이유. tip에 "잡는 법:" 금지.`,

  risks: `■ S6 예측 리스크 4가지 · 평생

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}

출력 스키마:
{ "risks": [{ "title": "string", "body": "string", "countermeasure": "string" }] }

{{narrative}}

정확히 4개. countermeasure에 "대비책:" 금지. 평생 습관·지금 시작 가능.`,

  roadmap: `■ S7 시간 로드맵 · 대운 3~4개

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${SCORE_CITATION_RULE}

출력 스키마:
{
  "roadmap": [{ "period": "string", "label": "string", "body": "string" }],
  "decisionMoments": [{ "situation": "string", "script": "string" }]
}

{{narrative}}

roadmap: 현재 대운 포함 향후 3~4개 (과거 제외). 현재는 "지금 당장" 관점.
decisionMoments 4 (평생 태도). script 따옴표 없이 구어·다짐체.`,

  prophecy: `■ S8 잠겨진 천명 · 평생

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}

출력 스키마:
{
  "prophecy": { "short": "string", "full": "string" },
  "cohortInsight": { "body": "string" }
}

{{narrative}}

prophecy.short: 평생 행운색·방향·시간·숫자 + 만트라(10~15자)
prophecy.full: 순서대로 — 만트라 / 인생 3대 질문 / 천명 선언("나 {{dayPillarLabel}}은/는") /
  잠겨진 천명(발행+5~15년 연도 2개 + 장면). 총 600~700자. {{currentYear}} 이후만.
${COHORT_RULE}`,
};
