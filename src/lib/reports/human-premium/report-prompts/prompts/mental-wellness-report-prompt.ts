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
import { S3_SCORES_SCHEMA_EN } from "./annual-report-prompt";

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
prophecy.full: 대운 파장·감정 관리, 서로 다른 미래 시점 2개 분리 (120자).
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
- ★ Topic differentiation: reflect this mental topic in the score mix. Keep strongest ≥80, Crisis avoidance 50–72, average 72–82, but vary the mix. Avoid all-even endings or repeated number sets.
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

export const SLOTS_EN: ReportSlotPromptMap = {
  "saju-structure": `■ S2 Chart structure · mind & mental

${ENGLISH_ONLY_RULE}
${OUTPUT_FORMAT_RULES_EN}
${ELEMENT_DEFICIENCY_RULE_EN}

Output schema:
{ "sajuStructure": "string" }

About 600 characters. Natural paragraphs only. Dominant/deficient (lowest % only) · emotion · recovery patterns.
${CARE_STYLE_EN}`,

  "master-narrative": `■ S3 Core fortune indicators + narrative · mental

${ENGLISH_ONLY_RULE}
${OUTPUT_FORMAT_RULES_EN}
${ELEMENT_DEFICIENCY_RULE_EN}
${SCORE_CITATION_RULE_EN}

Output schema:
${S3_SCORES_SCHEMA_EN}

${S3_SCORE_RULES_BLOCK_EN}

scores description ~40 chars each, mental context:
Current fortune strength (emotional energy) / Timing fit (inner exploration) / Opportunity catch (intuition·empathy) /
Crisis avoidance (50–72, burnout) / Relationship luck (emotional connection) / Wealth flow (mind→material indirect)

narrative ~200 chars. No domain N/10 mentions.`,

  "deep-analysis": `■ S4 Deep analysis · Mental Detox

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

intro: mental lead-in only (80–100 chars).
sections exactly 4, fixed titles:
1) "Inner psyche type" — type name · strengths · comfortable settings (~120 chars)
2) "Stress patterns" — triggers · signals · recovery (~200 chars)
3) "Emotion management" — immediate/daily/crisis vows (no wrapping quotes) · recovery pace (~200 chars)
4) "Resolving interpersonal conflict" — pattern · 3-step resolution (~200 chars)`,

  opportunities: `■ S5 Five opportunities · mental

${ENGLISH_ONLY_RULE}
${OUTPUT_FORMAT_RULES_EN}
${JSON_OUTPUT_FORCE_RULE_EN}
${SCORE_CITATION_RULE_EN}

Output schema:
{ "opportunities": [{ "title": "string", "body": "string", "tip": "string" }] }

{{narrative}}

Exactly 5. Do not prefix tip with "How to catch:".`,

  risks: `■ S6 Four predicted risks · mental

${ENGLISH_ONLY_RULE}
${OUTPUT_FORMAT_RULES_EN}
${JSON_OUTPUT_FORCE_RULE_EN}

Output schema:
{ "risks": [{ "title": "string", "body": "string", "countermeasure": "string" }] }

{{narrative}}

Exactly 4. Do not prefix countermeasure with "Countermeasure:". Mind·body actions on both sides.`,

  roadmap: `■ S7 Time roadmap · six recovery stages

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

roadmap 6 items (year-span · recovery stages). decisionMoments 4. script = spoken only, without wrapping quotes.`,

  prophecy: `■ S8 Sealed prophecy · mental

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
prophecy.full: major-luck waves · emotion care; two distinct future moments separated (~120 chars).
${PROPHECY_TWO_MOMENTS_RULE_EN}
${COHORT_RULE_EN}`,
};
