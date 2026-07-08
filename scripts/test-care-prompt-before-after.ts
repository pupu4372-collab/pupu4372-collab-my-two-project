/**
 * Before/after sample for care-oriented base-prompt rules (daily · opportunities slot).
 * Run: npx tsx scripts/test-care-prompt-before-after.ts
 */
import { config } from "dotenv";
import { computeBasicSaju } from "../src/lib/saju/engine";
import { buildHumanPremiumFacts } from "../src/lib/reports/human-premium/facts";
import { resolveSolarBirthDate } from "../src/lib/reports/human-premium/birth-basis";
import { computeHumanSajuMappingFromPremiumBirth } from "../src/lib/saju/ksaju-adapter";
import {
  buildSlotPrompt,
} from "../src/lib/reports/human-premium/report-prompts";
import {
  applyPromptTemplate,
  buildPromptTemplateContext,
} from "../src/lib/reports/human-premium/report-prompts/template-vars";
import { resolvePromptProduct } from "../src/lib/reports/human-premium/report-prompts/registry";
import {
  REPORT_PROMPT_SYSTEM_BASE,
} from "../src/lib/reports/human-premium/report-prompts/base-prompt";
import {
  callClaudeJsonParsed,
  isClaudeEnabled,
} from "../src/lib/saju/llm/providers/claude-provider";
import {
  callOpenAiJsonParsed,
  isOpenAiEnabled,
} from "../src/lib/saju/llm/providers/openai-provider";
import type { PremiumPromptContext } from "../src/lib/saju/llm/prompts/premium-context";

config({ path: ".env.local" });
config({ path: ".env" });

const OLD_SYSTEM_BASE = `당신은 대한민국 최고의 명리학 전문가이자 전략 컨설턴트입니다.
{{reportTypeLabel}} 리포트를 작성합니다. 표지·수신란 메인 제목은 {{reportTypeLabel}}이며, 본문에서도 동일한 상품명을 일관되게 사용하십시오. 대상 호칭은 {{dayPillarLabel}}만 사용하십시오 (실명·이름 금지).

【공통 문체 규칙】
- 격조 있는 경어체 (~하십시오, ~입니다)
- 핵심 명리 용어는 한자(漢字) 병기
- 부정적 단언 금지 → 조건부 표현만
- 단점은 "다만 ~을 의식하면 오히려 강점이 됩니다"로 재프레이밍
- 입력 팩트만 사용, 추측 금지
- 반드시 순수 JSON만 출력 (마크다운 코드블록 없음)
- 오행·십신·용어 표기는 한글+한자만 사용. 로마자(Su, Hwa, Mok, Geum, To 등
  발음기호) 절대 사용 금지. 입력 데이터에 로마자가 포함되어 있더라도
  출력할 때는 한글+한자 표기로 변환할 것 (예: "Su(수, 水)" → "수(水)")`;

const baseInput = {
  personName: "테스트",
  email: "test@example.com",
  birthDate: "1990-05-15",
  birthTime: "14:30",
  birthTimeUnknown: false,
  timezone: "Asia/Seoul",
  calendarType: "solar" as const,
  locale: "ko" as const,
  privacyConsent: true,
  gender: "male" as const,
};

const SAMPLE_NARRATIVE =
  "오늘은 말과 결정이 빠르게 흐르는 날입니다. 오전에는 정리와 연락, 오후에는 관계 대화에 에너지가 모입니다.";

async function callLlm(prompts: { system: string; user: string }) {
  if (isClaudeEnabled()) return callClaudeJsonParsed(prompts, 2048);
  if (isOpenAiEnabled()) return callOpenAiJsonParsed(prompts, 2048);
  return null;
}

function firstOpportunity(data: unknown) {
  const opps = (data as { opportunities?: { title: string; body: string; tip: string }[] })
    ?.opportunities;
  return opps?.[0] ?? null;
}

async function main() {
  const solarBirthDate = resolveSolarBirthDate(baseInput);
  const saju = computeBasicSaju({
    petName: baseInput.personName,
    species: "other",
    birthDate: solarBirthDate,
    birthTime: baseInput.birthTime,
    birthTimeUnknown: baseInput.birthTimeUnknown,
    timezone: baseInput.timezone,
    locale: baseInput.locale,
    privacyConsent: true,
    petGender: baseInput.gender,
  });

  const facts = buildHumanPremiumFacts(
    saju,
    "four_pillars",
    baseInput.personName,
    baseInput.locale,
    { timezone: baseInput.timezone, gender: baseInput.gender }
  );

  const mapping = computeHumanSajuMappingFromPremiumBirth({
    birthDate: solarBirthDate,
    birthTime: baseInput.birthTime,
    birthTimeUnknown: baseInput.birthTimeUnknown,
    gender: baseInput.gender,
    locale: baseInput.locale,
  });

  const day = saju.pillars.day;
  const dayPillarLabel = `${day.pillar} 일주`;

  const ctx: PremiumPromptContext = {
    mapping,
    saju,
    facts,
    locale: "ko",
    reportType: "daily",
    analysisMode: "four_pillars",
    dayPillarLabel,
    solarBirthDate,
    birthTime: baseInput.birthTime,
    birthTimeUnknown: baseInput.birthTimeUnknown,
    gender: baseInput.gender,
  };

  const productKey = resolvePromptProduct(ctx);
  const vars = buildPromptTemplateContext(
    ctx,
    productKey,
    "pillar block omitted for brevity",
    "하루 × 행운 — 오늘~이번 주 실행 행동",
    SAMPLE_NARRATIVE
  );

  const afterPrompts = buildSlotPrompt("opportunities", ctx, {
    pillarBlock: "pillar block omitted for brevity",
    focus: "하루 × 행운 — 오늘~이번 주 실행 행동",
    narrative: SAMPLE_NARRATIVE,
  });

  if (!afterPrompts) {
    console.error("No opportunities slot prompt for daily.");
    process.exit(1);
  }

  const beforeSystem = applyPromptTemplate(OLD_SYSTEM_BASE, vars);
  const beforePrompts = { system: beforeSystem, user: afterPrompts.user };

  if (!isClaudeEnabled() && !isOpenAiEnabled()) {
    console.log("SKIP LLM — API keys not set. System prompt diff only:\n");
    console.log("--- BEFORE (excerpt) ---");
    console.log(beforeSystem.slice(0, 500));
    console.log("\n--- AFTER (excerpt) ---");
    console.log(afterPrompts.system.slice(0, 700));
    process.exit(0);
  }

  console.log("Generating BEFORE sample (old base rules)…");
  const beforeJson = await callLlm(beforePrompts);
  console.log("Generating AFTER sample (care-oriented rules)…");
  const afterJson = await callLlm(afterPrompts);

  const before = firstOpportunity(beforeJson);
  const after = firstOpportunity(afterJson);

  console.log("\n========== BEFORE (기회 1건) ==========");
  console.log(JSON.stringify(before, null, 2));

  console.log("\n========== AFTER (기회 1건) ==========");
  console.log(JSON.stringify(after, null, 2));

  console.log("\n========== 체크 ==========");
  const jargon = /편인|겁재|식신|상관|정재|비견|일간|일주|[甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥]/;
  console.log("BEFORE jargon hit:", before ? jargon.test(`${before.body}${before.tip}`) : "n/a");
  console.log("AFTER jargon hit:", after ? jargon.test(`${after.body}${after.tip}`) : "n/a");
  console.log("AFTER has concrete action cue:", after?.tip?.includes("초") || after?.tip?.includes("분") || after?.tip?.includes("오늘"));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
