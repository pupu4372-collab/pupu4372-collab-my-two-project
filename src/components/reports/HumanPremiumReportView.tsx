"use client";

import { AppTopNav } from "@/components/layout/AppTopNav";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import type {
  HumanPremiumReportChapter,
  HumanPremiumReportPayload,
  HumanPremiumReportSection,
} from "@/lib/reports/human-premium/types";
import type { PillarDisplay } from "@/lib/saju/types";
import { useMemo, useState } from "react";

const UI = {
  ko: {
    toc: "목차",
    saju: "사주 리포트",
    zodiac: "서비스 별자리 운세",
    share: "리포트 공유하기",
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
    disclaimer: "운세는 재미로만 보세요~",
    copyright: "본 리포트는 지관재(知觀齋)의 고유 자산이며 무단 복제를 금합니다.",
    manseTitle: "사주 만세력 (四柱)",
    stemRow: "천간",
    branchRow: "지지",
    hourPillar: "시주",
    dayPillar: "일주",
    monthPillar: "월주",
    yearPillar: "년주",
    selfBadge: "본인",
    introFrom: "Message from Sim-won",
    introSign: "원장 심원 올림",
    maximEn: "He who knows his destiny is without obstacles",
  },
  en: {
    toc: "Contents",
    saju: "K-Saju report",
    zodiac: "Service zodiac fortune",
    share: "Share report",
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
    manseTitle: "Four pillars (Manse)",
    stemRow: "Stem",
    branchRow: "Branch",
    hourPillar: "Hour",
    dayPillar: "Day",
    monthPillar: "Month",
    yearPillar: "Year",
    selfBadge: "Self",
    introFrom: "Message from Sim-won",
    introSign: "Director Sim-won",
    maximEn: "He who knows his destiny is without obstacles",
  },
} as const;

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

type SajuPillars = {
  year: PillarDisplay;
  month: PillarDisplay;
  day: PillarDisplay;
  hour: PillarDisplay | null;
};

type FiveElement = "wood" | "fire" | "earth" | "metal" | "water";
type Polarity = "yang" | "yin";

const STEM_META: Record<string, { element: FiveElement; polarity: Polarity }> = {
  甲: { element: "wood", polarity: "yang" },
  乙: { element: "wood", polarity: "yin" },
  丙: { element: "fire", polarity: "yang" },
  丁: { element: "fire", polarity: "yin" },
  戊: { element: "earth", polarity: "yang" },
  己: { element: "earth", polarity: "yin" },
  庚: { element: "metal", polarity: "yang" },
  辛: { element: "metal", polarity: "yin" },
  壬: { element: "water", polarity: "yang" },
  癸: { element: "water", polarity: "yin" },
};

const BRANCH_META: Record<string, { element: FiveElement; polarity: Polarity }> = {
  子: { element: "water", polarity: "yang" },
  丑: { element: "earth", polarity: "yin" },
  寅: { element: "wood", polarity: "yang" },
  卯: { element: "wood", polarity: "yin" },
  辰: { element: "earth", polarity: "yang" },
  巳: { element: "fire", polarity: "yin" },
  午: { element: "fire", polarity: "yang" },
  未: { element: "earth", polarity: "yin" },
  申: { element: "metal", polarity: "yang" },
  酉: { element: "metal", polarity: "yin" },
  戌: { element: "earth", polarity: "yang" },
  亥: { element: "water", polarity: "yin" },
};

const GENERATES: Record<FiveElement, FiveElement> = {
  wood: "fire",
  fire: "earth",
  earth: "metal",
  metal: "water",
  water: "wood",
};

const CONTROLS: Record<FiveElement, FiveElement> = {
  wood: "earth",
  fire: "metal",
  earth: "water",
  metal: "wood",
  water: "fire",
};

const STEM_ORDER = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const BRANCH_ORDER = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

function asPillars(raw: Record<string, unknown>): SajuPillars {
  return raw as SajuPillars;
}

function safePdfFilename(name: string): string {
  const safe = name.replace(/[^\p{L}\p{N}\-_]+/gu, "-").replace(/-+/g, "-");
  return `jigwanjae-${safe || "report"}.pdf`;
}

