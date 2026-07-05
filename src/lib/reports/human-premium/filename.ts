import {
  DEFAULT_REPORT_TYPE,
  REPORT_TYPE_LABELS,
  REPORT_TYPE_LABELS_EN,
  type HumanPremiumReportPayload,
} from "./types";

const SITE_SLUG = "ksajupet";

/** Characters invalid on common file systems / download paths. */
const INVALID_FILENAME_CHARS = /[/\\:*?"<>|]/g;

function resolvePdfLabel(
  payload: Pick<HumanPremiumReportPayload, "cover" | "reportType" | "locale">
): string {
  const reportType = payload.reportType ?? DEFAULT_REPORT_TYPE;
  const fromReportType =
    payload.locale === "en"
      ? REPORT_TYPE_LABELS_EN[reportType]
      : REPORT_TYPE_LABELS[reportType];

  return (
    fromReportType.trim() ||
    payload.cover?.title?.trim() ||
    (payload.locale === "en" ? "Report" : "리포트")
  );
}

/**
 * Build PDF download filenames from report type label (e.g. "데일리 럭키 루틴").
 * - display: Korean/localized filename with spaces removed
 * - asciiFallback: legacy ASCII-only fallback for Content-Disposition
 */
export function buildHumanPremiumPdfFilename(
  payload: Pick<HumanPremiumReportPayload, "cover" | "reportType" | "locale">
): { display: string; asciiFallback: string } {
  const rawLabel = resolvePdfLabel(payload);
  const cleanLabel =
    rawLabel.replace(/\s+/g, "").replace(INVALID_FILENAME_CHARS, "") ||
    (payload.locale === "en" ? "Report" : "리포트");

  const display = `${cleanLabel}-${SITE_SLUG}.pdf`;
  const asciiFallback = `report-${SITE_SLUG}.pdf`;

  return { display, asciiFallback };
}
