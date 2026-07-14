import pdfMake from "pdfmake";
import type { Content, TDocumentDefinitions } from "pdfmake/interfaces";
import { ensurePdfFontsAsync, PDF_FONT_FAMILY } from "@/lib/reports/human-premium/pdf-fonts";
import type { PetPremiumPdfPayload } from "./types";
import {
  bondScoreGauge,
  careTipCards,
  chapterBanner,
  compatibilityDetailCards,
  coverBackgroundShapes,
  coverTopAccentBar,
  elementHighlightBox,
  elementPill,
  PAGE_HEIGHT,
  PAGE_MARGIN_X,
  PDF_INK,
  PDF_MUTED,
  PDF_PAGE_BG,
  PDF_PRIMARY,
  PET_PREMIUM_LABEL_THEME,
  PET_PREMIUM_SECTION_THEME,
  pillWithBody,
  zodiacDetailCards,
} from "./pdf-layout";

function pdfSafeText(value: string): string {
  return value
    .replace(/[\u2648-\u2653]/g, "")
    .replace(/[\uFE0E\uFE0F]/g, "")
    .replace(/[\uD800-\uDFFF]/g, "")
    .replace(/[•·]/g, "-")
    .replace(/[–—]/g, "-");
}

function paragraph(text: string, style: string = "body"): Content {
  return { text: pdfSafeText(text), style, margin: [0, 0, 0, 10] };
}

