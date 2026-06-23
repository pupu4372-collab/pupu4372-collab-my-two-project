"use client";

import type { HumanPremiumReportPayload } from "@/lib/reports/human-premium/types";
import { BodyText, ScoreBar, SectionHeading } from "./report-ui";

export function KeyIndicatorsSection({
  report,
  isKo,
}: {
  report: HumanPremiumReportPayload;
  isKo: boolean;
}) {
  const scores = report.structured?.scores ?? [];

  return (
    <section id="section-metrics" className="scroll-mt-24 space-y-6">
      <SectionHeading
        id="section-metrics-heading"
        title={isKo ? "핵심 운세 지표" : "Key fortune indicators"}
        subtitle={isKo ? "6개 영역 /100" : "Six domains /100"}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {scores.map((item) => (
          <article
            key={item.label}
            className="human-premium-paper rounded-lg border border-[var(--jig-ink)]/8 p-5"
          >
            <div className="mb-3 flex items-end justify-between gap-3">
              <h3 className="human-premium-serif text-lg font-semibold">{item.label}</h3>
              <span className="text-2xl font-bold tabular-nums text-[var(--jig-seal)]">
                {item.score}
                <span className="text-sm font-medium text-[var(--jig-muted)]">/100</span>
              </span>
            </div>
            <ScoreBar score={item.score} />
            <BodyText body={item.description} className="mt-4 text-sm" />
          </article>
        ))}
      </div>
    </section>
  );
}
