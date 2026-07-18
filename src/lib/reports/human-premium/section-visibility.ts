import type { HumanPremiumReportPayload, HumanPremiumSectionId } from "./types";
import { HUMAN_PREMIUM_SECTION_IDS } from "./types";
import { sanitizeLlmSlotText } from "@/lib/saju/llm/slot-output-sanitize";

export function findChapterSection(
  report: HumanPremiumReportPayload,
  sectionId: string
): { section: (typeof report.saju.chapters)[number]["sections"][number]; chapterTitle: string } | null {
  for (const chapter of report.saju.chapters) {
    const section = chapter.sections.find((item) => item.id === sectionId);
    if (section) {
      return { section, chapterTitle: chapter.title };
    }
  }
  return null;
}

export function sectionBodyText(
  report: HumanPremiumReportPayload,
  sectionId: string
): string {
  const meta = findChapterSection(report, sectionId);
  const raw = meta?.section.body.trim() ?? "";
  if (!raw) return "";
  return sanitizeLlmSlotText(`display:${sectionId}`, raw, report.locale);
}

/** Sections omitted on web and PDF (e.g. daily reports with no deep-analysis LLM body). */
export function isHumanPremiumSectionVisible(
  report: HumanPremiumReportPayload,
  sectionId: HumanPremiumSectionId
): boolean {
  if (sectionId === "section-depth") {
    const hasBody = sectionBodyText(report, sectionId).length > 0;
    const s = report.structured;
    return Boolean(
      hasBody ||
        s?.domainScores?.length ||
        s?.luckyDates?.length ||
        s?.deepSections?.length ||
        s?.yearCards?.length ||
        s?.lifeCycles?.length
    );
  }
  return true;
}

export function visibleHumanPremiumSectionIds(
  report: HumanPremiumReportPayload
): HumanPremiumSectionId[] {
  return HUMAN_PREMIUM_SECTION_IDS.filter((id) =>
    isHumanPremiumSectionVisible(report, id)
  );
}
