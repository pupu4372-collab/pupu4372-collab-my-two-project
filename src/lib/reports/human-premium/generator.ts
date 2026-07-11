import { computeBasicSaju } from "@/lib/saju/engine";
import { resolveHumanBirthBasis, resolveSolarBirthDate } from "./birth-basis";
import {
  buildHumanSummary,
  buildHumanPremiumStructured,
  buildSajuChapters,
  flattenChapterSections,
  resolveReportType,
  sumChapterPages,
} from "./content";
import type {
  HumanPremiumReportInput,
  HumanPremiumReportPayload,
} from "./types";

export function buildHumanPremiumReport(
  input: HumanPremiumReportInput
): HumanPremiumReportPayload {
  const birthBasis = resolveHumanBirthBasis(input);
  const solarBirthDate = resolveSolarBirthDate(input);

  const saju = computeBasicSaju({
    petName: input.personName.trim(),
    species: "other",
    petGender: input.gender ?? null,
    birthDate: solarBirthDate,
    birthTime: input.birthTime,
    birthTimeUnknown: input.birthTimeUnknown,
    timezone: input.timezone,
    locale: input.locale,
    privacyConsent: input.privacyConsent,
  });

  // Saju (四柱/三柱) reports: skip ziwei chart compute and section/bullet embed.
  const summary = buildHumanSummary(input.personName, saju, input.locale);
  const reportType = resolveReportType(input.reportType);
  const structured = buildHumanPremiumStructured(saju, input.locale, reportType);
  const sajuChapters = buildSajuChapters(saju, input.locale, {
    birthTimeUnknown: input.birthTimeUnknown,
    reportType,
  });

  const sajuSectionCount = flattenChapterSections(sajuChapters).length;
  const sajuEstimatedPages = sumChapterPages(sajuChapters);

  const isKo = input.locale === "ko";

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    personName: input.personName.trim(),
    locale: input.locale,
    reportType,
    deliveryMode: input.deliveryMode,
    calendarType: input.calendarType,
    birthBasis,
    analysisMode: input.birthTimeUnknown ? "three_pillars" : "four_pillars",
    structured,
    cover: {
      title: isKo
        ? "지운자무애(知運者無礙) - 운명을 아는 자는 거침이 없나니."
        : summary.headline,
      subtitle: isKo
        ? "지관재(知觀齋)"
        : "Premium Lifetime Report",
      tagline: isKo
        ? "운명을 '아는 것(知)'에서 그치지 않고, 그 운명의 흐름을 멀리서 '관조(觀)'하며 대처하는 법을 익히는 서재와 같은 공간입니다."
        : "K-Saju pillars and lifetime guidance",
    },
    summary,
    saju: {
      dominantElement: saju.dominantElement,
      pillars: saju.pillars as unknown as Record<string, unknown>,
      elements: saju.elements as unknown as Record<string, unknown>[],
      chapters: sajuChapters,
      sectionCount: sajuSectionCount,
      estimatedPages: sajuEstimatedPages,
    },
    zodiac: {
      signKey: "",
      signName: "",
      chapters: [],
      sectionCount: 0,
      estimatedPages: 0,
    },
    totals: {
      sections: sajuSectionCount,
      estimatedPages: sajuEstimatedPages,
    },
  };
}