function formatKstIssuedDate(dateKst: string, isKo: boolean): string {
  const [year, month, day] = dateKst.split("-");
  if (!year || !month || !day) return dateKst;
  if (isKo) return `${year}. ${month}. ${day}`;
  return new Date(`${dateKst}T12:00:00+09:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function buildCover(payload: PetPremiumPdfPayload): Content[] {
  const isKo = payload.locale === "ko";
  const title = isKo
    ? `${payload.petName} 프리미엄 케어 가이드`
    : `${payload.petName} Premium Care Guide`;
  const issued = formatKstIssuedDate(payload.issuedDateKst, isKo);

  return [
    coverBackgroundShapes(),
    {
      margin: [0, 96, 0, 0],
      stack: [
        coverTopAccentBar(PDF_PRIMARY),
        { text: "K-Saju Pet", style: "coverBrand", alignment: "center", margin: [0, 28, 0, 10] },
        { text: pdfSafeText(title), style: "reportTypeTitle", alignment: "center", margin: [0, 0, 0, 28] },
        {
          columns: [
            {
              width: "*",
              stack: [
                { text: isKo ? "이름" : "Name", style: "labelCaps", alignment: "center" },
                { text: pdfSafeText(payload.petName), style: "personName", alignment: "center", margin: [0, 4, 0, 16] },
                { text: isKo ? "종" : "Species", style: "labelCaps", alignment: "center" },
                { text: pdfSafeText(payload.speciesLabel), style: "body", alignment: "center", margin: [0, 4, 0, 0] },
              ],
            },
          ],
          margin: [0, 0, 0, 20],
        },
        {
          text: isKo
            ? "집사 궁합 · 별자리 케어를 한 권에 담았어요."
            : "Pet–butler bond and zodiac care in one guide.",
          style: "coverMotto",
          alignment: "center",
          margin: [0, 12, 0, 0],
        },
      ],
    },
    {
      absolutePosition: { x: PAGE_MARGIN_X, y: PAGE_HEIGHT - 108 },
      columns: [
        {
          width: "*",
          stack: [
            { text: isKo ? "발급일 (KST)" : "Issued (KST)", style: "labelCaps" },
            { text: pdfSafeText(issued), style: "body", margin: [0, 4, 0, 0] },
          ],
        },
        {
          width: "auto",
          stack: [
            elementPill(
              isKo
                ? `대표 오행 · ${payload.dominantElementLabel}`
                : `Dominant · ${payload.dominantElementLabel}`,
              payload.dominantElement,
              [0, 0, 0, 0]
            ),
          ],
        },
      ],
      columnGap: 16,
    },
  ];
}

function buildCompatibilitySection(payload: PetPremiumPdfPayload): Content[] {
  const isKo = payload.locale === "ko";
  const theme = PET_PREMIUM_SECTION_THEME.compatibility;
  const c = payload.compatibility;
  if (!c) {
    return [
      chapterBanner("compatibility", 1, isKo, true),
      paragraph(
        isKo
          ? "집사 생년월일을 입력하면 궁합 섹션이 포함됩니다."
          : "Enter butler birth info to include the bond section."
      ),
    ];
  }

  const label = PET_PREMIUM_LABEL_THEME;
  const petEl = c.petElement;
  const blocks: Content[] = [
    chapterBanner("compatibility", 1, isKo, true),
    {
      unbreakable: true,
      columns: [
        bondScoreGauge(c.bondScore, pdfSafeText(c.bondLabel)),
        {
          width: "*",
          stack: [
            pillWithBody(pdfSafeText(c.headline), pdfSafeText(c.story), label.accent, label.soft),
          ],
        },
      ],
      columnGap: 18,
      margin: [0, 0, 0, 24],
    },
  ];

  if (c.details?.length) {
    blocks.push({
      text: isKo ? "상세 궁합 해석" : "Detailed bond reading",
      style: "sectionHeading",
    });
    blocks.push(compatibilityDetailCards(c.details, petEl, c.ownerElement, theme.accent));
  }

  blocks.push({
    text: isKo ? "오행 관계" : "Element relation",
    style: "sectionHeading",
  });
  blocks.push(elementHighlightBox(pdfSafeText(c.relationDescription ?? c.story), 0));

  if (c.petElementNote) {
    blocks.push(
      pillWithBody(
        isKo ? "펫 오행 포인트" : "Pet element note",
        pdfSafeText(c.petElementNote),
        PDF_PRIMARY,
        "#E1F5F0"
      )
    );
  }

  if (c.careTips?.length) {
    blocks.push({
      text: isKo ? "케어 팁" : "Care tips",
      style: "sectionHeading",
    });
    blocks.push(careTipCards(c.careTips.map((tip) => pdfSafeText(tip))));
  }

  return blocks;
}

function buildZodiacSection(payload: PetPremiumPdfPayload): Content[] {
  const isKo = payload.locale === "ko";
  const z = payload.zodiac;
  if (!z) {
    return [
      chapterBanner("zodiac", 2, isKo, false),
      paragraph(isKo ? "별자리 데이터를 불러올 수 없습니다." : "Zodiac data unavailable."),
    ];
  }

  const label = PET_PREMIUM_LABEL_THEME;
  const el = z.elementAffinity;
  const blocks: Content[] = [
    chapterBanner("zodiac", 2, isKo, false),
    pillWithBody(pdfSafeText(z.personality.headline), pdfSafeText(z.personality.story), label.accent, label.soft),
    elementPill(
      isKo
        ? `오행 바이브 · ${z.elementLabel.hangul}(${z.elementLabel.hanja})`
        : `Element · ${z.elementLabel.meaning}`,
      el,
      [0, 8, 0, 16]
    ),
  ];

  if (z.personality.details?.length) {
    blocks.push({
      text: isKo ? "상세 해석" : "Detailed reading",
      style: "sectionHeading",
    });
    blocks.push(zodiacDetailCards(z.personality.details.map((detail) => ({
      title: pdfSafeText(detail.title),
      body: pdfSafeText(detail.body),
    }))));
  }

  blocks.push({
    text: isKo
      ? `오늘의 운세 (발급일 기준 · ${payload.issuedDateKst})`
      : `Today's fortune (as of issue date · ${payload.issuedDateKst})`,
    style: "sectionHeading",
  });
  blocks.push(elementHighlightBox(pdfSafeText(z.daily.today), 1));
  blocks.push(
    elementHighlightBox(
      isKo
        ? `럭키 간식: ${z.daily.luckySnack}`
        : `Lucky snack: ${z.daily.luckySnack}`,
      2
    )
  );
  blocks.push(
    elementHighlightBox(
      isKo ? `주의: ${z.daily.caution}` : `Caution: ${z.daily.caution}`,
      3
    )
  );
  blocks.push(
    elementHighlightBox(
      isKo ? `집사 팁: ${z.daily.ownerTip}` : `Butler tip: ${z.daily.ownerTip}`,
      0
    )
  );

  return blocks;
}

