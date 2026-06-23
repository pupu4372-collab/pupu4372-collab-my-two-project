"use client";

import type { HumanPremiumReportPayload } from "@/lib/reports/human-premium/types";
import { BodyText, SectionHeading } from "./report-ui";

export function OpportunitiesSection({
  report,
  isKo,
}: {
  report: HumanPremiumReportPayload;
  isKo: boolean;
}) {
  const items = report.structured?.opportunities ?? [];

  return (
    <section id="section-opportunity" className="scroll-mt-24 space-y-6">
      <SectionHeading
        id="section-opportunity-heading"
        title={isKo ? "포착할 기회" : "Opportunities to catch"}
        subtitle={isKo ? "5가지 + 잡는 법" : "Five openings + how to catch them"}
      />
      <div className="grid grid-cols-1 gap-4">
        {items.map((item, index) => (
          <article
            key={item.title}
            className="human-premium-paper rounded-lg border border-[var(--jig-obang-blue)]/25 bg-[color-mix(in_srgb,var(--jig-obang-blue)_8%,var(--jig-hanji))] p-6"
          >
            <p className="human-premium-label-caps text-[var(--jig-obang-blue)]">
              {String(index + 1).padStart(2, "0")}
            </p>
            <h3 className="human-premium-serif mt-2 text-xl font-semibold">{item.title}</h3>
            <BodyText body={item.body} className="mt-3 text-sm" />
            <p className="mt-4 rounded-lg bg-white/60 px-4 py-3 text-sm font-medium text-[var(--jig-ink)]">
              <span className="text-[var(--jig-seal)]">
                {isKo ? "잡는 법" : "How to catch"}
              </span>
              {" · "}
              {item.tip}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
