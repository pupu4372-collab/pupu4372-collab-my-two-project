"use client";

import type { HumanPremiumReportPayload } from "@/lib/reports/human-premium/types";
import {
  normalizeOpportunityTip,
  sanitizeLlmSlotText,
} from "@/lib/saju/llm/slot-output-sanitize";
import { BodyText, SectionHeading } from "./report-ui";

export function OpportunitiesSection({
  report,
  isKo,
}: {
  report: HumanPremiumReportPayload;
  isKo: boolean;
}) {
  const items = report.structured?.opportunities ?? [];
  const subtitle = isKo
    ? `${items.length}가지 + 잡는 법`
    : `${items.length} openings + how to catch them`;

  return (
    <section id="section-opportunity" className="scroll-mt-24 space-y-6">
      <SectionHeading
        id="section-opportunity-heading"
        title={isKo ? "다가올 행운과 기회" : "Opportunities to catch"}
        subtitle={subtitle}
      />
      <div className="grid grid-cols-1 gap-4">
        {items.map((item, index) => (
          <article
            key={item.title}
            className="rounded-lg border p-6"
            style={{
              backgroundColor: "color-mix(in srgb, #dcfce7 55%, var(--jig-hanji))",
              borderColor: "color-mix(in srgb, #86efac 35%, transparent)",
            }}
          >
            <p
              className="human-premium-label-caps"
              style={{ color: "color-mix(in srgb, #4ade80 55%, var(--jig-muted))" }}
            >
              {String(index + 1).padStart(2, "0")}
            </p>
            <h3 className="human-premium-serif mt-2 text-xl font-semibold">{item.title}</h3>
            <BodyText body={item.body} className="mt-3 text-sm" locale={report.locale} />
            <p
              className="mt-4 rounded-lg px-4 py-3 text-sm font-medium text-[var(--jig-ink)]"
              style={{
                backgroundColor: "color-mix(in srgb, #ecfdf5 70%, white)",
              }}
            >
              <span style={{ color: "color-mix(in srgb, #22c55e 50%, var(--jig-seal))" }}>
                {isKo ? "잡는 법" : "How to catch"}
              </span>
              {" · "}
              {normalizeOpportunityTip(
                sanitizeLlmSlotText("display:opportunity.tip", item.tip, report.locale)
              )}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
