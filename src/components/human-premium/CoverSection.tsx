"use client";

import type { HumanPremiumReportPayload } from "@/lib/reports/human-premium/types";
import {
  DEFAULT_REPORT_TYPE,
  REPORT_TYPE_LABELS,
  REPORT_TYPE_LABELS_EN,
} from "@/lib/reports/human-premium/types";
import Image from "next/image";
import { ManseTable } from "./ManseTable";
import {
  OBANG_COLORS,
  asElements,
  asPillars,
  formatBirthInputSummary,
  formatIssuedDate,
  obangPaleBg,
} from "./report-helpers";
import {
  branchHangulLabel,
  formatElementLabelForLocale,
  stemHangulLabel,
} from "@/lib/saju/elements";
import type { ElementKey } from "@/lib/saju/types";
import { BodyText, ReportTypeTitle } from "./report-ui";

interface CoverSectionProps {
  report: HumanPremiumReportPayload;
  isKo: boolean;
}

export function CoverSection({ report, isKo }: CoverSectionProps) {
  const pillars = asPillars(report.saju.pillars);
  const elements = asElements(report.saju.elements);
  const hasHour = report.analysisMode === "four_pillars" && Boolean(pillars.hour);
  const reportTypeKey = report.reportType ?? DEFAULT_REPORT_TYPE;
  const typeLabel = isKo
    ? REPORT_TYPE_LABELS[reportTypeKey]
    : REPORT_TYPE_LABELS_EN[reportTypeKey];
  const dominant = elements.find(
    (item) =>
      item.key === report.saju.dominantElement ||
      item.hangul === report.saju.dominantElement ||
      item.romanized === report.saju.dominantElement
  );
  const day = pillars.day;

  return (
    <section id="section-cover" className="scroll-mt-24 space-y-8">
      <div className="relative py-8 text-center sm:py-12">
        <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center px-4">
          <Image
            src="/stitch/jigwanjae/jigwanjae-cover-logo.png"
            alt={isKo ? "知觀齋" : "Jigwanjae"}
            width={280}
            height={120}
            className="mb-10 h-32 w-auto object-contain sm:h-40"
            priority
          />
          <p className="human-premium-label-caps text-[var(--jig-seal)]">{typeLabel}</p>
          <p className="human-premium-serif mt-4 whitespace-pre-line text-lg leading-relaxed tracking-tight text-[var(--jig-ink)] sm:text-xl">
            {isKo
              ? "운명을 아는 것(知)에서 그치지 않고,\n그 흐름을 멀리서 관조(觀)하며 대처하는 법을 익히는 서재"
              : "A study where knowing fate (知) meets\nobserving its flow (觀)."}
          </p>
          <div className="my-6 h-px w-24 bg-[var(--jig-seal)]/30" />
          <p className="human-premium-label-caps text-[var(--jig-muted)]">
            {isKo
              ? "[知運者無礙 - 운명을 아는 자는 거침이 없나니.]"
              : "[He who knows his destiny is without obstacles.]"}
          </p>
          <div className="mt-16 grid w-full max-w-xl grid-cols-1 gap-10 md:grid-cols-2 md:gap-12">
            <div className="border-l border-[var(--jig-ink)]/10 pl-6 text-left">
              <p className="human-premium-label-caps mb-1 text-[var(--jig-muted)]">
                {isKo ? "수신" : "RECIPIENT"}
              </p>
              <p className="human-premium-serif text-xl font-semibold text-[var(--jig-ink)]">
                {report.personName}
                {isKo ? "님" : ""}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--jig-muted)]">
                {formatBirthInputSummary(report.birthBasis, report.calendarType, isKo)}
              </p>
              <ReportTypeTitle className="mt-1">{typeLabel}</ReportTypeTitle>
            </div>
            <div className="border-l border-[var(--jig-ink)]/10 pl-6 text-left">
              <p className="human-premium-label-caps mb-1 text-[var(--jig-muted)]">
                {isKo ? "발행일" : "ISSUED DATE"}
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
      </div>

      <div className="p-6 sm:p-8">
        <p className="human-premium-label-caps mb-2 text-[var(--jig-seal)]">
          {isKo ? "일주 오행" : "Day pillar element"}
        </p>
        <p className="human-premium-serif text-2xl font-bold text-[var(--jig-ink)]">
          {isKo
            ? `${day.pillar} · ${stemHangulLabel(day.stemHanja)} · ${branchHangulLabel(day.branchHanja)}`
            : `${day.pillar} · ${day.stemLabel} · ${day.branchLabel}`}
        </p>
        <BodyText body={report.summary.story} className="mt-4 text-[var(--jig-ink)]/85" />
      </div>

      <div className="space-y-4">
        <h3 className="human-premium-serif text-xl font-semibold">
          {isKo ? "사주 만세력 (四柱)" : "Four pillars (Manse)"}
        </h3>
        <ManseTable pillars={pillars} hasHour={hasHour} isKo={isKo} />
      </div>

      <div className="p-6 sm:p-10">
        <header className="mb-6 border-b border-[var(--jig-ink)]/5 pb-4">
          <h3 className="human-premium-serif text-xl font-bold sm:text-2xl">
            {isKo ? "오행 에너지 균형" : "Element balance"}
          </h3>
          <p className="mt-1 text-sm text-[var(--jig-muted)]">
            {isKo ? "오행 분포의 구조적 분석" : "Structural five-element distribution"}
          </p>
        </header>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {elements.map((item) => {
            const pct = item.percent;
            const color = OBANG_COLORS[item.key] ?? "#888";
            const isDominant = dominant?.key === item.key;
            return (
              <div
                key={item.key}
                className={`rounded-lg border p-5 ${isDominant ? "border-2 shadow-sm" : "border-black/[0.06]"}`}
                style={{
                  backgroundColor: obangPaleBg(item.key, isDominant ? 18 : 14),
                  borderColor: isDominant ? `${color}55` : `${color}28`,
                }}
              >
                <div className="mb-3 flex items-start justify-between">
                  <span className="human-premium-label-caps" style={{ color }}>
                    {isKo
                      ? `${item.hangul} (${item.hanja})`
                      : formatElementLabelForLocale(item.key as ElementKey, "en")}
                  </span>
                  <span className="text-lg font-semibold tabular-nums">{pct}%</span>
                </div>
                <p className="human-premium-serif font-semibold text-[var(--jig-ink)]">
                  {item.meaning}
                </p>
                <div className="mt-4 h-2 w-full bg-[#E8E2D6]">
                  <div
                    className="human-premium-chart-bar h-full rounded-full"
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
