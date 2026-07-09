import type { Content } from "pdfmake/interfaces";
import {
  bondScoreRingGradient,
  elementBarHex,
  elementSoftHex,
  elementTextHex,
  PET_PREMIUM_SECTION_THEME,
  type PetPremiumSectionKey,
} from "@/lib/saju/element-colors";
import type { ElementKey } from "@/lib/saju/types";

const PAGE_CONTENT_WIDTH = 499;

/** Web-aligned PDF palette */
export const PDF_INK = "#3D2A4A";
export const PDF_MUTED = "#4B444D";
export const PDF_PRIMARY = "#442656";
export const PDF_ACCENT = "#8B5CF6";
export const PDF_PAGE_BG = "#FDFBF7";

export const PDF_PASTEL_SURFACES = [
  { fill: "#E6E1F9", border: "#C4B8F0" },
  { fill: "#E1F5F0", border: "#A8DDD2" },
  { fill: "#FCE1F1", border: "#F5B8DA" },
  { fill: "#C8E8F8", border: "#9DD4EF" },
] as const;

export const PET_PREMIUM_LABEL_THEME = {
  accent: PDF_PRIMARY,
  soft: "#E6E1F9",
} as const;

export function formatNumberedDetailBody(body: string, bodyStyle = "cardBody"): Content[] {
  const parts = body.split(/(?=[①②③④⑤])/).map((part) => part.trim()).filter(Boolean);
  if (parts.length <= 1) {
    return [{ text: body, style: bodyStyle, margin: [0, 8, 0, 0] }];
  }
  return parts.map((part, index) => ({
    text: part,
    style: bodyStyle,
    margin: [0, index === 0 ? 8 : 0, 0, 10] as [number, number, number, number],
  }));
}

export function elementPill(
  label: string,
  element: ElementKey,
  margin: [number, number, number, number] = [0, 0, 0, 8]
): Content {
  return {
    table: {
      widths: ["auto"],
      body: [
        [
          {
            text: label,
            color: elementTextHex(element),
            fillColor: elementSoftHex(element),
            bold: true,
            fontSize: 10.5,
            margin: [14, 8, 14, 8],
          },
        ],
      ],
    },
    layout: "noBorders",
    margin,
  };
}

export function subheadingPill(
  text: string,
  accent: string,
  soft: string,
  margin: [number, number, number, number] = [0, 6, 0, 4]
): Content {
  return {
    table: {
      widths: ["*"],
      body: [
        [
          {
            text,
            color: accent,
            fillColor: soft,
            bold: true,
            fontSize: 11,
            margin: [14, 9, 14, 9],
          },
        ],
      ],
    },
    layout: "noBorders",
    margin,
  };
}

/** Colored title pill + body kept together across page breaks. */
export function pillWithBody(
  title: string,
  body: string,
  accent: string,
  soft: string,
  bodyStyle: string = "cardBody"
): Content {
  return {
    unbreakable: true,
    stack: [
      subheadingPill(title, accent, soft, [0, 0, 0, 0]),
      {
        table: {
          widths: ["*"],
          body: [
            [
              {
                stack: formatNumberedDetailBody(body, bodyStyle),
                fillColor: soft,
                margin: [16, 4, 16, 14],
              },
            ],
          ],
        },
        layout: "noBorders",
      },
    ],
    margin: [0, 8, 0, 0],
  };
}

function pastelDetailCard(title: string, body: string, surface: (typeof PDF_PASTEL_SURFACES)[number]): Content {
  return {
    unbreakable: true,
    table: {
      widths: ["*"],
      body: [
        [
          {
            stack: [
              { text: title, style: "cardTitle", color: PDF_PRIMARY },
              ...formatNumberedDetailBody(body),
            ],
            fillColor: surface.fill,
            margin: [18, 16, 18, 16],
          },
        ],
      ],
    },
    layout: {
      hLineWidth: () => 1,
      vLineWidth: () => 1,
      hLineColor: () => surface.border,
      vLineColor: () => surface.border,
      paddingLeft: () => 0,
      paddingRight: () => 0,
      paddingTop: () => 0,
      paddingBottom: () => 0,
    },
    margin: [0, 0, 0, 14],
  };
}

