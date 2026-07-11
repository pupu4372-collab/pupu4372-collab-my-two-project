"use client";

import type { HumanPremiumReportPayload } from "@/lib/reports/human-premium/types";
import { DEFAULT_REPORT_TYPE } from "@/lib/reports/human-premium/types";
import {
  normalizeDecisionScriptQuotes,
  sanitizeLlmSlotText,
} from "@/lib/saju/llm/slot-output-sanitize";
import { BodyText, SectionHeading } from "./report-ui";

export function RoadmapSection({
  report,
  isKo,
}: {
  report: HumanPremiumReportPayload;
  isKo: boolean;
}) {
  const roadmap = report.structured?.roadmap ?? [];
  const moments = report.structured?.decisionMoments ?? [];
  const reportType = report.reportType ?? DEFAULT_REPORT_TYPE;
  const subtitle =
    reportType === "daily"
      ? isKo
        ? "오늘 시간대별 루틴 · 결정의 순간 4"
        : "Today's time bands · four decision moments"
      : isKo
        ? "대운별 전략 · 결정의 순간 4"
        : "Cycle strategy · four decision moments";

  return (
    <section id="section-roadmap" className="scroll-mt-24 space-y-6">
      <SectionHeading
        id="section-roadmap-heading"
        title={isKo ? "시간 로드맵" : "Time roadmap"}
        subtitle={subtitle}
      />
      <div className="space-y-4 border-l-2 border-[var(--jig-seal)]/30 pl-6">
        {roadmap.map((item) => (
          <article key={`${item.period}-${item.label}`} className="relative">
            <span className="absolute -left-[1.6rem] top-1 h-3 w-3 rounded-full bg-[var(--jig-seal)]" />
            <p className="human-premium-label-caps text-[var(--jig-muted)]">{item.period}</p>
            <h3 className="human-premium-serif text-lg font-semibold">{item.label}</h3>
            <BodyText body={item.body} className="mt-2 text-sm" />
          </article>
        ))}
      </div>

      <div className="mt-8 space-y-4">
        <h3 className="human-premium-serif text-xl font-semibold">
          {isKo ? "결정의 순간" : "Decision moments"}
        </h3>
        {moments.map((item) => (
          <article
            key={item.situation}
            className="human-premium-paper rounded-lg p-5"
          >
            <p className="text-sm font-semibold text-[var(--jig-seal)]">{item.situation}</p>
            <p className="mt-3 human-premium-serif text-base leading-relaxed text-[var(--jig-ink)]">
              &ldquo;
              {normalizeDecisionScriptQuotes(
                sanitizeLlmSlotText("display:decision.script", item.script)
              )}
              &rdquo;
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
