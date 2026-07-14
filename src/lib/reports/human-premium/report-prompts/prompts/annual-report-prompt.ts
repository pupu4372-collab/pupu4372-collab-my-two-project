import type { ReportSlotPromptMap } from "../prompt-definition";
import {
  ENGLISH_ONLY_RULE,
  REPORT_PROMPT_SCORE_RULES_EN,
} from "../base-prompt";
import {
  CARE_STYLE,
  COHORT_RULE,
  ELEMENT_DEFICIENCY_RULE,
  HANGUL_ONLY_RULE,
  OUTPUT_FORMAT_RULES,
  JSON_OUTPUT_FORCE_RULE,
  PROPHECY_TWO_MOMENTS_RULE,
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
- 올해 연도는 "올해"로만 지칭. "2026년" 등 연도 숫자 표기 금지.
- 잠겨진 천명: 시점 개수·발행 이후 제약은 PROPHECY_TWO_MOMENTS_RULE에 위임.
  이 상품에서는 두 장면을 내년·내후년만 사용(올해 장면 금지).
  표기는 "내년"/"내후년" 또는 나이로 하고, "2027년" 식 연도 숫자는 쓰지 말 것.`;

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
prophecy.full: 올해 흐름을 잇는 조건부 예언, 서로 다른 미래 시점 2개 분리 (120자).
${PROPHECY_TWO_MOMENTS_RULE}
${YEARLY_TENSE_RULES}
${COHORT_RULE}`,
};

/* —— EN path (yearly only). KO SLOTS above must stay byte-stable. —— */

/** Match content.ts DAILY_SCORE_LABELS_EN order/spelling. */
export const S3_SCORES_SCHEMA_EN = `{
  "narrative": "string",
  "scores": [
    { "label": "Current fortune strength", "score": number, "description": "string" },
    { "label": "Timing fit", "score": number, "description": "string" },
    { "label": "Opportunity catch", "score": number, "description": "string" },
    { "label": "Crisis avoidance", "score": number, "description": "string" },
    { "label": "Relationship luck", "score": number, "description": "string" },
    { "label": "Wealth flow", "score": number, "description": "string" }
  ]
}`;

const OUTPUT_FORMAT_RULES_EN = `★ Shared output format:
  - Do not put internal "[Label]:" / "[Label]" markers in prose — natural sentences and JSON fields only
  - No markdown (**bold**, # headers, backticks)
  - tip / countermeasure / script strings must not embed UI labels ("How to catch:", "Countermeasure:")
  - decisionMoments.script = spoken lines only, without wrapping quotes (the renderer adds them)`;

const JSON_OUTPUT_FORCE_RULE_EN = `★ Force machine-parseable JSON:
  - JSON only. No markdown fences (\`\`\`) or stray backticks
  - Each item needs title / body / tip (or countermeasure)
  - opportunities: exactly 5; risks: exactly 4
  - Do not put raw double-quotes (") inside string values (breaks JSON)`;

const ELEMENT_DEFICIENCY_RULE_EN = `★ Element consistency:
  Follow pillarBlock element distribution (%) and the lowest-% deficient element.
  When naming a shortage, point only at the lowest-% element.`;

const SCORE_CITATION_RULE_EN = `★ Score citation consistency:
  Later sections that cite S3 scores must reuse the exact label strings and numbers from scores[].
  Do not invent alternate labels or numbers.`;

const CARE_STYLE_EN = `★ Voice — care-oriented: end paragraphs with actionable next steps.
  Explain chart jargon in plain English; do not dump bare ten-god jargon into the body.`;

const S3_SCORE_RULES_BLOCK_EN = `${REPORT_PROMPT_SCORE_RULES_EN}
- Score range: integers 50–90. Crisis avoidance only 50–72.
- Average of the other five indicators 72–82.
- Do not put domain scores (N points, N/10, quarter scores) in narrative — those belong in S4.
- scores.label must be exactly the six English names above (spelling and spaces).
- ★ Topic differentiation: reflect this yearly topic in the score mix. Keep strongest ≥80, Crisis avoidance 50–72, average 72–82, but vary the mix. Avoid all-even endings or repeated number sets.
- ★ description must match score rank: highest = most prominent/strong; lower = relatively needs support.`;

const PROPHECY_TWO_MOMENTS_RULE_EN = `★ prophecy.full — two moments required:
  - Two distinct future moments (concrete year or age) + separate scene for each
  - Forbidden: a single moment or one blob like "after age OO"
  - Moments only after {{currentYear}}`;

const COHORT_RULE_EN = `cohortInsight.body: two lines of chart-cohort insight (~120 chars)
  - Subject: "People with [trait/structure]…"
  - ★ No fake survey percentages ("appears in ~%", "reaches about N%")
  - Tendency language only ("tend to…", "often…", "relatively higher/lower")
  - Folklore "seven out of ten" is OK; integer percent lists are not
  - No self-reference to buyers/readers of this product`;

const YEARLY_TENSE_RULES_EN = `★ Tense / date rules (use only 【Report-specific input · yearly tense】 — do not self-compute)
- Cover months 1–12, but tense must match period:
  · Past months: retrospective ("that stretch felt like…"). No action commands in tips/countermeasures.
  · Period containing the current month: present ("you are in…").
  · Upcoming (remaining) months: action-oriented as before.
- Opportunity tips, risk countermeasures, roadmap actions, and decisionMoments.script must use dates/periods on or after the issue date only.
- luckyMonths: pick 1–2 from the remaining-month list only. Not past or current month.
- Refer to this calendar year as "this year" — do not print "2026" style year digits for this year.
- Sealed prophecy moments: only next year and the year after (no scene set in this year).
  Prefer "next year" / "the year after" or age; do not print raw calendar digits like "2027".`;

