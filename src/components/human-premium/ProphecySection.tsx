"use client";

import type { HumanPremiumReportPayload } from "@/lib/reports/human-premium/types";
import { DEFAULT_REPORT_TYPE } from "@/lib/reports/human-premium/types";
import { BodyText, SectionHeading } from "./report-ui";

export function ProphecySection({
  report,
  isKo,
}: {
  report: HumanPremiumReportPayload;
  isKo: boolean;
}) {
  const reportType = report.reportType ?? DEFAULT_REPORT_TYPE;
  const prophecy = report.structured?.prophecy;
  const cohort = report.structured?.cohortInsight;
  const sealed =
    reportType === "lifetime" && prophecy?.full ? prophecy.full : prophecy?.short ?? "";
  const mantra = isKo
    ? "운명을 아는 자는 거침이 없나니 — 지금의 선택이 다음 계절을 만듭니다."
    : "He who knows his destiny moves without obstacle — today's choice shapes the next season.";

  return (
    <section id="section-prophecy" className="scroll-mt-24 space-y-6">
      <SectionHeading
        id="section-prophecy-heading"
        title={isKo ? "봉인된 예언 · COHORT INSIGHT" : "Sealed prophecy · cohort insight"}
        subtitle={
          reportType === "lifetime"
            ? isKo
              ? "풀버전"
              : "Full version"
            : isKo
              ? "요약"
              : "Short"
        }
      />
      <article className="rounded-2xl bg-[#2a2433] p-8 text-[#f4f1ea] shadow-inner sm:p-10">
        <p className="human-premium-label-caps text-[#d4a373]">
          {isKo ? "봉인된 예언" : "Sealed prophecy"}
        </p>
        <p className="human-premium-serif mt-4 text-lg italic leading-[2] text-[#f8f4ec]">
          {sealed}
        </p>
        <p className="mt-8 border-t border-white/10 pt-6 text-center human-premium-serif text-base italic text-[#e8dfd0]">
          {mantra}
        </p>
      </article>

      {cohort?.body ? (
        <article className="human-premium-lattice human-premium-paper rounded-lg p-6">
          <p className="human-premium-label-caps text-[var(--jig-seal)]">COHORT INSIGHT</p>
          <BodyText body={cohort.body} className="mt-3" />
        </article>
      ) : null}
    </section>
  );
}
