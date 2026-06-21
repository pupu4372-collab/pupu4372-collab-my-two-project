/**
 * LLM cache key stability smoke test
 * Run: npm run test:llm-cache-keys
 */
import { buildHumanPremiumSectionCacheKey, buildInterpretCacheKey } from "@/lib/saju/llm/cache-keys";
import type { HumanPremiumFactsBlock } from "@/lib/reports/human-premium/facts";
import type { PetSajuMapping } from "@/lib/saju/pet-trait-mapping";

const mapping = {
  dominantElement: "water",
  dominantTraits: { personality: ["a"], healthFocus: ["b"], activityStyle: ["c"] },
  weakTraits: { personality: [], healthFocus: [], activityStyle: [] },
  dayMasterArchetype: { keyword: "k", description: "d" },
  balanceScore: 50,
} as unknown as PetSajuMapping;

const key1 = buildInterpretCacheKey(
  { tier: "pet", mapping, locale: "ko", petName: "뭉치" },
  "claude",
  "claude-sonnet-4-20250514"
);
const key2 = buildInterpretCacheKey(
  { tier: "pet", mapping, locale: "ko", petName: "뭉치" },
  "claude",
  "claude-sonnet-4-20250514"
);
const key3 = buildInterpretCacheKey(
  { tier: "pet", mapping, locale: "ko", petName: "다른이름" },
  "claude",
  "claude-sonnet-4-20250514"
);

console.log("interpret key stable:", key1 === key2);
console.log("interpret key name-sensitive:", key1 !== key3);

const facts = {
  analysisMode: "four_pillars",
  ilganStem: "甲",
  dominantElement: "wood",
  elements: [],
  pillars: { year: "y", month: "m", day: "d", hour: "h" },
  sipseong: [],
  daewoon: { candidates: [], note: "" },
  shinsal: [],
  seun: { year: 2026, pillar: "p", stemTenGod: "s", branchTenGod: "b", natalInteractions: [] },
  monthlyLuck: [],
} as unknown as HumanPremiumFactsBlock;

const sectionKey1 = buildHumanPremiumSectionCacheKey({
  sectionKey: "temperament",
  locale: "ko",
  model: "gemini-2.5-flash",
  facts,
});
const sectionKey2 = buildHumanPremiumSectionCacheKey({
  sectionKey: "temperament",
  locale: "ko",
  model: "gemini-2.5-flash",
  facts,
});

console.log("section key stable:", sectionKey1 === sectionKey2);
process.exit(key1 === key2 && key1 !== key3 && sectionKey1 === sectionKey2 ? 0 : 1);
