/**
 * Verify that pet birthTime affects compatibility engine output.
 * Run: npx tsx scripts/verify-compatibility-birthtime.ts
 */
import { computeCompatibility } from "../src/lib/saju/compatibility/engine";
import { computeBasicSaju } from "../src/lib/saju/engine";
import type { CompatibilityRequest } from "../src/lib/saju/compatibility/engine";
import type { ElementDisplay } from "../src/lib/saju/types";

const BASE: Omit<
  CompatibilityRequest,
  "petBirthTime" | "petBirthTimeUnknown"
> = {
  petName: "우리푸",
  ownerName: "집사",
  species: "dog",
  petGender: "female",
  ownerGender: "female",
  petBirthDate: "2020-05-15",
  ownerBirthDate: "1990-08-20",
  ownerBirthTime: "09:30",
  ownerBirthTimeUnknown: false,
  timezone: "Asia/Seoul",
  locale: "ko",
};

type CaseLabel = "known_time" | "unknown_time";

function buildRequest(
  petBirthTime: string | null,
  petBirthTimeUnknown: boolean
): CompatibilityRequest {
  return {
    ...BASE,
    petBirthTime,
    petBirthTimeUnknown,
  };
}

function formatElements(elements: ElementDisplay[]): string {
  return elements
    .map((el) => `${el.romanized}(${el.hanja})=${el.count}`)
    .join(", ");
}

function snapshot(label: CaseLabel, request: CompatibilityRequest) {
  const petSaju = computeBasicSaju({
    petName: request.petName,
    species: request.species,
    birthDate: request.petBirthDate,
    birthTime: request.petBirthTime,
    birthTimeUnknown: request.petBirthTimeUnknown,
    timezone: request.timezone,
    locale: request.locale,
    privacyConsent: true,
  });
  const compat = computeCompatibility(request);

  return {
    label,
    input: {
      petBirthTime: request.petBirthTime,
      petBirthTimeUnknown: request.petBirthTimeUnknown,
      analysisMode: request.petBirthTimeUnknown ? "three_pillars" : "four_pillars",
    },
    petHourPillar: petSaju.pillars.hour?.pillar ?? "(none)",
    petDominantElement: petSaju.dominantElement,
    petElementDistribution: formatElements(petSaju.elements),
    bondScore: compat.bondScore,
    relation: compat.relation,
    petElementUsed: compat.petElement,
    ownerElementUsed: compat.ownerElement,
    petDayPillar: compat.petDayPillar,
    ownerDayPillar: compat.ownerDayPillar,
  };
}

function diffField(
  field: string,
  known: string | number,
  unknown: string | number
): string {
  const same = known === unknown;
  return `${field}: ${same ? "SAME" : "DIFF"} | known=${known} | unknown=${unknown}`;
}

function main() {
  const knownRequest = buildRequest("11:30", false);
  const unknownRequest = buildRequest(null, true);

  const known = snapshot("known_time", knownRequest);
  const unknown = snapshot("unknown_time", unknownRequest);

  console.log("=== Compatibility birthTime verification ===\n");
  console.log("Shared input (pet + butler):");
  console.log(JSON.stringify(BASE, null, 2));
  console.log("\n--- Case A: petBirthTime=11:30 ---");
  console.log(JSON.stringify(known, null, 2));
  console.log("\n--- Case B: petBirthTimeUnknown=true ---");
  console.log(JSON.stringify(unknown, null, 2));

  console.log("\n=== Diff report ===");
  const diffs = [
    diffField("petHourPillar", known.petHourPillar, unknown.petHourPillar),
    diffField("petDominantElement", known.petDominantElement, unknown.petDominantElement),
    diffField("petElementDistribution", known.petElementDistribution, unknown.petElementDistribution),
    diffField("bondScore", known.bondScore, unknown.bondScore),
    diffField("relation", known.relation, unknown.relation),
    diffField("petElementUsed", known.petElementUsed, unknown.petElementUsed),
    diffField("ownerElementUsed", known.ownerElementUsed, unknown.ownerElementUsed),
    diffField("petDayPillar", known.petDayPillar, unknown.petDayPillar),
  ];
  for (const line of diffs) console.log(line);

  const materialDiff =
    known.petHourPillar !== unknown.petHourPillar ||
    known.petElementDistribution !== unknown.petElementDistribution ||
    known.bondScore !== unknown.bondScore ||
    known.relation !== unknown.relation ||
    known.petElementUsed !== unknown.petElementUsed;

  console.log("\n=== Verdict ===");
  if (materialDiff) {
    console.log("PASS: birthTime changes compatibility output (engine uses hour pillar).");
    process.exit(0);
  }

  console.log("FAIL: known vs unknown produced identical material output.");
  console.log("\nTrace path (URL → API → engine):");
  console.log("1. URL/PremiumHub: birthTime query → parseBirthTimeSelect → petBirthTime + petBirthTimeUnknown");
  console.log("2. POST /api/saju/compatibility: body.petBirthTime, body.petBirthTimeUnknown");
  console.log("3. computeCompatibility → computeBasicSaju({ birthTime, birthTimeUnknown })");
  console.log("4. engine.ts: birthTimeUnknown ? null : birthTime → hour pillar + element count");
  console.log("\nIf step 2 receives birthTime=null + unknown=true for both cases, URL→API is broken.");
  console.log("If step 3 inputs differ but outputs match, dominant element may be unchanged for this sample — try another birthTime.");
  process.exit(1);
}

main();
