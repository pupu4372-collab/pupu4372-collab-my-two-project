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

/** No.01 · 커리어 빌드업 (career) */
export const FOCUS_KO =
  "커리어 빌드업 — 직장·성장·성과의 방향을 대운 단위로 설계한다. 조언은 실행 가능한 포지셔닝·전환 행동으로.";
export const FOCUS_EN =
  "Career Build-up — design work, growth, and recognition across major-luck cycles with executable positioning moves.";

export const SLOTS: ReportSlotPromptMap = {
  "saju-structure": `■ S2 사주 구조 해석 · 커리어

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${ELEMENT_DEFICIENCY_RULE}

출력 스키마:
{ "sajuStructure": "string" }

총 600자. 자연 문단만 (내부 라벨 금지).
우세/결핍(최저 %만)·커리어 강약·현재→다음 대운 흐름을 일상어로.
${CARE_STYLE}`,

  "master-narrative": `■ S3 핵심 운세 지표 + narrative · 커리어

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${ELEMENT_DEFICIENCY_RULE}
${SCORE_CITATION_RULE}

출력 스키마:
${S3_SCORES_SCHEMA}

${S3_SCORE_RULES_BLOCK}

scores description 각 40자, 커리어 맥락:
현재운세강도(대운 커리어 에너지) / 시기적합도(전환·브랜딩) / 기회포착력(네트워크) /
위기회피력(50~72, 직설·관계 리스크) / 관계운(동료·파트너) / 재물흐름(꾸준 수입)

narrative 200자: 20대~현재 대운 커리어 + 이후 전환. 영역 N/10 언급 금지.`,

  "deep-analysis": `■ S4 심층 분석 · 커리어 빌드업

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${JSON_OUTPUT_FORCE_RULE}
${SCORE_CITATION_RULE}

출력 스키마:
{
  "intro": "string",
  "sections": [
    { "title": "string", "body": "string" }
  ]
}

{{narrative}}

intro: 커리어 서두만 (80~100자). 섹션 본문·점수 몰아넣기 금지.
sections 정확히 5개, title 고정:
1) "커리어 3단 진화" — 현장→중간→최종 + 근거 (80자)
2) "핵심 직무 적성" — 맞는 직무 3~5 + 맞지 않는 1 (150자)
3) "포지셔닝 전략" — 사내 전환→외부 브랜딩→개인 브랜드 (150자)
4) "대운별 커리어 로드맵" — 현재~다음 대운 (200자)
5) "커리어 리스크 원칙" — 직설 3단·결단 프레임 (80자)`,

  opportunities: `■ S5 포착할 기회 5가지 · 커리어

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${JSON_OUTPUT_FORCE_RULE}
${SCORE_CITATION_RULE}

출력 스키마:
{ "opportunities": [{ "title": "string", "body": "string", "tip": "string" }] }

{{narrative}}

정확히 5개. tip에 "잡는 법:" 금지. title 12자 이내, body·tip 각 80~120자.`,

  risks: `■ S6 예측 리스크 4가지 · 커리어

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${JSON_OUTPUT_FORCE_RULE}

출력 스키마:
{ "risks": [{ "title": "string", "body": "string", "countermeasure": "string" }] }

{{narrative}}

정확히 4개. countermeasure에 "대비책:" 금지.`,

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

roadmap 6~7항목 (과거 요약 1 + 현재·다음 5년 세분 + 이후).
decisionMoments 4: 협상 망설임 / 비효율 지적 / 이직·전환 / 투자·동업
script는 따옴표 없이 구어 대사만.`,

  prophecy: `■ S8 잠겨진 천명 · 커리어

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
prophecy.full: 커리어 2막·지식 자산, 서로 다른 미래 시점 2개 분리 (120자).
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
- ★ Topic differentiation: reflect this career topic in the score mix. Keep strongest ≥80, Crisis avoidance 50–72, average 72–82, but vary the mix. Avoid all-even endings or repeated number sets.
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
  "saju-structure": `■ S2 Chart structure · career

${ENGLISH_ONLY_RULE}
${OUTPUT_FORMAT_RULES_EN}
${ELEMENT_DEFICIENCY_RULE_EN}

Output schema:
{ "sajuStructure": "string" }

About 600 characters. Natural paragraphs only (no internal labels).
Dominant/deficient (lowest % only) · career strengths/weaknesses · current→next major-luck flow in plain English.
${CARE_STYLE_EN}`,

  "master-narrative": `■ S3 Core fortune indicators + narrative · career

${ENGLISH_ONLY_RULE}
${OUTPUT_FORMAT_RULES_EN}
${ELEMENT_DEFICIENCY_RULE_EN}
${SCORE_CITATION_RULE_EN}

Output schema:
${S3_SCORES_SCHEMA_EN}

${S3_SCORE_RULES_BLOCK_EN}

scores description ~40 chars each, career context:
Current fortune strength (major-luck career energy) / Timing fit (transition·branding) / Opportunity catch (network) /
Crisis avoidance (50–72, bluntness·relationship risk) / Relationship luck (colleagues·partners) / Wealth flow (steady income)

narrative ~200 chars: career from the 20s through current major luck + later turn. No domain N/10 mentions.`,

  "deep-analysis": `■ S4 Deep analysis · Career Build-up

${ENGLISH_ONLY_RULE}
${OUTPUT_FORMAT_RULES_EN}
${JSON_OUTPUT_FORCE_RULE_EN}
${SCORE_CITATION_RULE_EN}

Output schema:
{
  "intro": "string",
  "sections": [
    { "title": "string", "body": "string" }
  ]
}

{{narrative}}

intro: career lead-in only (80–100 chars). Do not dump section bodies or scores here.
sections exactly 5, fixed titles:
1) "Three-stage career evolution" — field→mid→final + basis (~80 chars)
2) "Core job fit" — 3–5 fitting roles + 1 mismatch (~150 chars)
3) "Positioning strategy" — internal move→external branding→personal brand (~150 chars)
4) "Career roadmap by major luck" — current~next major luck (~200 chars)
5) "Career risk principles" — three-step bluntness · decision frame (~80 chars)`,

  opportunities: `■ S5 Five opportunities · career

${ENGLISH_ONLY_RULE}
${OUTPUT_FORMAT_RULES_EN}
${JSON_OUTPUT_FORCE_RULE_EN}
${SCORE_CITATION_RULE_EN}

Output schema:
{ "opportunities": [{ "title": "string", "body": "string", "tip": "string" }] }

{{narrative}}

Exactly 5. Do not prefix tip with "How to catch:". title ≤12 chars, body·tip 80–120 chars each.`,

  risks: `■ S6 Four predicted risks · career

${ENGLISH_ONLY_RULE}
${OUTPUT_FORMAT_RULES_EN}
${JSON_OUTPUT_FORCE_RULE_EN}

Output schema:
{ "risks": [{ "title": "string", "body": "string", "countermeasure": "string" }] }

{{narrative}}

Exactly 4. Do not prefix countermeasure with "Countermeasure:".`,

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

roadmap 6–7 items (past summary 1 + current·next 5-year splits + later).
decisionMoments 4: negotiation hesitation / calling out inefficiency / job change·transition / investment·partnership
script = spoken lines only, without wrapping quotes.`,

  prophecy: `■ S8 Sealed prophecy · career

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
prophecy.full: career act two · knowledge assets; two distinct future moments separated (~120 chars).
${PROPHECY_TWO_MOMENTS_RULE_EN}
${COHORT_RULE_EN}`,
};
