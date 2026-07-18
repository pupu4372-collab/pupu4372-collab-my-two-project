"use client";

import type { HumanPremiumReportPayload } from "@/lib/reports/human-premium/types";
import { findSectionBody } from "./report-helpers";
import { BodyText, SectionHeading } from "./report-ui";

export function DeepAnalysisSection({
  report,
  isKo,
}: {
  report: HumanPremiumReportPayload;
  isKo: boolean;
}) {
  const body = findSectionBody(report, "section-depth");
  const domains = report.structured?.domainScores ?? [];
  const luckyDates = report.structured?.luckyDates ?? [];
  const sections = report.structured?.deepSections ?? [];
  const yearCards = report.structured?.yearCards ?? [];
  const lifeCycles = report.structured?.lifeCycles ?? [];
  if (
    !body.trim() &&
    !domains.length &&
    !luckyDates.length &&
    !sections.length &&
    !yearCards.length &&
    !lifeCycles.length
  ) {
    return null;
  }

  const subtitle = domains.length
    ? isKo
      ? "서사 · 영역별 점수"
      : "Narrative · domain scores"
    : sections.length
      ? isKo
        ? "서사"
        : "Narrative"
      : yearCards.length
        ? isKo
          ? "서사 · 연도별 카드"
          : "Narrative · year cards"
        : lifeCycles.length
          ? isKo
            ? "서사 · 대운 사이클"
            : "Narrative · major-luck cycles"
          : isKo
            ? "마스터 내러티브 · 대운 스토리"
            : "Master narrative · major cycles";

  return (
    <section id="section-depth" className="scroll-mt-24 space-y-6">
      <SectionHeading
        id="section-depth-heading"
        title={isKo ? "심층 분석" : "Deep analysis"}
        subtitle={subtitle}
      />
      {body.trim() ? (
        <article className="human-premium-paper-warm border-l-4 border-[var(--jig-seal)] p-8 sm:p-10">
          <BodyText body={body} className="human-premium-serif text-lg leading-[2]" locale={report.locale} />
        </article>
      ) : null}

      {domains.length ? (
        <div className="space-y-4">
          <p className="human-premium-label-caps text-[var(--jig-seal)]">
            {isKo ? "영역별 분석" : "Domain analysis"}
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {domains.map((item) => (
              <article
                key={item.domain}
                className="human-premium-paper rounded-lg border border-[var(--jig-ink)]/8 p-5"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="human-premium-serif text-lg font-semibold text-[var(--jig-ink)]">
                    {item.domain}
                  </h3>
                  <p className="tabular-nums text-sm font-semibold text-[var(--jig-seal)]">
                    {item.score}
                    <span className="font-normal text-[var(--jig-muted)]">/10</span>
                  </p>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#E8E2D6]">
                  <div
                    className="h-full rounded-full bg-[#3E3A36]"
                    style={{ width: `${Math.max(0, Math.min(100, item.score * 10))}%` }}
                  />
                </div>
                <BodyText body={item.analysis} className="mt-3 text-sm" locale={report.locale} />
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {sections.length ? (
        <div className="grid grid-cols-1 gap-4">
          {sections.map((item) => (
            <article
              key={item.title}
              className="human-premium-paper rounded-lg border border-[var(--jig-ink)]/8 p-5"
            >
              <h3 className="human-premium-serif text-lg font-semibold text-[var(--jig-ink)]">
                {item.title}
              </h3>
              <BodyText body={item.body} className="mt-3 text-sm" locale={report.locale} />
            </article>
          ))}
        </div>
      ) : null}

      {yearCards.length ? (
        <div className="space-y-4">
          <p className="human-premium-label-caps text-[var(--jig-seal)]">
            {isKo ? "연도별 카드" : "Year cards"}
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {yearCards.map((item) => (
              <article
                key={`${item.year}-${item.score}`}
                className="human-premium-paper rounded-lg border border-[var(--jig-ink)]/8 p-4"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="human-premium-serif text-base font-semibold">{item.year}</h3>
                  <p className="tabular-nums text-sm font-semibold text-[var(--jig-seal)]">
                    {item.score}
                    <span className="font-normal text-[var(--jig-muted)]">/100</span>
                  </p>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#E8E2D6]">
                  <div
                    className="h-full rounded-full bg-[#3E3A36]"
                    style={{ width: `${Math.max(0, Math.min(100, item.score))}%` }}
                  />
                </div>
                <BodyText body={item.summary} className="mt-2 text-sm" locale={report.locale} />
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {lifeCycles.length ? (
        <div className="space-y-4">
          <p className="human-premium-label-caps text-[var(--jig-seal)]">
            {isKo ? "대운 사이클" : "Major-luck cycles"}
          </p>
          <div className="space-y-3">
            {lifeCycles.map((item) => (
              <article
                key={`${item.period}-${item.title}`}
                className="human-premium-paper rounded-lg border border-[var(--jig-ink)]/8 p-5"
              >
                <p className="human-premium-label-caps text-[var(--jig-muted)]">{item.period}</p>
                <h3 className="human-premium-serif mt-1 text-lg font-semibold">{item.title}</h3>
                <BodyText body={item.body} className="mt-3 text-sm" locale={report.locale} />
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {luckyDates.length ? (
        <article className="human-premium-paper rounded-lg p-5">
          <p className="human-premium-label-caps text-[var(--jig-seal)]">
            {isKo
              ? report.reportType === "yearly"
                ? "황금의 달"
                : "행운의 날짜"
              : report.reportType === "yearly"
                ? "Golden months"
                : "Lucky dates"}
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {luckyDates.map((date) => (
              <li
                key={date}
                className="rounded-md border border-[var(--jig-seal)]/25 bg-cream px-3 py-1.5 text-sm font-medium text-[var(--jig-ink)]"
              >
                {date}
              </li>
            ))}
          </ul>
        </article>
      ) : null}
    </section>
  );
}
