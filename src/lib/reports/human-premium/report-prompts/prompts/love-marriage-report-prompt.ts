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
  NUMERIC_RANGE_RULE,
  OUTPUT_FORMAT_RULES,
  JSON_OUTPUT_FORCE_RULE,
  PROPHECY_TWO_MOMENTS_RULE,
  ROADMAP_DAEWOON_RULE,
  S3_SCORE_RULES_BLOCK,
  S3_SCORES_SCHEMA,
  SCORE_CITATION_RULE,
} from "../newgen-common";
import { S3_SCORES_SCHEMA_EN } from "./annual-report-prompt";

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
${JSON_OUTPUT_FORCE_RULE}
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
${JSON_OUTPUT_FORCE_RULE}
${SCORE_CITATION_RULE}

출력 스키마:
{ "opportunities": [{ "title": "string", "body": "string", "tip": "string" }] }

{{narrative}}

정확히 5개. tip에 "잡는 법:" 금지.`,

  risks: `■ S6 예측 리스크 4가지 · 연애·결혼

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${JSON_OUTPUT_FORCE_RULE}

출력 스키마:
{ "risks": [{ "title": "string", "body": "string", "countermeasure": "string" }] }

{{narrative}}

정확히 4개. countermeasure에 "대비책:" 금지.`,

  roadmap: `■ S7 시간 로드맵 · 대운+루틴 6단계

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

roadmap 6~7항목 (과거 요약 1 + ★현재·다음 5년 세분 + 이후).
decisionMoments 4 (배우자·가족). script 따옴표 없이 구어만.`,

  prophecy: `■ S8 잠겨진 천명 · 연애·결혼

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
prophecy.full: 관계·인연 장면, 서로 다른 미래 시점 2개 분리 (120자).
${PROPHECY_TWO_MOMENTS_RULE}
${COHORT_RULE}`,
};

/* —— EN path. KO SLOTS above must stay byte-stable. —— */

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
- ★ Topic differentiation: reflect this romance topic in the score mix. Keep strongest ≥80, Crisis avoidance 50–72, average 72–82, but vary the mix. Avoid all-even endings or repeated number sets.
- ★ description must match score rank: highest = most prominent/strong; lower = relatively needs support.
★ Relationship luck allowed in the 75–90 upper band (romance product). Crisis avoidance must stay 50–72.
  Wealth flow follows the common 50–90 range and average rules (no upper-band exception).`;

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

const NUMERIC_RANGE_RULE_EN = `★ Numeric consistency:
  - Prefer ranges (e.g. about 10–20%) over single-point percentages or spans
  - Future daewoon allocation advice must use ranges
  - Do not invent hard numbers that contradict earlier narrative or deep analysis`;

const ROADMAP_DAEWOON_RULE_EN = `★ period (block header) = only the sub-years that block's body covers:
  - Correct: "2030–2034 (next major-luck first half)", "2035–2039 (next major-luck second half)"
  - Forbidden: one 10-year period ("2030–2039") with body alone split into halves
  - Forbidden: duplicate period strings across different blocks
  - label: short sub-span name (first/second half · path so far, etc.)

★ Past summary (path so far):
  - If there is past before the current major luck, compress it into 1 leading roadmap block (do not split individual past daewoon)
  - Retrospective voice only ("those years shaped…"). No action commands
  - period e.g. "past–before current major luck" or a real past year cluster
  - Young charts (current is first/early second daewoon) may omit this block

★ Detail level:
  - ★Current major luck + ★next major luck only — each split into two 5-year blocks (first half / second half)
  - "Next major luck" = the single cycle immediately after current (input's ★next major-luck mark / engine span)
  - Later distant / past cycles stay as one 10-year block (do not 5-year-split like next)
  - Forbidden: writing the next cycle as one 10-year block like "2033–2042 (next major luck)"`;

