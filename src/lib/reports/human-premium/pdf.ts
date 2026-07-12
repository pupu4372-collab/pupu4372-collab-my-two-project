import pdfMake from "pdfmake";
import type { Content, TDocumentDefinitions } from "pdfmake/interfaces";
import { ensurePdfFontsAsync, PDF_FONT_FAMILY } from "./pdf-fonts";
import type {
  HumanPremiumReportPayload,
} from "./types";
import {
  formatElementDisplayLabel,
  obangPaleHex,
  parseElementRows,
} from "./element-display";
import { loadJigwanjaeCoverLogoDataUrl } from "./pdf-assets";
import { buildPdfCoverBlocks } from "./pdf-cover";
import { buildOrderedPdfBodySections } from "./pdf-sections";
import {
  pdfBorderedCard,
  pdfElementAccentColor,
  pdfProgressBar,
  PDF_SCORE_TRACK,
} from "./pdf-visuals";
import {
  HUMAN_PREMIUM_SECTION_IDS,
  type HumanPremiumSectionId,
} from "./types";
import { isHumanPremiumSectionVisible } from "./section-visibility";

const JIG_HANJI = "#F4F1EA";
const JIG_INK = "#222222";
const JIG_SEAL = "#B22222";
const JIG_MUTED = "#747878";

const TOC_TITLES_KO: Record<HumanPremiumSectionId, string> = {
  "section-cover": "표지 & 사주",
  "section-structure": "사주 구조 해석",
  "section-metrics": "핵심 운세 지표",
  "section-depth": "심층 분석",
  "section-opportunity": "포착할 기회",
  "section-risk": "예측 리스크",
  "section-roadmap": "시간 로드맵",
  "section-prophecy": "잠겨진 천명",
};

const TOC_TITLES_EN: Record<HumanPremiumSectionId, string> = {
  "section-cover": "Cover & pillars",
  "section-structure": "Chart structure",
  "section-metrics": "Key indicators",
  "section-depth": "Deep analysis",
  "section-opportunity": "Opportunities",
  "section-risk": "Risks",
  "section-roadmap": "Roadmap",
  "section-prophecy": "Locked destiny",
};

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

function elementBar(percent: number, color: string, maxWidth = 160): Content {
  return pdfProgressBar(percent, color, maxWidth, 8, PDF_SCORE_TRACK);
}

/** Web-parity 5-element cards (pale fill + accent gauge). */
function elementSummaryBlocks(
  report: HumanPremiumReportPayload,
  isKo: boolean,
  options?: { pageBreak?: boolean }
): Content[] {
  const elements = parseElementRows(report.saju.elements);
  if (!elements.length) return [];

  const title = isKo ? "오행 에너지 균형" : "Element Balance";
  const subtitle = isKo
    ? "오행 분포의 구조적 분석"
    : "Structural analysis of five-element distribution";

  const dominant = elements.reduce(
    (best, item) => (item.count > best.count ? item : best),
    elements[0]
  );

  const cards: Content[] = elements.map((item) => {
    const barColor = pdfElementAccentColor(item.key);
    const isDominant = dominant?.key === item.key;
    const label = formatElementDisplayLabel(item, isKo);
    return pdfBorderedCard(
      [
        {
          columns: [
            {
              text: pdfSafeText(label),
              width: "*",
              style: "labelCaps",
              color: barColor,
              margin: [0, 0, 0, 0],
            },
            {
              text: `${item.percent}%`,
              width: 40,
              alignment: "right",
              style: "elementPercent",
            },
          ],
          margin: [0, 0, 0, 4],
        },
        {
          text: pdfSafeText(item.meaning),
          style: "sectionTitle",
          margin: [0, 0, 0, 6],
        },
        elementBar(item.percent, barColor, 180),
      ],
      {
        fillColor: obangPaleHex(item.key, isDominant ? 18 : 14),
        borderColor: isDominant ? barColor : "#E0DDD4",
        margin: [0, 0, 0, 8],
        unbreakable: true,
      }
    );
  });

  // 2 + 2 + 1 layout via consecutive cards (pdfmake-friendly)
  const titleBlock: Content =
    options?.pageBreak === false
      ? { text: title, style: "chapterTitle", margin: [0, 8, 0, 4] }
      : { text: title, style: "chapterTitle", pageBreak: "before" };

  return [
    titleBlock,
    { text: subtitle, style: "chapterSubtitle", margin: [0, 0, 0, 10] },
    ...cards,
    { text: "", margin: [0, 0, 0, 8] },
  ];
}

/**
 * TOC page matching web ReportToc (2×4 numbered titles).
 * Cover bullets (traits / 분석 모드) are intentionally NOT used here —
 * those are cover metadata, not a shared pet-template fallback.
 */
function tableOfContentsBlocks(
  report: HumanPremiumReportPayload,
  isKo: boolean
): Content[] {
  const titles = isKo ? TOC_TITLES_KO : TOC_TITLES_EN;
  const items = HUMAN_PREMIUM_SECTION_IDS.filter((id) =>
    id === "section-cover" ? true : isHumanPremiumSectionVisible(report, id)
  ).map((id, index) => ({
    num: index + 1,
    title: titles[id],
  }));

  const rows: Content[] = [];
  for (let r = 0; r < 2; r += 1) {
    const slice = items.slice(r * 4, r * 4 + 4);
    if (!slice.length) break;
    rows.push({
      columns: slice.map((item) => ({
        width: "*",
        stack: [
          {
            text: String(item.num),
            alignment: "center",
            bold: true,
            fontSize: 14,
            color: JIG_SEAL,
            margin: [0, 0, 0, 4],
          },
          {
            text: pdfSafeText(item.title),
            alignment: "center",
            fontSize: 9,
            color: JIG_INK,
          },
        ],
      })),
      columnGap: 8,
      margin: [0, 0, 0, 18],
    });
  }

  return [
    {
      text: isKo ? "목차" : "Contents",
      style: "chapterTitle",
      pageBreak: "before",
      alignment: "center",
      margin: [0, 24, 0, 8],
    },
    {
      text: isKo ? "CONTENTS" : "CONTENTS",
      style: "labelCaps",
      alignment: "center",
      color: JIG_SEAL,
      margin: [0, 0, 0, 24],
    },
    ...rows,
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

  // Cover bullets (분석 모드 / traits) are cover metadata — not a TOC.
  // Manse table lives on the cover via buildPdfCoverBlocks (human-only; not pet-shared).
  content.push(...tableOfContentsBlocks(report, isKo));
  content.push(...elementSummaryBlocks(report, isKo, { pageBreak: true }));
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
      coverSubtitle: { fontSize: 14, color: JIG_INK },
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
