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
import type { HumanPremiumReportPayload } from "@/lib/reports/human-premium/types";
import { HUMAN_PREMIUM_SECTION_IDS } from "@/lib/reports/human-premium/types";
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
    disclaimer:
      "사주란 2,000년전부터 내려오는 통계학에 가까운 학문입니다.\n맹신하기보단 삶의 지침서나 이정표 정도로 삼으시길 바랍니다.",
    backToVault: "리포트 보관함으로",
    vaultButton: "리포트 보관함",
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
      "section-prophecy": "봉인된 예언",
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
    disclaimer: "Enjoy fortunes lightly — for fun only.",
    backToVault: "Back to report vault",
    vaultButton: "Report vault",
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
      "section-prophecy": "Sealed prophecy",
    },
  },
} as const;

type UiStrings = (typeof UI)["ko"] | (typeof UI)["en"];

interface HumanPremiumReportViewProps {
  report: HumanPremiumReportPayload;
  shareUrl: string;
  emailUrl: string;
  pdfUrl: string;
  backHref?: string;
}

interface FileSystemWritableFileStreamLike {
  write(data: Blob): Promise<void>;
  close(): Promise<void>;
}

interface FileSystemFileHandleLike {
  createWritable(): Promise<FileSystemWritableFileStreamLike>;
}

type SavePickerWindow = Window & {
  showSaveFilePicker?: (options: {
    suggestedName: string;
    types: Array<{
      description: string;
      accept: Record<string, string[]>;
    }>;
  }) => Promise<FileSystemFileHandleLike>;
};

function safePdfFilename(name: string): string {
  const safe = name.replace(/[^\p{L}\p{N}\-_]+/gu, "-").replace(/-+/g, "-");
  return `jigwanjae-${safe || "report"}.pdf`;
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

export function HumanPremiumReportView({
  report,
  shareUrl,
  emailUrl,
  pdfUrl,
  backHref,
}: HumanPremiumReportViewProps) {
  const isKo = report.locale === "ko";
  const t = UI[report.locale];
  const [copied, setCopied] = useState(false);
  const [emailState, setEmailState] = useState<"idle" | "sending" | "sent" | "failed">(
    "idle"
  );
  const [pdfState, setPdfState] = useState<"idle" | "downloading" | "failed">("idle");
  const [pdfError, setPdfError] = useState<string | null>(null);

  useEffect(() => {
    markSessionAlive();
  }, []);

  const toc = useMemo(
    () =>
      HUMAN_PREMIUM_SECTION_IDS.map((id) => ({
        id,
        title: t.sectionTitles[id],
        group: t.saju,
      })),
    [t.saju, t.sectionTitles]
  );

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  async function sendEmail() {
    setEmailState("sending");
    try {
      const token = shareUrl.split("/").filter(Boolean).pop();
      const res = await fetch(emailUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) throw new Error("Email failed");
      setEmailState("sent");
    } catch {
      setEmailState("failed");
    }
  }

  async function downloadPdf() {
    setPdfState("downloading");
    setPdfError(null);
    try {
      const token = shareUrl.split("/").filter(Boolean).pop();
      const res = await fetch(`${pdfUrl}?token=${encodeURIComponent(token ?? "")}`);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "PDF failed");
      }

      const blob = await res.blob();
      if (!blob.type.includes("pdf")) throw new Error("PDF response invalid");

      const filename = safePdfFilename(report.personName);
      const picker = window as SavePickerWindow;

      if (picker.showSaveFilePicker) {
        const handle = await picker.showSaveFilePicker({
          suggestedName: filename,
          types: [
            {
              description: "PDF file",
              accept: { "application/pdf": [".pdf"] },
            },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
      } else {
        const objectUrl = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = objectUrl;
        anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(objectUrl);
      }

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
          {backHref ? (
            <div className="no-print mb-6">
              <Link
                href={backHref}
                title={t.backToVault}
                className="inline-flex h-[4.5rem] w-[4.5rem] flex-col items-center justify-center gap-1 rounded-xl border-2 border-[var(--jig-seal)]/25 bg-white/90 text-center shadow-[0_4px_18px_rgba(34,34,34,0.12)] transition hover:border-[var(--jig-seal)]/45 hover:bg-white"
              >
                <span className="text-lg leading-none" aria-hidden>
                  📁
                </span>
                <span className="human-premium-serif px-1 text-[9px] font-bold leading-tight text-[var(--jig-ink)]">
                  {t.vaultButton}
                </span>
              </Link>
            </div>
          ) : null}

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
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => void copyLink()}
                  className="human-premium-share-btn human-premium-share-btn--link"
                >
                  {copied ? t.shared : t.copyLink}
                </button>
                <button
                  type="button"
                  onClick={() => void downloadPdf()}
                  disabled={pdfState === "downloading"}
                  title={t.pdfReady}
                  className="human-premium-share-btn human-premium-share-btn--pdf disabled:opacity-60"
                >
                  {pdfState === "downloading" ? t.pdfDownloading : t.downloadChoice}
                </button>
                <button
                  type="button"
                  onClick={() => void sendEmail()}
                  disabled={emailState === "sending"}
                  className="human-premium-share-btn human-premium-share-btn--email disabled:opacity-60"
                >
                  {emailState === "sending"
                    ? t.emailSending
                    : emailState === "sent"
                      ? t.emailSent
                      : t.email}
                </button>
              </div>
              {emailState === "failed" && (
                <p className="text-center text-xs text-[var(--jig-seal)]">{t.emailFailed}</p>
              )}
              {pdfState === "failed" && (
                <p className="text-center text-xs text-[var(--jig-seal)]">
                  {t.pdfFailed}
                  {pdfError ? `: ${pdfError.slice(0, 120)}` : ""}
                </p>
              )}
              <p className="text-center text-xs text-[var(--jig-muted)]">{t.copyright}</p>
            </section>

            <p className="whitespace-pre-line pb-4 text-center text-sm leading-relaxed text-[var(--jig-muted)]">
              {t.disclaimer}
            </p>
          </div>
        </div>
      </main>
      <MobileBottomNav active="saju" />
    </div>
  );
}