export const SLOTS_EN: ReportSlotPromptMap = {
  "saju-structure": `■ S2 Chart structure · this year

${ENGLISH_ONLY_RULE}
${OUTPUT_FORMAT_RULES_EN}
${ELEMENT_DEFICIENCY_RULE_EN}

Output schema:
{ "sajuStructure": "string" }

About 600 characters. Natural paragraphs only. Dominant/deficient (lowest % only), daewoon, yearly luck, this-year strategy.
${CARE_STYLE_EN}`,

  "master-narrative": `■ S3 Core fortune indicators + narrative · this year

${ENGLISH_ONLY_RULE}
${OUTPUT_FORMAT_RULES_EN}
${ELEMENT_DEFICIENCY_RULE_EN}
${SCORE_CITATION_RULE_EN}

Output schema:
${S3_SCORES_SCHEMA_EN}

${S3_SCORE_RULES_BLOCK_EN}

Use the six scores.label strings exactly. description ~40 chars each.
narrative ~200 chars: daewoon context → this year's position → first/second half. No quarter N/10 mentions.
${YEARLY_TENSE_RULES_EN}`,

  "deep-analysis": `■ S4 Deep analysis · This Year's Major-Luck Plan

${ENGLISH_ONLY_RULE}
${OUTPUT_FORMAT_RULES_EN}
${JSON_OUTPUT_FORCE_RULE_EN}
${SCORE_CITATION_RULE_EN}

Output schema:
{
  "intro": "string",
  "domains": [
    { "domain": "Q1", "score": number, "analysis": "string" },
    { "domain": "Q2", "score": number, "analysis": "string" },
    { "domain": "Q3", "score": number, "analysis": "string" },
    { "domain": "Q4", "score": number, "analysis": "string" }
  ],
  "luckyMonths": ["string", "string"]
}

{{narrative}}

intro: this year's core setup only (~100 chars). Do not dump quarter scores or golden months here.
domains: exactly 4. domain names exactly as above. score integers on a /10 scale (6–9; Q2 relatively higher, Q4 relatively lower preferred).
analysis ~90 chars each — if a quarter mixes past/current/remaining months, follow tense rules.
luckyMonths: 1–2 strong months from remaining months only (e.g. if remaining are Aug–Dec → "September","November").
${YEARLY_TENSE_RULES_EN}`,

  opportunities: `■ S5 Five opportunities · this year

${ENGLISH_ONLY_RULE}
${OUTPUT_FORMAT_RULES_EN}
${JSON_OUTPUT_FORCE_RULE_EN}
${SCORE_CITATION_RULE_EN}

Output schema:
{ "opportunities": [{ "title": "string", "body": "string", "tip": "string" }] }

{{narrative}}

Exactly 5 (career / wealth / network / health / self-growth). Do not prefix tip with "How to catch:".
body follows period tense rules; tip dates/periods must be on/after issue date.
${YEARLY_TENSE_RULES_EN}`,

  risks: `■ S6 Four predicted risks · this year

${ENGLISH_ONLY_RULE}
${OUTPUT_FORMAT_RULES_EN}
${JSON_OUTPUT_FORCE_RULE_EN}

Output schema:
{ "risks": [{ "title": "string", "body": "string", "countermeasure": "string" }] }

{{narrative}}

Exactly 4. Do not prefix countermeasure with "Countermeasure:".
Past risks = retrospective; countermeasures only for on/after issue date.
${YEARLY_TENSE_RULES_EN}`,

  roadmap: `■ S7 Time roadmap · month blocks

${ENGLISH_ONLY_RULE}
${OUTPUT_FORMAT_RULES_EN}
${JSON_OUTPUT_FORCE_RULE_EN}
${SCORE_CITATION_RULE_EN}

Output schema:
{
  "roadmap": [{ "period": "string", "label": "string", "body": "string" }],
  "decisionMoments": [{ "situation": "string", "script": "string" }]
}

{{narrative}}

roadmap 6: Jan–Mar / Apr–Jun / Jul–Aug / Sep–Oct / Nov–Dec / overall daewoon
— past blocks retrospective (no commands); current-month block present tense;
  remaining-month blocks action-oriented.
decisionMoments: 4. script = spoken English without wrapping quotes. ★ situations on/after issue date only.
${YEARLY_TENSE_RULES_EN}`,

  prophecy: `■ S8 Sealed prophecy · this year

${ENGLISH_ONLY_RULE}
${OUTPUT_FORMAT_RULES_EN}
${JSON_OUTPUT_FORCE_RULE_EN}

Output schema:
{
  "prophecy": { "short": "string", "full": "string" },
  "cohortInsight": { "body": "string" }
}

{{narrative}}

prophecy.short: must equal the fixed value below (no rewrite):
{{luckyKeywordsShort}}
prophecy.full: conditional prophecy continuing this year's arc; two separated future moments (~120 chars).
${PROPHECY_TWO_MOMENTS_RULE_EN}
${YEARLY_TENSE_RULES_EN}
${COHORT_RULE_EN}`,
};
