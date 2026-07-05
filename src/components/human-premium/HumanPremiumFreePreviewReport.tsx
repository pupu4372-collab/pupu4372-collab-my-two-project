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
import { buildHumanPremiumPdfFilename } from "@/lib/reports/human-premium/filename";
import type { HumanPremiumReportPayload } from "@/lib/reports/human-premium/types";
import { useState } from "react";

const UI = {
  ko: {
    shareSectionLabel: "저장 · 공유",
    shareSectionHint: "PDF 저장",
    pdfReady: "한글 폰트가 포함된 PDF를 바로 저장합니다",
    downloadChoice: "PDF 저장",
    pdfDownloading: "PDF 생성 중…",
    pdfFailed: "PDF 저장에 실패했습니다",
    copyright: "본 리포트는 지관재(知觀齋)의 고유 자산이며 무단 복제를 금합니다.",
  },
  en: {
    shareSectionLabel: "Save · Share",
    shareSectionHint: "Save PDF",
    pdfReady: "Download a PDF with embedded Korean fonts",
    downloadChoice: "Save PDF",
    pdfDownloading: "Preparing PDF…",
    pdfFailed: "PDF download failed",
    copyright: "This report is proprietary to Jigwanjae (知觀齋).",
  },
} as const;

/**
 * Premium report body for free daily routine — same 8 sections as paid HumanPremiumReportView.
 * Rendered from DayPillarPreview after POST /api/human-premium/daily-routine.
 */
export function HumanPremiumFreePreviewReport({
  report,
  webToken,
}: {
  report: HumanPremiumReportPayload;
  webToken: string;
}) {
  const isKo = report.locale === "ko";
  const t = UI[report.locale];
  const [pdfState, setPdfState] = useState<"idle" | "downloading" | "failed">("idle");
  const [pdfError, setPdfError] = useState<string | null>(null);

  async function downloadPdf() {
    setPdfState("downloading");
    setPdfError(null);
    try {
      const res = await fetch(
        `/api/premium/human/pdf?token=${encodeURIComponent(webToken)}`
      );
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "PDF failed");
      }

      const blob = await res.blob();
      if (!blob.type.includes("pdf")) throw new Error("PDF response invalid");

      const { display: pdfFilename } = buildHumanPremiumPdfFilename(report);
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = pdfFilename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);

      setPdfState("idle");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setPdfState("idle");
        return;
      }
      setPdfError(error instanceof Error ? error.message : null);
      setPdfState("failed");
    }
  }

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

        <section className="no-print human-premium-share-panel mt-10 space-y-3">
          <p className="human-premium-label-caps text-center text-[var(--jig-seal)]">
            {t.shareSectionLabel}
          </p>
          <p className="human-premium-serif text-center text-sm font-semibold text-[var(--jig-ink)]">
            {t.shareSectionHint}
          </p>
          <div className="grid grid-cols-1 gap-2.5">
            <button
              type="button"
              onClick={() => void downloadPdf()}
              disabled={pdfState === "downloading"}
              title={t.pdfReady}
              className="human-premium-share-btn human-premium-share-btn--pdf disabled:opacity-60"
            >
              {pdfState === "downloading" ? t.pdfDownloading : t.downloadChoice}
            </button>
          </div>
          {pdfState === "failed" && (
            <p className="text-center text-xs text-[var(--jig-seal)]">
              {t.pdfFailed}
              {pdfError ? `: ${pdfError.slice(0, 120)}` : ""}
            </p>
          )}
          <p className="text-center text-xs text-[var(--jig-muted)]">{t.copyright}</p>
        </section>

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
