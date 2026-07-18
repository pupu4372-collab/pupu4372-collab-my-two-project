"use client";

import type { HumanPremiumReportPayload } from "@/lib/reports/human-premium/types";
import { DEFAULT_REPORT_TYPE } from "@/lib/reports/human-premium/types";
import {
  lockedDestinyTitle,
  prophecyMantra,
} from "@/lib/reports/human-premium/prophecy-labels";
import {
  COHORT_INSIGHT_TITLE_EN,
  COHORT_INSIGHT_TITLE_KO,
  stripCohortBodyPrefix,
} from "@/lib/reports/human-premium/cohort-insight-labels";
import {
  PROPHECY_BORDER,
  PROPHECY_FILL,
  PROPHECY_INK,
  PROPHECY_MUTED,
} from "@/lib/reports/human-premium/prophecy-colors";
import { sanitizeLlmSlotText } from "@/lib/saju/llm/slot-output-sanitize";
import { BodyText, SectionHeading } from "./report-ui";

export function ProphecySection({
  report,
  isKo,
}: {
  report: HumanPremiumReportPayload;
  isKo: boolean;
}) {
  const reportType = report.reportType ?? DEFAULT_REPORT_TYPE;
  const prophecy = report.structured?.prophecy;
  const cohort = report.structured?.cohortInsight;
  const sealed = sanitizeLlmSlotText(
    "display:prophecy",
    prophecy?.full ?? prophecy?.short ?? "",
    report.locale
  );
  const keywordCard = sanitizeLlmSlotText(
    "display:prophecy.short",
    prophecy?.short ?? "",
    report.locale
  );
  const showKeywordCard =
    Boolean(keywordCard) &&
    Boolean(prophecy?.full) &&
    keywordCard !==
      sanitizeLlmSlotText("display:prophecy.full", prophecy?.full ?? "", report.locale);
  const mantra = prophecyMantra(isKo);
  const destinyTitle = lockedDestinyTitle(isKo);

  return (
    <section id="section-prophecy" className="scroll-mt-24 space-y-6">
      <SectionHeading
        id="section-prophecy-heading"
        title={destinyTitle}
        subtitle={
          reportType === "lifetime"
            ? isKo
              ? "풀버전"
              : "Full version"
            : undefined
        }
      />
      {showKeywordCard ? (
        <article className="human-premium-paper rounded-lg p-6">
          <p className="human-premium-label-caps text-[var(--jig-seal)]">
            {isKo ? "행운 키워드" : "Lucky keywords"}
          </p>
          <p className="human-premium-serif mt-3 text-base leading-relaxed text-[var(--jig-ink)]">
            {keywordCard}
          </p>
        </article>
      ) : null}
      <article
        className="rounded-2xl border p-8 shadow-inner sm:p-10"
        style={{
          backgroundColor: PROPHECY_FILL,
          borderColor: PROPHECY_BORDER,
        }}
      >
        <p
          className="human-premium-serif text-lg italic leading-[2]"
          style={{ color: PROPHECY_INK }}
        >
          {sealed}
        </p>
        <p
          className="mt-8 border-t pt-6 text-center human-premium-serif text-base italic"
          style={{ borderColor: PROPHECY_BORDER, color: PROPHECY_MUTED }}
        >
          {mantra}
        </p>
      </article>

      {cohort?.body ? (
        <article className="human-premium-paper rounded-lg p-6">
          <p className="human-premium-label-caps text-[var(--jig-seal)]">
            {isKo ? COHORT_INSIGHT_TITLE_KO : COHORT_INSIGHT_TITLE_EN}
          </p>
          <BodyText
            body={stripCohortBodyPrefix(cohort.body, isKo ? "ko" : "en")}
            className="mt-3"
            locale={report.locale}
          />
        </article>
      ) : null}
    </section>
  );
}
