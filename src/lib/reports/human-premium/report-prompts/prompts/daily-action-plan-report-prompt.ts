import { REPORT_PROMPT_SCORE_RULES } from "../base-prompt";
import type { ReportSlotPromptMap } from "../prompt-definition";

/** No.06 · 데일리 럭키 루틴 (daily) — S4 의도적 공백 / S7: 5시간대+대운 */
export const FOCUS_KO = "오늘 하루 행동·시간대별 미션 · 데일리 럭키 루틴";
export const FOCUS_EN = "Today's action missions by time band · Daily Lucky Routine";

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

[명리_진단]: 오늘 일진 기준 원국 진단 — 강해지는 십신·주의점·오늘 에너지 방향 (200~250자, {{dayPillarLabel}}으로 시작)`,

  "master-narrative": `■ S3 핵심 운세 지표 + deep_narrative · 오늘 하루

출력 스키마:
{ "narrative": "string" }

총 750자 이내. 오늘 일진 × 원국 기준.

[지표 6개] 각 점수/100 + 설명 40자:
- 현재운세강도 / 시기적합도(행동·정리·대기) / 기회포착력 / 위기회피력(50~72)
- 관계운 / 재물흐름

[심층서사]: 지표 종합 오늘 서사 (250~300자)
  ※ {{dayPillarLabel}} 1회 + 일진×원국 + 에너지 집중 시간대 + 오늘 메모할 생각`,

  "deep-analysis": `■ S4 심층 분석 · 데일리 럭키 루틴 전용 (의도적 공백)

출력 스키마:
{ "deepAnalysis": "" }

★ 이 상품은 S4를 **반드시 빈 문자열**로만 출력합니다.
내용·문단·요약을 절대 채우지 마십시오. JSON은 위 스키마만 반환.`,

  opportunities: `■ S5 포착할 기회 5가지 · 오늘 당장 실행

출력 스키마:
{ "opportunities": [{ "title": "string", "body": "string", "tip": "string" }] }

{{narrative}}

정확히 5개. title 10자 이내, body 오늘 사주 연결 (80자), tip "잡는 법:" + **시간·장소·방법** (100~120자).`,

  risks: `■ S6 예측 리스크 4가지 + 대비책 · 오늘 하루

출력 스키마:
{ "risks": [{ "title": "string", "body": "string", "countermeasure": "string" }] }

{{narrative}}

정확히 4개. title 10자 이내, body 사주 근거 (80자), countermeasure 오늘 바로 적용 (100~120자).`,

  roadmap: `■ S7 시간 로드맵 + 결정 스크립트 · 5시간대+대운

출력 스키마:
{
  "roadmap": [{ "period": "string", "label": "string", "body": "string" }],
  "decisionMoments": [{ "situation": "string", "script": "string" }]
}

{{narrative}}

roadmap 6항목 (十二支 시간 배당 근거):
- 오전: 辰~午 (07~13시) — 기획·정리
- 오후: 未~酉 (13~19시)
- 밤: 戌~亥 (19~23시) — 관계·대화
- 심야: 子 (23~01시) — 사색·전략
- 새벽: 丑 (01~03시) — 휴식·회복
- 대운: 현재 대운 키워드 + 오늘과 연결 (80자)

decisionMoments 4항목 (script 큰따옴표 대사, 100자):
- 협상 망설임 / 가족 서운함 / 지출·투자 흔들림 / 업무 과다 막막함

결정프레임 Q1~Q3는 roadmap 마지막 body:
- 재정·자산 판단 / 말·관계·상관 / 우선순위·시급성`,

  prophecy: `■ S8 봉인 & 천명 · 행운 키워드 카드

출력 스키마:
{
  "prophecy": { "short": "string", "full": "string" },
  "cohortInsight": { "body": "string" }
}

{{narrative}}

prophecy.short: **행운 키워드 카드** — 색·방향·시간·숫자·다짐(10~15자), 오행·지지 근거
prophecy.full: 봉인된 예언 — **미래 연도 2개**(오늘+1~3년) + 오늘 정리·기록·대화가 미래와 연결 (100~120자)
cohortInsight.body: 동일 일간 코호트 통계 2줄 — 오늘 루틴과 연결 (120자)`,
};
