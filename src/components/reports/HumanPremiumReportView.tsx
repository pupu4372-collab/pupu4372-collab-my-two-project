"use client";

import { CoverSection } from "@/components/human-premium/CoverSection";
import { DeepAnalysisSection } from "@/components/human-premium/DeepAnalysisSection";
import { InstaCard } from "@/components/human-premium/InstaCard";
import { KeyIndicatorsSection } from "@/components/human-premium/KeyIndicatorsSection";
import { OpportunitiesSection } from "@/components/human-premium/OpportunitiesSection";
import { ProphecySection } from "@/components/human-premium/ProphecySection";
import { RisksSection } from "@/components/human-premium/RisksSection";
import { RoadmapSection } from "@/components/human-premium/RoadmapSection";
import { SajuStructureSection } from "@/components/human-premium/SajuStructureSection";
import { AppTopNav } from "@/components/layout/AppTopNav";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import type { HumanPremiumReportPayload } from "@/lib/reports/human-premium/types";
import { HUMAN_PREMIUM_SECTION_IDS } from "@/lib/reports/human-premium/types";
import { shareHumanPremiumReportToKakao } from "@/lib/share/pet-fortune-share";
import Image from "next/image";
import { useMemo, useState } from "react";

const UI = {
  ko: {
    toc: "목차",
    saju: "사주 리포트",
    share: "카카오 공유",
    shareSectionLabel: "지관재 · 나눔",
    shareSectionHint: "소중한 리포트를 카카오로 전해 보세요",
    shareFailed:
      "카카오 공유 검증 실패예요. developers.kakao.com 에서 Web 도메인(ksajupet.com, localhost) 등록을 확인해 주세요.",
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
    share: "Kakao",
    shareSectionLabel: "Jigwanjae · Share",
    shareSectionHint: "Send your report to friends on Kakao",
    shareFailed:
      "Kakao share verification failed. Register ksajupet.com in Kakao Developers.",
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

const TOC_CHIP_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  "section-cover": {
    bg: "color-mix(in srgb, var(--jig-obang-yellow) 22%, var(--jig-hanji))",
    border: "var(--jig-obang-yellow)",
    text: "#6f4f2c",
  },
  "section-structure": {
    bg: "color-mix(in srgb, var(--jig-obang-blue) 16%, var(--jig-hanji))",
    border: "var(--jig-obang-blue)",
    text: "var(--jig-obang-blue)",
  },
  "section-metrics": {
    bg: "color-mix(in srgb, var(--jig-seal) 12%, var(--jig-hanji))",
    border: "var(--jig-seal)",
    text: "var(--jig-seal)",
  },
  "section-depth": {
    bg: "color-mix(in srgb, white 55%, var(--jig-hanji))",
    border: "rgba(34, 34, 34, 0.16)",
    text: "var(--jig-ink)",
  },
  "section-opportunity": {
    bg: "color-mix(in srgb, var(--jig-obang-blue) 10%, var(--jig-hanji))",
    border: "var(--jig-obang-blue)",
    text: "var(--jig-obang-blue)",
  },
  "section-risk": {
    bg: "color-mix(in srgb, var(--jig-obang-red) 14%, var(--jig-hanji))",
    border: "var(--jig-obang-red)",
    text: "var(--jig-obang-red)",
  },
  "section-roadmap": {
    bg: "color-mix(in srgb, var(--jig-obang-black) 10%, var(--jig-hanji))",
    border: "var(--jig-obang-black)",
    text: "var(--jig-obang-black)",
  },
  "section-prophecy": {
    bg: "color-mix(in srgb, #2a2433 12%, var(--jig-hanji))",
    border: "#2a2433",
    text: "#2a2433",
  },
};

const TOC_CHIP_DEFAULT = {
  bg: "color-mix(in srgb, white 55%, var(--jig-hanji))",
  border: "rgba(34, 34, 34, 0.12)",
  text: "var(--jig-ink)",
};

function tocChipStyle(id: string) {
  return TOC_CHIP_STYLES[id] ?? TOC_CHIP_DEFAULT;
}

interface HumanPremiumReportViewProps {
  report: HumanPremiumReportPayload;
  shareUrl: string;
  emailUrl: string;
  pdfUrl: string;
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

function ReportToc({
  items,
  t,
  compact = false,
}: {
  items: Array<{ id: string; title: string; group: string }>;
  t: UiStrings;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <nav className="no-print human-premium-lattice human-premium-paper-warm rounded-sm p-4 lg:hidden">
        <p className="human-premium-label-caps mb-3 text-[var(--jig-seal)]">{t.toc}</p>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {items.map((item, index) => {
            const chip = tocChipStyle(item.id);
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="group min-w-0 rounded-sm border px-2.5 py-2.5 text-center transition hover:shadow-sm"
                style={{
                  backgroundColor: chip.bg,
                  borderColor: chip.border,
                  color: chip.text,
                }}
              >
                <span className="human-premium-label-caps mb-1 block text-[9px] opacity-75">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="human-premium-serif block text-xs font-semibold leading-snug break-keep">
                  {item.title}
                </span>
              </a>
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <nav className="human-premium-lattice human-premium-paper-warm rounded-sm p-4">
      <div className="mb-3 flex items-center gap-2 border-b border-[var(--jig-seal)]/15 pb-3">
        <Image
          src="/stitch/jigwanjae/jigwanjae-small-logo.png"
          alt={t.brand}
          width={80}
          height={32}
          className="h-8 w-auto object-contain"
        />
      </div>
      <p className="human-premium-label-caps text-[var(--jig-seal)]">{t.toc}</p>
      <ul className="mt-3 max-h-[60vh] space-y-1.5 overflow-y-auto text-sm">
        {items.map((item, index) => {
          const chip = tocChipStyle(item.id);
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="block rounded-sm border px-2.5 py-2 transition hover:shadow-sm"
                style={{
                  backgroundColor: chip.bg,
                  borderColor: chip.border,
                  color: chip.text,
                  borderLeftWidth: 3,
                }}
              >
                <span className="human-premium-label-caps block text-[9px] opacity-75">
                  {String(index + 1).padStart(2, "0")} · {item.group}
                </span>
                <span className="human-premium-serif mt-0.5 block font-semibold leading-snug">
                  {item.title}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function HumanPremiumReportView({
  report,
  shareUrl,
  emailUrl,
  pdfUrl,
}: HumanPremiumReportViewProps) {
  const isKo = report.locale === "ko";
  const t = UI[report.locale];
  const [copied, setCopied] = useState(false);
  const [emailState, setEmailState] = useState<"idle" | "sending" | "sent" | "failed">(
    "idle"
  );
  const [pdfState, setPdfState] = useState<"idle" | "downloading" | "failed">("idle");
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [shareBusy, setShareBusy] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

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

  async function shareReportToKakao() {
    setShareBusy(true);
    setShareError(null);
    try {
      await shareHumanPremiumReportToKakao({
        shareUrl,
        personName: report.personName,
        tagline: report.cover.tagline,
        locale: report.locale,
      });
    } catch {
      setShareError(t.shareFailed);
    } finally {
      setShareBusy(false);
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
    <div className="human-premium-report safe-area-shell flex min-h-dvh flex-col">
      <AppTopNav active="saju" />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-32 pt-4 sm:px-6 sm:pt-6">
        <div className="grid gap-8 lg:grid-cols-[180px_minmax(0,1fr)] lg:gap-10">
          <aside className="no-print hidden lg:sticky lg:top-24 lg:block lg:self-start">
            <ReportToc items={toc} t={t} />
          </aside>

          <div className="print-report-main min-w-0 space-y-10 sm:space-y-16">
            <ReportToc items={toc} t={t} compact />
            <CoverSection report={report} isKo={isKo} />
            <SajuStructureSection report={report} isKo={isKo} />
            <KeyIndicatorsSection report={report} isKo={isKo} />
            <DeepAnalysisSection report={report} isKo={isKo} />
            <OpportunitiesSection report={report} isKo={isKo} />
            <RisksSection report={report} isKo={isKo} />
            <RoadmapSection report={report} isKo={isKo} />
            <ProphecySection report={report} isKo={isKo} />
            <InstaCard report={report} isKo={isKo} />

            <section className="no-print human-premium-share-panel space-y-3">
              <p className="human-premium-label-caps text-center text-[var(--jig-seal)]">
                {t.shareSectionLabel}
              </p>
              <p className="human-premium-serif text-center text-sm font-semibold text-[var(--jig-ink)]">
                {t.shareSectionHint}
              </p>
              <button
                type="button"
                disabled={shareBusy}
                onClick={() => void shareReportToKakao()}
                className="human-premium-share-btn human-premium-share-btn--kakao disabled:opacity-60"
              >
                {shareBusy ? "…" : t.share}
              </button>
              {shareError ? (
                <p className="text-center text-xs text-[var(--jig-seal)]">{shareError}</p>
              ) : null}
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
