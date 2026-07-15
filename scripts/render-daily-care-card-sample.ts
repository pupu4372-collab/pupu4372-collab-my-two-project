/**
 * Renders a sample today's-care PNG using the server SVG→sharp pipeline.
 * Usage: npx tsx scripts/render-daily-care-card-sample.ts
 * Output: tmp/daily-care-card-sample.png
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  buildPetDailyFortune,
  buildPetFortunePetMeta,
  type PetProfileForFortune,
} from "../src/lib/saju/pet-daily-fortune";
import { renderDailyCareCardPng } from "../src/lib/share/daily-fortune-care-card-png";

async function main() {
  const profile: PetProfileForFortune = {
    id: "sample",
    name: "코코",
    species: "dog",
    birthDate: "2020-05-12",
    birthTime: null,
    birthTimeUnknown: true,
    birthTimezone: "Asia/Seoul",
    profileImageUrl: null,
    photoUrl: null,
  };

  const locale = "ko";
  const fortune = buildPetDailyFortune(profile, locale);
  const pet = buildPetFortunePetMeta(profile, locale);
  const png = await renderDailyCareCardPng({ pet, fortune, isKo: true });

  const outDir = join(process.cwd(), "tmp");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "daily-care-card-sample.png");
  writeFileSync(outPath, png);
  console.log(`Wrote ${outPath} (${png.length} bytes)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
