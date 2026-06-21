/**
 * ksaju-engine + trait mapping smoke test (Desktop bundle cases)
 * Run: npm run test:ksaju-mapping
 */
import { extractDayMaster, extractElementsFromSaju } from "@/lib/saju/extract-elements";
import { calculateSaju, type BirthInput } from "@/lib/saju/ksaju-engine";
import { mapToPetTraits, type AnimalGroup } from "@/lib/saju/pet-trait-mapping";

function runCase(label: string, birth: BirthInput, group: AnimalGroup) {
  console.log(`\n========== ${label} (${group}) ==========`);
  const saju = calculateSaju(birth);
  console.log("사주:", saju.pillars.map((p) => p.ganzi).join(" "));

  const elements = extractElementsFromSaju(saju);
  const dayMaster = extractDayMaster(saju);
  const mapping = mapToPetTraits(elements, dayMaster, group);

  console.log("주도 오행:", mapping.dominantElement, "→", mapping.dominantTraits.personality.join(" / "));
  console.log("일간 캐릭터:", `[${mapping.dayMasterArchetype.keyword}]`, mapping.dayMasterArchetype.description);
  console.log("균형 점수:", mapping.balanceScore, "/100");
}

runCase(
  "테스트견 뭉치",
  { year: 1971, month: 10, day: 6, hour: 0, minute: 30, gender: "M", isLunar: true },
  "dog"
);
runCase("테스트묘 나비", { year: 2022, month: 6, day: 15, hour: 14, minute: 0, gender: "F" }, "cat");
runCase("테스트도마뱀 도도", { year: 2023, month: 3, day: 3, hour: 9, minute: 0, gender: "M" }, "reptile");

console.log("\n========== EN sample (dog) ==========");
const enBirth = { year: 2022, month: 6, day: 15, hour: 14, minute: 0, gender: "F" as const, isLunar: false };
const enSaju = calculateSaju(enBirth);
const enMapping = mapToPetTraits(
  extractElementsFromSaju(enSaju),
  extractDayMaster(enSaju),
  "dog",
  "en"
);
console.log("Day master:", `[${enMapping.dayMasterArchetype.keyword}]`, enMapping.dayMasterArchetype.description);
console.log("Dominant:", enMapping.dominantTraits.personality.join(" / "));
console.log("Compatibility:", enMapping.dominantTraits.compatibilityTag);
