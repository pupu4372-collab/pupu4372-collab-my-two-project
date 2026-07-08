import fs from "node:fs";
import path from "node:path";
import { renderPetPremiumPdf } from "../src/lib/reports/pet-premium/pdf";
import type { PetPremiumPdfPayload } from "../src/lib/reports/pet-premium/types";
import { computeCompatibility } from "../src/lib/saju/compatibility/engine";
import { dominantElementLabel } from "../src/lib/saju/pet-lucky-scores";
import { computePetSajuBundle } from "../src/lib/saju/engine";
import { getTodayKstDateString } from "../src/lib/saju/zodiac/fortunes";
import { computeZodiacFortune } from "../src/lib/saju/zodiac/engine";

function buildSamplePayload(): PetPremiumPdfPayload {
  const petName = "러럴";
  const locale = "ko" as const;
  const birthDate = "2020-06-22";
  const timezone = "Asia/Seoul";

  const { mapping } = computePetSajuBundle({
    petName,
    species: "dog",
    birthDate,
    calendarType: "solar",
    birthTime: null,
    birthTimeUnknown: true,
    timezone,
    locale,
    privacyConsent: true,
  });

  const compatibility = computeCompatibility({
    petName,
    ownerName: "집사",
    species: "dog",
    petGender: "male",
    ownerGender: "female",
    petBirthDate: birthDate,
    petBirthTime: null,
    petBirthTimeUnknown: true,
    ownerBirthDate: "1992-03-15",
    ownerBirthTime: null,
    ownerBirthTimeUnknown: true,
    timezone,
    locale,
  });

  const zodiac = computeZodiacFortune({
    petName,
    species: "dog",
    birthDate,
    locale,
  });

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    issuedDateKst: getTodayKstDateString(),
    locale,
    petName,
    species: "dog",
    speciesLabel: "강아지",
    dominantElement: mapping.dominantElement,
    dominantElementLabel: dominantElementLabel(mapping.dominantElement, locale),
    mbti: {
      mbtiType: "ENFP",
      axisPercents: {
        EI: { E: 72, I: 28 },
        SN: { S: 35, N: 65 },
        TF: { T: 40, F: 60 },
        JP: { J: 38, P: 62 },
      },
      personalityBlend:
        "러럴이는 새로운 자극에 반응이 빠르고, 사람 곁에서 에너지를 회복하는 타입이에요. 산책·놀이·칭찬 루틴이 잘 맞습니다.",
      sajuCombo:
        "수(水) 기운의 관찰력과 ENFP의 호기심이 만나, 낯선 환경도 천천히 탐색하며 적응하는 패턴이에요.",
      butlerFit:
        "집사님과 함께하는 시간이 많을수록 러럴이는 안정감을 느껴요. 짧고 자주 교감하는 루틴이 좋아요.",
      health: "소음·급한 변화에 스트레스를 받을 수 있어요. 조용한 휴식 공간을 마련해 주세요.",
      dailyCare: "하루 한 번 눈 맞춤 인사, 10분 산책, 간식은 칭찬 후에만 주는 규칙을 추천해요.",
      narrativeSource: "template",
    },
    compatibility,
    zodiac,
  };
}

async function main() {
  const payload = buildSamplePayload();
  const pdf = await renderPetPremiumPdf(payload);
  const outDir = path.join(process.cwd(), "tmp");
  const outFile = path.join(outDir, "pet-premium-sample.pdf");

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, pdf);

  console.log(`Wrote ${outFile} (${pdf.length} bytes)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
