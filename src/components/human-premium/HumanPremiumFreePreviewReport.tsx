"use client";

import { CoverSection } from "@/components/human-premium/CoverSection";
import { DeepAnalysisSection } from "@/components/human-premium/DeepAnalysisSection";
import { KeyIndicatorsSection } from "@/components/human-premium/KeyIndicatorsSection";
import { OpportunitiesSection } from "@/components/human-premium/OpportunitiesSection";
import { ProphecySection } from "@/components/human-premium/ProphecySection";
import { RisksSection } from "@/components/human-premium/RisksSection";
import { RoadmapSection } from "@/components/human-premium/RoadmapSection";
import { SajuStructureSection } from "@/components/human-premium/SajuStructureSection";
import { Link } from "@/i18n/navigation";
import type { HumanPremiumReportPayload } from "@/lib/reports/human-premium/types";

/**
 * Premium report body for free daily preview — same 8 sections as paid HumanPremiumReportView.
 * Wire from DayPillarPreview after buildHumanPremiumFreePreviewReport().
 */
export function HumanPremiumFreePreviewReport({
  report,
}: {
  report: HumanPremiumReportPayload;
}) {
  const isKo = report.locale === "ko";

  return (
    <div className="human-premium-stage">
      <div className="human-premium-paper-sheet mx-auto w-full max-w-3xl px-4 py-6 sm:px-8 sm:py-10">
        <CoverSection report={report} isKo={isKo} />
        <SajuStructureSection report={report} isKo={isKo} />
        <KeyIndicatorsSection report={report} isKo={isKo} />
        <DeepAnalysisSection report={report} isKo={isKo} />
        <OpportunitiesSection report={report} isKo={isKo} />
        <RisksSection report={report} isKo={isKo} />
        <RoadmapSection report={report} isKo={isKo} />
        <ProphecySection report={report} isKo={isKo} />

        <p className="mt-10 text-center text-sm text-[var(--jig-muted)]">
          {isKo
            ? "전체 프리미엄 리포트는 아래에서 선택할 수 있어요."
            : "Choose full premium reports below."}{" "}
          <Link href="/premium/human" className="font-semibold text-channel-saju underline">
            {isKo ? "프리미엄 사주 보기" : "Premium Saju"}
          </Link>
        </p>
      </div>
    </div>
  );
}
