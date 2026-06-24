import { formatHumanPremiumError } from "@/lib/reports/human-premium/client-errors";
import { computeBasicSaju } from "@/lib/saju/engine";
import { buildHumanSummary } from "@/lib/reports/human-premium/content";
import { resolveSolarBirthDate } from "@/lib/reports/human-premium/birth-basis";
import { parseHumanPremiumReportInput } from "@/lib/reports/human-premium/service";
import { ELEMENT_META } from "@/lib/saju/elements";
import type { ElementKey } from "@/lib/saju/types";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  try {
    const input = parseHumanPremiumReportInput(body);
    const solarBirthDate = resolveSolarBirthDate(input);
    const saju = computeBasicSaju({
      petName: input.personName.trim(),
      species: "other",
      birthDate: solarBirthDate,
      birthTime: input.birthTime,
      birthTimeUnknown: input.birthTimeUnknown,
      timezone: input.timezone,
      locale: input.locale,
      privacyConsent: true,
      petGender: input.gender ?? null,
    });

    const summary = buildHumanSummary(input.personName, saju, input.locale);
    const day = saju.pillars.day;
    const dominant = ELEMENT_META[saju.dominantElement as ElementKey];
    const isKo = input.locale === "ko";

    return NextResponse.json({
      dayPillar: day.pillar,
      dayStem: day.stemLabel,
      dayBranch: day.branchLabel,
      dayPillarNickname: isKo ? `${day.pillar} 일주` : `${day.pillar} day pillar`,
      dominantElement: isKo
        ? `${dominant.romanized}(${dominant.hangul})`
        : dominant.romanized,
      story: summary.story,
      traits: summary.traits,
      analysisMode:
        input.birthTimeUnknown || !saju.pillars.hour ? "three_pillars" : "four_pillars",
    });
  } catch (err) {
    const raw = err instanceof Error ? err.message : "Preview failed.";
    const locale = body?.locale === "en" ? "en" : "ko";
    return NextResponse.json(
      { error: formatHumanPremiumError(raw, locale) },
      { status: 400 }
    );
  }
}