function tenGodLabel(
  dayStem: string,
  target: { element: FiveElement; polarity: Polarity } | undefined,
  isKo: boolean
): string {
  const day = STEM_META[dayStem];
  if (!day || !target) return "-";

  const samePolarity = day.polarity === target.polarity;
  if (day.element === target.element) return isKo ? (samePolarity ? "비견" : "겁재") : samePolarity ? "Peer" : "Rob Wealth";
  if (GENERATES[day.element] === target.element) return isKo ? (samePolarity ? "식신" : "상관") : samePolarity ? "Eating God" : "Hurting Officer";
  if (GENERATES[target.element] === day.element) return isKo ? (samePolarity ? "편인" : "정인") : samePolarity ? "Indirect Resource" : "Direct Resource";
  if (CONTROLS[day.element] === target.element) return isKo ? (samePolarity ? "편재" : "정재") : samePolarity ? "Indirect Wealth" : "Direct Wealth";
  if (CONTROLS[target.element] === day.element) return isKo ? (samePolarity ? "편관" : "정관") : samePolarity ? "Seven Killings" : "Direct Officer";
  return "-";
}

function emptyBranchesForDay(dayPillar: PillarDisplay): string[] {
  const stem = dayPillar.stemHanja || dayPillar.stem || dayPillar.pillar.charAt(0);
  const branch = dayPillar.branchHanja || dayPillar.branch || dayPillar.pillar.charAt(1);
  const stemIndex = STEM_ORDER.indexOf(stem);
  const branchIndex = BRANCH_ORDER.indexOf(branch);
  if (stemIndex < 0 || branchIndex < 0) return [];

  const cycleStartBranchIndex = (branchIndex - stemIndex + BRANCH_ORDER.length) % BRANCH_ORDER.length;
  return [
    BRANCH_ORDER[(cycleStartBranchIndex + 10) % BRANCH_ORDER.length],
    BRANCH_ORDER[(cycleStartBranchIndex + 11) % BRANCH_ORDER.length],
  ];
}

