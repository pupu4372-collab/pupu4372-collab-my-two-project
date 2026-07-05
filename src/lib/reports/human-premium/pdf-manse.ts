import type { Content, TableCell } from "pdfmake/interfaces";
import { branchHangulLabel, stemHangulLabel } from "@/lib/saju/elements";
import type { PillarDisplay } from "@/lib/saju/types";
import { PDF_JIG_MUTED, PDF_JIG_SEAL, PDF_PAPER_BORDER, PDF_PAPER_FILL } from "./pdf-visuals";

export interface PdfMansePillars {
  year: PillarDisplay;
  month: PillarDisplay;
  day: PillarDisplay;
  hour: PillarDisplay | null;
}

function pdfSafeText(value: string): string {
  return value
    .replace(/[\u2648-\u2653]/g, "")
    .replace(/[\uFE0E\uFE0F]/g, "")
    .replace(/[\uD800-\uDFFF]/g, "")
    .replace(/[•·]/g, "-")
    .replace(/[–—]/g, "-");
}

function pillarCell(pillar: PillarDisplay, isKo: boolean, emphasis = false): TableCell {
  const stemHanja = pillar.stemHanja || pillar.stem || pillar.pillar.charAt(0);
  const branchHanja = pillar.branchHanja || pillar.branch || pillar.pillar.charAt(1);
  const detail = isKo
    ? `${stemHangulLabel(stemHanja)} · ${branchHangulLabel(branchHanja)}`
    : `${pillar.stemLabel} · ${pillar.branchLabel}`;

  return {
    stack: [
      {
        text: pdfSafeText(pillar.pillar),
        alignment: "center",
        bold: true,
        fontSize: 15,
        color: emphasis ? "#222222" : PDF_JIG_MUTED,
        margin: [0, 0, 0, 2],
      },
      {
        text: pdfSafeText(detail),
        alignment: "center",
        fontSize: 8.5,
        color: PDF_JIG_MUTED,
      },
    ],
    fillColor: emphasis ? "#F5EBEB" : "#FFFFFF",
    margin: [6, 8, 6, 8],
  };
}

/** Compact 3–4 column pillar table aligned with web ManseTable column order. */
export function buildPdfManseTable(
  pillars: PdfMansePillars,
  hasHour: boolean,
  isKo: boolean
): Content {
  const cols: Array<{
    key: keyof PdfMansePillars;
    label: string;
    emphasis?: boolean;
  }> = [
    ...(hasHour && pillars.hour
      ? [{ key: "hour" as const, label: isKo ? "생시" : "Hour" }]
      : []),
    { key: "day", label: isKo ? "생일" : "Day", emphasis: true },
    { key: "month", label: isKo ? "생월" : "Month" },
    { key: "year", label: isKo ? "생년" : "Year" },
  ];

  const headerRow = cols.map(
    (col): TableCell => ({
      text: pdfSafeText(col.label),
      alignment: "center",
      style: "labelCaps",
      fillColor: PDF_PAPER_FILL,
      margin: [4, 6, 4, 4],
    })
  );

  const pillarRow = cols.map((col): TableCell => {
    const pillar =
      col.key === "hour" ? pillars.hour : pillars[col.key as "day" | "month" | "year"];
    if (!pillar) {
      return { text: "-", alignment: "center" };
    }
    return pillarCell(pillar, isKo, col.emphasis);
  });

  const manseTitle = isKo ? "사주 만세력 (四柱)" : "Four pillars (Manse)";

  return {
    stack: [
      {
        text: pdfSafeText(manseTitle),
        style: "sectionTitle",
        margin: [0, 14, 0, 8],
      },
      {
        table: {
          widths: cols.map(() => "*"),
          body: [headerRow, pillarRow],
        },
        layout: {
          hLineWidth: () => 1,
          vLineWidth: () => 1,
          hLineColor: () => PDF_PAPER_BORDER,
          vLineColor: () => PDF_PAPER_BORDER,
          paddingLeft: () => 0,
          paddingRight: () => 0,
          paddingTop: () => 0,
          paddingBottom: () => 0,
        },
        fillColor: PDF_PAPER_FILL,
      },
      {
        text: pdfSafeText(
          isKo
            ? `분석 모드: ${hasHour ? "사주(四柱)" : "삼주(三柱)"}`
            : `Mode: ${hasHour ? "Four pillars" : "Three pillars"}`
        ),
        style: "bodyMuted",
        alignment: "center",
        margin: [0, 6, 0, 0],
        color: PDF_JIG_SEAL,
      },
    ],
  };
}
