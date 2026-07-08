import pdfMake from "pdfmake";
import type { Content, TDocumentDefinitions } from "pdfmake/interfaces";
import { ELEMENT_TRACK_COLOR } from "@/lib/reports/human-premium/element-display";
import { ensurePdfFontsAsync, PDF_FONT_FAMILY } from "@/lib/reports/human-premium/pdf-fonts";
import { elementBarHex, elementSoftHex, PET_PREMIUM_SECTION_THEME } from "@/lib/saju/element-colors";
import type { ElementRelation } from "@/lib/saju/compatibility/elements-cycle";
import type { PetPremiumPdfPayload } from "./types";
import {
  bondScoreGauge,
  chapterBanner,
  compatibilityDetailCards,
  coverBackgroundShapes,
  coverTopAccentBar,
  elementHighlightBox,
  elementPill,
  mbtiAxisBarColor,
  pillWithBody,
  PET_PREMIUM_LABEL_THEME,
  subheadingPill,
} from "./pdf-layout";

const JIG_HANJI = "#F4F1EA";
const JIG_INK = "#222222";
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

function mbtiAxisBar(
  leftLabel: string,
  rightLabel: string,
  leftPct: number,
  rightPct: number
): Content {
  const leftDominant = leftPct >= rightPct;
  const barColor = mbtiAxisBarColor(leftDominant);
  return {
    stack: [
      {
        columns: [
          {
            text: pdfSafeText(`${leftLabel} ${leftPct}%`),
            width: "*",
            style: leftDominant ? "axisLabelBold" : "axisLabel",
          },
          {
            text: pdfSafeText(`${rightLabel} ${rightPct}%`),
            width: "*",
            alignment: "right",
            style: !leftDominant ? "axisLabelBold" : "axisLabel",
          },
        ],
        margin: [0, 0, 0, 2],
      },
      elementBar(leftDominant ? leftPct : rightPct, barColor, 220),
    ],
    margin: [0, 0, 0, 8],
  };
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

function relationTint(relation: ElementRelation): string {
  if (relation.includes("nourishes")) return elementSoftHex("wood");
  if (relation.includes("controls")) return elementSoftHex("earth");
  return elementSoftHex("metal");
}

function buildCover(payload: PetPremiumPdfPayload): Content[] {
  const isKo = payload.locale === "ko";
  const accent = elementBarHex(payload.dominantElement);
  const soft = elementSoftHex(payload.dominantElement);
  const title = isKo
    ? `${payload.petName} 프리미엄 케어 가이드`
    : `${payload.petName} Premium Care Guide`;
  const issued = formatKstIssuedDate(payload.issuedDateKst, isKo);

  return [
    coverBackgroundShapes(),
    coverTopAccentBar(accent),
    { text: "K-Saju Pet", style: "coverBrand", color: accent, margin: [0, 8, 0, 6] },
    { text: pdfSafeText(title), style: "reportTypeTitle", margin: [0, 0, 0, 20] },
    elementPill(
      isKo ? `대표 오행 · ${payload.dominantElementLabel}` : `Dominant · ${payload.dominantElementLabel}`,
      payload.dominantElement,
      [0, 0, 0, 16]
    ),
    {
      columns: [
        {
          width: "*",
          stack: [
            { text: isKo ? "이름" : "Name", style: "labelCaps" },
            { text: pdfSafeText(payload.petName), style: "personName", margin: [0, 2, 0, 10] },
            { text: isKo ? "종" : "Species", style: "labelCaps" },
            { text: pdfSafeText(payload.speciesLabel), style: "body", margin: [0, 2, 0, 10] },
          ],
        },
        {
          width: "*",
          stack: [
            { text: isKo ? "발급일 (KST)" : "Issued (KST)", style: "labelCaps" },
            { text: pdfSafeText(issued), style: "body", margin: [0, 2, 0, 10] },
            { text: isKo ? "포함 섹션" : "Sections", style: "labelCaps" },
            {
              text: isKo ? "MBTI · 궁합 · 별자리" : "MBTI · Bond · Zodiac",
              style: "body",
              color: accent,
              margin: [0, 2, 0, 0],
            },
          ],
        },
      ],
      margin: [0, 0, 0, 20],
    },
    {
      text: isKo
        ? "상세 MBTI · 집사 궁합 · 별자리 케어를 한 권에 담았어요."
        : "Detailed MBTI, pet–butler bond, and zodiac care in one guide.",
      style: "coverMotto",
      margin: [0, 8, 0, 0],
    },
  ];
}

function buildMbtiSection(payload: PetPremiumPdfPayload): Content[] {
  const isKo = payload.locale === "ko";
  const mbti = payload.mbti;
  if (!mbti) {
    return [
      chapterBanner("mbti", 1, isKo, true),
      paragraph(
        isKo
          ? "MBTI 설문을 완료하면 이 섹션이 채워집니다."
          : "Complete the MBTI survey to fill this section."
      ),
    ];
  }

  const sections: { key: keyof typeof mbti; titleKo: string; titleEn: string }[] = [
    { key: "personalityBlend", titleKo: "성격 융합", titleEn: "Personality blend" },
    { key: "sajuCombo", titleKo: "사주 × MBTI", titleEn: "Chart × MBTI" },
    { key: "butlerFit", titleKo: "집사와의 궁합", titleEn: "Bond with butler" },
    { key: "health", titleKo: "건강·스트레스", titleEn: "Health & stress" },
    { key: "dailyCare", titleKo: "일상 케어", titleEn: "Daily care" },
  ];

  const p = mbti.axisPercents;
  const axisLabels = isKo
    ? {
        EI: ["E 외향", "I 내향"],
        SN: ["S 감각", "N 직관"],
        TF: ["T 사고", "F 감정"],
        JP: ["J 판단", "P 인식"],
      }
    : {
        EI: ["E Extraversion", "I Introversion"],
        SN: ["S Sensing", "N Intuition"],
        TF: ["T Thinking", "F Feeling"],
        JP: ["J Judging", "P Perceiving"],
      };

  const label = PET_PREMIUM_LABEL_THEME;

  const blocks: Content[] = [
    chapterBanner("mbti", 1, isKo, true),
    subheadingPill(`${mbti.mbtiType} · ${isKo ? "4축 성향" : "Four-axis tendency"}`, label.accent, label.soft),
    mbtiAxisBar(axisLabels.EI[0], axisLabels.EI[1], p.EI.E, p.EI.I),
    mbtiAxisBar(axisLabels.SN[0], axisLabels.SN[1], p.SN.S, p.SN.N),
    mbtiAxisBar(axisLabels.TF[0], axisLabels.TF[1], p.TF.T, p.TF.F),
    mbtiAxisBar(axisLabels.JP[0], axisLabels.JP[1], p.JP.J, p.JP.P),
  ];

  for (const section of sections) {
    const body = mbti[section.key];
    if (typeof body !== "string") continue;
    blocks.push(
      pillWithBody(
        isKo ? section.titleKo : section.titleEn,
        pdfSafeText(body),
        label.accent,
        label.soft
      )
    );
  }

  return blocks;
}

function buildCompatibilitySection(payload: PetPremiumPdfPayload): Content[] {
  const isKo = payload.locale === "ko";
  const theme = PET_PREMIUM_SECTION_THEME.compatibility;
  const c = payload.compatibility;
  if (!c) {
    return [
      chapterBanner("compatibility", 2, isKo, false),
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
    chapterBanner("compatibility", 2, isKo, false),
    {
      columns: [
        bondScoreGauge(c.bondScore, pdfSafeText(c.bondLabel)),
        {
          width: "*",
          stack: [
            pillWithBody(pdfSafeText(c.headline), pdfSafeText(c.story), label.accent, label.soft),
          ],
        },
      ],
      columnGap: 16,
      margin: [0, 0, 0, 14],
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
  blocks.push(
    elementHighlightBox(pdfSafeText(c.relationDescription ?? c.story), petEl)
  );

  if (c.petElementNote) {
    blocks.push(
      pillWithBody(
        isKo ? "펫 오행 포인트" : "Pet element note",
        pdfSafeText(c.petElementNote),
        elementBarHex(petEl),
        elementSoftHex(petEl)
      )
    );
  }

  if (c.careTips?.length) {
    blocks.push({
      text: isKo ? "케어 팁" : "Care tips",
      style: "sectionHeading",
    });
    blocks.push({
      ul: c.careTips.map((tip) => pdfSafeText(tip)),
      style: "body",
      margin: [8, 0, 0, 10],
    });
  }

  return blocks;
}

function buildZodiacSection(payload: PetPremiumPdfPayload): Content[] {
  const isKo = payload.locale === "ko";
  const z = payload.zodiac;
  if (!z) {
    return [
      chapterBanner("zodiac", 3, isKo, false),
      paragraph(isKo ? "별자리 데이터를 불러올 수 없습니다." : "Zodiac data unavailable."),
    ];
  }

  const label = PET_PREMIUM_LABEL_THEME;
  const el = z.elementAffinity;
  const blocks: Content[] = [
    chapterBanner("zodiac", 3, isKo, false),
    pillWithBody(pdfSafeText(z.personality.headline), pdfSafeText(z.personality.story), label.accent, label.soft),
    elementPill(
      isKo ? `오행 바이브 · ${z.elementLabel.hangul}(${z.elementLabel.hanja})` : `Element · ${z.elementLabel.meaning}`,
      el,
      [0, 4, 0, 12]
    ),
  ];

  if (z.personality.details?.length) {
    blocks.push({
      text: isKo ? "상세 해석" : "Detailed reading",
      style: "sectionHeading",
    });
    for (const detail of z.personality.details) {
      blocks.push(
        pillWithBody(pdfSafeText(detail.title), pdfSafeText(detail.body), label.accent, label.soft)
      );
    }
  }

  blocks.push({
    text: isKo
      ? `오늘의 운세 (발급일 기준 · ${payload.issuedDateKst})`
      : `Today's fortune (as of issue date · ${payload.issuedDateKst})`,
    style: "sectionHeading",
  });
  blocks.push(elementHighlightBox(pdfSafeText(z.daily.today), el));
  blocks.push(
    paragraph(
      isKo
        ? `럭키 간식: ${z.daily.luckySnack} · 주의: ${z.daily.caution}`
        : `Lucky snack: ${z.daily.luckySnack} · Caution: ${z.daily.caution}`
    )
  );
  blocks.push(paragraph(isKo ? `집사 팁: ${z.daily.ownerTip}` : `Butler tip: ${z.daily.ownerTip}`));

  return blocks;
}

function buildDocumentDefinition(payload: PetPremiumPdfPayload): TDocumentDefinitions {
  const isKo = payload.locale === "ko";
  const footerLabel = "K-Saju Pet Premium Care Guide";

  const content: Content[] = [
    ...buildCover(payload),
    ...buildMbtiSection(payload),
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
    pageMargins: [56, 56, 56, 68],
    defaultStyle: {
      font: PDF_FONT_FAMILY,
      fontSize: 10.5,
      color: JIG_INK,
      lineHeight: 1.45,
    },
    styles: {
      coverBrand: { fontSize: 20, bold: true, color: JIG_INK },
      reportTypeTitle: { fontSize: 22, bold: true, color: JIG_INK },
      coverMotto: { fontSize: 11, color: JIG_MUTED, lineHeight: 1.5 },
      labelCaps: { fontSize: 8, bold: true, color: JIG_MUTED },
      personName: { fontSize: 14, bold: true, color: JIG_INK },
      sectionHeading: { fontSize: 13, bold: true, color: JIG_INK, margin: [0, 10, 0, 4] },
      body: { fontSize: 10.5, color: JIG_INK },
      axisLabel: { fontSize: 9.5, color: JIG_MUTED },
      axisLabelBold: { fontSize: 9.5, bold: true, color: JIG_INK },
      disclaimer: { fontSize: 9.5, color: JIG_MUTED, alignment: "center" },
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
        ],
      };
    },
    footer(currentPage) {
      return {
        margin: [56, 12, 56, 32],
        columns: [
          {
            text: footerLabel,
            alignment: "left",
            fontSize: 8,
            color: JIG_MUTED,
            width: "*",
          },
          {
            text: "·",
            alignment: "center",
            fontSize: 8,
            color: JIG_MUTED,
            width: 16,
          },
          {
            text: String(currentPage),
            alignment: "right",
            fontSize: 8,
            color: JIG_MUTED,
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
