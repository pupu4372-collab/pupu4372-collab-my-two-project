"use client";

import { CoverSection } from "@/components/human-premium/CoverSection";
import { DeepAnalysisSection } from "@/components/human-premium/DeepAnalysisSection";
import { KeyIndicatorsSection } from "@/components/human-premium/KeyIndicatorsSection";
import { OpportunitiesSection } from "@/components/human-premium/OpportunitiesSection";
import { ProphecySection } from "@/components/human-premium/ProphecySection";
import { RisksSection } from "@/components/human-premium/RisksSection";
import { RoadmapSection } from "@/components/human-premium/RoadmapSection";
import { SajuStructureSection } from "@/components/human-premium/SajuStructureSection";
import { AppTopNav } from "@/components/layout/AppTopNav";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Link } from "@/i18n/navigation";
import { buildHumanPremiumPdfFilename } from "@/lib/reports/human-premium/filename";
import type { HumanPremiumReportPayload } from "@/lib/reports/human-premium/types";
import { visibleHumanPremiumSectionIds } from "@/lib/reports/human-premium/section-visibility";
import { useEffect, useMemo, useState } from "react";
import { markSessionAlive } from "@/lib/supabase/auth-session-policy";

const UI = {
  ko: {
    toc: "목차",
    saju: "사주 리포트",
    shareSectionLabel: "저장 · 공유",
    shareSectionHint: "링크 복사, PDF 저장, 이메일 발송",
    copyLink: "링크 복사",
    shared: "링크를 복사했어요",
    pdfReady: "한글 폰트가 포함된 PDF를 바로 저장합니다",
    downloadChoice: "PDF 저장",
    pdfDownloading: "PDF 생성 중…",
    pdfFailed: "PDF 저장에 실패했습니다",
    email: "이메일 발송",
    emailSending: "이메일 발송 중…",
    emailSent: "이메일을 발송했어요",
    emailFailed: "이메일 발송에 실패했습니다",
    emailUnavailable: "결제 시 이메일을 입력하면 여기서 다시 발송할 수 있어요",
    disclaimer:
      "사주란 2,000년전부터 내려오는 통계학에 가까운 학문입니다.\n맹신하기보단 삶의 지침서나 이정표 정도로 삼으시길 바랍니다.",
    backToList: "← 리포트 목록으로",
    copyright: "본 리포트는 지관재(知觀齋)의 고유 자산이며 무단 복제를 금합니다.",
    brand: "知觀齋",
    sectionTitles: {
      "section-cover": "표지 & 사주",
      "section-structure": "사주 구조 해석",
      "section-metrics": "핵심 운세 지표",
      "section-depth": "심층 분석",
      "section-opportunity": "포착할 기회",
      "section-risk": "예측 리스크",
      "section-roadmap": "시간 로드맵",
      "section-prophecy": "잠겨진 천명",
    },
  },
  en: {
    toc: "Contents",
    saju: "K-Saju report",
    shareSectionLabel: "Save · Share",
    shareSectionHint: "Copy link, save PDF, or send email",
    copyLink: "Copy link",
    shared: "Link copied",
    pdfReady: "Download a PDF with embedded Korean fonts",
    downloadChoice: "Save PDF",
    pdfDownloading: "Preparing PDF…",
    pdfFailed: "PDF download failed",
    email: "Send email",
    emailSending: "Sending email…",
    emailSent: "Email sent",
    emailFailed: "Email failed",
    emailUnavailable: "Add your email at checkout to resend from here",
    disclaimer: "Enjoy fortunes lightly — for fun only.",
    backToList: "← Back to report list",
    copyright: "This report is proprietary to Jigwanjae (知觀齋).",
    brand: "Jigwanjae",
    sectionTitles: {
      "section-cover": "Cover & pillars",
      "section-structure": "Chart structure",
      "section-metrics": "Key indicators",
      "section-depth": "Deep analysis",
      "section-opportunity": "Opportunities",
      "section-risk": "Risks",
      "section-roadmap": "Roadmap",
      "section-prophecy": "Locked destiny",
    },
  },
} as const;

