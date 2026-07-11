import { REPORT_PROMPT_SCORE_RULES } from "../base-prompt";
import type { ReportSlotPromptMap } from "../prompt-definition";

/** No.09 · 월간 로드맵 (monthly) — S4: 4영역+행운의 날 / S7: 5일×6구간 */
export const FOCUS_KO =
  "월간 로드맵 — 모든 시간 언급은 반드시 이번 달(초·중·후반·날짜 구간) 안으로 제한한다. 나이·연대·평생 단위 서술은 금지하며, 조언은 이번 달 안에 실행 가능한 구체 행동이어야 한다.";
export const FOCUS_EN =
  "Monthly Roadmap — every time reference must stay within this month (early/mid/late or date bands). No age-based or lifetime-scale framing. Advice must be concrete actions executable this month.";

const HANGUL_ONLY_RULE = `★ 한자 표기 예외 — 이 섹션은 base 규칙의 "한자 병기"를 따르지 않는다.
  십신·오행·간지를 언급할 때 한자(漢字)를 절대 쓰지 말고 한글로만
  표기할 것 (예: "재성(財星)" 대신 "재물운", "辰~午" 대신 "해당 시간대",
  "월간지(月運)" 대신 "이번 달의 기운"). 입력 데이터(pillarBlock,
  월간지 등)에 한자가 포함되어 있어도, 그 한자를 그대로 출력에
  옮기지 말고 반드시 한글 표현으로 바꿔서 쓸 것.`;

const OUTPUT_FORMAT_RULES = `★ 출력 형식 공통:
  - "[라벨]:" / "[라벨]" 형태의 내부 라벨을 본문에 쓰지 말 것 — 자연 문장·JSON 필드만
  - 마크다운(**볼드**, # 헤더, 백틱) 사용 금지
  - tip·countermeasure·script 문자열 안에 UI 라벨("잡는 법:", "대비책:")을 넣지 말 것
  - decisionMoments.script는 따옴표 없이 대사 본문만 (렌더러가 감쌈)`;

const ELEMENT_DEFICIENCY_RULE = `★ 오행 정합성:
  pillarBlock의 "오행 분포(%)"와 "결핍 오행(최저 %)"를 반드시 따른다.
  결핍·부족을 말할 때는 가장 낮은 %의 오행만 지목한다.
  입력에 없는 오행을 결핍으로 창작하거나, 두 번째로 낮은 오행을 결핍처럼 쓰는 것 금지.`;

const SCORE_CITATION_RULE = `★ 지표 인용 정합성:
  이후 섹션에서 S3 점수를 언급할 때는 scores[]에 쓴 지표명·점수와
  동일한 것만 인용한다. 임의 수치·다른 지표명 창작 금지.`;

/** Monthly S3 label set (spaces) — distinct from daily compact labels. */
export const MONTHLY_SCORE_LABELS_KO = [
  "현재 운세 강도",
  "시기 적합도",
  "기회 포착력",
  "위기 회피력",
  "관계 운",
  "재물 흐름",
] as const;

export const MONTHLY_SCORE_LABELS_EN = [
  "Current fortune strength",
  "Timing fit",
  "Opportunity catch",
  "Crisis avoidance",
  "Relationship luck",
  "Wealth flow",
] as const;

