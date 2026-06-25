import { REPORT_PROMPT_SCORE_RULES } from "../base-prompt";
import type { ReportSlotPromptMap } from "../prompt-definition";

/** No.09 · 월간 로드맵 (monthly) — S4: 4영역+행운의 날 / S7: 5일×6구간 */
export const FOCUS_KO = "이달 전략·4영역 설계 · 월간 인생 설계";
export const FOCUS_EN = "This month's strategy across four domains · Monthly Life Architecture";

export const SLOTS: ReportSlotPromptMap = {
  "saju-structure": `■ S2 사주 구조 해석 · 이번 달 월운 맥락

★ pillarBlock의 **이번 달 월간지(月運)** 반드시 참조. "이번 달은" 표현 필수.

출력 스키마:
{ "sajuStructure": "string" }

총 600자 이내. sajuStructure 한 필드에 모두 담기.

[오행_우세]: 우세 오행 + 삶에 미치는 영향 (50자)
[오행_결핍]: 결핍 + 이번 달 보완 방법 (50자)
[오행_해설]: 우세+결핍 + 화(火) 등 구체 보완 제안 (100자)

${REPORT_PROMPT_SCORE_RULES}

[십신_비견겁재]~[정인편인]: 각 50자, **이번 달** 작동 방식

[명리_진단]: 대운 + 월간지 × 원국 (200~250자, {{dayPillarLabel}}으로 시작)
  ※ 이번 달 성격(리허설/실행/정비) + 운용 원칙 한 줄
  예: "관계는 보수적으로, 일과 돈은 공격적으로"`,

  "master-narrative": `■ S3 핵심 운세 지표 + deep_narrative · 이번 달

출력 스키마:
{ "narrative": "string" }

총 750자 이내.

[지표 6개] 이번 달 기준, 각 점수/100 + 설명 40자:
- 현재운세강도: 대운·세운·월운 합산
- 시기적합도: 행동·정리·대기
- 기회포착력 / 위기회피력(50~72) / 관계운 / 재물흐름

[심층서사]: 이번 달 종합 서사 (250~300자)
  ※ {{dayPillarLabel}} 1회 + 핵심 작동 원리(상관생재 등)
  ※ 대운 내 이달 위치(리허설·수확 준비 등)
  ※ 이달 태도 슬로건: "완벽한 계획 1개보다 불완전한 실행 3개" 류`,

  "deep-analysis": `■ S4 심층 분석 · 월간 인생 설계 전용 (이 리포트 핵심)

출력 스키마:
{ "deepAnalysis": "string" }

{{narrative}}

총 1,000자 이내. deepAnalysis 한 필드에 아래 순서대로 포함.

[월간_서두]: 이번 달 에너지 + 초·중·후반 흐름 (100~120자, {{dayPillarLabel}} 호칭)

[영역별_분석]: 10점 만점 정수(6~8 권장, 관계 6~7), 각 100~120자
- 커리어: 업무 에너지·갈등·권장 행동
- 재정: 수입·지출·투자, 충동 지출 주의
- 인간관계: 신규 vs 기존, 가족·파트너
- 건강: 오행 불균형·주의 부위·습관

[행운의_날짜]: 이번 달 **3개 날짜** (월간지·일진 흐름, 약 9~10일 간격)`,

  opportunities: `■ S5 포착할 기회 5가지 · 이번 달

출력 스키마:
{ "opportunities": [{ "title": "string", "body": "string", "tip": "string" }] }

{{narrative}}

정확히 5개. title 10자 이내, body 이번 달 사주 연결 (80자)
tip "잡는 법:" + **날짜 구간·행동** (100~120자), 행운의 날짜 연결 가능`,

  risks: `■ S6 예측 리스크 4가지 + 대비책 · 이번 달

출력 스키마:
{ "risks": [{ "title": "string", "body": "string", "countermeasure": "string" }] }

{{narrative}}

정확히 4개. title 10자 이내, body 사주 근거 (80자)
countermeasure 이번 달 실천 + 날짜 구간 가능 (100~120자)`,

  roadmap: `■ S7 시간 로드맵 + 결정 스크립트 · 5일×6구간

출력 스키마:
{
  "roadmap": [{ "period": "string", "label": "string", "body": "string" }],
  "decisionMoments": [{ "situation": "string", "script": "string" }]
}

{{narrative}}

roadmap 6항목 (고정):
- 1~5일: 정리·점검·준비
- 6~10일: 제안·소통·아이디어
- 11~15일: 실행·테스트
- 16~20일: 관계 조율
- 21~25일: 재정 구조
- 26~30일: 회고·다음 달 설계

decisionMoments 4항목 (script 큰따옴표 대사, 100자):
- 협상 망설임 / 비합리적 요구 / 가족 돈 갈등 / 피곤한데 일 더 하기

결정프레임 Q1~Q3는 roadmap 마지막 body:
- 감정 vs 데이터? / 3년 뒤 구조? / **직접 통제 가능한 요소는?**`,

  prophecy: `■ S8 봉인 & 천명 · 행운 키워드 카드

출력 스키마:
{
  "prophecy": { "short": "string", "full": "string" },
  "cohortInsight": { "body": "string" }
}

{{narrative}}

prophecy.short: **행운 키워드 카드** — 색·방향·시간·숫자·다짐(10~15자), 월운·일간 근거
prophecy.full: 봉인된 예언 — **미래 연도 2개**(발행+1~3년) + 이번 달 행동과 연결 (100~120자)
cohortInsight.body: 동일 일간·대운 코호트 — 전환·루틴 통계 2줄 (120자)`,
};
