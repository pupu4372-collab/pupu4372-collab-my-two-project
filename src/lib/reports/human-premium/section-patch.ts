import type { HumanPremiumReportPayload } from "./types";

export function findSectionBody(
  payload: HumanPremiumReportPayload,
  sectionId: string
): string | null {
  for (const chapter of payload.saju.chapters) {
    const section = chapter.sections.find((s) => s.id === sectionId);
    if (section) return section.body;
  }
  for (const chapter of payload.zodiac.chapters) {
    const section = chapter.sections.find((s) => s.id === sectionId);
    if (section) return section.body;
  }
  return null;
}

export function patchSectionBody(
  payload: HumanPremiumReportPayload,
  sectionId: string,
  body: string
): boolean {
  for (const chapter of payload.saju.chapters) {
    const section = chapter.sections.find((s) => s.id === sectionId);
    if (section) {
      section.body = body;
      return true;
    }
  }
  for (const chapter of payload.zodiac.chapters) {
    const section = chapter.sections.find((s) => s.id === sectionId);
    if (section) {
      section.body = body;
      return true;
    }
  }
  return false;
}
