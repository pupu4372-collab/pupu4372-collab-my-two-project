import type { ReportSlotPromptMap } from "../prompt-definition";
import {
  CARE_STYLE,
  COHORT_RULE,
  ELEMENT_DEFICIENCY_RULE,
  HANGUL_ONLY_RULE,
  OUTPUT_FORMAT_RULES,
  S3_SCORE_RULES_BLOCK,
  S3_SCORES_SCHEMA,
  SCORE_CITATION_RULE,
} from "../newgen-common";

/** No.01 · 커리어 빌드업 (career) */
export const FOCUS_KO =
  "커리어 빌드업 — 직장·성장·성과의 방향을 대운 단위로 설계한다. 조언은 실행 가능한 포지셔닝·전환 행동으로.";
export const FOCUS_EN =
  "Career Build-up — design work, growth, and recognition across major-luck cycles with executable positioning moves.";

export const SLOTS: ReportSlotPromptMap = {
  "saju-structure": `■ S2 사주 구조 해석 · 커리어

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${ELEMENT_DEFICIENCY_RULE}

출력 스키마:
{ "sajuStructure": "string" }

총 600자. 자연 문단만 (내부 라벨 금지).
우세/결핍(최저 %만)·커리어 강약·현재→다음 대운 흐름을 일상어로.
${CARE_STYLE}`,

  "master-narrative": `■ S3 핵심 운세 지표 + narrative · 커리어

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${ELEMENT_DEFICIENCY_RULE}
${SCORE_CITATION_RULE}

출력 스키마:
${S3_SCORES_SCHEMA}

${S3_SCORE_RULES_BLOCK}

scores description 각 40자, 커리어 맥락:
현재운세강도(대운 커리어 에너지) / 시기적합도(전환·브랜딩) / 기회포착력(네트워크) /
위기회피력(50~72, 직설·관계 리스크) / 관계운(동료·파트너) / 재물흐름(꾸준 수입)

narrative 200자: 20대~현재 대운 커리어 + 이후 전환. 영역 N/10 언급 금지.`,

  "deep-analysis": `■ S4 심층 분석 · 커리어 빌드업

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${SCORE_CITATION_RULE}

출력 스키마:
{
  "intro": "string",
  "sections": [
    { "title": "string", "body": "string" }
  ]
}

{{narrative}}

intro: 커리어 서두만 (80~100자). 섹션 본문·점수 몰아넣기 금지.
sections 정확히 5개, title 고정:
1) "커리어 3단 진화" — 현장→중간→최종 + 근거 (80자)
2) "핵심 직무 적성" — 맞는 직무 3~5 + 맞지 않는 1 (150자)
3) "포지셔닝 전략" — 사내 전환→외부 브랜딩→개인 브랜드 (150자)
4) "대운별 커리어 로드맵" — 현재~다음 대운 (200자)
5) "커리어 리스크 원칙" — 직설 3단·결단 프레임 (80자)`,

  opportunities: `■ S5 포착할 기회 5가지 · 커리어

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${SCORE_CITATION_RULE}

출력 스키마:
{ "opportunities": [{ "title": "string", "body": "string", "tip": "string" }] }

{{narrative}}

정확히 5개. tip에 "잡는 법:" 금지. title 12자 이내, body·tip 각 80~120자.`,

  risks: `■ S6 예측 리스크 4가지 · 커리어

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}

출력 스키마:
{ "risks": [{ "title": "string", "body": "string", "countermeasure": "string" }] }

{{narrative}}

정확히 4개. countermeasure에 "대비책:" 금지.`,

  roadmap: `■ S7 시간 로드맵 · 대운 단위

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}
${SCORE_CITATION_RULE}

출력 스키마:
{
  "roadmap": [{ "period": "string", "label": "string", "body": "string" }],
  "decisionMoments": [{ "situation": "string", "script": "string" }]
}

{{narrative}}

roadmap 6항목: 현재~3년 / 3~7년 / 다음 대운 초반 / 다음 대운 후반 / 이후 대운 / 평생 관통
decisionMoments 4: 협상 망설임 / 비효율 지적 / 이직·전환 / 투자·동업
script는 따옴표 없이 구어 대사만.`,

  prophecy: `■ S8 잠겨진 천명 · 커리어

${HANGUL_ONLY_RULE}
${OUTPUT_FORMAT_RULES}

출력 스키마:
{
  "prophecy": { "short": "string", "full": "string" },
  "cohortInsight": { "body": "string" }
}

{{narrative}}

prophecy.short: 행운 요소 + 커리어 다짐(15자)
prophecy.full: 커리어 2막·지식 자산·미래 연도 2개 (120자). {{currentYear}} 이후만.
${COHORT_RULE}`,
};
