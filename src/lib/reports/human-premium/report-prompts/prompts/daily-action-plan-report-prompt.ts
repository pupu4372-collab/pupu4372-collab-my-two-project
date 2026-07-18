import {
  ENGLISH_ONLY_RULE,
  REPORT_PROMPT_SCORE_RULES,
  REPORT_PROMPT_SCORE_RULES_EN,
} from "../base-prompt";
import type { ReportSlotPromptMap } from "../prompt-definition";
import { S3_SCORES_SCHEMA_EN } from "./annual-report-prompt";

/** No.06 · 데일리 럭키 루틴 (daily) — S4 의도적 공백 / S7: 5시간대+대운 */
export const FOCUS_KO =
  "하루 × 행운 — 모든 시간 언급은 반드시 오늘 하루 또는 늦어도 이번 주 이내로 제한한다. 나이·연대·인생 전체 단위의 서술은 금지하며, 모든 조언은 오늘 당장 실행 가능한 구체적 행동이어야 한다. (예외: prophecy.full 잠겨진 천명만 올해·내년 계절 단위 2시점 허용)";
export const FOCUS_EN =
  "Day × Luck — every time reference must stay within today or, at the widest, this week. No age-based or lifetime-scale framing. Every piece of advice must be a concrete action executable today. (Exception: prophecy.full may use two year/season moments — this year and next year only.)";

const HANGUL_ONLY_RULE = `★ 한자 표기 예외 — 이 섹션은 base 규칙의 "한자 병기"를 따르지 않는다.
  십신·오행·간지를 언급할 때 한자(漢字)를 절대 쓰지 말고 한글로만
  표기할 것 (예: "재성(財星)" 대신 "재물운", "辰~午" 대신 "오전
  시간대", "일진(日辰)" 대신 "오늘의 기운"). 입력 데이터(pillarBlock,
  오늘 일진 등)에 한자가 포함되어 있어도, 그 한자를 그대로 출력에
  옮기지 말고 반드시 한글 표현으로 바꿔서 쓸 것.`;

