import path from "node:path";
import pdfMake from "pdfmake";
import type { Content, TDocumentDefinitions } from "pdfmake/interfaces";
import type {
  HumanPremiumReportPayload,
  HumanPremiumReportSection,
} from "./types";

const FONT_ROOT = path.join(process.cwd(), "src/assets/fonts");
const FONT_DIR = path.join(FONT_ROOT, "NotoSansCJKkr");
const FONT_FAMILY = "NotoSansCJKkr";

let fontsReady = false;

function ensurePdfFonts(): void {
  if (fontsReady) return;

  pdfMake.setUrlAccessPolicy(() => false);
  pdfMake.setLocalAccessPolicy((fontPath) => fontPath.startsWith(FONT_ROOT));
  pdfMake.addFonts({
    [FONT_FAMILY]: {
      normal: path.join(FONT_DIR, "NotoSansCJKkr-Regular.otf"),
      bold: path.join(FONT_DIR, "NotoSansCJKkr-Bold.otf"),
      italics: path.join(FONT_DIR, "NotoSansCJKkr-Regular.otf"),
      bolditalics: path.join(FONT_DIR, "NotoSansCJKkr-Bold.otf"),
    },
  });
  fontsReady = true;
}

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

function sectionBlocks(section: HumanPremiumReportSection): Content[] {
  const blocks: Content[] = [
    { text: pdfSafeText(section.title), style: "sectionTitle" },
  ];

  if (section.subtitle) {
    blocks.push({
      text: pdfSafeText(section.subtitle),
      style: "sectionSubtitle",
      margin: [0, 0, 0, 6],
    });
  }

  blocks.push(paragraph(section.body));

  if (section.bullets?.length) {
    blocks.push({
      ul: section.bullets.map((item) => pdfSafeText(item)),
      style: "body",
      margin: [8, 0, 0, 10],
    });
  }

  return blocks;
}

function buildDocumentDefinition(report: HumanPremiumReportPayload): TDocumentDefinitions {
  const isKo = report.locale === "ko";
  const footerLabel = isKo
    ? "지관재(知觀齋) Premium Report"
    : "Jigwanjae Premium Report";

  const content: Content[] = [
    { text: pdfSafeText(report.cover.subtitle), style: "coverBrand" },
    { text: pdfSafeText(report.cover.title), style: "coverTitle", margin: [0, 8, 0, 10] },
    paragraph(report.cover.tagline),
    paragraph(`${report.personName}${isKo ? "님" : ""}`, "personName"),
    paragraph(report.summary.story),
  ];

  if (report.summary.traits.length) {
    content.push({
      ul: report.summary.traits.map((item) => pdfSafeText(item)),
      style: "body",
      margin: [8, 0, 0, 14],
    });
  }

  for (const chapter of report.saju.chapters) {
    content.push({ text: pdfSafeText(chapter.title), style: "chapterTitle", pageBreak: "before" });
    if (chapter.subtitle) {
      content.push({
        text: pdfSafeText(chapter.subtitle),
        style: "chapterSubtitle",
        margin: [0, 0, 0, 8],
      });
    }
    for (const section of chapter.sections) {
      content.push(...sectionBlocks(section));
    }
  }

  for (const chapter of report.zodiac.chapters) {
    content.push({ text: pdfSafeText(chapter.title), style: "chapterTitle", pageBreak: "before" });
    if (chapter.subtitle) {
      content.push({
        text: pdfSafeText(chapter.subtitle),
        style: "chapterSubtitle",
        margin: [0, 0, 0, 8],
      });
    }
    for (const section of chapter.sections) {
      content.push(...sectionBlocks(section));
    }
  }

  content.push(
    paragraph(
      isKo ? "운세는 재미로만 보세요~" : "Enjoy fortunes lightly — for fun only.",
      "disclaimer"
    )
  );

  return {
    info: {
      title: pdfSafeText(report.cover.subtitle),
      author: "K-Saju Pet",
      subject: pdfSafeText(report.personName),
    },
    pageSize: "A4",
    pageMargins: [48, 56, 48, 56],
    defaultStyle: {
      font: FONT_FAMILY,
      fontSize: 10.5,
      color: "#3d2a4a",
      lineHeight: 1.45,
    },
    styles: {
      coverBrand: { fontSize: 20, bold: true, color: "#5c3d6e" },
      coverTitle: { fontSize: 14, color: "#c9a85a" },
      personName: { fontSize: 11, bold: true, color: "#5c3d6e" },
      chapterTitle: { fontSize: 15, bold: true, color: "#5c3d6e", margin: [0, 0, 0, 4] },
      chapterSubtitle: { fontSize: 11, color: "#c9a85a" },
      sectionTitle: { fontSize: 12, bold: true, color: "#5c3d6e", margin: [0, 10, 0, 4] },
      sectionSubtitle: { fontSize: 10.5, color: "#c9a85a" },
      body: { fontSize: 10.5, color: "#3d2a4a" },
      disclaimer: { fontSize: 10, color: "#958e98", alignment: "center" },
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
            color: "#161025",
          },
          {
            type: "rect",
            x: 40,
            y: 40,
            w: pageSize.width - 80,
            h: pageSize.height - 80,
            color: "#fffaf2",
            lineColor: "#c9a85a",
            lineWidth: 2,
          },
        ],
      };
    },
    footer(currentPage, pageCount) {
      return {
        margin: [48, 0, 48, 24],
        columns: [
          { text: footerLabel, alignment: "left", fontSize: 8, color: "#958e98" },
          {
            text: String(currentPage),
            alignment: "right",
            fontSize: 8,
            color: "#958e98",
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
  ensurePdfFonts();
  const docDefinition = buildDocumentDefinition(report);
  const pdfDoc = pdfMake.createPdf(docDefinition);
  return pdfDoc.getBuffer();
}
