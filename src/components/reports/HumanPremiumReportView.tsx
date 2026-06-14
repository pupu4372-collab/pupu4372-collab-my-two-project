"use client";

import { AppTopNav } from "@/components/layout/AppTopNav";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import type {
  HumanPremiumReportPayload,
  HumanPremiumReportSection,
} from "@/lib/reports/human-premium/types";
import type { PillarDisplay } from "@/lib/saju/types";
import {
  BRANCH_META,
  formatTenGodLabel,
  STEM_META,
} from "@/lib/saju/sipseong";
import Image from "next/image";
import { useMemo, useState } from "react";

const UI = {
  ko: {
    toc: "목차",
    saju: "사주 리포트",
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
    disclaimer:
      "사주란 2,000년전부터 내려오는 통계학에 가까운 학문입니다.\n맹신하기보단 삶의 지침서나 이정표 정도로 삼으시길 바랍니다.",
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
    coverMotto:
      "운명을 아는 것(知)에서 그치지 않고,\n그 흐름을 멀리서 관조(觀)하며 대처하는 법을 익히는 서재",
    coverMaxim: "[知運者無礙 - 운명을 아는 자는 거침이 없나니.]",
    recipient: "수신",
    issued: "발행일",
    reportType: "평생 사주 리포트",
    elementsTitle: "오행 에너지 균형 분석",
    elementsSubtitle: "오행 분포의 구조적 분석",
    elementsSummary: "종합 분석 요약",
    elementsTotal: "총 에너지",
    elementsDetail: "오행별 상세 역학",
    elementsDominant: "주된 기운",
    brand: "知觀齋",
  },
  en: {
    toc: "Contents",
    saju: "K-Saju report",
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
    coverMotto:
      "A study where knowing fate (知) meets\nobserving its flow (觀) and learning to respond.",
    coverMaxim: "[He who knows his destiny is without obstacles.]",
    recipient: "RECIPIENT",
    issued: "ISSUED DATE",
    reportType: "Lifetime Saju Report",
    elementsTitle: "Element Balance Analysis",
    elementsSubtitle: "Structural analysis of five-element distribution",
    elementsSummary: "Summary",
    elementsTotal: "Total energy",
    elementsDetail: "Element dynamics",
    elementsDominant: "Dominant element",
    brand: "Jigwanjae",
  },
} as const;

type UiStrings = (typeof UI)["ko"] | (typeof UI)["en"];

const OBANG_COLORS: Record<string, string> = {
  wood: "#3E5C76",
  fire: "#9A3B3B",
  earth: "#D4A373",
  metal: "#BDBDBD",
  water: "#3D3D3D",
};

