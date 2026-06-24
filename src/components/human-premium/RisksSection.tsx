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
            className="rounded-lg border p-6"
            style={{
              backgroundColor: "color-mix(in srgb, #fdf2f8 65%, var(--jig-hanji))",
              borderColor: "color-mix(in srgb, var(--jig-obang-red) 42%, transparent)",
            }}
          >
            <p
              className="human-premium-label-caps"
              style={{ color: "color-mix(in srgb, var(--jig-obang-red) 65%, var(--jig-muted))" }}
            >
              {isKo ? "주의" : "Caution"} {index + 1}
            </p>
            <h3 className="human-premium-serif mt-2 text-lg font-semibold">{item.title}</h3>
            <BodyText body={item.body} className="mt-3 text-sm" />
            <p
              className="mt-4 rounded-lg border px-4 py-3 text-sm"
              style={{
                backgroundColor: "color-mix(in srgb, #fff1f2 75%, white)",
                borderColor: "color-mix(in srgb, var(--jig-obang-red) 33%, transparent)",
              }}
            >
              <span
                className="font-semibold"
                style={{ color: "color-mix(in srgb, var(--jig-obang-red) 80%, var(--jig-seal))" }}
              >
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
