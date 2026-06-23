"use client";

import type { HumanPremiumReportPayload } from "@/lib/reports/human-premium/types";
import { BodyText, SectionHeading } from "./report-ui";

export function RisksSection({
  report,
  isKo,
}: {
  report: HumanPremiumReportPayload;
  isKo: boolean;
}) {
  const items = report.structured?.risks ?? [];

  return (
    <section id="section-risk" className="scroll-mt-24 space-y-6">
      <SectionHeading
        id="section-risk-heading"
        title={isKo ? "예측 리스크" : "Forecast risks"}
        subtitle={isKo ? "4가지 + 대비책" : "Four risks + countermeasures"}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((item, index) => (
          <article
            key={item.title}
            className="human-premium-paper rounded-lg border border-[var(--jig-obang-red)]/30 bg-[color-mix(in_srgb,var(--jig-obang-red)_10%,var(--jig-hanji))] p-6"
          >
            <p className="human-premium-label-caps text-[var(--jig-obang-red)]">
              {isKo ? "주의" : "Caution"} {index + 1}
            </p>
            <h3 className="human-premium-serif mt-2 text-lg font-semibold">{item.title}</h3>
            <BodyText body={item.body} className="mt-3 text-sm" />
            <p className="mt-4 rounded-lg border border-[var(--jig-obang-red)]/20 bg-white/50 px-4 py-3 text-sm">
              <span className="font-semibold text-[var(--jig-obang-red)]">
                {isKo ? "대비책" : "Countermeasure"}
              </span>
              {" · "}
              {item.countermeasure}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
