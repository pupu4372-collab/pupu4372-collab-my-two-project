import { REPORT_PROMPT_SCORE_RULES } from "../base-prompt";
import type { ReportSlotPromptMap } from "../prompt-definition";

/** No.04 · 비즈니스 파트너 플랜 (business) — S4만 비즈니스 전용, 나머지는 연간 뼈대 + 비즈니스 맥락 */
export const FOCUS_KO = "협업·네트워크·파트너 · 비즈니스 파트너십 전략";
export const FOCUS_EN = "Collaboration, network, partners · business partnership strategy";

export const SLOTS: ReportSlotPromptMap = {
  "saju-structure": `■ S2 사주 구조 해석 · 비즈니스 맥락

출력 스키마:
{ "sajuStructure": "string" }

총 600자 이내. sajuStructure 한 필드에 모두 담기.

[오행_우세]: 가장 강한 오행과 비즈니스 강점 (50자)
[오행_결핍]: 부족 오행과 파트너 보완 필요 이유 (50자)
[오행_해설]: 비즈니스 맥락 오행 의미 + 이상적 파트너 오행 방향 (100자)
  ※ "파트너나 팀에서 [결핍 오행]이 강한 사람을 두면 밸런스가 좋아집니다" 형태 포함

${REPORT_PROMPT_SCORE_RULES}
※ 비견겁재 강하면 88~90, 관성 약하면 40~50 권장

[십신_비견겁재]: 동업·경쟁 관계 (60자)
[십신_식신상관]: 기획·표현·브랜딩 (60자)
[십신_정재편재]: 수익 모델·자산 관리 (60자)
[십신_정관편관]: 조직·규칙·직함 태도 (60자)
[십신_정인편인]: 정보 흡수·전략 전환 (60자)

[명리_진단]: 일간 비즈니스 구조 → 현재 대운 사업 흐름 → 다음 대운 전환 (200자, {{dayPillarLabel}}으로 시작, 현재·다음 대운 모두 언급)`,

  "master-narrative": `■ S3 핵심 운세 지표 + deep_narrative · 비즈니스

출력 스키마:
{ "narrative": "string" }

총 680자 이내.

[지표 6개] 비즈니스 맥락, 각 점수/100 + 설명 40자:
- 현재운세강도: 현재 대운 사업 활성화
- 시기적합도: 확장 vs 안정 국면
- 기회포착력: 시장·사람 의도 읽기 (80~90 권장)
- 위기회피력: 과신·직설 리스크 (60~72, 제3자 브레이크 필요)
- 관계운: 파트너·고객·네트워크
- 재물흐름: 수입 구조 안정성 + 확장 여지

[심층서사]: 20대~현재 대운별 사업 흐름 → 이후 대운 "2선 전환" 청사진 (200자)`,

  "deep-analysis": `■ S4 심층 분석 · 비즈니스 파트너 전략 전용 (이 리포트 핵심)

출력 스키마:
{ "deepAnalysis": "string" }

{{narrative}}

총 900자 이내. deepAnalysis 한 필드에 아래 5항목을 순서대로 포함.

[나의_비즈니스_역할]: {{dayPillarLabel}} 최적 역할 (80자)
  → 설계자·전략가 vs 실행·영업은 파트너에게 구조 명시 + 사주 근거

[이상적_파트너_유형]: 보완 파트너 오행·십신 (100자)
  → "화(火)·목(木) 기운 [십신] 파트너 → [역할] 시너지" 형식

[파트너십_구조_설계]: 역할 분담·KPI·의사결정·철수 조건·2단계 검증 전략 (150자)

[대운별_사업_로드맵]: 현재 대운~다음 대운 전환 (200자)
  → 현재 대운 핵심 / 현재~3년 파트너 정비 / 다음 대운 2선 / 평생 원칙 한 줄

[파트너십_경보_신호]: 위험 신호 3가지 (100자, ①②③ 형식)`,

  opportunities: `■ S5 포착할 기회 5가지 · 비즈니스

출력 스키마:
{ "opportunities": [{ "title": "string", "body": "string", "tip": "string" }] }

{{narrative}}

정확히 5개. 파트너십/컨설팅/투자/브랜드/네트워크 각 1개.
title 4~10자 행동형, body에 대운·시기·근거 (90자), tip은 "잡는 법:" + 단계 (100자).
지분·수익화 시점·검토 기간 등 숫자 포함.`,

  risks: `■ S6 예측 리스크 4가지 + 대비책 · 비즈니스

출력 스키마:
{ "risks": [{ "title": "string", "body": "string", "countermeasure": "string" }] }

{{narrative}}

정확히 4개. 동업갈등 / 실행지연(과분석) / 건강·과로 / 법적·계약 리스크 권장.
title: "~로 인한 ○○ 갈등/리스크" 형태, 조건부 표현만.`,

  roadmap: `■ S7 시간 로드맵 + 결정 스크립트 · 대운 단위

출력 스키마:
{
  "roadmap": [{ "period": "string", "label": "string", "body": "string" }],
  "decisionMoments": [{ "situation": "string", "script": "string" }]
}

{{narrative}}

roadmap 6항목 (각 80자 내외):
- 현재 대운 전반: 확장·브랜딩
- 현재~3년: 파트너 구조 정비
- 현재 대운 말기: 포트폴리오 재편
- 다음 대운 초반: 2선·자문 비즈니스
- 다음 대운 후반: 수익 안정·삶 밀도
- 평생 관통: 비즈니스 원칙 한 줄

decisionMoments 4항목 (script는 큰따옴표 대화, 80자):
- 중요 협상 망설임 / 파트너 감정 갈등 / 동업 제안 수신 / 과다 제안·우선순위 상실

결정프레임 Q1~Q3는 roadmap 마지막 항목 body에 포함:
- 정보 우위 vs 감정?
- 설계자 vs 실행자?
- 최악 시 가족 손실 한도?`,

  prophecy: `■ S8 잠겨진 천명 · 비즈니스

출력 스키마:
{
  "prophecy": { "short": "string", "full": "string" },
  "cohortInsight": { "body": "string" }
}

{{narrative}}

prophecy.short: 행운색·방향·시간·숫자 + 비즈니스 다짐(15자) 요약
prophecy.full: 파트너십·사업 미래 예언, 연도 범위·역할 유지 조건 (120자)
cohortInsight.body: 동일 일간 코호트 비즈니스 통계 — 구조 전환·파트너십·2선 시기 (120자)`,
};
