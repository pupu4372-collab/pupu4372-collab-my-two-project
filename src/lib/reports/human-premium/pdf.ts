import pdfMake from "pdfmake";
import type { Content, TDocumentDefinitions } from "pdfmake/interfaces";
import { ensurePdfFontsAsync, PDF_FONT_FAMILY } from "./pdf-fonts";
import type {
  HumanPremiumReportPayload,
  HumanPremiumReportSection,
} from "./types";
import {
  ELEMENT_TRACK_COLOR,
  elementAccentColor,
  formatElementDisplayLabel,
  parseElementRows,
} from "./element-display";
import { loadJigwanjaeCoverLogoDataUrl } from "./pdf-assets";
import { buildPdfCoverBlocks } from "./pdf-cover";
import { buildOrderedPdfBodySections } from "./pdf-sections";

const JIG_HANJI = "#F4F1EA";
const JIG_INK = "#222222";
const JIG_SEAL = "#B22222";
const JIG_MUTED = "#747878";

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

function sectionBlocks(
  section: HumanPremiumReportSection,
  options?: { hideTitle?: boolean; hideBody?: boolean }
): Content[] {
  const blocks: Content[] = [];

  if (!options?.hideTitle) {
    blocks.push({ text: pdfSafeText(section.title), style: "sectionTitle" });
  }

  if (section.subtitle) {
    blocks.push({
      text: pdfSafeText(section.subtitle),
      style: "sectionSubtitle",
      margin: [0, 0, 0, 6],
    });
  }

  if (!options?.hideBody) {
    blocks.push(paragraph(section.body));
  }

  if (section.bullets?.length) {
    blocks.push({
      ul: section.bullets.map((item) => pdfSafeText(item)),
      style: "body",
      margin: [8, 0, 0, 10],
    });
  }

  return blocks;
}

function findCoverSection(
  report: HumanPremiumReportPayload
): HumanPremiumReportSection | undefined {
  for (const chapter of report.saju.chapters) {
    for (const section of chapter.sections) {
      if (section.id === "section-cover") return section;
    }
  }
  return undefined;
}

function elementBar(percent: number, color: string, maxWidth = 200): Content {
  const clamped = Math.max(0, Math.min(100, percent));
  return {
    canvas: [
      { type: "rect", x: 0, y: 0, w: maxWidth, h: 10, color: ELEMENT_TRACK_COLOR },
      { type: "rect", x: 0, y: 0, w: (maxWidth * clamped) / 100, h: 10, color },
    ],
    margin: [0, 2, 0, 6],
  };
}

function elementSummaryBlocks(
  report: HumanPremiumReportPayload,
  isKo: boolean,
  options?: { pageBreak?: boolean }
): Content[] {
  const elements = parseElementRows(report.saju.elements);

  const title = isKo ? "오행 에너지 균형" : "Element Balance";
  const subtitle = isKo
    ? "오행 분포의 구조적 분석"
    : "Structural analysis of five-element distribution";

  const rows: Content[] = elements.map((item) => {
    const label = formatElementDisplayLabel(item, isKo);
    const barColor = elementAccentColor(item.key);
    return {
      columns: [
        {
          text: pdfSafeText(label),
          width: 80,
          style: "elementLabel",
          color: barColor,
        },
        {
          stack: [elementBar(item.percent, barColor)],
          width: 220,
        },
        {
          text: `${item.percent}%`,
          width: 40,
          alignment: "right",
          style: "elementPercent",
        },
      ],
      columnGap: 8,
      margin: [0, 4, 0, 4],
    };
  });

  const dominant = elements.reduce((best, item) =>
    item.count > best.count ? item : best
  , elements[0]);

  const dominantLabel = dominant
    ? formatElementDisplayLabel(dominant, isKo)
    : "-";

  const titleBlock: Content = options?.pageBreak === false
    ? { text: title, style: "chapterTitle", margin: [0, 16, 0, 4] }
    : { text: title, style: "chapterTitle", pageBreak: "before" };

  return [
    titleBlock,
    { text: subtitle, style: "chapterSubtitle", margin: [0, 0, 0, 10] },
    paragraph(
      isKo
        ? `주된 기운은 ${dominantLabel}입니다. 아래는 사주팔자 기준 오행 분포입니다.`
        : `Dominant element: ${dominantLabel}. Distribution from the four pillars:`,
      "body"
    ),
    ...rows,
    { text: "", margin: [0, 0, 0, 12] },
  ];
}

