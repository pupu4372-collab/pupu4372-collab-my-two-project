import type { Locale } from "@/lib/saju/types";

export const COHORT_INSIGHT_TITLE_KO = "나와 같은 운명의 통찰";
export const COHORT_INSIGHT_TITLE_EN = "Insight for people like you";

/** Strip legacy cohort labels embedded in LLM/template body text. */
export function stripCohortBodyPrefix(body: string, locale: Locale): string {
  let text = body.trim();
  text = text.replace(/^\s*COHORT\s+INSIGHT\s*·\s*/i, "");
  text = text.replace(/^\s*【\s*COHORT\s+INSIGHT\s*】\s*/i, "");
  if (locale === "ko") {
    text = text.replace(
      new RegExp(`^\\s*【\\s*${COHORT_INSIGHT_TITLE_KO}\\s*】\\s*`),
      ""
    );
    text = text.replace(
      new RegExp(`^\\s*${COHORT_INSIGHT_TITLE_KO}\\s*·\\s*`),
      ""
    );
  } else {
    text = text.replace(
      new RegExp(`^\\s*【\\s*${COHORT_INSIGHT_TITLE_EN}\\s*】\\s*`, "i"),
      ""
    );
    text = text.replace(
      new RegExp(`^\\s*${COHORT_INSIGHT_TITLE_EN}\\s*·\\s*`, "i"),
      ""
    );
  }
  return text.trim();
}
