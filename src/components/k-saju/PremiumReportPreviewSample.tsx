"use client";

import { OpportunitiesSection } from "@/components/human-premium/OpportunitiesSection";
import { ProphecySection } from "@/components/human-premium/ProphecySection";
import { RisksSection } from "@/components/human-premium/RisksSection";
import { getPremiumReportPreviewSample } from "@/lib/reports/human-premium/premium-preview-sample";
import type { HumanPremiumReportPayload } from "@/lib/reports/human-premium/types";
import { useMemo } from "react";

function DecisionMomentsPreview({
  report,
  isKo,
}: {
  report: HumanPremiumReportPayload;
  isKo: boolean;
}) {
  const moments = report.structured?.decisionMoments ?? [];

  return (
    <section className="space-y-3">
      <h3 className="human-premium-serif text-base font-semibold text-[var(--jig-ink)]">
        {isKo ? "결정의 순간" : "Decision moments"}
      </h3>
      <div className="space-y-2">
        {moments.map((item) => (
          <article key={item.situation} className="human-premium-paper rounded-lg p-3">
            <p className="text-xs font-semibold text-[var(--jig-seal)]">{item.situation}</p>
            <p className="mt-2 human-premium-serif text-sm leading-relaxed text-[var(--jig-ink)]">
              &ldquo;{item.script}&rdquo;
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function PremiumReportPreviewSample({ locale }: { locale: "ko" | "en" }) {
  const isKo = locale === "ko";
  const report = useMemo(() => getPremiumReportPreviewSample(locale), [locale]);

  return (
    <div className="human-premium-stage rounded-b-[1.75rem]">
      <div
        className="human-premium-paper-sheet max-h-[32rem] overflow-y-auto overscroll-y-contain px-3 py-4 sm:max-h-[36rem] sm:px-4 [&_.human-premium-accent-bar]:h-5 [&_.human-premium-accent-bar]:w-1 [&_.human-premium-label-caps]:text-[10px] [&_.human-premium-serif]:text-base [&_h2]:text-lg [&_h3]:text-sm [&_section]:scroll-mt-0 [&_section]:space-y-3 [&_section_h2]:text-lg"
        tabIndex={0}
        aria-label={isKo ? "프리미엄 리포트 샘플" : "Premium report sample"}
      >
        <div className="space-y-8">
          <OpportunitiesSection report={report} isKo={isKo} />
          <RisksSection report={report} isKo={isKo} />
          <DecisionMomentsPreview report={report} isKo={isKo} />
          <ProphecySection report={report} isKo={isKo} />
        </div>
        <p className="mt-4 border-t border-[var(--jig-seal)]/15 pt-3 text-center text-[10px] text-[var(--jig-muted)]">
          {isKo ? "리포트 샘플 · 실제 리포트는 내 사주 기준으로 생성됩니다" : "Report sample · your report is generated from your birth chart"}
        </p>
      </div>
    </div>
  );
}
