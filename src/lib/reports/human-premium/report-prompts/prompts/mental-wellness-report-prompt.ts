import { REPORT_PROMPT_SCORE_RULES } from "../base-prompt";
import type { ReportSlotPromptMap } from "../prompt-definition";

/** No.03 · 멘탈디톡스 (mental) — S4: 내면 심리·스트레스·감정관리·갈등해소 / S7: 연수 6단계 */
export const FOCUS_KO = "심리·건강·에너지·회복력 · 멘탈디톡스";
export const FOCUS_EN = "Mind, health, energy, resilience · Mental Detox";

export const SLOTS: ReportSlotPromptMap = {
  "saju-structure": `■ S2 사주 구조 해석 · 심리·멘탈 맥락

출력 스키마:
{ "sajuStructure": "string" }

총 600자 이내. sajuStructure 한 필드에 모두 담기.
※ 병리 진단 금지 — 명리 기반 성향·경향만. "~경향이 있으며 ~로 다룰 수 있습니다" 표현

[오행_우세]: 강한 오행과 내면 심리 특성 (50자)
[오행_결핍]: 부족 오행과 취약점 — "다만 ~을 의식하면" 재프레이밍 (50자)
[오행_해설]: 우세-결핍 내면 구조, 감정 처리·스트레스·회복 + 현재 대운 영향 (100자)

${REPORT_PROMPT_SCORE_RULES}
※ 정인·편인 심리·직관·내면 탐구 관점 강조

[십신_비견겁재]: 자아·경쟁·비교 심리 (60자)
[십신_식신상관]: 표현·창의·감정 방출 (60자)
[십신_정재편재]: 안정 욕구·통제감 (60자)
[십신_정관편관]: 규율·압박 vs 반항 (60자)
[십신_정인편인]: 직관·공감·내면 깊이 (60자)

[명리_진단]: 일간 내면 구조 → 현재 대운 심리 → 다음 대운 감정 변화 (200자, {{dayPillarLabel}}으로 시작)
  ※ 말의 톤·감정 표현이 대인관계 핵심`,

  "master-narrative": `■ S3 핵심 운세 지표 + deep_narrative · 심리·멘탈

출력 스키마:
{ "narrative": "string" }

총 680자 이내.

[지표 6개] 심리·멘탈 맥락, 각 점수/100 + 설명 40자:
- 현재운세강도: 감정·심리 에너지
- 시기적합도: 내면 탐구·자기 재정의 적합도
- 기회포착력: 감정 인식·직관·공감
- 위기회피력: 감정 조절·번아웃 회피 (55~72, 의식적 관리 필요)
- 관계운: 공감·소통·정서적 연결
- 재물흐름: 심리 안정이 물질 흐름에 미치는 간접 영향

[심층서사]: 초년~청년~현재 대운 심리 발달 + 다음 대운 안정화 방향 (200자)
  ※ "내면 [오행] 기운이 가장 강하게 발현되는 시기" 패턴`,

  "deep-analysis": `■ S4 심층 분석 · 멘탈디톡스 전용 (이 리포트 핵심)

출력 스키마:
{ "deepAnalysis": "string" }

{{narrative}}

총 1,000자 이내. deepAnalysis 한 필드에 아래 4항목 순서대로 포함.

[내면_심리_유형]: 유형 이름(4~8자) + 강점 2~3 + 편안한 환경 + 시적 마무리 (120자)

[스트레스_패턴]: 유발 상황 2~3 + 신체·행동·감정 신호 + 회복 연결 (200자)

[감정_관리법]: 즉각 처방 / 일상 루틴 / 위기 자기다짐(큰따옴표) / 회복 속도 특성 (200자)

[대인관계_갈등_해소]: 관계 패턴 + 갈등 유형 2 + 해소 3단계 + 맞는·주의 관계 유형 (200자)`,

  opportunities: `■ S5 포착할 기회 5가지 · 커리어+멘탈 혼합

출력 스키마:
{ "opportunities": [{ "title": "string", "body": "string", "tip": "string" }] }

{{narrative}}

정확히 5개 (PDF 기준):
1. 경험 기반 컨설팅·자문 확대
2. 2막 커리어: 전문성+네트워크 전환
3. 글쓰기·기록 브랜드 구축
4. 심리·멘탈 역량 자산화(조정자·멘토)
5. 재무 구조 재정비·안정 자산

title 4~10자, body 대운·나이 시기 (90자), tip "잡는 법:" 오행·십신 활동명 (110자).`,

  risks: `■ S6 예측 리스크 4가지 + 대비책 · 심리·멘탈

출력 스키마:
{ "risks": [{ "title": "string", "body": "string", "countermeasure": "string" }] }

{{narrative}}

정확히 4개 (PDF 기준):
1. 말·표현 갈등·오해 → "내가 얻고 싶은 결과" + "내일 아침 답장"
2. 생각 과잉·무기력 → 몸으로 흘려보내기, 주 3회 유산소
3. 자기비판·후회 → "오늘 잘한 것 3가지" + 연간 성취 리스트
4. 거리감·고립 → "3명만 깊게" + 분기 1회 진솔한 대화

대비책: 심리·신체 양면 행동 포함.`,

  roadmap: `■ S7 시간 로드맵 + 결정 스크립트 · 연수 6단계

출력 스키마:
{
  "roadmap": [{ "period": "string", "label": "string", "body": "string" }],
  "decisionMoments": [{ "situation": "string", "script": "string" }]
}

{{narrative}}

roadmap 6항목 (각 80자 내외, PDF 기준):
- 현재~2년: 표현과 정리
- 3~5년 후: 역할 재정의
- 6~10년 후: 구조화와 자산화
- 11~15년 후: 조정자·멘토
- 16~20년 후: 정리와 선택
- 20년 이후: 전달과 유산 (60자)

decisionMoments 4항목 (script 큰따옴표, 80자):
- 협상 망설임 / 감정 상해 즉각 반박 / 무기력·무의욕 / 결정 전 불안
※ 상황3: 수기운 "시작만 하면 흐름" / 상황4: 3가지 시나리오 종이

결정프레임 Q1~Q3는 roadmap 마지막 body:
- 가치 vs 순간 감정?
- 3년 뒤 상태?
- 혼자 vs 함께할 때 더 빛나는가?`,

  prophecy: `■ S8 봉인 & 천명 · 심리·멘탈

출력 스키마:
{
  "prophecy": { "short": "string", "full": "string" },
  "cohortInsight": { "body": "string" }
}

{{narrative}}

prophecy.short: 심리 안정 색·방향·시간·숫자 + 다짐(15자)
prophecy.full: 대운 파장·감정 관리 조건·미래 연도 2개·내면 성숙 (120자)
cohortInsight.body: 동일 구조 코호트 — 전환점·루틴 성공 vs 삭임 실패 대비 (120자)`,
};