type UiStrings = (typeof UI)["ko"] | (typeof UI)["en"];

interface HumanPremiumReportViewProps {
  report: HumanPremiumReportPayload;
  webToken: string;
  backHref?: string;
}

function TocTextRows({
  items,
}: {
  items: Array<{ id: string; title: string }>;
}) {
  const rows = [items.slice(0, 4), items.slice(4, 8)];

  return (
    <div className="mt-4 space-y-4">
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className="grid grid-cols-4 gap-1 sm:gap-3"
        >
          {row.map((item, index) => {
            const num = rowIndex * 4 + index + 1;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="human-premium-serif group flex min-w-0 flex-col items-center px-0.5 text-center transition"
              >
                <span className="text-base font-bold text-[var(--jig-seal)] sm:text-lg">{num}</span>
                <span className="mt-1 break-keep text-[9px] leading-snug text-[var(--jig-ink)] group-hover:text-[var(--jig-seal)] sm:text-[11px]">
                  {item.title}
                </span>
              </a>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function ReportToc({
  items,
  t,
}: {
  items: Array<{ id: string; title: string; group: string }>;
  t: UiStrings;
}) {
  return (
    <nav className="no-print mb-8 border-b border-[var(--jig-seal)]/15 pb-6">
      <p className="human-premium-label-caps text-center text-[var(--jig-seal)]">{t.toc}</p>
      <TocTextRows items={items} />
    </nav>
  );
}

function BackToReportListLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="no-print inline-flex text-sm font-semibold text-[var(--jig-ink)]/80 underline-offset-2 transition hover:text-[var(--jig-seal)] hover:underline"
    >
      {label}
    </Link>
  );
}

export function HumanPremiumReportView({
  report,
  webToken,
  backHref = "/premium/human/vault",
}: HumanPremiumReportViewProps) {
  const isKo = report.locale === "ko";
  const t = UI[report.locale];
  const [pdfState, setPdfState] = useState<"idle" | "downloading" | "failed">("idle");
  const [pdfError, setPdfError] = useState<string | null>(null);

  useEffect(() => {
    markSessionAlive();
  }, []);

  const toc = useMemo(
    () =>
      visibleHumanPremiumSectionIds(report).map((id) => ({
        id,
        title: t.sectionTitles[id],
        group: t.saju,
      })),
    [report, t.saju, t.sectionTitles]
  );

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
    <div className="human-premium-stage safe-area-shell flex min-h-dvh flex-col">
      <AppTopNav active="saju" />
      <main className="flex-1 px-3 py-4 pb-32 sm:px-4 sm:py-6">
        <div className="human-premium-paper-sheet mx-auto w-full max-w-3xl px-4 py-6 sm:px-8 sm:py-10">
          <div className="mb-6">
            <BackToReportListLink href={backHref} label={t.backToList} />
          </div>

          <ReportToc items={toc} t={t} />

          <div className="print-report-main min-w-0 space-y-10 sm:space-y-16">
            <CoverSection report={report} isKo={isKo} />
            <SajuStructureSection report={report} isKo={isKo} />
            <KeyIndicatorsSection report={report} isKo={isKo} />
            <DeepAnalysisSection report={report} isKo={isKo} />
            <OpportunitiesSection report={report} isKo={isKo} />
            <RisksSection report={report} isKo={isKo} />
            <RoadmapSection report={report} isKo={isKo} />
            <ProphecySection report={report} isKo={isKo} />

            <section className="no-print human-premium-share-panel space-y-3">
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

            <p className="whitespace-pre-line pb-2 text-center text-sm leading-relaxed text-[var(--jig-muted)]">
              {t.disclaimer}
            </p>

            <div className="border-t border-[var(--jig-seal)]/15 pt-6 pb-4 text-center">
              <BackToReportListLink href={backHref} label={t.backToList} />
            </div>
          </div>
        </div>
      </main>
      <MobileBottomNav active="saju" />
    </div>
  );
}
