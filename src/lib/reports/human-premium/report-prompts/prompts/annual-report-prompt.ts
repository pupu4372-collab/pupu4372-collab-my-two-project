import { REPORT_PROMPT_SCORE_RULES } from "../base-prompt";
import type { ReportSlotPromptMap } from "../prompt-definition";

/** No.10 · 올해의 인생 청사진 (yearly) */
export const FOCUS_KO = "올해 로드맵과 분기별 행동 · 연간 인생 청사진";
export const FOCUS_EN = "Yearly roadmap, quarterly moves, annual life blueprint";

export const SLOTS: ReportSlotPromptMap = {
  "saju-structure": `■ S2 사주 구조 해석

출력 스키마:
{ "sajuStructure": "string" }

총 600자 이내. sajuStructure 한 필드에 모두 담기.

[오행_우세]: 가장 강한 오행과 특성 (50자 이내)
[오행_결핍]: 가장 부족한 오행과 구조적 의미 (50자 이내)
[오행_해설]: 우세-결핍 조합 + 현재 대운/세운 관계 (100자 이내)

${REPORT_PROMPT_SCORE_RULES}

[십신_비견겁재]~[십신_정인편인]: 각 점수 + 설명 60자 이내

[명리_진단]: 일간 → 강점 → 대운 → 세운 → 올해 전략 한 문장 (200자, {{dayPillarLabel}}으로 시작)`,

  "master-narrative": `■ S3 핵심 운세 지표 + deep_narrative

출력 스키마:
{ "narrative": "string" }

총 680자 이내.

[지표 6개] 각 점수/100 + 설명 40자: 현재운세강도, 시기적합도, 기회포착력, 위기회피력(50~72), 관계운, 재물흐름
[심층서사]: 평생 대운 맥락 → 올해 위치 → 전반기/후반기 (200자)`,

  "deep-analysis": `■ S4 심층 분석 · 연간 전용

출력 스키마:
{ "deepAnalysis": "string" }

{{narrative}}

총 500자 이내.

[연간_서두]: {{dayPillarLabel}} 올해 핵심 명리 구도 (100자, 공격:방어 비율)
[1~4분기]: 분기별 점수(65~85) + 내용 90자 (2분기 최고, 4분기 최저)
[황금의달]: 운기 강한 달 1~2개`,

  opportunities: `■ S5 포착할 기회 5가지

출력 스키마:
{ "opportunities": [{ "title": "string", "body": "string", "tip": "string" }] }

{{narrative}}

정확히 5개. title 4~10자, body에 시기 명시, tip은 "잡는 법:" 접두어.
직업/재물/인맥/건강/자기계발 각 1개.`,

  risks: `■ S6 예측 리스크 4가지 + 대비책

출력 스키마:
{ "risks": [{ "title": "string", "body": "string", "countermeasure": "string" }] }

{{narrative}}

정확히 4개. 건강/대인관계/재정/가족·배우자 권장.`,

  roadmap: `■ S7 시간 로드맵 + 결정 스크립트

출력 스키마:
{
  "roadmap": [{ "period": "string", "label": "string", "body": "string" }],
  "decisionMoments": [{ "situation": "string", "script": "string" }]
}

{{narrative}}

roadmap 6항목: 1~3월, 4~6월, 7~8월, 9~10월, 11~12월, 대운 전체.
decisionMoments 4항목. 결정프레임 Q1~Q3는 roadmap 마지막 body에 포함.`,

  prophecy: `■ S8 봉인 & 천명

출력 스키마:
{
  "prophecy": { "short": "string", "full": "string" },
  "cohortInsight": { "body": "string" }
}

{{narrative}}

prophecy.short: 행운 요소 + 인생만트라 요약
prophecy.full: 미래 연도 2개 포함 조건부 예언 (120자)
cohortInsight.body: 코호트 통계 패턴 (120자)`,
};
