import { REPORT_PROMPT_SCORE_RULES } from "../base-prompt";
import type { ReportSlotPromptMap } from "../prompt-definition";

/** No.12 · 인생의 마스터플랜 (lifetime) — S4: 대운별 생애지도 / S8: 3대 질문+천명 선언 */
export const FOCUS_KO = "평생 대운·천명·생애 설계 · 인생의 마스터플랜";
export const FOCUS_EN = "Lifetime major luck, destiny, life design · Life Master Plan";

export const SLOTS: ReportSlotPromptMap = {
  "saju-structure": `■ S2 사주 구조 해석 · 평생 관점

★ 톤: 묵직·철학적. pillarBlock **전체 대운 목록** 반드시 참조.

출력 스키마:
{ "sajuStructure": "string" }

총 650자 이내. sajuStructure 한 필드에 모두 담기.

[오행_우세]: 평생 영향 (50자)
[오행_결핍]: 평생 과제 + 돌파구 (50자)
[오행_해설]: 우세+결핍 반복 패턴 (100자)

${REPORT_PROMPT_SCORE_RULES}

[십신_비견겁재]~[정인편인]: 각 50자, **평생** 작동 방식

[명리_진단]: 평생 원국 — 전반부 vs 후반부, 대운 보완 (200~250자, {{dayPillarLabel}}으로 시작)
  ※ "인생 전반부는 X, 후반부는 Y" 구조`,

  "master-narrative": `■ S3 핵심 운세 지표 + deep_narrative · 평생

출력 스키마:
{ "narrative": "string" }

총 750자 이내.

[지표 6개] 평생·현재 대운 맥락, 각 점수/100 + 설명 40자:
- 현재운세강도: 지금이 인생 곡선 어디인지
- 시기적합도: 도약·정비·수확기
- 기회포착력: 평생 기회 패턴
- 위기회피력: 50~72, 반복 위기 패턴
- 관계운: 귀인 유형 힌트
- 재물흐름: 전반기 vs 후반기

[심층서사]: 존재론적 평생 서사 (250~300자)
  ※ {{dayPillarLabel}} 1회 + 인생 곡선 + 지금 위치 + 앞 전환`,

  "deep-analysis": `■ S4 대운별 생애 지도 · 인생의 마스터플랜 전용 (핵심)

출력 스키마:
{ "deepAnalysis": "string" }

{{narrative}}

총 1,400자 이내. deepAnalysis 한 필드에 순서대로 포함.

[생애_서두]: 인생 전체 조망 (120~150자, {{dayPillarLabel}} 호칭)

[대운별_지도]: pillarBlock 전체 대운 **빠짐없이** 각각:
  · 나이구간 / 대운 간지 / 시대별칭(8~12자) / 에너지(60자) / 인생과제(60자) / 핵심행동(40자)
  ※ 현재 대운에 "(현재)" 표시

[전환점_3]: 나이 + 대운 교체·충합 근거 (각 60자)`,

  opportunities: `■ S5 포착할 기회 5가지 · 평생·현재 대운

출력 스키마:
{ "opportunities": [{ "title": "string", "body": "string", "tip": "string" }] }

{{narrative}}

정확히 5개. 평생 관점 + **현재 대운에서 잡을 이유**
title 10자 이내, body (80자), tip "잡는 법:" 기한·행동 (100~120자)`,

  risks: `■ S6 예측 리스크 4가지 + 대비책 · 평생

출력 스키마:
{ "risks": [{ "title": "string", "body": "string", "countermeasure": "string" }] }

{{narrative}}

정확히 4개. **평생 반복** 패턴 + 사주 근거
대비책: 평생 습관, 지금 시작 가능 (100~120자)`,

  roadmap: `■ S7 시간 로드맵 + 결정 스크립트 · 대운 3~4개

출력 스키마:
{
  "roadmap": [{ "period": "string", "label": "string", "body": "string" }],
  "decisionMoments": [{ "situation": "string", "script": "string" }]
}

{{narrative}}

roadmap: **현재 대운 포함 향후 3~4개** (과거 제외), 각 70~80자
  ※ 현재 대운은 "지금 당장" 관점

decisionMoments 4항목 (평생 태도·철학, script 100자):
- 큰 전환 두려움 / 방식 비판 / 의미 상실 / 노년 막막함

결정프레임 Q1~Q3는 roadmap 마지막 body:
- 원국 강점 살리는가? / 10년 뒤 어떻게 볼까? / **천명과 정렬되는가?**`,

  prophecy: `■ S8 잠겨진 천명 · 평생 전용 (가장 깊은 마무리)

출력 스키마:
{
  "prophecy": { "short": "string", "full": "string" },
  "cohortInsight": { "body": "string" }
}

{{narrative}}

prophecy.short: 평생 행운색·방향·시간·숫자 + 만트라(10~15자)
prophecy.full: 아래를 **순서대로** 한 필드에 포함 (총 600~700자)

① 인생 만트라 (15~20자)

② 인생 3대 질문 (각 80~100자, 사주 근거 필수):
- 나는 누구인가 (존재 정의)
- 무엇을 위해 사는가 (삶의 목적)
- 어떻게 마무리할 것인가 (노년·남길 것/내려놓을 것)

③ 천명 선언문 (200~250자): 반드시 "나 {{dayPillarLabel}}은/는"으로 시작

④ 잠겨진 천명: 미래 연도 **2개**(발행+5~15년) + 장면 + "지금 선택이 천명 완성으로" (100~120자)

cohortInsight.body: 동일 구조 코호트 — 평생 전환·후반 수확 (120자)`,
};
