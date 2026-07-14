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

/** No.02 · 자산과 재테크 (wealth) */
export const FOCUS_KO =
  "자산과 재테크 — 자산 흐름과 재테크를 대운 단위로 설계한다. 수치·규칙이 있는 실행 조언으로.";
export const FOCUS_EN =
  "Assets & Wealth — design asset flow and wealth strategy across major-luck cycles with rule-based actions.";

export const SLOTS: ReportSlotPromptMap = {
  "saju-structure": `■ S2 사주 구조 해석 · 재물

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${ELEMENT_DEFICIENCY_RULE}

출력 스키마:
{ "sajuStructure": "string" }

총 600자. 자연 문단만. 우세/결핍(최저 %만)·재물 강약·현재→다음 대운.
${CARE_STYLE}`,

  "master-narrative": `■ S3 핵심 운세 지표 + narrative · 재물

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${ELEMENT_DEFICIENCY_RULE}
${SCORE_CITATION_RULE}

출력 스키마:
${S3_SCORES_SCHEMA}

${S3_SCORE_RULES_BLOCK}

scores description 각 40자, 재물 맥락:
현재운세강도 / 시기적합도(확장 vs 수성) / 기회포착력(투자·정보) /
위기회피력(50~72, 과도 베팅) / 관계운(관계 속 돈) / 재물흐름

narrative 200자: 대운별 재물 3단 서사. 영역 N/10 언급 금지.`,

  "deep-analysis": `■ S4 심층 분석 · 자산과 재테크

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${JSON_OUTPUT_FORCE_RULE}
${SCORE_CITATION_RULE}
${NUMERIC_RANGE_RULE}

출력 스키마:
{
  "intro": "string",
  "sections": [{ "title": "string", "body": "string" }]
}

{{narrative}}

intro: 재물 서두만 (80~100자).
sections 정확히 4개, title 고정:
1) "재물 3단 구조" — 정보→전략→자산화 공식 (80자)
2) "자산 유형별 전략" — 부동산·금융·부업·연금, 비중·기간은 범위형 (200자)
3) "대운별 재물 로드맵" — 현재~그다음 대운 (250자)
4) "재물 경보 원칙" — 규칙 3가지, 수치는 범위형 (100자)`,

  opportunities: `■ S5 포착할 기회 5가지 · 재물

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${JSON_OUTPUT_FORCE_RULE}
${SCORE_CITATION_RULE}
${NUMERIC_RANGE_RULE}

출력 스키마:
{ "opportunities": [{ "title": "string", "body": "string", "tip": "string" }] }

{{narrative}}

정확히 5개. tip에 "잡는 법:" 금지.`,

  risks: `■ S6 예측 리스크 4가지 · 재물

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${JSON_OUTPUT_FORCE_RULE}
${NUMERIC_RANGE_RULE}

출력 스키마:
{ "risks": [{ "title": "string", "body": "string", "countermeasure": "string" }] }

{{narrative}}

정확히 4개. countermeasure에 "대비책:" 금지. 비중·기간은 범위형.`,

  roadmap: `■ S7 시간 로드맵 · 대운 단위

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

roadmap 5~7항목 (과거 요약 1 + 현재·다음 세분 + 이후 요약).
decisionMoments 4. script 따옴표 없이 구어만.`,

  prophecy: `■ S8 잠겨진 천명 · 재물

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
prophecy.full: 현금흐름·버티는 힘, 서로 다른 미래 시점 2개 분리 (120자).
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
- ★ Topic differentiation: reflect this wealth topic in the score mix. Keep strongest ≥80, Crisis avoidance 50–72, average 72–82, but vary the mix. Avoid all-even endings or repeated number sets.
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
  "saju-structure": `■ S2 Chart structure · wealth

${ENGLISH_ONLY_RULE}
${OUTPUT_FORMAT_RULES_EN}
${ELEMENT_DEFICIENCY_RULE_EN}

Output schema:
{ "sajuStructure": "string" }

About 600 characters. Natural paragraphs only. Dominant/deficient (lowest % only) · wealth strengths/weaknesses · current→next major luck.
${CARE_STYLE_EN}`,

  "master-narrative": `■ S3 Core fortune indicators + narrative · wealth

${ENGLISH_ONLY_RULE}
${OUTPUT_FORMAT_RULES_EN}
${ELEMENT_DEFICIENCY_RULE_EN}
${SCORE_CITATION_RULE_EN}

Output schema:
${S3_SCORES_SCHEMA_EN}

${S3_SCORE_RULES_BLOCK_EN}

scores description ~40 chars each, wealth context:
Current fortune strength / Timing fit (expand vs conserve) / Opportunity catch (invest·info) /
Crisis avoidance (50–72, over-betting) / Relationship luck (money inside relationships) / Wealth flow

narrative ~200 chars: three-act wealth story by major luck. No domain N/10 mentions.`,

  "deep-analysis": `■ S4 Deep analysis · Assets & Wealth

${ENGLISH_ONLY_RULE}
${OUTPUT_FORMAT_RULES_EN}
${JSON_OUTPUT_FORCE_RULE_EN}
${SCORE_CITATION_RULE_EN}
${NUMERIC_RANGE_RULE_EN}

Output schema:
{
  "intro": "string",
  "sections": [{ "title": "string", "body": "string" }]
}

{{narrative}}

intro: wealth lead-in only (80–100 chars).
sections exactly 4, fixed titles:
1) "Three-layer wealth structure" — info→strategy→asset formula (~80 chars)
2) "Strategy by asset type" — real estate·finance·side income·pension; weights·horizons as ranges (~200 chars)
3) "Wealth roadmap by major luck" — current~following major luck (~250 chars)
4) "Wealth warning principles" — 3 rules; numbers as ranges (~100 chars)`,

  opportunities: `■ S5 Five opportunities · wealth

${ENGLISH_ONLY_RULE}
${OUTPUT_FORMAT_RULES_EN}
${JSON_OUTPUT_FORCE_RULE_EN}
${SCORE_CITATION_RULE_EN}
${NUMERIC_RANGE_RULE_EN}

Output schema:
{ "opportunities": [{ "title": "string", "body": "string", "tip": "string" }] }

{{narrative}}

Exactly 5. Do not prefix tip with "How to catch:".`,

  risks: `■ S6 Four predicted risks · wealth

${ENGLISH_ONLY_RULE}
${OUTPUT_FORMAT_RULES_EN}
${JSON_OUTPUT_FORCE_RULE_EN}
${NUMERIC_RANGE_RULE_EN}

Output schema:
{ "risks": [{ "title": "string", "body": "string", "countermeasure": "string" }] }

{{narrative}}

Exactly 4. Do not prefix countermeasure with "Countermeasure:". Weights·horizons as ranges.`,

  roadmap: `■ S7 Time roadmap · major-luck units

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

roadmap 5–7 items (past summary 1 + current·next splits + later summary).
decisionMoments 4. script = spoken only, without wrapping quotes.`,

  prophecy: `■ S8 Sealed prophecy · wealth

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
prophecy.full: cash flow · staying power; two distinct future moments separated (~120 chars).
${PROPHECY_TWO_MOMENTS_RULE_EN}
${COHORT_RULE_EN}`,
};