function buildDocumentDefinition(payload: PetPremiumPdfPayload): TDocumentDefinitions {
  const isKo = payload.locale === "ko";
  const footerLabel = "K-Saju Pet Premium Care Guide";

  const content: Content[] = [
    ...buildCover(payload),
    ...buildCompatibilitySection(payload),
    ...buildZodiacSection(payload),
    paragraph(
      isKo
        ? "케어 가이드는 참고용이에요. 우리 아이의 컨디션을 가장 잘 아는 건 집사님이에요."
        : "This care guide is for reference. You know your pet's condition best.",
      "disclaimer"
    ),
  ];

  return {
    info: {
      title: pdfSafeText(`${payload.petName} Premium Care`),
      author: "K-Saju Pet",
      subject: pdfSafeText(payload.petName),
    },
    pageSize: "A4",
    pageMargins: [PAGE_MARGIN_X, PAGE_MARGIN_X, PAGE_MARGIN_X, 60],
    defaultStyle: {
      font: PDF_FONT_FAMILY,
      fontSize: 10.5,
      color: PDF_INK,
      lineHeight: 1.5,
    },
    styles: {
      coverBrand: { fontSize: 18, bold: true, color: PDF_PRIMARY },
      reportTypeTitle: { fontSize: 22, bold: true, color: PDF_INK },
      coverMotto: { fontSize: 11, color: PDF_MUTED, lineHeight: 1.5 },
      labelCaps: { fontSize: 8, bold: true, color: PDF_MUTED },
      personName: { fontSize: 15, bold: true, color: PDF_INK },
      sectionTitle: { fontSize: 16, bold: true, color: PDF_INK },
      sectionHeading: { fontSize: 13, bold: true, color: PDF_PRIMARY, margin: [0, 8, 0, 8] },
      cardTitle: { fontSize: 11.5, bold: true, color: PDF_INK },
      cardBody: { fontSize: 10.5, color: PDF_INK, lineHeight: 1.5 },
      body: { fontSize: 10.5, color: PDF_INK, lineHeight: 1.5 },
      disclaimer: { fontSize: 9.5, color: PDF_MUTED, alignment: "center", lineHeight: 1.5 },
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
            color: PDF_PAGE_BG,
          },
        ],
      };
    },
    footer(currentPage) {
      return {
        margin: [PAGE_MARGIN_X, 12, PAGE_MARGIN_X, 28],
        columns: [
          {
            text: footerLabel,
            alignment: "left",
            fontSize: 8,
            color: PDF_MUTED,
            width: "*",
          },
          {
            text: "·",
            alignment: "center",
            fontSize: 8,
            color: PDF_MUTED,
            width: 16,
          },
          {
            text: String(currentPage),
            alignment: "right",
            fontSize: 8,
            color: PDF_MUTED,
            width: 28,
          },
        ],
        columnGap: 8,
      };
    },
    content,
  };
}

export async function renderPetPremiumPdf(payload: PetPremiumPdfPayload): Promise<Buffer> {
  await ensurePdfFontsAsync();
  const docDefinition = buildDocumentDefinition(payload);
  const pdfDoc = pdfMake.createPdf(docDefinition);
  return pdfDoc.getBuffer();
}