export function compatibilityDetailCards(
  details: { title: string; body: string }[],
  _petElement: ElementKey,
  _ownerElement: ElementKey,
  _accent: string
): Content {
  return {
    stack: details.slice(0, 3).map((detail, index) =>
      pastelDetailCard(detail.title, detail.body, PDF_PASTEL_SURFACES[index % PDF_PASTEL_SURFACES.length]!)
    ),
    margin: [0, 4, 0, 8],
  };
}

export function zodiacDetailCards(details: { title: string; body: string }[]): Content {
  return {
    stack: details.map((detail, index) =>
      pastelDetailCard(detail.title, detail.body, PDF_PASTEL_SURFACES[index % PDF_PASTEL_SURFACES.length]!)
    ),
    margin: [0, 4, 0, 8],
  };
}

export function chapterBanner(
  section: PetPremiumSectionKey,
  sectionNumber: 1 | 2 | 3,
  isKo: boolean,
  pageBreak = false
): Content {
  const theme = PET_PREMIUM_SECTION_THEME[section];
  const title = isKo ? theme.labelKo : theme.labelEn;

  return {
    unbreakable: true,
    stack: [
      {
        canvas: [{ type: "rect", x: 0, y: 0, w: PAGE_CONTENT_WIDTH, h: 4, color: theme.accent }],
        margin: [0, 0, 0, 12],
      },
      {
        columns: [
          {
            width: 52,
            text: String(sectionNumber),
            fontSize: 36,
            bold: true,
            color: theme.accent,
            margin: [0, 2, 0, 0],
          },
          {
            width: "*",
            stack: [
              {
                text: title,
                style: "sectionTitle",
                color: theme.accent,
                margin: [0, 4, 0, 2],
              },
              {
                text: isKo ? `${sectionNumber}장` : `Section ${sectionNumber}`,
                fontSize: 9,
                color: PDF_MUTED,
              },
            ],
          },
        ],
      },
      {
        canvas: [{ type: "rect", x: 0, y: 0, w: PAGE_CONTENT_WIDTH, h: 1, color: theme.soft }],
        margin: [0, 12, 0, 0],
      },
    ],
    pageBreak: pageBreak ? "before" : undefined,
    margin: pageBreak ? [0, 0, 0, 24] : [0, 24, 0, 24],
  };
}

