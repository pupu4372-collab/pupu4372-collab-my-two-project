import { buildCarePointText } from "../src/lib/saju/care-point-copy";
import { enrichBasicResultDisplayFields, buildPersonalityTraitTags } from "../src/lib/saju/enrich-basic-result-display";
import { escapeHtml } from "../src/lib/saju/escape-html";
import { computePetSajuBundle } from "../src/lib/saju/engine";
import { applyPetInterpretationToBasicResponse } from "../src/lib/saju/llm/apply-pet-to-basic";
import type { PetInterpretationJson } from "../src/lib/saju/llm/types";
import type { PetSajuMapping } from "../src/lib/saju/pet-trait-mapping";
import { buildPillarsSummaryLine } from "../src/lib/saju/pillars-summary-line";
import { buildSajuNarrative } from "../src/lib/saju/saju-narrative";
import type { ElementKey, SajuBasicResponse } from "../src/lib/saju/types";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const ELEMENTS: ElementKey[] = ["wood", "fire", "earth", "metal", "water"];
const ELEMENT_FULL_KO: Record<ElementKey, string> = {
  wood: "목(木)·나무의 기운",
  fire: "화(火)·불의 기운",
  earth: "토(土)·땅의 기운",
  metal: "금(金)·쇠의 기운",
  water: "수(水)·물의 기운",
};

const sampleRequest = {
  petName: "우리푸",
  species: "cat" as const,
  petGender: "female" as const,
  birthDate: "2020-05-15",
  birthTime: "12:30",
  birthTimeUnknown: false,
  timezone: "Asia/Seoul",
  locale: "ko" as const,
  privacyConsent: true,
};

function mappingFor(dominant: ElementKey, weak: ElementKey, animalGroup: PetSajuMapping["animalGroup"]) {
  const { mapping } = computePetSajuBundle(sampleRequest);
  return { ...mapping, dominantElement: dominant, weakElement: weak, animalGroup };
}

console.log("=== narrative: 10 cases (dog/cat × 5 elements) ===");
for (const species of ["dog", "cat"] as const) {
  for (const dominant of ELEMENTS) {
    const weak = ELEMENTS[(ELEMENTS.indexOf(dominant) + 2) % ELEMENTS.length]!;
    const { result } = computePetSajuBundle({ ...sampleRequest, species });
    const mapping = mappingFor(dominant, weak, species);
    const narrative = buildSajuNarrative(result, mapping);
    const paragraphs = narrative.split("\n\n");
    assert(paragraphs.length === 3, `${species}/${dominant}: expected 3 paragraphs`);
    assert((narrative.match(/<strong>/g) ?? []).length === 3, `${species}/${dominant}: expected 3 bold tags`);
    assert(
      paragraphs[0]!.includes(`<strong>${ELEMENT_FULL_KO[dominant]}</strong>`),
      `${species}/${dominant}: dominant full gloss in p1`
    );
    assert(!paragraphs[1]!.includes(ELEMENT_FULL_KO[dominant]), `${species}/${dominant}: no full gloss repeat in p2`);
    assert(paragraphs[2]!.includes(ELEMENT_FULL_KO[weak]), `${species}/${dominant}: weak full gloss in p3`);
    console.log(`OK ${species}/${dominant}`);
  }
}

console.log("\n=== XSS: pet name escape ===");
const xssName = '<img src=x onerror=alert(1)>';
const { result: xssResult, mapping: xssMapping } = computePetSajuBundle({
  ...sampleRequest,
  petName: xssName,
});
const xssNarrative = buildSajuNarrative(xssResult, xssMapping);
assert(!xssNarrative.includes("<img"), "script/img tags must not appear raw");
assert(xssNarrative.includes(escapeHtml(xssName)), "pet name must be escaped");
console.log("OK pet name escaped");

console.log("\n=== pillars summary line ===");
const pillarsBundle = computePetSajuBundle(sampleRequest);
enrichBasicResultDisplayFields(pillarsBundle.result, pillarsBundle.mapping);
assert((pillarsBundle.result.pillarsSummaryLine ?? "").includes("<strong>"), "day pillar bold stored");
assert((pillarsBundle.result.pillarsSummaryLine ?? "").includes("일주"), "day pillar label");
console.log("Line:", pillarsBundle.result.pillarsSummaryLine);

const { result, mapping } = computePetSajuBundle(sampleRequest);
enrichBasicResultDisplayFields(result, mapping);
const sajuNarrative = result.sajuNarrative ?? buildSajuNarrative(result, mapping);

console.log("\n=== a) LLM vs saju narrative opening ===");
console.log("Saju narrative:", sajuNarrative.replace(/<[^>]+>/g, "").slice(0, 120) + "...");

const llmMock: PetInterpretationJson = {
  characterIntro: "우리푸 · 집안 대장",
  personality:
    "우리푸는 새로운 자극에 반응이 빠르고, 좋아하는 사람 옆에서는 애정 표현이 또렷해요. 혼자만의 시간도 소중히 여기는 편이에요.",
  healthNote: "수분 섭취와 규칙적인 휴식을 챙겨 주면 컨디션이 안정돼요.",
  compatibility: "천천히 다가가며 선택권을 존중해 주면 신뢰가 깊어져요.",
};

const llmResult: SajuBasicResponse = { ...result, story: result.story, traits: [...result.traits] };
applyPetInterpretationToBasicResponse(llmResult, llmMock, mapping, "openai");
enrichBasicResultDisplayFields(llmResult, mapping);
const storyLead = llmResult.story.split("\n\n")[0]?.slice(0, 120) ?? "";
console.log("LLM story lead:", storyLead + "...");

const plainNarrative = sajuNarrative.replace(/<[^>]+>/g, "");
const sajuOpensWithElement = /기운</.test(sajuNarrative) || /기운을 강하게 타고난/.test(plainNarrative);
const llmOpensSamePattern = /기운을 (강하게 )?타고/.test(storyLead) || /[木火土金水]|목\(/.test(storyLead);
console.log(
  sajuOpensWithElement && llmOpensSamePattern
    ? "WARN: possible duplicate element-style opening"
    : "OK: openings differ (saju uses element framing; LLM personality avoids it)"
);

console.log("\n=== c) care point empty healthFocus ===");
const emptyHealthMapping = {
  ...mapping,
  weakTraits: { ...mapping.weakTraits, healthFocus: [] },
};
assert(buildCarePointText(emptyHealthMapping, "ko") === null, "empty healthFocus -> null");

console.log("\n=== d) template path ===");
const templateBundle = computePetSajuBundle(sampleRequest);
enrichBasicResultDisplayFields(templateBundle.result, templateBundle.mapping);
assert(templateBundle.result.story.length > 0, "template story exists");
assert(templateBundle.result.traits.length > 0, "template traits exist");
assert(
  (templateBundle.result.sajuNarrative ?? "").includes("우리푸"),
  "template saju narrative renders"
);
assert(
  buildPillarsSummaryLine(templateBundle.result).includes("월주"),
  "pillars summary includes month pillar"
);
const templateTags = buildPersonalityTraitTags(templateBundle.mapping);
assert(templateTags.length >= 2, "template personality tags render");
assert(
  templateBundle.result.traits.join(",") === templateTags.join(","),
  "stored traits match mapping personality tags"
);
console.log("Template tags:", templateTags.join(", "));

console.log("\nAll verification checks passed.");
