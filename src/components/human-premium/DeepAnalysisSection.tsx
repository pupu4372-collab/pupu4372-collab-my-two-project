"use client";

import type { HumanPremiumReportPayload } from "@/lib/reports/human-premium/types";
import { findSectionBody } from "./report-helpers";
import { BodyText, SectionHeading } from "./report-ui";

export function DeepAnalysisSection({
  report,
  isKo,
}: {
  report: HumanPremiumReportPayload;
  isKo: boolean;
}) {
  const body = findSectionBody(report, "section-depth");
  if (!body.trim()) return null;

  return (
    <section id="section-depth" className="scroll-mt-24 space-y-6">
      <SectionHeading
        id="section-depth-heading"
        title={isKo ? "심층 분석" : "Deep analysis"}
        subtitle={isKo ? "마스터 내러티브 · 대운 스토리" : "Master narrative · major cycles"}
      />
      <article className="human-premium-paper-warm border-l-4 border-[var(--jig-seal)] p-8 sm:p-10">
        <BodyText body={body} className="human-premium-serif text-lg leading-[2]" />
      </article>
    </section>
  );
}
