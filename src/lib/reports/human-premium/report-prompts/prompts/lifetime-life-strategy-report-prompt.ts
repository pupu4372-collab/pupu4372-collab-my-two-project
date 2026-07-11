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

/** No.12 · 인생의 마스터플랜 (lifetime) */
export const FOCUS_KO =
  "인생의 마스터플랜 — 평생 대운·천명·생애 설계를 묵직하고 철학적으로 다룬다. pillarBlock 전체 대운을 빠짐없이 참조한다.";
export const FOCUS_EN =
  "Life Master Plan — lifetime major luck, destiny, and life design in a grounded philosophical tone. Cover every major-luck cycle in the input.";

const LIFETIME_TENSE_RULES = `★ 시제·대운 규칙 (입력의 【리포트 특수 입력 · 평생 시제】만 기준, 자체 계산 금지)
- 지나간 대운: 회고체. "~한 시절이었습니다", "이런 경험이 있었다면 그 기운의 발현입니다" 톤.
  행동 지시(~하십시오 / tip·대비책의 실행 명령) 절대 금지.
- 현재 대운: 현재형 + 지금 할 행동 지시 허용 ("지금 ~하십시오").
- 이후 대운: 미래형. 단 "그 시기를 위해 지금 준비할 것" 형태의 현재 시점 지시는 허용.
- 기회 tip·리스크 대비책·로드맵의 직접 실행 지시는 현재 대운(또는 지금 준비)에만.
- 대운 전환 연도·나이: 입력에 적힌 나이구간·연도 환산만 사용 (예: 54세 → 출생연+54).
- prophecy.full의 잠겨진 천명 두 장면: 미래 연도만. 가능하면 이후 대운 전환 나이의 환산 연도를 쓸 것.`;

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
대운 사이클 목록·영역 점수를 narrative에 나열하지 말 것.
${LIFETIME_TENSE_RULES}`,

  "deep-analysis": `■ S4 대운별 생애 지도 · 인생의 마스터플랜

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${JSON_OUTPUT_FORCE_RULE}
${SCORE_CITATION_RULE}

출력 스키마:
{
  "intro": "string",
  "cycles": [
    { "period": "string", "title": "string", "body": "string" }
  ],
  "sections": [
    { "title": "전환점", "body": "string" }
  ]
}

{{narrative}}

intro: 인생 전체 조망만 (120~150자, {{dayPillarLabel}}). cycles 몰아넣기 금지.
cycles: pillarBlock 전체 대운을 빠짐없이.
  period: 나이구간 (예: "28~37세"). title: 시대별칭 8~12자.
  ★ title에 "현재"·"(현재)" 금지 — 시스템은 별도로 표시함.
  body: 에너지·인생과제·핵심행동 (150자 내외).
  ★ 지나간 대운 body = 회고만(행동 지시 금지) / 현재 = 현재형+지금 행동 /
    이후 = 미래형(+지금 준비 지시 허용).
sections: 1개 — title "전환점", body에 전환 3개(나이+근거) 각 60자 합산.
${LIFETIME_TENSE_RULES}`,

  opportunities: `■ S5 포착할 기회 5가지 · 평생

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${JSON_OUTPUT_FORCE_RULE}
${SCORE_CITATION_RULE}

출력 스키마:
{ "opportunities": [{ "title": "string", "body": "string", "tip": "string" }] }

{{narrative}}

정확히 5개. 평생 관점 + 현재 대운에서 잡을 이유. tip에 "잡는 법:" 금지.
tip는 지금(현재 대운) 실행 가능한 지시만.
${LIFETIME_TENSE_RULES}`,

  risks: `■ S6 예측 리스크 4가지 · 평생

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${JSON_OUTPUT_FORCE_RULE}

출력 스키마:
{ "risks": [{ "title": "string", "body": "string", "countermeasure": "string" }] }

{{narrative}}

정확히 4개. countermeasure에 "대비책:" 금지. 평생 습관·지금 시작 가능.
${LIFETIME_TENSE_RULES}`,

  roadmap: `■ S7 시간 로드맵 · 대운 3~4개

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

roadmap: 현재 대운 포함 향후 3~4개 (과거 제외). 현재는 "지금 당장" 관점.
decisionMoments 4 (평생 태도). script 따옴표 없이 구어·다짐체.
${LIFETIME_TENSE_RULES}`,

  prophecy: `■ S8 잠겨진 천명 · 평생

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
prophecy.full: 순서대로 — 만트라 / 인생 3대 질문 / 천명 선언("나 {{dayPillarLabel}}은/는") /
  잠겨진 천명(이후 대운 전환 나이의 환산 연도 2개 + 장면). 총 600~700자.
  ★ 연도는 입력의 나이→연도 환산만 사용. {{currentYear}} 이전 연도 금지.
${LIFETIME_TENSE_RULES}
${COHORT_RULE}`,
};
