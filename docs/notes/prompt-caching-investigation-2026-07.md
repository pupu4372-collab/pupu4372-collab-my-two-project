# Anthropic 프롬프트 캐싱 조사 (2026-07)

## 조사 배경

집사(K-Saju) 프리미엄 리포트 파이프라인의 Anthropic API 입력 비용 절감을 위해, Prompt Caching(`cache_control`) 도입을 검토했다.  
(앱 내부 `saju_llm_cache` 테이블·Gemini 경로와는 별개.)

## 결론

**보류** — 현재 구조·트래픽에서는 도입하지 않는다.

## 사유

1. **system 단독 캐시 불가**  
   조립된 system 프롬프트는 약 ~800 tokens 수준으로, Anthropic Sonnet 계열 캐싱 최소 길이(**1,024 tokens**)에 미달한다. system에만 `cache_control`을 붙여도 조용히 미캐시될 수 있다.

2. **공통 접두(prefix) 규모**  
   동일 리포트의 스테이지 간 공통 접두(system 동일분 + user LCP, `■ S` 슬롯 분기 직전)는 측정상 약 **1,200~1,600 tokens**. 최소 기준은 넘기나, 절감 폭은 접두 재사용분에 한정된다.

3. **트래픽 대비 절감액**  
   현 트래픽 규모에서는 캐싱으로 인한 입력 비용 절감이 실무상 무의미한 수준으로 판단한다.

## 재검토 조건

다음 중 하나에 해당하면 재조사한다.

- 리포트 생성 트래픽이 유의미하게 증가한 경우
- `base-prompt` / 공통 규칙 토큰 수가 늘어 캐싱이 확실히 이득인 규모가 된 경우  
  (예: system 단독 ≥ 1,024, 또는 조립 재편으로 정적 접두가 크게 늘어난 경우)

## 참고 (조사 시점 스냅샷)

- 조립: `buildSlotPrompt` → `REPORT_PROMPT_SYSTEM_BASE` + `REPORT_PROMPT_USER_INPUT` + `SLOTS[slot]`
- Claude 호출: `claude-provider.ts` (`cache_control` 미사용)
- 스테이지 분기점: user의 `\n\n■ S` (S2~S8)
- 상세 측정·재편 후보 목록은 2026-07-13 조사 세션 기록 참고
