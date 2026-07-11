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

/** No.10 · 올해의 인생 청사진 (yearly) */
export const FOCUS_KO =
  "올해의 인생 청사진 — 올해 로드맵과 분기별 행동을 세운·월운 안에서 설계한다. 올해 안에 실행 가능한 조언으로.";
export const FOCUS_EN =
  "This Year's Major-Luck Plan — design this year's roadmap and quarterly moves within annual luck. Advice must be executable this year.";

/** Injected 【리포트 특수 입력 · 연간 시제】 + tense / golden-month / prophecy year rules. */
const YEARLY_TENSE_RULES = `★ 시제·날짜 규칙 (입력의 【리포트 특수 입력 · 연간 시제】만 기준, 자체 계산 금지)
- 1~12월 전체를 다루되, 시기별 서술 시제를 구분한다:
  · 지나간 달: 회고형. "~하는 흐름이었습니다", "이런 일이 있었다면 그 기운의 발현입니다" 톤.
    행동 지시(~하십시오 / ~하세요 / tip·대비책의 실행 명령) 금지.
  · 현재 달이 포함된 시기: "지금 ~한 구간을 지나고 있습니다" 현재형.
  · 다가올 달(남은 달): 기존처럼 실행 지시형.
- 기회 tip('잡는 법'), 리스크 대비책, 로드맵 실행 지시, 결정의 순간 script는
  반드시 발행일 이후 날짜/기간으로만 작성.
- luckyMonths(황금의 달): 남은 달 목록에서만 1~2개 선정. 지나간 달·현재 달 금지.
- 올해 연도는 "올해"로만 지칭. 미래 시점처럼 "2026년" 등 연도 표기 금지.
- 잠겨진 천명 두 장면: 내년({{currentYear}}+1)과 내후년({{currentYear}}+2)만.`;

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
narrative 200자: 대운 맥락→올해 위치→전반/후반. 분기 N/10 언급 금지.
${YEARLY_TENSE_RULES}`,

  "deep-analysis": `■ S4 심층 분석 · 올해의 인생 청사진

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${JSON_OUTPUT_FORCE_RULE}
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
analysis 각 90자 — 해당 분기에 지나간/현재/남은 달이 섞이면 시제 규칙을 따를 것.
luckyMonths: 운기 강한 달 1~2개. ★ 남은 달에서만 (예: 남은 달이 8~12면 "9월","11월").
${YEARLY_TENSE_RULES}`,

  opportunities: `■ S5 포착할 기회 5가지 · 올해

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${JSON_OUTPUT_FORCE_RULE}
${SCORE_CITATION_RULE}

출력 스키마:
{ "opportunities": [{ "title": "string", "body": "string", "tip": "string" }] }

{{narrative}}

정확히 5개 (직업/재물/인맥/건강/자기계발). tip에 "잡는 법:" 금지.
body는 시기별 시제 규칙을 따르고, tip(잡는 법)은 발행일 이후 날짜/기간만.
${YEARLY_TENSE_RULES}`,

  risks: `■ S6 예측 리스크 4가지 · 올해

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${JSON_OUTPUT_FORCE_RULE}

출력 스키마:
{ "risks": [{ "title": "string", "body": "string", "countermeasure": "string" }] }

{{narrative}}

정확히 4개. countermeasure에 "대비책:" 금지.
지나간 리스크는 회고, 대비책은 발행일 이후만.
${YEARLY_TENSE_RULES}`,

  roadmap: `■ S7 시간 로드맵 · 월 구간

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

roadmap 6: 1~3월 / 4~6월 / 7~8월 / 9~10월 / 11~12월 / 대운 전체
— 지나간 구간은 회고형(행동 지시 금지), 현재 달 포함 구간은 현재형,
  남은 달 구간만 실행 지시형.
decisionMoments 4. script 따옴표 없이 구어만. ★ 발행일 이후 상황만.
${YEARLY_TENSE_RULES}`,

  prophecy: `■ S8 잠겨진 천명 · 올해

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
prophecy.full: 올해(연도 숫자 표기 금지) → 내년({{currentYear}}+1) → 내후년({{currentYear}}+2)
  두 장면의 조건부 예언 (120자).
${YEARLY_TENSE_RULES}
${COHORT_RULE}`,
};
