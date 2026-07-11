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
    prophecy?.full ?? prophecy?.short ?? ""
  );
  const keywordCard = sanitizeLlmSlotText(
    "display:prophecy.short",
    prophecy?.short ?? ""
  );
  const showKeywordCard =
    Boolean(keywordCard) &&
    Boolean(prophecy?.full) &&
    keywordCard !== sanitizeLlmSlotText("display:prophecy.full", prophecy?.full ?? "");
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
      <article className="rounded-2xl bg-[#2a2433] p-8 text-[#f4f1ea] shadow-inner sm:p-10">
        <p className="human-premium-serif text-lg italic leading-[2] text-[#f8f4ec]">
          {sealed}
        </p>
        <p className="mt-8 border-t border-white/10 pt-6 text-center human-premium-serif text-base italic text-[#e8dfd0]">
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
          />
        </article>
      ) : null}
    </section>
  );
}