export const SLOTS: ReportSlotPromptMap = {
  "saju-structure": `■ S2 사주 구조 해석 · 오늘 일진(日辰) × 원국

★ 일일 리포트: 오늘 일진과 원국의 충·합·형·파 분석 필수. "오늘은" 표현 자주 사용.

출력 스키마:
{ "sajuStructure": "string" }

총 600자 이내. sajuStructure 한 필드에 모두 담기.

[오행_우세]: 우세 오행 + 삶·오늘에 미치는 영향 (50자)
[오행_결핍]: 결핍 오행 + 보완 (50자)
[오행_해설]: 우세+결핍 핵심 과제·보완 (100자)

${REPORT_PROMPT_SCORE_RULES}

[십신_비견겁재]~[정인편인]: 각 50자, 오늘 일진과의 관계 포함

[명리_진단]: 오늘 일진 기준 원국 진단 — 강해지는 십신·주의점·오늘 에너지 방향 (200~250자, {{dayPillarLabel}}으로 시작)

★ 문체 규칙 — 위 base 【케어 지향 원칙】 적용 (ko/en 공통):
  십신·오행·간지 명칭을 출력에 노출하지 말고, 오늘 이 사람에게 실제로 어떤
  상황·감정·행동으로 나타나는지 일상 언어로 풀어 쓴 뒤, 마지막 문장은
  오늘~이번 주 실행 가능한 구체 행동으로 마무리할 것.
  나쁜 예: "상관(生각과 말로 승부를 보는 힘)이 강해져 표현력이 좋아집니다."
  좋은 예: "오늘은 하고 싶은 말이 술술 나오는 날이에요. 중요한 얘기는 한 번
  더 다듬고 꺼내시고, 대화 전 3초 숨을 고르시면 톤이 부드러워집니다."
  ★ en 출력 시: sajuStructure 본문 전체를 자연스러운 일상 영어로 작성할 것.
  로마자·명리 용어 나열 금지. 마지막은 구체 행동으로 끝낼 것.`,

  "master-narrative": `■ S3 핵심 운세 지표 + deep_narrative · 오늘 하루

${HANGUL_ONLY_RULE}

출력 스키마:
{
  "narrative": "string",
  "scores": [
    { "label": "현재운세강도", "score": number, "description": "string" },
    { "label": "시기적합도", "score": number, "description": "string" },
    { "label": "기회포착력", "score": number, "description": "string" },
    { "label": "위기회피력", "score": number, "description": "string" },
    { "label": "관계운", "score": number, "description": "string" },
    { "label": "재물흐름", "score": number, "description": "string" }
  ]
}

총 750자 이내. 오늘 일진 × 원국 기준.

[지표 6개] scores 배열에 위 label 이름 그대로, 각 score/100 + description 40자:
- 현재운세강도
- 시기적합도 (행동·정리·대기)
- 기회포착력
- 위기회피력 (50~72)
- 관계운
- 재물흐름

[심층서사]: narrative 필드에 지표 종합 오늘 서사 (250~300자)
  ※ {{dayPillarLabel}} 1회 + 일진×원국 + 에너지 집중 시간대 + 오늘 메모할 생각`,

  "deep-analysis": `■ S4 심층 분석 · 데일리 럭키 루틴 전용 (의도적 공백)

출력 스키마:
{ "deepAnalysis": "" }

★ 이 상품은 S4를 **반드시 빈 문자열**로만 출력합니다.
내용·문단·요약을 절대 채우지 마십시오. JSON은 위 스키마만 반환.`,

  opportunities: `■ S5 포착할 기회 5가지 · 오늘 당장 실행

${HANGUL_ONLY_RULE}

출력 스키마:
{ "opportunities": [{ "title": "string", "body": "string", "tip": "string" }] }

{{narrative}}

정확히 5개. title 10자 이내, body 오늘 사주 연결 (80자),
tip: **시간·장소·방법**을 담은 구체적 행동 지침 (100~120자).
★ "잡는 법:" 같은 라벨을 tip 문자열 안에 포함하지 말 것 — UI가
이미 라벨을 붙이므로 본문 내용만 작성.`,

  risks: `■ S6 예측 리스크 4가지 + 대비책 · 오늘 하루

${HANGUL_ONLY_RULE}

출력 스키마:
{ "risks": [{ "title": "string", "body": "string", "countermeasure": "string" }] }

{{narrative}}

정확히 4개. title 10자 이내, body 사주 근거 (80자),
countermeasure: 오늘 바로 적용할 구체적 행동 (100~120자).
★ "대비책:" 같은 라벨을 countermeasure 문자열 안에 포함하지 말 것 —
UI가 이미 라벨을 붙이므로 본문 내용만 작성.`,

  roadmap: `■ S7 시간 로드맵 + 결정 스크립트 · 3시간×6+오늘 한 줄

${HANGUL_ONLY_RULE}

출력 스키마:
{
  "roadmap": [{ "period": "string", "label": "string", "body": "string" }],
  "decisionMoments": [{ "situation": "string", "script": "string" }]
}

{{narrative}}

★ 금지: period에 나이·연대(OO~OO세)·대운·평생 구간 사용 금지. 반드시 오늘 시각대(OO~OO시)만.
roadmap 정확히 7항목 (더도 덜도 말고 반드시 7개 — 이보다 세분화하거나
통합하는 것 금지. 시간대 배당 근거):
★ 각 항목의 body는 100~130자, 반드시 2문장 구조로 작성:
  1문장 — 오늘의 기운·원국과 이 시간대가 왜 연결되는지 명리적 근거
    (해당 시간대의 오행·십신이 오늘 원국과 어떻게 공명하는지 구체적으로)
  2문장 — 그 근거를 바탕으로 한 구체적 행동 지침 (무엇을·어떻게)
  ※ 근거 없이 행동 지침만 나열하는 것 금지. 반드시 "왜 이 시간에
    이 행동이 유리한지"가 오늘의 사주 데이터에 근거해서 드러나야 함
★ 아래 7개 항목 외에 새로운 시간대를 만들거나, 하나의 시간대를
  둘 이상으로 쪼개는 것(예: "07~09시"와 "09~13시"를 따로 만드는 것)
  절대 금지. 반드시 아래 시간 범위 그대로 사용할 것.

- 07~10시: 아침·시작
- 10~13시: 오전 마무리
- 13~16시: 오후 실행
- 16~19시: 오후 마무리
- 19~22시: 저녁·관계
- 22~01시: 밤·정리
- 오늘 한 줄 정렬(시간대 아님, period 필드는 "오늘 한 줄"로 표기):
  100~130자, 2문장 구조 동일 적용. 오늘 하루를 관통하는 핵심 하나로
  마무리 (★ 대명제가 "하루" 단위이므로, 대운을 언급하더라도 반드시
  "오늘"과의 연결로 귀결시킬 것 — 대운 자체를 장기 서술로 확장 금지)

★ 01~07시(새벽) 구간은 절대 만들지 말 것.

decisionMoments 4항목 (script 큰따옴표 대사, 100자):
- 협상 망설임 / 가족 서운함 / 지출·투자 흔들림 / 업무 과다 막막함
★ 문체 규칙 — 실제 입으로 말하듯 구어체로 쓸 것:
  - "~습니다/합니다" 격식체·문어체 금지. "~요/~할게/~할래" 등
    실제 대화에서 쓰는 말투로 작성 (혼잣말이면 편한 반말·다짐체,
    상대에게 하는 말이면 부드러운 존댓말체 — 상황에 맞게 선택)
  - 한 문장이 너무 길거나 접속사로 딱딱하게 이어지지 않도록,
    실제 사람이 말하듯 짧게 끊어서 쓸 것
  - 사주 용어(재물운·오늘의 기운 등)를 쓰더라도, 그 용어가 문장의 주어가
    되지 않게 하고 자연스럽게 녹여서 말할 것
  나쁜 예 (문어체): "오늘 재물운 압력이 강한 날임을
  알고 있습니다. 강한 날일수록 원칙이 먼저입니다."
  좋은 예 (구어체): "오늘 돈 관련해서 유혹이 좀 셀 수 있는 날이야.
  그럴수록 정해둔 기준부터 지키자. 한도 넘는 건 내일 다시 볼게."
  ★ en 출력 시: 격식체("I have already established my criteria")가
  아니라 실제 구어 영어("I already know where I stand on this,
  so let's not overthink it")로 쓸 것.

결정프레임 Q1~Q3는 roadmap 마지막 body:
- 재정·자산 판단 / 말·관계·상관 / 우선순위·시급성`,

  prophecy: `■ S8 잠겨진 천명 · 행운 키워드 카드

${HANGUL_ONLY_RULE}
★ 위 한자 표기 예외는 prophecy.short, prophecy.full, cohortInsight.body
  출력 필드 전체에 동일하게 적용한다.

출력 스키마:
{
  "prophecy": { "short": "string", "full": "string" },
  "cohortInsight": { "body": "string" }
}

★ 필수: prophecy(short, full), cohortInsight(body) 세 필드 모두
  반드시 채워서 반환할 것. cohortInsight.body를 비워두거나
  필드 자체를 생략하는 것은 허용되지 않는 오류로 간주된다.
  답변을 마치기 전, 세 필드가 모두 비어있지 않은지 스스로 점검할 것.

{{narrative}}

prophecy.short: 반드시 아래 고정값을 그대로 (창작 금지):
{{luckyKeywordsShort}}
prophecy.full: 잠겨진 천명 — ★ 아래 규칙 모두 필수
  - 현재 연도는 {{currentYear}}년임. 언급하는 모든 미래 시점은 반드시
    {{currentYear}}년 이후여야 하며, 생년·대운 시작연도 등 과거 시점을
    미래 예언으로 착각해서 쓰지 말 것
  - ★ 시점은 반드시 "구체적인 두 시점"으로 분리해서 쓸 것.
    하나의 범위(예: "2027년~2031년")로 뭉뚱그리는 것 금지.
    형식: "[시점1: 올해 내 특정 계절/월]... 그리고
    [시점2: 내년 내 특정 계절/월]..."
    ★ 시점 표기는 "올해"/"내년" + 계절·월만 쓰고, "2026년"·"2027년" 식
      연도 숫자는 쓰지 말 것 (내부 기준 연도는 {{currentYear}}).
  - ★ 각 시점마다 "무슨 일이 일어나는지" 구체적인 사건 유형을 반드시 명시할 것.
    아래 카테고리 중 최소 1개 이상을 골라 사용:
    (제안·연락, 문서·계약, 사람과의 만남, 작은 수입·기회, 이사·이직 관련 소식)
    추상적 비유("장면이 바뀐다", "물길이 열린다" 등)만 쓰고 구체적 사건을
    전혀 언급하지 않는 것 금지 — 비유를 쓰더라도 그 비유가 가리키는
    구체적 사건 유형을 함께 명시해야 함
  - 오늘 정리·기록·대화한 내용이 그 구체적 사건과 어떻게 연결되는지
    인과관계를 분명히 서술
  - 100~120자
  예시(형식 참고용, 실제 내용은 입력 데이터 기준으로 생성):
  "[시점1] 계절, 오늘 정리해둔 [구체적 대상] 하나가 예상치 못한 [제안/연락]과
  연결됩니다. 그리고 [시점2] 무렵, [구체적 사건]이 새로운 흐름의 계기가 됩니다."
  ★ 문체 규칙 — 사주 용어 나열 금지, 현실 시나리오로 전달 (ko/en 공통):
    prophecy.full 본문에서 "서쪽·금 기운 방향에서 오는 기회", "이 일주의 다음 장면"
    같은 사주 전문용어·간지 표기를 문장에 그대로 노출하지 말 것. 대신 그것이
    현실에서 어떤 형태로 나타날지(제안·연락·문서·사람과의 만남 등)를
    구어체로, 마치 친구에게 조언해주듯 서술할 것.
    나쁜 예: "2027년~2031년 사이, 서쪽·금 기운 방향에서 오는 기회가
    이 일주의 다음 장면을 바꾸는 계기가 됩니다."
    좋은 예: "[발행일 기준 2~4개월 뒤의 계절 표현], 예전에 정리해둔 서류나
    미뤄뒀던 일 하나가 갑자기 연락이나 제안으로 이어질 수 있어요. 그러니
    지금 정리해둔 거 괜히 지우지 말고 잘 챙겨두세요. 그리고 [첫 시점에서
    다시 4~6개월 뒤의 계절 표현], 가볍게 나눈 대화 하나가 생각보다 큰
    흐름으로 이어질 수 있으니 사람 만나는 자리 피하지 마세요."
    ★ 예시의 대괄호 부분은 자리표시자다. 실제 출력에서는 입력의 발행일을
      기준으로 계절/시기를 직접 산출해 자연스러운 한국어 표현으로 쓸 것
      (예: 발행일이 7월이면 "올가을", 12월이면 "내년 봄"). 대괄호 문자열을
      출력에 그대로 쓰지 말 것. 두 시점은 서로 다른 시기여야 하며 모두
      발행일 이후여야 한다.
    ★ en 출력 시: prophecy.full을 자연스러운 영어 조언체로 작성할 것.
    오행·간지·로마자 명리 표기 없이, 위와 같은 현실 시나리오 톤을 유지할 것.
cohortInsight.body: 동일 명식 구조를 가진 사람들의 장기 패턴 통찰 2줄 (120자)
  - ★ 한자·십성·간지 명칭 금지 — 일상 언어로 구조를 설명 (예: "말과 재물 감각이 빠른 성향에 휴식이 부족하기 쉬운 구조")
  - 주어는 반드시 "[성향/구조]를 가진 사람들은" 형태로 명식 기준 서술
  - 시간 범위는 제한하지 않음 — 수십 년 단위 인생 패턴(예: 특정 연령대의 커리어 전환,
    재정 재정비 시기 등)을 경향으로 서술해도 됨
  - ★ 실측 통계처럼 단정하는 퍼센트 금지 ("~%로 나타납니다", "~%에 달합니다" 등)
  - 경향성만: "~하는 경향이 뚜렷합니다", "~한 경우가 많습니다"
  - 수치 비유는 '열에 일곱은' 수준 관용만 허용
  - ★ 금지: "이 상품/루틴/리포트를 선택한 독자·구매자·사용자" 등 상품 구매 행위를
    주어로 하는 자기지시적 표현 절대 금지 — 반드시 명식 구조가 주어여야 함
  예시: "말과 재물 감각이 빠르고 휴식 리듬이 짧아지기 쉬운 구조를 가진 사람들은,
  40대 중후반~50대 초반에 재정 구조를 재정비하며 두 번째 커리어를
  설계하는 경우가 많습니다. 이들 중 열에 일곱은 말·기술·전문성을 활용한 일에서
  가장 안정적인 수입원을 확보하는 경향을 보입니다."`,
};