function polarOnRing(cx: number, cy: number, radius: number, degreesFromTop: number): { x: number; y: number } {
  const rad = ((degreesFromTop - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}

function ringArcPath(cx: number, cy: number, radius: number, sweepDegrees: number): string {
  if (sweepDegrees >= 359.99) {
    return `M ${cx} ${cy - radius} A ${radius} ${radius} 0 1 1 ${cx - 0.01} ${cy - radius}`;
  }
  const start = polarOnRing(cx, cy, radius, 0);
  const end = polarOnRing(cx, cy, radius, sweepDegrees);
  const largeArc = sweepDegrees > 180 ? 1 : 0;
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

export function bondScoreGauge(score: number, bondLabel: string): Content {
  const clamped = Math.min(100, Math.max(0, score));
  const radius = 34;
  const cx = 44;
  const cy = 44;
  const sweep = (360 * clamped) / 100;
  const gradient = bondScoreRingGradient(clamped);
  const ringFrom = clamped >= 90 ? gradient.from : PDF_PRIMARY;
  const ringTo = clamped >= 90 ? gradient.to : PDF_ACCENT;
  const progressPath = ringArcPath(cx, cy, radius, sweep);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="88" height="88" viewBox="0 0 88 88">
  <circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="#E6E1F9" stroke-width="7"/>
  <path d="${progressPath}" fill="none" stroke="${ringTo}" stroke-width="9" stroke-linecap="round"/>
</svg>`;

  return {
    width: 104,
    unbreakable: true,
    stack: [
      {
        stack: [
          { svg, width: 88, alignment: "center" },
          {
            text: `${clamped}%`,
            alignment: "center",
            fontSize: 20,
            bold: true,
            color: ringFrom,
            relativePosition: { x: 0, y: -52 },
          },
        ],
        margin: [0, 0, 0, 2],
      },
      {
        text: bondLabel,
        alignment: "center",
        fontSize: 8.5,
        bold: true,
        color: PDF_MUTED,
        margin: [0, 0, 0, 0],
      },
    ],
  } as Content;
}

export function coverTopAccentBar(accent: string): Content {
  return {
    canvas: [{ type: "rect", x: 0, y: 0, w: PAGE_CONTENT_WIDTH, h: 4, color: accent }],
    margin: [0, 0, 0, 0],
  };
}

/** A4 page size with default pet-premium margins (48pt). */
export const PAGE_WIDTH = 595;
export const PAGE_HEIGHT = 842;
const PAGE_MARGIN_X = 48;

export function coverBackgroundShapes(): Content {
  return {
    absolutePosition: { x: 0, y: 0 },
    canvas: [
      { type: "rect", x: 0, y: 0, w: PAGE_WIDTH, h: PAGE_HEIGHT, color: PDF_PAGE_BG },
      { type: "rect", x: 0, y: 0, w: PAGE_WIDTH, h: 220, color: "#E6E1F9" },
      { type: "rect", x: 0, y: 180, w: PAGE_WIDTH, h: 80, color: PDF_PAGE_BG },
    ],
  };
}

export function elementHighlightBox(text: string, surfaceIndex = 0): Content {
  const surface = PDF_PASTEL_SURFACES[surfaceIndex % PDF_PASTEL_SURFACES.length]!;
  return {
    unbreakable: true,
    table: {
      widths: ["*"],
      body: [
        [
          {
            text,
            color: PDF_INK,
            fillColor: surface.fill,
            fontSize: 10.5,
            lineHeight: 1.5,
            margin: [18, 16, 18, 16],
          },
        ],
      ],
    },
    layout: {
      hLineWidth: () => 1,
      vLineWidth: () => 1,
      hLineColor: () => surface.border,
      vLineColor: () => surface.border,
      paddingLeft: () => 0,
      paddingRight: () => 0,
      paddingTop: () => 0,
      paddingBottom: () => 0,
    },
    margin: [0, 0, 0, 14],
  };
}

export function careTipCards(tips: string[]): Content {
  return {
    stack: tips.map((tip, index) => {
      const surface = PDF_PASTEL_SURFACES[index % PDF_PASTEL_SURFACES.length]!;
      return {
        unbreakable: true,
        table: {
          widths: ["*"],
          body: [
            [
              {
                text: tip,
                color: PDF_INK,
                fillColor: surface.fill,
                fontSize: 10.5,
                lineHeight: 1.5,
                margin: [18, 14, 18, 14],
              },
            ],
          ],
        },
        layout: {
          hLineWidth: () => 1,
          vLineWidth: () => 1,
          hLineColor: () => surface.border,
          vLineColor: () => surface.border,
          paddingLeft: () => 0,
          paddingRight: () => 0,
          paddingTop: () => 0,
          paddingBottom: () => 0,
        },
        margin: [0, 0, 0, 10],
      } satisfies Content;
    }),
    margin: [0, 4, 0, 8],
  };
}

export function mbtiAxisBarColor(leftDominant: boolean): string {
  return leftDominant ? PET_PREMIUM_SECTION_THEME.mbti.accent : "#A78BFA";
}

export { elementBarHex, PET_PREMIUM_SECTION_THEME, PAGE_MARGIN_X };
