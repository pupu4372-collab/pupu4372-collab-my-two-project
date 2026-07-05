import type { Content } from "pdfmake/interfaces";
import { branchHangulLabel, stemHangulLabel } from "@/lib/saju/elements";
import {
  formatBirthInputSummary,
  formatIssuedDate,
} from "./birth-display";
import { buildPdfManseTable, type PdfMansePillars } from "./pdf-manse";
import { PDF_JIG_MUTED, PDF_JIG_SEAL } from "./pdf-visuals";
import type { HumanPremiumReportPayload } from "./types";
import {
  DEFAULT_REPORT_TYPE,
  REPORT_TYPE_LABELS,
  REPORT_TYPE_LABELS_EN,
} from "./types";

function pdfSafeText(value: string): string {
  return value
    .replace(/[\u2648-\u2653]/g, "")
    .replace(/[\uFE0E\uFE0F]/g, "")
    .replace(/[\uD800-\uDFFF]/g, "")
    .replace(/[•·]/g, "-")
    .replace(/[–—]/g, "-");
}

function paragraph(text: string, style: string = "body"): Content {
  return { text: pdfSafeText(text), style, margin: [0, 0, 0, 8] };
}

function asPillars(raw: Record<string, unknown>): PdfMansePillars {
  return raw as PdfMansePillars;
}

export function buildPdfCoverBlocks(
  report: HumanPremiumReportPayload,
  options?: { logoDataUrl?: string | null }
): Content[] {
  const isKo = report.locale === "ko";
  const reportTypeKey = report.reportType ?? DEFAULT_REPORT_TYPE;
  const reportTypeLabel = isKo
    ? REPORT_TYPE_LABELS[reportTypeKey]
    : REPORT_TYPE_LABELS_EN[reportTypeKey];
  const motto = isKo
    ? "운명을 아는 것(知)에서 그치지 않고,\n그 흐름을 멀리서 관조(觀)하며 대처하는 법을 익히는 서재"
    : "A study where knowing fate (知) meets\nobserving its flow (觀).";
  const maxim = isKo
    ? "[知運者無礙 - 운명을 아는 자는 거침이 없나니.]"
    : "[He who knows his destiny is without obstacles.]";
  const recipientLabel = isKo ? "수신" : "RECIPIENT";
  const issuedLabel = isKo ? "발행일" : "ISSUED DATE";
  const birthSummary = formatBirthInputSummary(
    report.birthBasis,
    report.calendarType,
    isKo
  );

  const pillars = asPillars(report.saju.pillars);
  const hasHour = report.analysisMode === "four_pillars" && Boolean(pillars.hour);
  const day = pillars.day;
  const dayLine = isKo
    ? `${day.pillar} · ${stemHangulLabel(day.stemHanja)} · ${branchHangulLabel(day.branchHanja)}`
    : `${day.pillar} · ${day.stemLabel} · ${day.branchLabel}`;

  const blocks: Content[] = [];

  if (options?.logoDataUrl) {
    blocks.push({
      image: options.logoDataUrl,
      width: 180,
      alignment: "center",
      margin: [0, 0, 0, 12],
    });
  } else {
    blocks.push({
      text: isKo ? "知觀齋" : "Jigwanjae (知觀齋)",
      style: "coverBrand",
      alignment: "center",
    });
  }

  blocks.push(
    {
      text: pdfSafeText(reportTypeLabel),
      style: "coverSubtitle",
      alignment: "center",
      margin: [0, 4, 0, 12],
    },
    { text: pdfSafeText(motto), style: "coverMotto", alignment: "center", margin: [0, 0, 0, 8] },
    { text: pdfSafeText(maxim), style: "coverMaxim", alignment: "center", margin: [0, 0, 0, 20] },
    {
      columns: [
        {
          width: "*",
          stack: [
            { text: recipientLabel, style: "labelCaps" },
            {
              text: pdfSafeText(`${report.personName}${isKo ? "님" : ""}`),
              style: "personName",
              margin: [0, 4, 0, 0],
            },
            {
              text: pdfSafeText(birthSummary),
              style: "bodyMuted",
              margin: [0, 4, 0, 0],
            },
            { text: reportTypeLabel, style: "reportTypeTitle", margin: [0, 6, 0, 0] },
          ],
        },
        {
          width: "*",
          stack: [
            { text: issuedLabel, style: "labelCaps", alignment: "right" },
            {
              text: formatIssuedDate(report.generatedAt, isKo),
              style: "personName",
              alignment: "right",
              margin: [0, 4, 0, 0],
            },
            {
              text: pdfSafeText(report.cover.tagline),
              style: "bodyMuted",
              alignment: "right",
              margin: [0, 2, 0, 0],
            },
          ],
        },
      ],
      margin: [0, 0, 0, 16],
    },
    {
      text: pdfSafeText(isKo ? "일주 오행" : "Day pillar element"),
      style: "labelCaps",
      color: PDF_JIG_SEAL,
      margin: [0, 0, 0, 4],
    },
    {
      text: pdfSafeText(dayLine),
      style: "sectionTitle",
      margin: [0, 0, 0, 8],
    },
    paragraph(report.summary.story),
    buildPdfManseTable(pillars, hasHour, isKo)
  );

  return blocks;
}
