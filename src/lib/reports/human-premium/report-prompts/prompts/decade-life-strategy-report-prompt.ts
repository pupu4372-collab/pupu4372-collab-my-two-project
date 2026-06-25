import { REPORT_PROMPT_SCORE_RULES } from "../base-prompt";
import type { ReportSlotPromptMap } from "../prompt-definition";

/** No.11 · 10년 인생 청사진 (decade) — S4: 연도별 10카드+전환점 / S7: 연·세운 7단계 */
export const FOCUS_KO = "10년 대운 전략과 인생 로드맵 · 10년 인생 청사진";
export const FOCUS_EN = "10-year major-luck strategy · 10-Year Life Blueprint";

export const SLOTS: ReportSlotPromptMap = {
  "saju-structure": `■ S2 사주 구조 해석 · 10년 인생 전략

★ 연도 명시 필수. 슬로건: "확장보다 정리, 전면전보다 선택과 집중"
★ pillarBlock의 오행 수치(소수)·10년 세운 목록 반드시 참조

출력 스키마:
{ "sajuStructure": "string" }

총 650자 이내. sajuStructure 한 필드에 모두 담기.

[테마_단락]: 맨 앞 80자 — "'[테마 키워드]'는 [은유]… 이 원형은 '[10년 전략]'으로 전환할 때 빛납니다"

[오행_우세]: 10년 전략적 의미 + 소수 수치 언급 (50자)
[오행_결핍]: 대운 보충 여부 + 주의 (50자)
[오행_해설]: 10년 패턴 + "구조만 잘 잡으면 안정적 수입·자산 가능" (100자)

${REPORT_PROMPT_SCORE_RULES}

[십신_비견겁재]~[정인편인]: 각 60자, 10년 로드맵과 연결(언제 어떻게 발현)

[명리_진단]: 원국 → 현재 대운 10년 → 전반기/후반기 (200자, {{dayPillarLabel}}으로 시작)
  ※ 연도 구간 명시 + "덜 소모되면서 오래 가는 구조 설계" 마무리`,

  "master-narrative": `■ S3 핵심 운세 지표 + deep_narrative · 10년

출력 스키마:
{ "narrative": "string" }

총 680자 이내.

[지표 6개] 각 점수/100 + 설명 40자:
- 현재운세강도: 변화·선택 폭
- 시기적합도: 2막 설계·정리·브랜딩
- 기회포착력: 기회 풍부, 분산 주의
- 위기회피력: **65~72** — 우유부단·과배려, 기준 설정 필요
- 관계운: 인맥 넓되 가까운 소수 집중
- 재물흐름: 재성 강화 연도 구체 언급 (예: 2028~2029)

[심층서사]: 10년 4구간 흐름 (200자)
  ※ 2026~29 / 2030~31 / 2032~33 / 2034~35 각 핵심 과제 1줄
  ※ "강이 바다로 나가기 전 마지막 큰 굽이" 은유 + 마지막 "일은 줄이고 존재감은 남기기"`,

  "deep-analysis": `■ S4 심층 분석 · 10년 인생 청사진 전용 (이 리포트 핵심)

출력 스키마:
{ "deepAnalysis": "string" }

{{narrative}}

총 1,200자 이내. deepAnalysis 한 필드에 아래 순서대로 포함.

[연간_서두]: 10년 명리 성격 + "확장보다 정리, 선택과 집중" (100자)

[연도별_카드]: 발행 연도 기준 **10개 연도** 각각
  형식: "[YYYY년 (세운)] 점수: N — 세운 특성·원국 관계·핵심 과제" (50자)
  ※ 점수 65~88, 평균 75~80 / 완성 문장, 말줄임 금지

[주요_전환점]: 3개 (150자)
  • 1차: 연도범위+세운 — 구조 재편
  • 2차: 연도범위+세운 — 속도 조절·정리
  • 3차: 연도범위+세운 — 2막 씨앗`,

  opportunities: `■ S5 포착할 기회 5가지 · 10년 (연도 범위 필수)

출력 스키마:
{ "opportunities": [{ "title": "string", "body": "string", "tip": "string" }] }

{{narrative}}

정확히 5개 (PDF 기준):
1. 2028~2029 자산·커리어 구조 재설계
2. 전문성 2선 역할 전환
3. 인맥 정제·핵심 네트워크
4. 콘텐츠·지식 자산화
5. 건강 루틴·장기 퍼포먼스

title에 연도 범위 포함, body 세운·근거 (90자), tip "잡는 법:" 2단계 이상 (120자)
※ 각 기회 연도 언급 2회 이상`,

  risks: `■ S6 예측 리스크 4가지 + 대비책 · 10년

출력 스키마:
{ "risks": [{ "title": "string", "body": "string", "countermeasure": "string" }] }

{{narrative}}

정확히 4개 (PDF 기준):
1. 겁재 재정 분산·보증 손실 → 2026~ 정리 원칙
2. 과로·건강 악화 → 근무 상한 + 2030 이후 검진
3. 관계 피로·번아웃 (2030~2031) → 범위 명확화
4. 결정 지연·기회 상실 → 정보/결정 기한 원칙

대비책에 연도 명시`,

  roadmap: `■ S7 시간 로드맵 + 결정 스크립트 · 연·세운 7단계

출력 스키마:
{
  "roadmap": [{ "period": "string", "label": "string", "body": "string" }],
  "decisionMoments": [{ "situation": "string", "script": "string" }]
}

{{narrative}}

roadmap 7항목 (대운 단위 아님, 연도·세운):
- 2026~2027: 현황 파악·정리 시작
- 2028~2029: 재무·커리어 구조 재편
- 2030~2031: 속도 조절·건강 점검
- 2032: 2막 씨앗 심기
- 2033: 네트워크 재구성
- 2034~2035: 마무리·단순화
- 평생관통: 일간 전략 원칙 한 줄

decisionMoments 4항목 (script 큰따옴표 80자):
- 협상 망설임 / 보증·빌려주기 / 건강·일 줄이기 / 새 제안 결정 안 남
※ 상황4: "단순해지는가 복잡해지는가" + "지금은 맡은 일 정리 시기"

결정프레임 Q1~Q3는 roadmap 마지막 body:
- 단순 vs 복잡? / 3년 후에도 계속? / 없어도 괜찮은가?`,

  prophecy: `■ S8 봉인 & 천명 · 10년 (가장 구체적 예언)

출력 스키마:
{
  "prophecy": { "short": "string", "full": "string" },
  "cohortInsight": { "body": "string" }
}

{{narrative}}

prophecy.short: 행운색·방향·시간·숫자 + 10년 다짐(15자)
prophecy.full: **미래 연도 2개** + 각각 구체 장면(가족 자리·문서·씨앗 등) (120자)
cohortInsight.body: 동일 구조 코호트 — 구조조정·2선 전환·재정비 통계 (120자)`,
};