function buildDocumentDefinition(
  report: HumanPremiumReportPayload,
  logoDataUrl?: string | null
): TDocumentDefinitions {
  const isKo = report.locale === "ko";
  const footerLabel = isKo
    ? "지관재(知觀齋) Premium Report"
    : "Jigwanjae Premium Report";

  const content: Content[] = buildPdfCoverBlocks(report, { logoDataUrl });

  const coverSection = findCoverSection(report);
  if (coverSection) {
    content.push(...sectionBlocks(coverSection, { hideTitle: true, hideBody: true }));
  }

  content.push(...elementSummaryBlocks(report, isKo, { pageBreak: false }));
  content.push(...buildOrderedPdfBodySections(report, isKo));

  content.push(
    paragraph(
      isKo
        ? "사주란 2,000년전부터 내려오는 통계학에 가까운 학문입니다.\n맹신하기보단 삶의 지침서나 이정표 정도로 삼으시길 바랍니다."
        : "Saju is closer to a statistical discipline handed down for nearly 2,000 years. Rather than blind belief, please use it as a guidepost for life.",
      "disclaimer"
    )
  );

  return {
    info: {
      title: pdfSafeText(report.cover.subtitle),
      author: "Jigwanjae",
      subject: pdfSafeText(report.personName),
    },
    pageSize: "A4",
    pageMargins: [56, 56, 56, 56],
    defaultStyle: {
      font: PDF_FONT_FAMILY,
      fontSize: 10.5,
      color: JIG_INK,
      lineHeight: 1.45,
    },
    styles: {
      coverBrand: { fontSize: 22, bold: true, color: JIG_INK },
      coverSubtitle: { fontSize: 14, color: JIG_SEAL },
      reportTypeTitle: { fontSize: 24, bold: true, color: JIG_INK },
      coverMotto: { fontSize: 11, color: JIG_INK, lineHeight: 1.5 },
      coverMaxim: { fontSize: 9, color: JIG_MUTED },
      labelCaps: { fontSize: 8, bold: true, color: JIG_MUTED },
      personName: { fontSize: 12, bold: true, color: JIG_INK },
      bodyMuted: { fontSize: 9.5, color: JIG_MUTED },
      chapterTitle: { fontSize: 15, bold: true, color: JIG_INK, margin: [0, 0, 0, 4] },
      chapterSubtitle: { fontSize: 10.5, color: JIG_SEAL },
      sectionTitle: { fontSize: 12, bold: true, color: JIG_INK, margin: [0, 10, 0, 4] },
      sectionSubtitle: { fontSize: 10, color: JIG_MUTED },
      body: { fontSize: 10.5, color: JIG_INK },
      elementLabel: { fontSize: 10.5, bold: true },
      elementPercent: { fontSize: 10.5, bold: true, color: JIG_INK },
      prophecySealed: { fontSize: 11.5, italics: true, color: JIG_INK, lineHeight: 1.6 },
      prophecyMantra: { fontSize: 10.5, italics: true, color: JIG_MUTED, lineHeight: 1.5 },
      decisionQuote: { fontSize: 11, italics: false, color: JIG_INK, lineHeight: 1.55 },
      disclaimer: { fontSize: 10, color: JIG_MUTED, alignment: "center" },
    },
    background(_currentPage, pageSize) {
      return {
        canvas: [
          {
            type: "rect",
            x: 0,
            y: 0,
            w: pageSize.width,
            h: pageSize.height,
            color: JIG_HANJI,
          },
          {
            type: "rect",
            x: 40,
            y: 40,
            w: pageSize.width - 80,
            h: pageSize.height - 80,
            lineColor: "rgba(34,34,34,0.12)",
            lineWidth: 1,
          },
        ],
      };
    },
    footer(currentPage) {
      return {
        margin: [56, 0, 56, 28],
        columns: [
          { text: footerLabel, alignment: "left", fontSize: 8, color: JIG_MUTED },
          {
            text: String(currentPage),
            alignment: "right",
            fontSize: 8,
            color: JIG_MUTED,
          },
        ],
      };
    },
    content,
  };
}

export async function renderHumanPremiumReportPdf(
  report: HumanPremiumReportPayload
): Promise<Buffer> {
  await ensurePdfFontsAsync();
  const logoDataUrl = await loadJigwanjaeCoverLogoDataUrl();
  const docDefinition = buildDocumentDefinition(report, logoDataUrl);
  const pdfDoc = pdfMake.createPdf(docDefinition);
  return pdfDoc.getBuffer();
}
