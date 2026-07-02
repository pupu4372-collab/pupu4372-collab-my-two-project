"use client";

import type { HumanPremiumReportPayload } from "@/lib/reports/human-premium/types";
import { DEFAULT_REPORT_TYPE } from "@/lib/reports/human-premium/types";
import { BodyText, SectionHeading } from "./report-ui";

const COHORT_TITLE_KO = "나와 같은 운명의 통찰";
const COHORT_TITLE_EN = "Insight for people like you";

/** Template fallback embeds "COHORT INSIGHT · " in body; UI already shows the card label. */
function stripCohortBodyPrefix(body: string, isKo: boolean): string {
  let text = body.trim();
  text = text.replace(/^\s*COHORT\s+INSIGHT\s*·\s*/i, "");
  if (isKo) {
    text = text.replace(new RegExp(`^\\s*${COHORT_TITLE_KO}\\s*·\\s*`), "");
  } else {
    text = text.replace(new RegExp(`^\\s*${COHORT_TITLE_EN}\\s*·\\s*`, "i"), "");
  }
  return text.trim();
}

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
  const sealed = prophecy?.full ?? prophecy?.short ?? "";
  const mantra = isKo
    ? "운명을 아는 자는 거침이 없나니 — 지금의 선택이 다음 계절을 만듭니다."
    : "He who knows his destiny moves without obstacle — today's choice shapes the next season.";

  return (
    <section id="section-prophecy" className="scroll-mt-24 space-y-6">
      <SectionHeading
        id="section-prophecy-heading"
        title={isKo ? "잠겨진 천명" : "Locked destiny"}
        subtitle={
          reportType === "lifetime"
            ? isKo
              ? "풀버전"
              : "Full version"
            : undefined
        }
      />
      <article className="rounded-2xl bg-[#2a2433] p-8 text-[#f4f1ea] shadow-inner sm:p-10">
        <p className="human-premium-label-caps text-[#d4a373]">
          {isKo ? "잠겨진 천명" : "Locked destiny"}
        </p>
        <p className="human-premium-serif mt-4 text-lg italic leading-[2] text-[#f8f4ec]">
          {sealed}
        </p>
        <p className="mt-8 border-t border-white/10 pt-6 text-center human-premium-serif text-base italic text-[#e8dfd0]">
          {mantra}
        </p>
      </article>

      {cohort?.body ? (
        <article className="human-premium-paper rounded-lg p-6">
          <p className="human-premium-label-caps text-[var(--jig-seal)]">
            {isKo ? COHORT_TITLE_KO : COHORT_TITLE_EN}
          </p>
          <BodyText
            body={stripCohortBodyPrefix(cohort.body, isKo)}
            className="mt-3"
          />
        </article>
      ) : null}
    </section>
  );
}
