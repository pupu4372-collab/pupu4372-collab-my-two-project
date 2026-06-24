"use client";

import type { HumanPremiumReportPayload } from "@/lib/reports/human-premium/types";
import { findSectionBody } from "./report-helpers";
import { BodyText, SectionHeading } from "./report-ui";

export function SajuStructureSection({
  report,
  isKo,
}: {
  report: HumanPremiumReportPayload;
  isKo: boolean;
}) {
  const body = findSectionBody(report, "section-structure");

  return (
    <section id="section-structure" className="scroll-mt-24 space-y-6">
      <SectionHeading
        id="section-structure-heading"
        title={isKo ? "사주 구조 해석" : "Chart structure"}
        subtitle={isKo ? "오행 · 십신 · 명리 진단" : "Elements · Ten Gods · frame"}
      />
      <article className="human-premium-paper rounded-lg p-6 sm:p-8">
        <BodyText body={body} className="human-premium-serif text-lg leading-[1.95]" />
      </article>
    </section>
  );
}
