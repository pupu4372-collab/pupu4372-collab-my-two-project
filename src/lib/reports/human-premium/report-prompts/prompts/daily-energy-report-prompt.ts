import { REPORT_PROMPT_SCORE_RULES } from "../base-prompt";
import type { ReportSlotPromptMap } from "../prompt-definition";

/** No.07 · 일별 인생 플랜 보기 (free-daily-preview) — S4: 시간대별 에너지 / S7: 오늘+단기+대운 혼합 */
export const FOCUS_KO = "오늘 하루 에너지·시간대별 전략 · 일별 인생 플랜";
export const FOCUS_EN = "Today's energy and time-of-day strategy · Daily life plan";

export const SLOTS: ReportSlotPromptMap = {
  "saju-structure": `■ S2 사주 구조 해석 · 오늘 일진(日辰) 맥락

★ 일일 리포트 전용: 대운이 아닌 **오늘 일진 × 원국** 기준. "오늘은", "오늘 하루는" 표현 필수.

출력 스키마:
{ "sajuStructure": "string" }

총 600자 이내. sajuStructure 한 필드에 모두 담기.

[오행_우세]: 원국 강한 오행 + 오늘 일진이 자극하는 방식 (50자)
[오행_결핍]: 원국 부족 오행 + 일진이 보완/악화하는지 — 재프레이밍 (50자)
[오행_해설]: 원국-일진 조합의 오늘 에너지, 몸·마음 온도·회복 패턴 (100자)

${REPORT_PROMPT_SCORE_RULES}

[십신_비견겁재]: 오늘 일진과의 관계·자아 에너지 (60자)
[십신_식신상관]: 오늘 말·표현 에너지 강도 (60자)
[십신_정재편재]: 오늘 금전·실무 에너지 (60자)
[십신_정관편관]: 오늘 조직·규율 에너지 (60자)
[십신_정인편인]: 오늘 학습·직관 에너지 (60자)

[명리_진단]: 원국 + 현재 대운 + 오늘 일진 3단 (200자, {{dayPillarLabel}}으로 시작)
  ※ 반드시 "오늘과 같은 [오행] 기운이 강한 날에는" 포함
  ※ 오늘 핵심 과제 한 줄로 마무리`,

  "master-narrative": `■ S3 핵심 운세 지표 + deep_narrative · 오늘 하루

출력 스키마:
{ "narrative": "string" }

총 680자 이내. **오늘 일진 × 원국** 기준 (대운 기준 아님).

[지표 6개] 각 점수/100 + 설명 40자:
- 현재운세강도: 오늘 일진 에너지 강도
- 시기적합도: 확장·모험 vs 정리·실무
- 기회포착력: 정보·아이디어 포착 속도
- 위기회피력: 말 실수·갈등 위험 (상관 강 시 60~70, "말 조절 관건")
- 관계운: 대인관계·금전 대화 주의 등
- 재물흐름: 재성 활성화·계약형 vs 확장형

[심층서사]: "오늘 하루는 {{dayPillarLabel}} 사주에서 [오행]이 전면에 나서는 날"로 시작 (200자)
  ※ 강점 활성 시간대 + 오늘 운영 원칙 한 줄 ("말은 80%, 확인은 120%" 류)`,

  "deep-analysis": `■ S4 심층 분석 · 일별 에너지 전용 (이 리포트 핵심)

출력 스키마:
{ "deepAnalysis": "string" }

{{narrative}}

총 700자 이내. deepAnalysis 한 필드에 아래 5항목 순서대로 포함.

[오전_에너지]: "오늘 오전은 {{dayPillarLabel}}에게 ~의 시간" + 권장 활동 (120자)
[오후_에너지]: 일진 오행 강해지는 오후 + 실무·조율 집중/주의 (120자)
[저녁_에너지]: 정리·점검·관계 회복 + 재정·내일 우선순위 (120자)
[행운의_시간대]: 유리한 2개 시간대 + 활동 유형 (120자)
  ※ "오전 N~N시(○時)" / "저녁 N~N시(○時)" 형식
[오늘의_핵심_원칙]: 한 줄 원칙 + 사주 근거 (50자)`,

  opportunities: `■ S5 포착할 기회 5가지 · 오늘 하루

출력 스키마:
{ "opportunities": [{ "title": "string", "body": "string", "tip": "string" }] }

{{narrative}}

정확히 5개 (PDF 기준, 오늘 실행 가능 수준):
1. 거래·계약 조건 재정비
2. 전문성·경험 문서·자료 정리
3. 가족·배우자 재정 계획 점검 (저녁 시간 필수)
4. 업무 프로세스·도구 개선
5. 조용한 1:1 대화로 신뢰 쌓기

title 4~12자, body 원국+일진 근거 (90자), tip "잡는 법:" + **오늘 몇 시** 무엇을 (110자)
※ 시간대 명시: 오전 9~11시 / 오후 1~4시 / 저녁 7~9시`,

  risks: `■ S6 예측 리스크 4가지 + 대비책 · 오늘 하루

출력 스키마:
{ "risks": [{ "title": "string", "body": "string", "countermeasure": "string" }] }

{{narrative}}

정확히 4개 (PDF 기준):
1. 말 한마디로 관계 금 가기 → "보내기 전 10초 멈춤" + "30분~1시간 뒤 재확인"
2. 걱정·계산 과부하 → "생각 1시간당 몸 움직이기 10분"
3. 안전지향 기회 포기 → "완전 거절 대신 10~20% 소규모 시험"
4. 수면·휴식 부족 → "스마트폰 30분 일찍 끊기" + "내일 아침에 생각해도 된다"

대비책: 오늘 즉시 실행 가능한 행동.`,

  roadmap: `■ S7 시간 로드맵 + 결정 스크립트 · 오늘+단기+대운 혼합

출력 스키마:
{
  "roadmap": [{ "period": "string", "label": "string", "body": "string" }],
  "decisionMoments": [{ "situation": "string", "script": "string" }]
}

{{narrative}}

roadmap 6항목 (각 70~80자):
- 오늘 오전: 정리·기획
- 오늘 오후: 실무·조건 조율 (말 날카로움 주의)
- 오늘 저녁: 관계·재정 점검
- 올해 하반기: 계획 재설계
- 현재 대운 전반: 자율성·전문성
- 현재 대운 후반: 정리·전수

decisionMoments 4항목 (script 큰따옴표, 80자):
- 협상 망설임 / 가족 돈 이야기 분위기 싸함 / 즉각 반박 욕구 / 새 제안·투자
※ 스크립트 4: "소액부터 시험" 포함

결정프레임 Q1~Q3는 roadmap 마지막 body:
- 안전 vs 성장 구분?
- 지금 말 vs 내일 말?
- 직접 나서기 vs 구조·도구 바꾸기 먼저?`,

  prophecy: `■ S8 봉인 & 천명 · 오늘 연결

출력 스키마:
{
  "prophecy": { "short": "string", "full": "string" },
  "cohortInsight": { "body": "string" }
}

{{narrative}}

prophecy.short: **오늘 일진** 오행 기반 행운색·방향·시간(저녁 중심)·숫자 + 다짐(15자)
prophecy.full: 미래 **연도 1개** + 오늘 준비와 연결 — "오늘 [행동] 점검 → 그때 선택이 가벼워짐" (120자)
cohortInsight.body: 동일 원국 코호트 — 전환·말·글·재정 패턴 통계 (120자)`,
};