export const SLOTS: ReportSlotPromptMap = {
  "saju-structure": `■ S2 사주 구조 해석 · 이번 달 월운 맥락

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${ELEMENT_DEFICIENCY_RULE}

★ pillarBlock·reportSpecificBlock의 이번 달 월간지·오행 %를 반드시 참조. "이번 달은" 표현 필수.

출력 스키마:
{ "sajuStructure": "string" }

총 600자 이내. sajuStructure 한 필드에 자연 문단으로만 담기 (내부 라벨 금지).

포함할 내용 (문단으로 풀어 쓰기):
- 우세 오행이 삶·이번 달에 미치는 영향
- 결핍 오행(최저 %만) + 이번 달 보완 방법
- 우세+결핍을 잇는 핵심 과제·보완 제안
- 이번 달 기운이 원국과 어떻게 맞물리는지 (일상어로)
- 이번 달 성격(리허설/실행/정비) + 운용 원칙 한 줄
  예: "관계는 보수적으로, 일과 돈은 공격적으로"

${REPORT_PROMPT_SCORE_RULES}

★ 문체 — 케어 지향: 설명 → 이번 달 실행 가능 행동으로 문단 마무리.
  십신·명리 전문용어를 본문에 그대로 노출하지 말고 풀어서 쓸 것.
  ★ en: 자연스러운 일상 영어. 로마자·명리 용어 나열 금지.`,

  "master-narrative": `■ S3 핵심 운세 지표 + deep_narrative · 이번 달

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${ELEMENT_DEFICIENCY_RULE}
${SCORE_CITATION_RULE}

출력 스키마:
{
  "narrative": "string",
  "scores": [
    { "label": "현재 운세 강도", "score": number, "description": "string" },
    { "label": "시기 적합도", "score": number, "description": "string" },
    { "label": "기회 포착력", "score": number, "description": "string" },
    { "label": "위기 회피력", "score": number, "description": "string" },
    { "label": "관계 운", "score": number, "description": "string" },
    { "label": "재물 흐름", "score": number, "description": "string" }
  ]
}

※ 필드 별칭 허용: name↔label, desc↔description (가능하면 label/description 사용)

총 750자 이내( narrative + scores description 합산 기준). 이번 달 월운 × 원국 기준.

[지표 6개] scores 배열에 위 label 이름 그대로(띄어쓰기 유지), 각 score/100 + description 40자:
- 현재 운세 강도 (대운·세운·월운 합산 감각)
- 시기 적합도 (행동·정리·대기)
- 기회 포착력
- 위기 회피력 (50~72)
- 관계 운
- 재물 흐름

점수 규칙: 50~90 정수, 6종 평균 72~82, 위기 회피력만 50~72로 상대적 낮게.
가장 강한 항목 ≥80, 가장 약한 항목 ≤55 권장.

[심층서사]: narrative 필드 (250~300자)
  ※ {{dayPillarLabel}} 1회 + 이번 달 핵심 작동을 일상어로
  ※ 대운 안에서 이달 위치(리허설·수확 준비 등) — 전문용어 나열 금지
  ※ 이달 태도 슬로건 한 줄 (예: "완벽한 계획 1개보다 불완전한 실행 3개")
★ 금지: narrative에 커리어/재정/인간관계/건강 영역별 점수(N점·N/10)나
  영역별 분석 본문을 쓰지 말 것 — 그건 S4(deep-analysis) 전용.`,

  "deep-analysis": `■ S4 심층 분석 · 월간 로드맵 전용 (이 리포트 핵심)

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${ELEMENT_DEFICIENCY_RULE}
${SCORE_CITATION_RULE}

출력 스키마:
{
  "intro": "string",
  "domains": [
    { "domain": "커리어", "score": number, "analysis": "string" },
    { "domain": "재정", "score": number, "analysis": "string" },
    { "domain": "인간관계", "score": number, "analysis": "string" },
    { "domain": "건강", "score": number, "analysis": "string" }
  ],
  "luckyDates": ["string", "string", "string"]
}

※ 별칭 허용: score_out_of_10↔score, name/title↔domain, body/desc↔analysis
※ deepAnalysis 단일 문자열로 영역 분석을 몰아넣지 말 것 — 반드시 domains 배열.

{{narrative}}

intro: 이번 달 에너지 + 초·중·후반 흐름만 (100~120자, {{dayPillarLabel}} 호칭).
  ★ intro에 영역별 점수·영역 분석·행운의 날짜를 넣지 말 것.

domains: 정확히 4개. domain 이름은 위 한글 그대로.
  score: 10점 만점 정수 (6~8 권장, 인간관계는 6~7).
  analysis: 각 100~120자 (커리어=업무 에너지·갈등·행동 / 재정=수입·지출·투자 /
  인간관계=신규 vs 기존 / 건강=최저 % 결핍 오행·주의 부위·습관).

luckyDates: 이번 달 날짜 문자열 정확히 3개 (월운·일진 흐름, 약 9~10일 간격).
  ★ 발행일 이후 날짜만 (예: 발행 11일이면 ["15일", "22일", "28일"]).
  예: ["7일", "16일", "25일"]`,

  opportunities: `■ S5 포착할 기회 5가지 · 이번 달

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${SCORE_CITATION_RULE}

★ 행동 지시(tip·대비책·로드맵·결정 스크립트·행운 날짜)는 발행일 이후 날짜만.
  (입력의 발행일·이달 남은 날짜 범위 준수)

출력 스키마:
{ "opportunities": [{ "title": "string", "body": "string", "tip": "string" }] }

{{narrative}}

정확히 5개. title 10자 이내, body 이번 달 사주 연결 (80자),
tip: 날짜 구간·행동을 담은 구체 지침 (100~120자). 행운의 날짜 연결 가능.
★ tip에 "잡는 법:" 라벨 금지 — UI가 이미 붙임.`,

  risks: `■ S6 예측 리스크 4가지 + 대비책 · 이번 달

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${SCORE_CITATION_RULE}

출력 스키마:
{ "risks": [{ "title": "string", "body": "string", "countermeasure": "string" }] }

{{narrative}}

정확히 4개. title 10자 이내, body 사주 근거 (80자),
countermeasure: 이번 달 실천 + 날짜 구간 가능 (100~120자).
★ countermeasure에 "대비책:" 라벨 금지 — UI가 이미 붙임.`,

  roadmap: `■ S7 시간 로드맵 + 결정 스크립트 · 5일×6구간

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${SCORE_CITATION_RULE}

출력 스키마:
{
  "roadmap": [{ "period": "string", "label": "string", "body": "string" }],
  "decisionMoments": [{ "situation": "string", "script": "string" }]
}

{{narrative}}

★ period는 이번 달 날짜 구간만. 나이·연대·대운 구간 금지.

roadmap 정확히 6항목 (고정):
- 1~5일: 정리·점검·준비
- 6~10일: 제안·소통·아이디어
- 11~15일: 실행·테스트
- 16~20일: 관계 조율
- 21~25일: 재정 구조
- 26~30일: 회고·다음 달 설계

각 body 100~130자, 2문장: (1) 이번 달 기운·원국과 이 구간이 맞는 이유
(2) 구체 행동. S3 scores 지표를 인용할 경우 동일 지표명·점수만.

decisionMoments 4항목 (script는 따옴표 없이 대사만, 100자):
- 협상 망설임 / 비합리적 요구 / 가족 돈 갈등 / 피곤한데 일 더 하기
★ 구어체: "~습니다" 문어체 금지. 실제 말하듯 짧게.

결정프레임 Q1~Q3는 roadmap 마지막(26~30일) body에 자연스럽게 녹여 쓰기:
- 감정 vs 데이터? / 3년 뒤 구조? / 직접 통제 가능한 요소는?`,

  prophecy: `■ S8 잠겨진 천명 · 행운 키워드 카드

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
★ 한자 표기 예외는 prophecy.short, prophecy.full, cohortInsight.body 전체에 적용.

출력 스키마:
{
  "prophecy": { "short": "string", "full": "string" },
  "cohortInsight": { "body": "string" }
}

★ 필수: prophecy(short, full), cohortInsight(body) 세 필드 모두 채울 것.

{{narrative}}

prophecy.short: 반드시 아래 고정값을 그대로 (창작 금지):
{{luckyKeywordsShort}}
prophecy.full: 잠겨진 천명 — ★ 아래 규칙 필수
  - 현재 연도는 {{currentYear}}년. 미래 시점은 {{currentYear}} 이후만
  - 미래 연도 2개(발행+1~3년 범위의 구체 연도)를 분리해 서술 (범위로 뭉뚱그리기 금지)
  - 이번 달 행동과 그 미래 장면의 인과 (100~120자)
  - 사주 전문용어 나열 금지, 현실 시나리오·구어 조언체

cohortInsight.body: 동일 명식 구조 코호트 통계 2줄 (120자)
  - 주어: "[성향/구조]를 가진 사람들은"
  - ★ 정수 % 수치 정확히 2개 필수 (예: 68%, 41%)
  - 상품 구매자·독자 자기지시 금지`,
};