/* —— EN path (daily). KO SLOTS above must stay byte-stable. —— */

const OUTPUT_FORMAT_RULES_EN = `★ Shared output format:
  - Do not put internal "[Label]:" / "[Label]" markers in prose — natural sentences and JSON fields only
  - No markdown (**bold**, # headers, backticks)
  - tip / countermeasure / script strings must not embed UI labels ("How to catch:", "Countermeasure:")
  - decisionMoments.script = spoken lines only, without wrapping quotes (the renderer adds them)`;

const JSON_OUTPUT_FORCE_RULE_EN = `★ Force machine-parseable JSON:
  - JSON only. No markdown fences (\`\`\`) or stray backticks
  - Each opportunity/risk item needs title / body / tip (or countermeasure)
  - opportunities: exactly 5; risks: exactly 4; roadmap: exactly 7; decisionMoments: exactly 4
  - Do not put raw double-quotes (") inside string values (breaks JSON)`;

const CARE_STYLE_EN = `★ Voice — care-oriented: end paragraphs with actionable next steps for today–this week.
  Explain chart jargon in plain English; do not dump bare ten-god jargon into the body.`;

const S3_SCORE_RULES_BLOCK_EN = `${REPORT_PROMPT_SCORE_RULES_EN}
- Score range: integers 50–90. Crisis avoidance only 50–72.
- Average of the other five indicators 72–82.
- scores.label must be exactly the six English names in the schema (spelling and spaces).
- ★ Topic differentiation: reflect today's day-luck topic in the score mix. Keep strongest ≥80, Crisis avoidance 50–72, average 72–82, but vary the mix.
- ★ description must match score rank (~40 chars each).`;