function ManseTable({
  pillars,
  hasHour,
  isKo,
}: {
  pillars: SajuPillars;
  hasHour: boolean;
  isKo: boolean;
}) {
  const t = UI[isKo ? "ko" : "en"];
  const emptyBranches = emptyBranchesForDay(pillars.day);
  const emptyBranchText =
    emptyBranches.length > 0
      ? `${emptyBranches.join("")} ${isKo ? "공망" : "void"}`
      : "-";
  const cols: {
    key: keyof SajuPillars;
    label: string;
    fortune: string;
    hint: string;
    relation: string;
    emphasis?: boolean;
  }[] = [
    ...(hasHour && pillars.hour
      ? [
          {
            key: "hour" as const,
            label: isKo ? "생시" : t.hourPillar,
            fortune: isKo ? "말년운" : "Late life",
            hint: isKo ? "자녀운, 결실" : "Legacy, results",
            relation: isKo ? "자녀" : "Legacy",
          },
        ]
      : []),
    {
      key: "day",
      label: isKo ? "생일" : t.dayPillar,
      fortune: isKo ? "중년운" : "Midlife",
      hint: isKo ? "정체성, 자아" : "Identity, self",
      relation: t.selfBadge,
      emphasis: true,
    },
    {
      key: "month",
      label: isKo ? "생월" : t.monthPillar,
      fortune: isKo ? "청년운" : "Youth",
      hint: isKo ? "부모, 사회상" : "Parents, society",
      relation: isKo ? "사회" : "Society",
    },
    {
      key: "year",
      label: isKo ? "생년" : t.yearPillar,
      fortune: isKo ? "초년운" : "Early life",
      hint: isKo ? "조상, 시대상" : "Ancestry, era",
      relation: isKo ? "조상" : "Ancestry",
    },
  ];

  return (
    <div className="overflow-x-auto rounded-xl bg-[#d8d3cd] p-4 shadow-xl sm:p-6">
      <div className="min-w-[620px]">
        <div
          className="grid gap-0 pl-12 text-center text-sm font-semibold text-ink"
          style={{ gridTemplateColumns: `repeat(${cols.length}, minmax(0, 1fr))` }}
        >
          {cols.map((col) => (
            <div key={col.key} className="pb-2">
              {col.label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[3rem_1fr] items-stretch">
          <div className="grid grid-rows-[74px_74px_38px_74px_38px_38px] text-sm font-semibold text-ink">
            <div />
            <div className="flex items-center">{t.stemRow}</div>
            <div className="flex items-center">{isKo ? "십성" : "Ten god"}</div>
            <div className="flex items-center">{t.branchRow}</div>
            <div className="flex items-center">{isKo ? "십성" : "Ten god"}</div>
            <div className="flex items-center">{isKo ? "공망" : "Void"}</div>
          </div>

          <div
            className="human-premium-paper grid overflow-hidden rounded-lg border border-[#b9b0a8] text-center text-ink"
            style={{ gridTemplateColumns: `repeat(${cols.length}, minmax(0, 1fr))` }}
          >
            {cols.map((col) => {
              const pillar = pillars[col.key];
              if (!pillar) return null;
              return (
                <div
                  key={`${col.key}-fortune`}
                  className="border-b border-r border-[#b9b0a8] p-3 last:border-r-0"
                >
                  <p className="font-serif text-lg font-semibold text-[#3d2a4a]">
                    {col.fortune}
                  </p>
                  <p className="mt-1 text-xs text-[#8d7d72]">{col.hint}</p>
                </div>
              );
            })}

            {cols.map((col) => {
              const pillar = pillars[col.key];
              if (!pillar) return null;
              return (
                <div
                  key={`${col.key}-stem`}
                  className={`relative border-b border-r border-[#b9b0a8] p-3 last:border-r-0 ${
                    col.emphasis ? "bg-[#e5c271]/10" : ""
                  }`}
                >
                  <div className="flex items-end justify-center gap-2">
                    <span
                      className={`font-serif text-3xl font-bold sm:text-4xl ${
                        col.emphasis ? "text-[#3d2a4a]" : "text-[#9b8978]"
                      }`}
                    >
                      {pillar.stemHanja}
                    </span>
                    <span
                      className={`text-sm font-bold ${col.emphasis ? "text-[#3d2a4a]" : "text-[#8d7d72]"}`}
                    >
                      {pillar.stemLabel}
                    </span>
                  </div>
                  <span
                    className={`absolute bottom-2 right-3 text-xs font-bold ${
                      col.emphasis ? "text-[#3d2a4a]" : "text-[#8d7d72]"
                    }`}
                  >
                    {col.relation}
                  </span>
                </div>
              );
            })}

            {cols.map((col) => {
              const pillar = pillars[col.key];
              if (!pillar) return null;
              return (
                <div
                  key={`${col.key}-stem-ten-god`}
                  className={`border-b border-r border-[#b9b0a8] px-3 py-2 text-sm font-medium last:border-r-0 ${
                    col.emphasis ? "bg-[#e5c271]/10 text-[#3d2a4a]" : "text-[#3d2a4a]"
                  }`}
                >
                  {tenGodLabel(pillars.day.stemHanja, STEM_META[pillar.stemHanja], isKo)}
                </div>
              );
            })}

            {cols.map((col) => {
              const pillar = pillars[col.key];
              if (!pillar) return null;
              return (
                <div
                  key={`${col.key}-branch`}
                  className={`relative border-b border-r border-[#b9b0a8] p-3 last:border-r-0 ${
                    col.emphasis ? "bg-[#e5c271]/10" : ""
                  }`}
                >
                  <div className="flex items-end justify-center gap-2">
                    <span className="font-serif text-3xl font-bold text-[#3d2a4a] sm:text-4xl">
                      {pillar.branchHanja}
                    </span>
                    <span className="text-sm font-bold text-[#3d2a4a]">
                      {pillar.branchLabel}
                    </span>
                  </div>
                  <span
                    className={`absolute bottom-2 right-3 text-xs font-bold ${
                      col.emphasis ? "text-[#3d2a4a]" : "text-[#8d7d72]"
                    }`}
                  >
                    {col.emphasis ? (isKo ? "배우자" : "Partner") : col.relation}
                  </span>
                </div>
              );
            })}

            {cols.map((col) => {
              const pillar = pillars[col.key];
              if (!pillar) return null;
              return (
                <div
                  key={`${col.key}-branch-ten-god`}
                  className={`border-b border-r border-[#b9b0a8] px-3 py-2 text-sm font-medium last:border-r-0 ${
                    col.emphasis ? "bg-[#e5c271]/10 text-[#3d2a4a]" : "text-[#3d2a4a]"
                  }`}
                >
                  {tenGodLabel(pillars.day.stemHanja, BRANCH_META[pillar.branchHanja], isKo)}
                </div>
              );
            })}

            {cols.map((col) => {
              const pillar = pillars[col.key];
              if (!pillar) return null;
              const branch = pillar.branchHanja || pillar.branch || pillar.pillar.charAt(1);
              const isVoid = emptyBranches.includes(branch);
              return (
                <div
                  key={`${col.key}-void`}
                  className={`border-r border-[#b9b0a8] px-3 py-2 text-sm font-medium last:border-r-0 ${
                    isVoid ? "bg-[#3d2a4a] text-[#fffaf2]" : "text-[#8d7d72]"
                  }`}
                >
                  {isVoid ? (isKo ? "공망 해당" : "Void hit") : emptyBranchText}
                </div>
              );
            })}
          </div>
        </div>
        <p className="mt-3 text-right text-xs font-medium text-ink/65">
          {isKo ? "일주 기준 공망" : "Void branches from day pillar"}: {emptyBranchText}
        </p>
      </div>
    </div>
  );
}

function IntroLetter({
  section,
  isKo,
}: {
  section: HumanPremiumReportSection;
  isKo: boolean;
}) {
  const t = UI[isKo ? "ko" : "en"];
  const paragraphs = section.body.split("\n\n").filter(Boolean);

  return (
    <section id="chapter-introduction" className="scroll-mt-24">
      <div className="human-premium-paper-warm rounded-xl border-l-8 border-[#593a6b] p-8 shadow-lg sm:p-12">
        <p className="mb-6 text-xs font-semibold uppercase tracking-[0.15em] text-[#593a6b]/60">
          {t.introFrom}
        </p>
        {paragraphs.length > 0 && (
          <p className="mb-8 font-serif text-lg leading-[1.8] text-ink">
            {paragraphs[0]}
          </p>
        )}
        {paragraphs.length > 1 && (
          <div className="space-y-4 text-base leading-relaxed text-ink/90">
            {paragraphs.slice(1).map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
        )}
        <div className="mt-10 flex justify-end">
          <p className="font-serif text-xl text-ink">{t.introSign}</p>
        </div>
      </div>
    </section>
  );
}

function ReadingCard({
  section,
  variant = "paper",
}: {
  section: HumanPremiumReportSection;
  variant?: "paper" | "zodiac";
}) {
  const isZodiac = variant === "zodiac";

  return (
    <article
      id={`section-${section.id}`}
      className={`scroll-mt-24 ${
        isZodiac
          ? "rounded-xl border border-[#d5bcf2]/20 bg-[#35245F]/20 p-6 shadow-inner backdrop-blur-sm sm:p-10"
          : "human-premium-inner-frame human-premium-paper rounded-xl border border-[#e5c271]/30 p-6 shadow-xl sm:p-10"
      }`}
    >
      <header
        className={`mb-6 border-b pb-4 ${isZodiac ? "border-[#d5bcf2]/20" : "border-ink/10"}`}
      >
        {section.subtitle && (
          <p
            className={`mb-1 text-sm ${isZodiac ? "text-[#d5bcf2]" : "text-[#e5c271]"}`}
          >
            {section.subtitle}
          </p>
        )}
        <h3
          className={`font-serif text-xl font-semibold sm:text-2xl ${
            isZodiac ? "text-[#d5bcf2]" : "text-ink"
          }`}
        >
          {section.title}
        </h3>
      </header>
      <p
        className={`whitespace-pre-line text-base leading-relaxed ${
          isZodiac ? "text-[#ccc4cf]" : "text-ink/90"
        }`}
      >
        {section.body}
      </p>
      {section.bullets && section.bullets.length > 0 && (
        <ul className="mt-6 flex flex-wrap gap-2">
          {section.bullets.map((item) => (
            <li
              key={item}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                isZodiac
                  ? "border-[#d5bcf2]/20 bg-[#d5bcf2]/10 text-[#d5bcf2]"
                  : "border-[#593a6b]/15 bg-[#FDF7EF] text-[#593a6b]"
              }`}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function ChapterHeading({
  id,
  title,
  subtitle,
}: {
  id: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <header id={`chapter-${id}`} className="scroll-mt-24">
      <h2 className="font-serif text-2xl font-semibold text-[#d5bcf2] sm:text-3xl">
        {title}
      </h2>
      {subtitle && <p className="mt-1 text-sm text-[#ccc4cf]/80">{subtitle}</p>}
    </header>
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

  const pillars = asPillars(report.saju.pillars);
  const hasHour = report.analysisMode === "four_pillars" && Boolean(pillars.hour);

  const introChapter = report.saju.chapters.find((c) => c.id === "introduction");
  const prefaceChapter = report.saju.chapters.find((c) => c.id === "preface");
  const manseChapter = report.saju.chapters.find((c) => c.id === "manse-calendar");
  const sajuResultChapter = report.saju.chapters.find((c) => c.id === "saju-result");

  const toc = useMemo(
    () => [
      ...report.saju.chapters.map((chapter) => ({
        id: chapter.id,
        title: chapter.title,
        group: t.saju,
      })),
      ...report.zodiac.chapters.map((chapter) => ({
        id: chapter.id,
        title: chapter.title,
        group: t.zodiac,
      })),
    ],
    [report.saju.chapters, report.zodiac.chapters, t.saju, t.zodiac]
  );

  const maximLine = report.cover.title.split(" - ")[0] ?? report.cover.title;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  async function shareReport() {
    if (navigator.share) {
      await navigator.share({
        title: report.cover.subtitle,
        text: report.cover.tagline,
        url: shareUrl,
      });
      return;
    }
    await copyLink();
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
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-28 pt-6 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[180px_minmax(0,1fr)] lg:gap-10">
          <aside className="no-print lg:sticky lg:top-24 lg:self-start">
            <nav className="rounded-xl border border-[#d5bcf2]/15 bg-[#221c32]/80 p-4 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ccc4cf]/60">
                {t.toc}
              </p>
              <ul className="mt-3 max-h-[60vh] space-y-1 overflow-y-auto text-sm">
                {toc.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#chapter-${item.id}`}
                      className="block rounded-lg px-2 py-1.5 text-[#e9defc]/80 transition hover:bg-[#d5bcf2]/10 hover:text-[#e9defc]"
                    >
                      <span className="block text-[10px] uppercase tracking-wide text-[#ccc4cf]/45">
                        {item.group}
                      </span>
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <div className="print-report-main space-y-12 sm:space-y-16">
            {/* Hero */}
            <section className="relative text-center">
              <div className="human-premium-paper relative overflow-hidden rounded-xl border-2 border-[#e5c271] p-8 shadow-2xl sm:p-10">
                <div className="absolute left-0 top-0 h-1 w-full bg-[#e5c271]" />
                <div className="absolute bottom-0 left-0 h-1 w-full bg-[#e5c271]" />
                <div className="flex flex-col items-center gap-4">
                  <div className="human-premium-seal font-serif text-2xl">知</div>
                  <h1 className="font-serif text-2xl font-semibold tracking-widest text-[#593a6b] sm:text-3xl">
                    {report.cover.subtitle}
                  </h1>
                  <div className="my-2 h-px w-16 bg-[#e5c271]/50" />
                  <p className="font-serif text-lg text-[#593a6b]">{maximLine}</p>
                  {isKo && (
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#958e98]">
                      {t.maximEn}
                    </p>
                  )}
                  <p className="max-w-lg text-sm leading-relaxed text-ink/80 sm:text-base">
                    {report.cover.tagline}
                  </p>
                  <p className="text-sm font-medium text-[#593a6b]">
                    {report.personName}
                    {isKo ? "님" : ""}
                  </p>
                </div>
              </div>
              <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-[#d5bcf2]/10 blur-[80px]" />
              <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-[#e5c271]/10 blur-[80px]" />
            </section>

            {introChapter?.sections[0] && (
              <IntroLetter section={introChapter.sections[0]} isKo={isKo} />
            )}

            {prefaceChapter && (
              <section className="space-y-6">
                <ChapterHeading
                  id={prefaceChapter.id}
                  title={prefaceChapter.title}
                  subtitle={prefaceChapter.subtitle}
                />
                {prefaceChapter.sections.map((section) => (
                  <ReadingCard key={section.id} section={section} />
                ))}
              </section>
            )}

            {manseChapter && (
              <section className="space-y-6">
                <ChapterHeading
                  id={manseChapter.id}
                  title={t.manseTitle}
                  subtitle={manseChapter.subtitle}
                />
                <ManseTable pillars={pillars} hasHour={hasHour} isKo={isKo} />
                {manseChapter.sections.map((section) => (
                  <ReadingCard key={section.id} section={section} />
                ))}
              </section>
            )}

            {sajuResultChapter && (
              <section className="space-y-6">
                <ChapterHeading
                  id={sajuResultChapter.id}
                  title={sajuResultChapter.title}
                  subtitle={sajuResultChapter.subtitle}
                />
                {sajuResultChapter.sections.map((section) => (
                  <ReadingCard key={section.id} section={section} />
                ))}
              </section>
            )}

            {report.zodiac.chapters.map((chapter: HumanPremiumReportChapter) => (
              <section key={chapter.id} className="space-y-6">
                <ChapterHeading
                  id={chapter.id}
                  title={chapter.title}
                  subtitle={chapter.subtitle ?? report.zodiac.signName}
                />
                {chapter.sections.map((section, index) => (
                  <ReadingCard
                    key={section.id}
                    section={section}
                    variant={index === 0 ? "zodiac" : "paper"}
                  />
                ))}
              </section>
            ))}

            <section className="no-print space-y-4">
              <button
                type="button"
                onClick={() => void shareReport()}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#593a6b] font-bold text-[#FFFaf2] shadow-lg transition hover:opacity-90"
              >
                {t.share}
              </button>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => void copyLink()}
                  className="human-premium-paper flex h-14 flex-col items-center justify-center gap-1 rounded-xl border border-[#593a6b] text-ink transition hover:bg-[#E6E1F9]"
                >
                  <span className="text-[11px] font-semibold">
                    {copied ? t.shared : t.copyLink}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => void downloadPdf()}
                  disabled={pdfState === "downloading"}
                  title={t.pdfReady}
                  className="human-premium-paper flex h-14 flex-col items-center justify-center gap-1 rounded-xl border border-[#593a6b] text-ink transition hover:bg-[#E6E1F9] disabled:opacity-60"
                >
                  <span className="text-[11px] font-semibold">
                    {pdfState === "downloading" ? t.pdfDownloading : t.downloadChoice}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => void sendEmail()}
                  disabled={emailState === "sending"}
                  className="human-premium-paper flex h-14 flex-col items-center justify-center gap-1 rounded-xl border border-[#593a6b] text-ink transition hover:bg-[#E6E1F9] disabled:opacity-60"
                >
                  <span className="text-[11px] font-semibold">
                    {emailState === "sending"
                      ? t.emailSending
                      : emailState === "sent"
                        ? t.emailSent
                        : t.email}
                  </span>
                </button>
              </div>
              {emailState === "failed" && (
                <p className="text-center text-xs text-red-300">{t.emailFailed}</p>
              )}
              {pdfState === "failed" && (
                <p className="text-center text-xs text-red-300">
                  {t.pdfFailed}
                  {pdfError ? `: ${pdfError.slice(0, 120)}` : ""}
                </p>
              )}
              <p className="text-center text-xs text-[#958e98]/60">{t.copyright}</p>
            </section>

            <p className="pb-4 text-center text-sm text-[#ccc4cf]/70">{t.disclaimer}</p>
          </div>
        </div>
      </main>
      <MobileBottomNav active="saju" />
    </div>
  );
}
