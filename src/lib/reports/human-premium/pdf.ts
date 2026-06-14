import pdfMake from "pdfmake";
import type { Content, TDocumentDefinitions } from "pdfmake/interfaces";
import { ensurePdfFontsAsync, PDF_FONT_FAMILY } from "./pdf-fonts";
import type {
  HumanPremiumReportPayload,
  HumanPremiumReportSection,
} from "./types";

const JIG_HANJI = "#F4F1EA";
const JIG_INK = "#222222";
const JIG_SEAL = "#B22222";
const JIG_MUTED = "#747878";

const OBANG_COLORS: Record<string, string> = {
  wood: "#3E5C76",
  fire: "#9A3B3B",
  earth: "#D4A373",
  metal: "#BDBDBD",
  water: "#3D3D3D",
};

interface ElementRow {
  key: string;
  hanja: string;
  hangul: string;
  romanized: string;
  count: number;
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

function asElements(raw: Record<string, unknown>[]): ElementRow[] {
  return raw.map((item) => ({
    key: String(item.key ?? ""),
    hanja: String(item.hanja ?? ""),
    hangul: String(item.hangul ?? ""),
    romanized: String(item.romanized ?? ""),
    count: Number(item.count ?? 0),
  }));
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

function elementSummaryBlocks(
  report: HumanPremiumReportPayload,
  isKo: boolean
): Content[] {
  const elements = asElements(report.saju.elements);
  const total = elements.reduce((sum, item) => sum + item.count, 0) || 1;

  const title = isKo ? "오행 에너지 균형" : "Element Balance";
  const subtitle = isKo
    ? "오행 분포의 구조적 분석"
    : "Structural analysis of five-element distribution";

  const rows: Content[] = elements.map((item) => {
    const pct = Math.round((item.count / total) * 100);
    const label = isKo
      ? `${item.hangul} (${item.hanja})`
      : `${item.romanized} (${item.hanja})`;
    return {
      columns: [
        {
          width: "*",
          text: pdfSafeText(label),
          style: "body",
          color: OBANG_COLORS[item.key] ?? JIG_INK,
        },
        {
          width: 40,
          text: `${pct}%`,
          alignment: "right",
          style: "body",
          bold: true,
        },
      ],
      margin: [0, 0, 0, 4],
    };
  });

  const dominant = elements.reduce((best, item) =>
    item.count > best.count ? item : best
  , elements[0]);

  const dominantLabel = dominant
    ? isKo
      ? `${dominant.hangul} (${dominant.hanja})`
      : `${dominant.romanized} (${dominant.hanja})`
    : "-";

  return [
    { text: title, style: "chapterTitle", pageBreak: "before" },
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

function formatIssuedDate(iso: string, isKo: boolean): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso.slice(0, 10);
  if (isKo) {
    return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, "0")}. ${String(date.getDate()).padStart(2, "0")}`;
  }
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function buildDocumentDefinition(report: HumanPremiumReportPayload): TDocumentDefinitions {
  const isKo = report.locale === "ko";
  const footerLabel = isKo
    ? "지관재(知觀齋) Premium Report"
    : "Jigwanjae Premium Report";
  const brandLine = isKo ? "知觀齋" : "Jigwanjae (知觀齋)";
  const motto = isKo
    ? "운명을 아는 것(知)에서 그치지 않고, 그 흐름을 멀리서 관조(觀)하며 대처하는 법을 익히는 서재"
    : "A study where knowing fate (知) meets observing its flow (觀).";
  const maxim = isKo
    ? "[知運者無礙 - 운명을 아는 자는 거침이 없나니.]"
    : "[He who knows his destiny is without obstacles.]";
  const recipientLabel = isKo ? "수신" : "RECIPIENT";
  const issuedLabel = isKo ? "발행일" : "ISSUED DATE";
  const reportType = isKo ? "평생 사주 리포트" : "Lifetime Saju Report";

  const content: Content[] = [
    { text: brandLine, style: "coverBrand", alignment: "center" },
    {
      text: pdfSafeText(report.cover.subtitle),
      style: "coverSubtitle",
      alignment: "center",
      margin: [0, 4, 0, 12],
    },
    { text: motto, style: "coverMotto", alignment: "center", margin: [0, 0, 0, 8] },
    { text: maxim, style: "coverMaxim", alignment: "center", margin: [0, 0, 0, 20] },
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
            { text: reportType, style: "bodyMuted", margin: [0, 2, 0, 0] },
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
    paragraph(report.summary.story),
  ];

  if (report.summary.traits.length) {
    content.push({
      ul: report.summary.traits.map((item) => pdfSafeText(item)),
      style: "body",
      margin: [8, 0, 0, 14],
    });
  }

  content.push(...elementSummaryBlocks(report, isKo));

  for (const chapter of report.saju.chapters) {
    content.push({
      text: pdfSafeText(chapter.title),
      style: "chapterTitle",
      pageBreak: "before",
    });
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
  const docDefinition = buildDocumentDefinition(report);
  const pdfDoc = pdfMake.createPdf(docDefinition);
  return pdfDoc.getBuffer();
}