const COHORT_RULE_EN = `cohortInsight.body: two lines of chart-cohort insight (~120 chars)
  - Subject: "People with [trait/structure]…"
  - ★ No fake survey percentages ("appears in ~%", "reaches about N%")
  - Tendency language only ("tend to…", "often…", "relatively higher/lower")
  - Folklore "seven out of ten" is OK; integer percent lists are not
  - No self-reference to buyers/readers of this product`;

export const SLOTS_EN: ReportSlotPromptMap = {
  "saju-structure": `■ S2 Chart structure · today's day-luck × natal chart

${ENGLISH_ONLY_RULE}
${OUTPUT_FORMAT_RULES_EN}

★ Daily report: analyze today's day-luck vs natal clashes/combinations. Use "today" often.

Output schema:
{ "sajuStructure": "string" }

About 600 characters total in sajuStructure alone.
Cover dominant element + today's effect; deficient element + how to support; brief synthesis;
ten-god angles as they show up today; closing diagnosis starting with {{dayPillarLabel}}.
${CARE_STYLE_EN}
${REPORT_PROMPT_SCORE_RULES_EN}
Bad: "Shi-shen jargon dumps with bare romanization lists."
Good: "Words come easily today. Soften important messages — take three calm breaths before you speak."`,

  "master-narrative": `■ S3 Core fortune indicators + narrative · today

${ENGLISH_ONLY_RULE}
${OUTPUT_FORMAT_RULES_EN}

Output schema:
${S3_SCORES_SCHEMA_EN}

${S3_SCORE_RULES_BLOCK_EN}

Total ~750 characters. Today's day-luck × natal chart.
Use the six scores.label strings exactly (match content.ts DAILY_SCORE_LABELS_EN).
narrative ~250–300 chars: {{dayPillarLabel}} once + day-luck×natal + peak energy window + one thought to note today.
${CARE_STYLE_EN}`,

  "deep-analysis": `■ S4 Deep analysis · Daily Lucky Plan only (intentional blank)

${ENGLISH_ONLY_RULE}

Output schema:
{ "deepAnalysis": "" }

★ This product must return deepAnalysis as an empty string only.
Do not fill content, paragraphs, or summaries. Return only the schema above.`,

  opportunities: `■ S5 Five opportunities · executable today

${ENGLISH_ONLY_RULE}
${OUTPUT_FORMAT_RULES_EN}
${JSON_OUTPUT_FORCE_RULE_EN}

Output schema:
{ "opportunities": [{ "title": "string", "body": "string", "tip": "string" }] }

{{narrative}}

Exactly 5. title ≤ ~10 words, body ties to today's chart (~80 chars),
tip: concrete action with time · place · method (~100–120 chars).
Do not prefix tip with "How to catch:" — UI already labels it.`,

  risks: `■ S6 Four predicted risks + countermeasures · today

${ENGLISH_ONLY_RULE}
${OUTPUT_FORMAT_RULES_EN}
${JSON_OUTPUT_FORCE_RULE_EN}

Output schema:
{ "risks": [{ "title": "string", "body": "string", "countermeasure": "string" }] }

{{narrative}}

Exactly 4. title ≤ ~10 words, body chart-grounded (~80 chars),
countermeasure: concrete action for today (~100–120 chars).
Do not prefix countermeasure with "Countermeasure:" — UI already labels it.`,

  roadmap: `■ S7 Time roadmap + decision scripts · 3-hour blocks ×6 + today's one line

${ENGLISH_ONLY_RULE}
${OUTPUT_FORMAT_RULES_EN}
${JSON_OUTPUT_FORCE_RULE_EN}

Output schema:
{
  "roadmap": [{ "period": "string", "label": "string", "body": "string" }],
  "decisionMoments": [{ "situation": "string", "script": "string" }]
}

{{narrative}}

★ Forbidden: ages, decade bands, major-luck spans, or lifetime ranges in period.
  period must be today's clock windows only (HH~HH).
roadmap exactly 7 items (no more, no fewer — do not split or merge windows):
★ Each body ~100–130 chars, exactly two sentences:
  1) Why this window resonates with today's chart (plain English; no bare jargon dumps)
  2) Concrete action (what · how) grounded in that reason
  ※ Action-only lists without "why this hour" are forbidden.
★ Use these windows exactly — do not invent new ones or split (e.g. do not create both "07~09" and "09~13"):

- 07~10: morning · start
- 10~13: late morning wrap
- 13~16: afternoon execute
- 16~19: afternoon close
- 19~22: evening · relationships
- 22~01: night · tidy-up
- Today's one-line alignment (not a clock window; period must be exactly "Today's one line"):
  same 2-sentence structure; one through-line for the day
  (★ thesis is "one day" — if major luck is mentioned, tie it back to today only)

★ Never create a 01~07 (dawn) block.

decisionMoments: exactly 4 (script = spoken English, no wrapping quotes, ~100 chars):
- Hesitation in a negotiation / Family friction / Spending·investing wobble / Work overload fog
★ Spoken voice — not formal essay English:
  Prefer "I already know where I stand on this, so let's not overthink it"
  over "I have already established my criteria."
  Keep lines short; chart terms must not be the grammatical subject.
decision-frame Q1–Q3 live in the last roadmap body:
- money·assets / words·relationships / priority·urgency`,

  prophecy: `■ S8 Sealed prophecy · lucky-keyword card

${ENGLISH_ONLY_RULE}
${OUTPUT_FORMAT_RULES_EN}
${JSON_OUTPUT_FORCE_RULE_EN}

Output schema:
{
  "prophecy": { "short": "string", "full": "string" },
  "cohortInsight": { "body": "string" }
}

★ Required: prophecy.short, prophecy.full, and cohortInsight.body must all be non-empty.
  Omitting or blanking cohortInsight.body is an error. Self-check before finishing.

{{narrative}}

prophecy.short: must equal the fixed value below (no rewrite):
{{luckyKeywordsShort}}
prophecy.full: sealed destiny — all rules required
  - Current year is {{currentYear}}. Every future moment must be after {{currentYear}}; never mistake birth year or past daewoon starts for future prophecy
  - ★ Two concrete moments, separated — not one blob like "2027–2031"
    Format: "[moment1: a season/month within this year]… and [moment2: a season/month within next year]…"
    ★ Use "this year"/"next year" + season/month only — do not print digits like "2026" or "2027"
      (internal year anchor is {{currentYear}})
  - ★ Each moment must name a concrete event type (at least one of):
    offer·message / document·contract / meeting someone / small income·opportunity / move·job news
    Pure metaphor with no event type is forbidden
  - Show how today's tidy-up / notes / conversation connect to that event
  - ~100–120 chars
  ★ Plain advisory English — no bare element/stem/branch dumps; real-life scenario tone
    Derive natural season phrases from the issue date (e.g. July issue → "this fall"; December → "next spring").
    Both moments after issue date and distinct from each other.
${COHORT_RULE_EN}`,
};