interface ElementBreakdown {
  key: string;
  hanja: string;
  hangul: string;
  romanized: string;
  meaning: string;
  count: number;
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

type SajuPillars = {
  year: PillarDisplay;
  month: PillarDisplay;
  day: PillarDisplay;
  hour: PillarDisplay | null;
};

const STEM_ORDER = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const BRANCH_ORDER = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const BODY_PARAGRAPH_MAX = 140;

function asPillars(raw: Record<string, unknown>): SajuPillars {
  return raw as SajuPillars;
}

function asElements(raw: Record<string, unknown>[]): ElementBreakdown[] {
  return raw.map((item) => ({
    key: String(item.key ?? ""),
    hanja: String(item.hanja ?? ""),
    hangul: String(item.hangul ?? ""),
    romanized: String(item.romanized ?? ""),
    meaning: String(item.meaning ?? ""),
    count: Number(item.count ?? 0),
  }));
}

function safePdfFilename(name: string): string {
  const safe = name.replace(/[^\p{L}\p{N}\-_]+/gu, "-").replace(/-+/g, "-");
  return `jigwanjae-${safe || "report"}.pdf`;
}

function formatIssuedDate(iso: string, isKo: boolean): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso.slice(0, 10);
  if (isKo) {
    return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, "0")}. ${String(date.getDate()).padStart(2, "0")}`;
  }
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function emptyBranchesForDay(dayPillar: PillarDisplay): string[] {
  const stem = dayPillar.stemHanja || dayPillar.stem || dayPillar.pillar.charAt(0);
  const branch = dayPillar.branchHanja || dayPillar.branch || dayPillar.pillar.charAt(1);
  const stemIndex = STEM_ORDER.indexOf(stem);
  const branchIndex = BRANCH_ORDER.indexOf(branch);
  if (stemIndex < 0 || branchIndex < 0) return [];

  const cycleStartBranchIndex =
    (branchIndex - stemIndex + BRANCH_ORDER.length) % BRANCH_ORDER.length;
  return [
    BRANCH_ORDER[(cycleStartBranchIndex + 10) % BRANCH_ORDER.length],
    BRANCH_ORDER[(cycleStartBranchIndex + 11) % BRANCH_ORDER.length],
  ];
}

function splitReadableParagraphs(body: string): string[] {
  return body
    .split(/\n{2,}/)
    .flatMap((block) => {
      const normalized = block.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
      if (!normalized) return [];
      if (normalized.length <= BODY_PARAGRAPH_MAX) return [normalized];

      const sentences =
        normalized.match(/[^.!?。！？.]+[.!?。！？.]?/g) ?? [normalized];
      const paragraphs: string[] = [];
      let current = "";

      for (const sentence of sentences) {
        const next = sentence.trim();
        if (!next) continue;
        if (current && current.length + next.length > BODY_PARAGRAPH_MAX) {
          paragraphs.push(current);
          current = next;
          continue;
        }
        current = current ? `${current} ${next}` : next;
      }

      if (current) paragraphs.push(current);
      return paragraphs;
    });
}

function BodyText({
  body,
  className = "",
}: {
  body: string;
  className?: string;
}) {
  const paragraphs = splitReadableParagraphs(body);

  return (
    <div className={`space-y-5 text-base leading-[1.9] text-[var(--jig-ink)]/90 ${className}`}>
      {paragraphs.map((paragraph, index) => (
        <p key={`${paragraph.slice(0, 32)}-${index}`}>{paragraph}</p>
      ))}
    </div>
  );
}

function CoverPage({
  report,
  isKo,
  t,
}: {
  report: HumanPremiumReportPayload;
  isKo: boolean;
  t: UiStrings;
}) {
  return (
    <section className="human-premium-frame relative py-8 text-center sm:py-12">
      <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center px-4">
        <Image
          src="/stitch/jigwanjae/jigwanjae-cover-logo.png"
          alt={t.brand}
          width={280}
          height={120}
          className="mb-10 h-32 w-auto object-contain sm:h-40"
          priority
        />

        <p className="human-premium-serif whitespace-pre-line text-lg leading-relaxed tracking-tight text-[var(--jig-ink)] sm:text-xl">
          {t.coverMotto}
        </p>

        <div className="my-6 h-px w-24 bg-[var(--jig-seal)]/30" />

        <p className="human-premium-label-caps text-[var(--jig-muted)]">{t.coverMaxim}</p>

        <div className="mt-16 grid w-full max-w-xl grid-cols-1 gap-10 md:grid-cols-2 md:gap-12">
          <div className="border-l border-[var(--jig-ink)]/10 pl-6 text-left">
            <p className="human-premium-label-caps mb-1 text-[var(--jig-muted)]">
              {t.recipient}
            </p>
            <p className="human-premium-serif text-xl font-semibold text-[var(--jig-ink)]">
              {report.personName}
              {isKo ? "님" : ""}
            </p>
            <p className="mt-1 text-sm text-[var(--jig-muted)]">{t.reportType}</p>
          </div>
          <div className="border-l border-[var(--jig-ink)]/10 pl-6 text-left md:text-left">
            <p className="human-premium-label-caps mb-1 text-[var(--jig-muted)]">
              {t.issued}
            </p>
            <p className="human-premium-serif text-xl font-semibold text-[var(--jig-ink)]">
              {formatIssuedDate(report.generatedAt, isKo)}
            </p>
            <p className="mt-1 text-sm text-[var(--jig-muted)]">{report.cover.tagline}</p>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-4 right-4 sm:bottom-8 sm:right-8">
        <div className="human-premium-seal human-premium-serif p-1">
          <div className="human-premium-seal-inner">
            <span>知</span>
            <span>觀</span>
            <span>齋</span>
            <span>印</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function ElementsSection({
  elements,
  dominantElement,
  summaryStory,
  isKo,
  t,
}: {
  elements: ElementBreakdown[];
  dominantElement: string;
  summaryStory: string;
  isKo: boolean;
  t: UiStrings;
}) {
  const total = elements.reduce((sum, item) => sum + item.count, 0) || 1;
  const dominant = elements.find(
    (item) =>
      item.key === dominantElement ||
      item.hangul === dominantElement ||
      item.romanized === dominantElement
  );

  let offset = 0;
  const segments = elements.map((item) => {
    const pct = (item.count / total) * 100;
    const segment = { ...item, pct, offset };
    offset -= pct;
    return segment;
  });

  return (
    <section id="chapter-elements" className="scroll-mt-24">
      <div className="human-premium-lattice bg-white/40 p-6 sm:p-10">
        <header className="mb-8 border-b border-[var(--jig-ink)]/5 pb-6">
          <p className="human-premium-label-caps mb-2 text-[var(--jig-seal)]">
            {isKo ? "전략적 내부 분석 보고서" : "Strategic analysis report"}
          </p>
          <h2 className="human-premium-serif text-2xl font-bold text-[var(--jig-ink)] sm:text-3xl">
            {t.elementsTitle}
          </h2>
          <p className="mt-2 text-sm italic text-[var(--jig-muted)]">{t.elementsSubtitle}</p>
        </header>

        <div className="mb-10 grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <div className="mb-4 flex items-start gap-3">
              <div className="human-premium-accent-bar" />
              <h3 className="human-premium-serif text-xl font-semibold">{t.elementsSummary}</h3>
            </div>
            <BodyText body={summaryStory} className="text-[var(--jig-ink)]/85" />
            {dominant && (
              <div className="mt-6 rounded-lg border border-[var(--jig-ink)]/10 bg-[#f6f3ec]/80 p-5">
                <p className="human-premium-label-caps text-xs text-[var(--jig-muted)]">
                  {t.elementsDominant}
                </p>
                <p className="mt-1 font-semibold text-[var(--jig-ink)]">
                  {isKo
                    ? `${dominant.hangul} (${dominant.hanja}) · ${dominant.meaning}`
                    : `${dominant.romanized} (${dominant.hanja}) · ${dominant.meaning}`}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center justify-center border-[var(--jig-ink)]/5 md:col-span-5 md:border-l md:pl-10">
            <div className="relative h-56 w-56">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="transparent"
                  stroke="#E9E5D9"
                  strokeWidth="3"
                />
                {segments.map((item) =>
                  item.pct > 0 ? (
                    <circle
                      key={item.key}
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="transparent"
                      stroke={OBANG_COLORS[item.key] ?? "#888"}
                      strokeWidth="3.5"
                      strokeDasharray={`${item.pct} ${100 - item.pct}`}
                      strokeDashoffset={item.offset}
                    />
                  ) : null
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="human-premium-label-caps text-[10px] text-[var(--jig-muted)]">
                  {t.elementsTotal}
                </span>
                <span className="text-3xl font-semibold tabular-nums">100%</span>
              </div>
            </div>
            <div className="mt-6 grid w-full max-w-xs grid-cols-2 gap-x-6 gap-y-2">
              {elements.map((item) => {
                const pct = Math.round((item.count / total) * 100);
                return (
                  <div key={item.key} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 shrink-0"
                      style={{ backgroundColor: OBANG_COLORS[item.key] }}
                    />
                    <span className="human-premium-label-caps text-[10px]">
                      {isKo ? item.hangul : item.romanized} ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <h3 className="human-premium-serif mb-6 text-xl font-semibold">{t.elementsDetail}</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {elements.map((item) => {
            const pct = Math.round((item.count / total) * 100);
            const color = OBANG_COLORS[item.key] ?? "#888";
            const isDominant = dominant?.key === item.key;
            return (
              <div
                key={item.key}
                className={`human-premium-paper p-5 transition-colors ${
                  isDominant ? "border-2" : ""
                }`}
                style={isDominant ? { borderColor: `${color}40` } : undefined}
              >
                <div className="mb-3 flex items-start justify-between">
                  <span className="human-premium-label-caps" style={{ color }}>
                    {isKo ? `${item.hangul} (${item.hanja})` : `${item.romanized} (${item.hanja})`}
                  </span>
                  <span className="text-lg font-semibold tabular-nums">{pct}%</span>
                </div>
                <p className="human-premium-serif text-lg font-semibold text-[var(--jig-ink)]">
                  {item.meaning}
                </p>
                <div className="mt-4 h-1 w-full bg-[#f1eee7]">
                  <div
                    className="human-premium-chart-bar h-full"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
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
    <div className="human-premium-lattice overflow-x-auto bg-white/50 p-4 sm:p-6">
      <div className="min-w-[620px]">
        <div
          className="grid gap-0 pl-12 text-center text-sm font-semibold text-[var(--jig-ink)]"
          style={{ gridTemplateColumns: `repeat(${cols.length}, minmax(0, 1fr))` }}
        >
          {cols.map((col) => (
            <div key={col.key} className="pb-2">
              {col.label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[3rem_1fr] items-stretch">
          <div className="grid grid-rows-[74px_74px_38px_74px_38px_38px] text-sm font-semibold text-[var(--jig-ink)]">
            <div />
            <div className="flex items-center">{t.stemRow}</div>
            <div className="flex items-center">{isKo ? "십성" : "Ten god"}</div>
            <div className="flex items-center">{t.branchRow}</div>
            <div className="flex items-center">{isKo ? "십성" : "Ten god"}</div>
            <div className="flex items-center">{isKo ? "공망" : "Void"}</div>
          </div>

          <div
            className="human-premium-paper grid overflow-hidden rounded-lg border border-[var(--jig-ink)]/15 text-center"
            style={{ gridTemplateColumns: `repeat(${cols.length}, minmax(0, 1fr))` }}
          >
            {cols.map((col) => {
              const pillar = pillars[col.key];
              if (!pillar) return null;
              return (
                <div
                  key={`${col.key}-fortune`}
                  className="border-b border-r border-[var(--jig-ink)]/10 p-3 last:border-r-0"
                >
                  <p className="human-premium-serif text-lg font-semibold">{col.fortune}</p>
                  <p className="mt-1 text-xs text-[var(--jig-muted)]">{col.hint}</p>
                </div>
              );
            })}

            {cols.map((col) => {
              const pillar = pillars[col.key];
              if (!pillar) return null;
              return (
                <div
                  key={`${col.key}-stem`}
                  className={`relative border-b border-r border-[var(--jig-ink)]/10 p-3 last:border-r-0 ${
                    col.emphasis ? "bg-[var(--jig-seal)]/5" : ""
                  }`}
                >
                  <div className="flex items-end justify-center gap-2">
                    <span
                      className={`human-premium-serif text-3xl font-bold sm:text-4xl ${
                        col.emphasis ? "text-[var(--jig-ink)]" : "text-[var(--jig-muted)]"
                      }`}
                    >
                      {pillar.stemHanja}
                    </span>
                    <span className="text-sm font-bold">{pillar.stemLabel}</span>
                  </div>
                  <span className="absolute bottom-2 right-3 text-xs font-bold text-[var(--jig-muted)]">
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
                  className={`border-b border-r border-[var(--jig-ink)]/10 px-3 py-2 text-sm font-medium last:border-r-0 ${
                    col.emphasis ? "bg-[var(--jig-seal)]/5" : ""
                  }`}
                >
                  {formatTenGodLabel(
                    pillars.day.stemHanja,
                    STEM_META[pillar.stemHanja],
                    isKo ? "ko" : "en"
                  )}
                </div>
              );
            })}

            {cols.map((col) => {
              const pillar = pillars[col.key];
              if (!pillar) return null;
              return (
                <div
                  key={`${col.key}-branch`}
                  className={`relative border-b border-r border-[var(--jig-ink)]/10 p-3 last:border-r-0 ${
                    col.emphasis ? "bg-[var(--jig-seal)]/5" : ""
                  }`}
                >
                  <div className="flex items-end justify-center gap-2">
                    <span className="human-premium-serif text-3xl font-bold sm:text-4xl">
                      {pillar.branchHanja}
                    </span>
                    <span className="text-sm font-bold">{pillar.branchLabel}</span>
                  </div>
                  <span className="absolute bottom-2 right-3 text-xs font-bold text-[var(--jig-muted)]">
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
                  className={`border-b border-r border-[var(--jig-ink)]/10 px-3 py-2 text-sm font-medium last:border-r-0 ${
                    col.emphasis ? "bg-[var(--jig-seal)]/5" : ""
                  }`}
                >
                  {formatTenGodLabel(
                    pillars.day.stemHanja,
                    BRANCH_META[pillar.branchHanja],
                    isKo ? "ko" : "en"
                  )}
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
                  className={`border-r border-[var(--jig-ink)]/10 px-3 py-2 text-sm font-medium last:border-r-0 ${
                    isVoid ? "bg-[var(--jig-ink)] text-[var(--jig-hanji)]" : "text-[var(--jig-muted)]"
                  }`}
                >
                  {isVoid ? (isKo ? "공망 해당" : "Void hit") : emptyBranchText}
                </div>
              );
            })}
          </div>
        </div>
        <p className="mt-3 text-right text-xs font-medium text-[var(--jig-muted)]">
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
      <div className="human-premium-paper-warm border-l-4 border-[var(--jig-seal)] p-8 sm:p-10">
        <p className="human-premium-label-caps mb-6 text-[var(--jig-muted)]">{t.introFrom}</p>
        {paragraphs.length > 0 && (
          <BodyText
            body={paragraphs[0]}
            className="human-premium-serif mb-8 text-lg leading-[1.9]"
          />
        )}
        {paragraphs.length > 1 && (
          <BodyText body={paragraphs.slice(1).join("\n\n")} />
        )}
        <div className="mt-10 flex justify-end">
          <p className="human-premium-serif text-xl">{t.introSign}</p>
        </div>
      </div>
    </section>
  );
}

function ReadingCard({ section }: { section: HumanPremiumReportSection }) {
  return (
    <article
      id={`section-${section.id}`}
      className="human-premium-inner-frame human-premium-paper scroll-mt-24 rounded-lg p-6 sm:p-8"
    >
      <header className="mb-6 border-b border-[var(--jig-ink)]/10 pb-4">
        {section.subtitle && (
          <p className="mb-1 text-sm text-[var(--jig-seal)]">{section.subtitle}</p>
        )}
        <h3 className="human-premium-serif text-xl font-semibold sm:text-2xl">{section.title}</h3>
      </header>
      <BodyText body={section.body} />
      {section.bullets && section.bullets.length > 0 && (
        <ul className="mt-6 flex flex-wrap gap-2">
          {section.bullets.map((item) => (
            <li
              key={item}
              className="rounded-full border border-[var(--jig-ink)]/10 bg-[#f6f3ec] px-3 py-1 text-xs font-medium text-[var(--jig-ink)]"
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
      <div className="flex items-start gap-3">
        <div className="human-premium-accent-bar mt-1" />
        <div>
          <h2 className="human-premium-serif text-2xl font-bold sm:text-3xl">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-sm text-[var(--jig-muted)]">{subtitle}</p>
          )}
        </div>
      </div>
    </header>
  );
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
      <nav className="no-print human-premium-paper rounded-lg p-4 lg:hidden">
        <p className="human-premium-label-caps mb-3 text-[var(--jig-muted)]">{t.toc}</p>
        <div className="grid grid-cols-2 gap-2 min-[420px]:grid-cols-3 sm:grid-cols-4">
          {items.map((item) => (
            <a
              key={item.id}
              href={`#chapter-${item.id}`}
              className="min-w-0 rounded-full border border-[var(--jig-ink)]/10 bg-white/60 px-3 py-2 text-center text-xs font-semibold leading-snug text-[var(--jig-ink)]"
            >
              <span className="line-clamp-2 break-keep">{item.title}</span>
            </a>
          ))}
        </div>
      </nav>
    );
  }

  return (
    <nav className="human-premium-paper rounded-lg p-4">
      <div className="mb-3 flex items-center gap-2 border-b border-[var(--jig-seal)]/20 pb-3">
        <Image
          src="/stitch/jigwanjae/jigwanjae-small-logo.png"
          alt={t.brand}
          width={80}
          height={32}
          className="h-8 w-auto object-contain"
        />
      </div>
      <p className="human-premium-label-caps text-[var(--jig-muted)]">{t.toc}</p>
      <ul className="mt-3 max-h-[60vh] space-y-1 overflow-y-auto text-sm">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#chapter-${item.id}`}
              className="block rounded px-2 py-1.5 text-[var(--jig-ink)]/80 transition hover:bg-[var(--jig-seal)]/5 hover:text-[var(--jig-ink)]"
            >
              <span className="block text-[10px] uppercase tracking-wide text-[var(--jig-muted)]">
                {item.group}
              </span>
              {item.title}
            </a>
          </li>
        ))}
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

  const pillars = asPillars(report.saju.pillars);
  const elements = asElements(report.saju.elements);
  const hasHour = report.analysisMode === "four_pillars" && Boolean(pillars.hour);

  const introChapter = report.saju.chapters.find((c) => c.id === "introduction");
  const prefaceChapter = report.saju.chapters.find((c) => c.id === "preface");
  const manseChapter = report.saju.chapters.find((c) => c.id === "manse-calendar");
  const sajuResultChapter = report.saju.chapters.find((c) => c.id === "saju-result");
  const luckCyclesChapter = report.saju.chapters.find((c) => c.id === "luck-cycles");

  const toc = useMemo(
    () => [
      {
        id: "elements",
        title: t.elementsTitle,
        group: t.saju,
      },
      ...report.saju.chapters.map((chapter) => ({
        id: chapter.id,
        title: chapter.title,
        group: t.saju,
      })),
    ],
    [report.saju.chapters, t.elementsTitle, t.saju]
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
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-32 pt-4 sm:px-6 sm:pt-6">
        <div className="grid gap-8 lg:grid-cols-[180px_minmax(0,1fr)] lg:gap-10">
          <aside className="no-print hidden lg:sticky lg:top-24 lg:block lg:self-start">
            <ReportToc items={toc} t={t} />
          </aside>

          <div className="print-report-main min-w-0 space-y-10 sm:space-y-16">
            <CoverPage report={report} isKo={isKo} t={t} />
            <ReportToc items={toc} t={t} compact />

            {introChapter?.sections[0] && (
              <IntroLetter section={introChapter.sections[0]} isKo={isKo} />
            )}

            <ElementsSection
              elements={elements}
              dominantElement={report.saju.dominantElement}
              summaryStory={report.summary.story}
              isKo={isKo}
              t={t}
            />

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

            {luckCyclesChapter && (
              <section className="space-y-6">
                <ChapterHeading
                  id={luckCyclesChapter.id}
                  title={luckCyclesChapter.title}
                  subtitle={luckCyclesChapter.subtitle}
                />
                {luckCyclesChapter.sections.map((section) => (
                  <ReadingCard key={section.id} section={section} />
                ))}
              </section>
            )}

            <section className="no-print space-y-4">
              <button
                type="button"
                onClick={() => void shareReport()}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-[var(--jig-ink)] font-bold text-[var(--jig-hanji)] shadow transition hover:opacity-90"
              >
                {t.share}
              </button>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => void copyLink()}
                  className="human-premium-paper flex h-14 flex-col items-center justify-center gap-1 rounded-lg border border-[var(--jig-ink)]/20 transition hover:border-[var(--jig-seal)]/40"
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
                  className="human-premium-paper flex h-14 flex-col items-center justify-center gap-1 rounded-lg border border-[var(--jig-ink)]/20 transition hover:border-[var(--jig-seal)]/40 disabled:opacity-60"
                >
                  <span className="text-[11px] font-semibold">
                    {pdfState === "downloading" ? t.pdfDownloading : t.downloadChoice}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => void sendEmail()}
                  disabled={emailState === "sending"}
                  className="human-premium-paper flex h-14 flex-col items-center justify-center gap-1 rounded-lg border border-[var(--jig-ink)]/20 transition hover:border-[var(--jig-seal)]/40 disabled:opacity-60"
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