export const SLOTS_EN: ReportSlotPromptMap = {
  "saju-structure": `■ S2 Chart structure · love & marriage

${ENGLISH_ONLY_RULE}
${OUTPUT_FORMAT_RULES_EN}
${ELEMENT_DEFICIENCY_RULE_EN}

Output schema:
{ "sajuStructure": "string" }

About 600 characters. Natural paragraphs only. Dominant/deficient (lowest % only) · relationship patterns · current major-luck reset.
${CARE_STYLE_EN}`,

  "master-narrative": `■ S3 Core fortune indicators + narrative · love & marriage

${ENGLISH_ONLY_RULE}
${OUTPUT_FORMAT_RULES_EN}
${ELEMENT_DEFICIENCY_RULE_EN}
${SCORE_CITATION_RULE_EN}

Output schema:
${S3_SCORES_SCHEMA_EN}

${S3_SCORE_RULES_BLOCK_EN}

scores description ~40 chars each, relationship context:
Current fortune strength / Timing fit (new vs existing) / Opportunity catch /
Crisis avoidance (50–72) / Relationship luck (75–90) / Wealth flow

narrative ~200 chars. No domain N/10 mentions.`,

  "deep-analysis": `■ S4 Deep analysis · Romance Signal

${ENGLISH_ONLY_RULE}
${OUTPUT_FORMAT_RULES_EN}
${JSON_OUTPUT_FORCE_RULE_EN}
${SCORE_CITATION_RULE_EN}

Output schema:
{
  "intro": "string",
  "sections": [{ "title": "string", "body": "string" }]
}

{{narrative}}

intro: relationship lead-in only (80–100 chars).
sections exactly 4, fixed titles:
1) "Love style" — strengths · complements · comfortable settings (~120 chars)
2) "Ideal partner type" — complementary traits · types to watch · activation windows (~120 chars)
3) "Relationship conflict patterns" — 2–3 recurring conflicts + resolution (~150 chars)
4) "Resetting the current relationship" — major-luck impact · speech shifts · 3 routines (~200 chars)`,

  opportunities: `■ S5 Five opportunities · love & marriage

${ENGLISH_ONLY_RULE}
${OUTPUT_FORMAT_RULES_EN}
${JSON_OUTPUT_FORCE_RULE_EN}
${SCORE_CITATION_RULE_EN}

Output schema:
{ "opportunities": [{ "title": "string", "body": "string", "tip": "string" }] }

{{narrative}}

Exactly 5. Do not prefix tip with "How to catch:".`,

  risks: `■ S6 Four predicted risks · love & marriage

${ENGLISH_ONLY_RULE}
${OUTPUT_FORMAT_RULES_EN}
${JSON_OUTPUT_FORCE_RULE_EN}

Output schema:
{ "risks": [{ "title": "string", "body": "string", "countermeasure": "string" }] }

{{narrative}}

Exactly 4. Do not prefix countermeasure with "Countermeasure:".`,

  roadmap: `■ S7 Time roadmap · major luck + 6 routine steps

${ENGLISH_ONLY_RULE}
${OUTPUT_FORMAT_RULES_EN}
${JSON_OUTPUT_FORCE_RULE_EN}
${SCORE_CITATION_RULE_EN}
${NUMERIC_RANGE_RULE_EN}
${ROADMAP_DAEWOON_RULE_EN}

Output schema:
{
  "roadmap": [{ "period": "string", "label": "string", "body": "string" }],
  "decisionMoments": [{ "situation": "string", "script": "string" }]
}

{{narrative}}

roadmap 6–7 items (past summary 1 + ★current·next 5-year splits + later).
decisionMoments 4 (partner·family). script = spoken only, without wrapping quotes.`,

  prophecy: `■ S8 Sealed prophecy · love & marriage

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
prophecy.full: relationship·bond scenes; two distinct future moments separated (~120 chars).
${PROPHECY_TWO_MOMENTS_RULE_EN}
${COHORT_RULE_EN}`,
};
