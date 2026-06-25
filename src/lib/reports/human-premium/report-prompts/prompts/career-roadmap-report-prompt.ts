import { REPORT_PROMPT_SCORE_RULES } from "../base-prompt";
import type { ReportSlotPromptMap } from "../prompt-definition";

/** No.01 · 커리어 빌드업 (career) — S4 전용: 커리어 3단 진화 + 직무 포지셔닝 + 대운별 전직 로드맵 */
export const FOCUS_KO = "직장·성장·성과 방향 · 커리어 빌드업";
export const FOCUS_EN = "Work, growth, recognition · Career Build-up";

export const SLOTS: ReportSlotPromptMap = {
  "saju-structure": `■ S2 사주 구조 해석 · 커리어 맥락

출력 스키마:
{ "sajuStructure": "string" }

총 600자 이내. sajuStructure 한 필드에 모두 담기.

[오행_우세]: 강한 오행과 커리어 강점 (50자)
[오행_결핍]: 부족 오행과 약점 + 대운 보완 시점 (50자)
[오행_해설]: 커리어 맥락 오행 + 적합 포지션 (100자)
  ※ "선두 영업형보다 참모·기획자·컨설턴트" 류, 결핍 오행 대운 도약 타이밍

${REPORT_PROMPT_SCORE_RULES}
※ 식신상관 80~90 / 정관편관 45~60 / 정인편인 후반 교육·강의 연결

[십신_비견겁재]: 동료·네트워크 협업 (60자)
[십신_식신상관]: 말·글·기획·발표 (60자)
[십신_정재편재]: 수입 안정·재무 감각 (60자)
[십신_정관편관]: 조직 적응 vs 자율 (60자)
[십신_정인편인]: 학습·자격·전문지식 (60자)

[명리_진단]: 일간 커리어 → 전 대운 조정 → 현재 실행 → 다음 수확 (200자, {{dayPillarLabel}}으로 시작)
  ※ "현장 실무자 → 전략·기획자 → 자문·멘토" 3단 + "말의 톤 조절" 리스크 언급`,

  "master-narrative": `■ S3 핵심 운세 지표 + deep_narrative · 커리어

출력 스키마:
{ "narrative": "string" }

총 680자 이내.

[지표 6개] 커리어 맥락, 각 점수/100 + 설명 40자:
- 현재운세강도: 현재 대운 커리어 에너지 (결핍 보완 시 "상위 N%" 표현 가능)
- 시기적합도: 방향 전환·브랜딩·역할 재정의
- 기회포착력: 정보·네트워크 (상관 강하면 결단 시 화기 보완 필요)
- 위기회피력: 상관 직설·인간관계 (65~75)
- 관계운: 동료·파트너, "말 한마디가 관계 질 좌우"
- 재물흐름: 꾸준 수입 + 50대 중반까지 재정 구조 설계

[심층서사]: 20대~현재 대운별 커리어 + 이후 전환 (200자)
  ※ 3단 진화, 현재=실행 / 다음=수확·안정, "시간 대비 효율 높은 일" 결론`,

  "deep-analysis": `■ S4 심층 분석 · 커리어 빌드업 전용 (이 리포트 핵심)

출력 스키마:
{ "deepAnalysis": "string" }

{{narrative}}

총 900자 이내. deepAnalysis 한 필드에 아래 5항목 순서대로 포함.

[커리어_3단_진화]: "현장 실무자 → [중간] → [최종]" + 사주 근거 (80자)

[핵심_직무_적성]: 맞는 직무 3~5가지 + 이유, 맞지 않는 직무 1가지 (150자)
  ※ 정보·데이터·리스크·품질·감사·기획·컨설팅 등

[포지셔닝_전략]: 현재 대운 역할 재정의 (150자)
  → 1단계 사내 전환 / 2단계 외부 브랜딩(강의·컨설팅·자격) / 3단계 개인 브랜드
  → "이 분야 설명은 {{dayPillarLabel}}" 인식 목표

[대운별_커리어_로드맵]: 현재~3년·3~7년·다음 대운 초·중후반·그다음 대운·평생 원칙 (200자)

[커리어_리스크_원칙]: 상관 직설 3단 + 결단 지연 방지 프레임 (80자)
  ※ 공로 인정→우리의 과제→대안 제시 / 정보 수집 기한·A·B안 비교`,

  opportunities: `■ S5 포착할 기회 5가지 · 커리어

출력 스키마:
{ "opportunities": [{ "title": "string", "body": "string", "tip": "string" }] }

{{narrative}}

정확히 5개. 교육·컨설팅 포지셔닝 / 전문 직무 전환 / 실물자산 캐시플로 / 사내 PM·전략 / 세컨드 커리어 각 1개.
title 4~12자, body에 대운·시기 (90자), tip은 "잡는 법:" 1·2·3단계 (110자).`,

  risks: `■ S6 예측 리스크 4가지 + 대비책 · 커리어

출력 스키마:
{ "risks": [{ "title": "string", "body": "string", "countermeasure": "string" }] }

{{narrative}}

정확히 4개. 상관 직설 갈등 / 결단 지연 / 번아웃 / 재정 복잡화.
리스크1: 공로 인정→우리의 과제→대안 3단. 리스크2: 정보 수집 기한·2~3인 자문단.`,

  roadmap: `■ S7 시간 로드맵 + 결정 스크립트 · 대운 단위

출력 스키마:
{
  "roadmap": [{ "period": "string", "label": "string", "body": "string" }],
  "decisionMoments": [{ "situation": "string", "script": "string" }]
}

{{narrative}}

roadmap 6항목 (각 80자 내외):
- 현재~3년: 포지셔닝·역할 전환
- 3~7년: 브랜드·자산 구조화
- 다음 대운 초반: 세컨드 커리어 론칭
- 다음 대운 후반: 지식 자산 수확·후배 양성
- 이후 대운: 안정·정리·선택적 활동
- 평생 관통: 정보·분석·기획 중심

decisionMoments 4항목 (script 큰따옴표, 80자):
- 협상 망설임 / 비효율 지적 / 이직·전환 제안 / 투자·동업 제안

결정프레임 Q1~Q3는 roadmap 마지막 body:
- 분석·기획·조율 강점 활용?
- 3년 뒤 위치?
- 최악 시나리오 감당?`,

  prophecy: `■ S8 봉인 & 천명 · 커리어

출력 스키마:
{
  "prophecy": { "short": "string", "full": "string" },
  "cohortInsight": { "body": "string" }
}

{{narrative}}

prophecy.short: 행운 요소 + 커리어 다짐(15자) 요약
prophecy.full: 커리어 2막·지식 자산·미래 연도, "준비량이 선택 폭 결정" (120자)
cohortInsight.body: 동일 구조 코호트 — 직무 전환·만족도·노후 자산 패턴 (120자)`,
};
