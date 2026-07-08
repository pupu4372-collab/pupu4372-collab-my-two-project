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

const PAGE_CONTENT_WIDTH = 483;

/** Mint label pills — aligned with cover lower band (`element-*` wood). */
export const PET_PREMIUM_LABEL_THEME = {
  accent: elementBarHex("wood"),
  soft: elementSoftHex("wood"),
} as const;

export function elementPill(label: string, element: ElementKey, margin: [number, number, number, number] = [0, 0, 0, 8]): Content {
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
            margin: [12, 6, 12, 6],
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
            fontSize: 10.5,
            margin: [12, 7, 12, 7],
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
  bodyStyle: string = "body"
): Content {
  return {
    unbreakable: true,
    stack: [
      subheadingPill(title, accent, soft, [0, 0, 0, 2]),
      { text: body, style: bodyStyle, margin: [0, 0, 0, 8] },
    ],
    margin: [0, 6, 0, 0],
  };
}

export function compatibilityDetailCards(
  details: { title: string; body: string }[],
  petElement: ElementKey,
  ownerElement: ElementKey,
  accent: string
): Content {
  const card = (title: string, body: string, borderColor: string, fillColor: string): Content => ({
    unbreakable: true,
    table: {
      widths: [4, "*"],
      body: [
        [
          { text: "", fillColor: borderColor },
          {
            stack: [
              { text: title, bold: true, fontSize: 9.5, color: accent },
              { text: body, fontSize: 9, lineHeight: 1.4, margin: [0, 4, 0, 0] },
            ],
            fillColor,
            margin: [8, 8, 8, 8],
          },
        ],
      ],
    },
    layout: {
      hLineWidth: () => 0,
      vLineWidth: () => 0,
      paddingLeft: () => 0,
      paddingRight: () => 0,
      paddingTop: () => 0,
      paddingBottom: () => 0,
    },
  });

  return {
    columns: details.slice(0, 3).map((detail, index) => ({
      width: "*",
      stack: [
        card(
          detail.title,
          detail.body,
          elementBarHex(index % 2 === 0 ? petElement : ownerElement),
          elementSoftHex(index % 2 === 0 ? petElement : ownerElement)
        ),
      ],
    })),
    columnGap: 8,
    margin: [0, 0, 0, 10],
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
    stack: [
      {
        canvas: [{ type: "rect", x: 0, y: 0, w: PAGE_CONTENT_WIDTH, h: 5, color: theme.accent }],
        margin: [0, 0, 0, 10],
      },
      {
        columns: [
          {
            width: 56,
            text: String(sectionNumber),
            fontSize: 40,
            bold: true,
            color: theme.accent,
            margin: [0, 4, 0, 0],
          },
          {
            width: "*",
            stack: [
              {
                text: title,
                fontSize: 18,
                bold: true,
                color: theme.accent,
                margin: [0, 10, 0, 2],
              },
              {
                text: isKo ? `${sectionNumber}장` : `Section ${sectionNumber}`,
                fontSize: 9,
                color: theme.accent,
              },
            ],
          },
        ],
      },
      {
        canvas: [{ type: "rect", x: 0, y: 0, w: PAGE_CONTENT_WIDTH, h: 1, color: theme.soft }],
        margin: [0, 10, 0, 0],
      },
    ],
    pageBreak: pageBreak ? "before" : undefined,
    margin: pageBreak ? [0, 0, 0, 12] : [0, 20, 0, 12],
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
  const progressPath = ringArcPath(cx, cy, radius, sweep);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="88" height="88" viewBox="0 0 88 88">
  <circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="#EFEAE0" stroke-width="7"/>
  <path d="${progressPath}" fill="none" stroke="${gradient.from}" stroke-width="9" stroke-linecap="round"/>
</svg>`;

  return {
    width: 104,
    stack: [
      {
        stack: [
          { svg, width: 88, alignment: "center" },
          {
            text: `${clamped}%`,
            alignment: "center",
            fontSize: 20,
            bold: true,
            color: gradient.from,
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
        color: gradient.to,
        margin: [0, 0, 0, 0],
      },
    ],
  } as Content;
}

export function coverTopAccentBar(accent: string): Content {
  return {
    canvas: [{ type: "rect", x: 0, y: 0, w: PAGE_CONTENT_WIDTH, h: 6, color: accent }],
    margin: [0, 0, 0, 20],
  };
}

/** A4 page size with default pet-premium margins (56pt). */
const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;

/** Cover lower band — soft mint wash (목/wood palette), not pet dominant element. */
const COVER_BAND_WASH = "#E5F4EC";
const COVER_BAND_LINE = "#B8DFC8";

export function coverBackgroundShapes(): Content {
  const bandTop = PAGE_HEIGHT - 248;
  const bandHeight = 248;
  return {
    absolutePosition: { x: 0, y: 0 },
    canvas: [
      { type: "rect", x: 0, y: bandTop, w: PAGE_WIDTH, h: bandHeight, color: COVER_BAND_WASH },
      {
        type: "line",
        x1: 56,
        y1: bandTop,
        x2: PAGE_WIDTH - 56,
        y2: bandTop,
        lineWidth: 1,
        lineColor: COVER_BAND_LINE,
      },
    ],
  };
}

export function elementHighlightBox(text: string, element: ElementKey): Content {
  return {
    table: {
      widths: ["*"],
      body: [
        [
          {
            text,
            color: elementTextHex(element),
            fillColor: elementSoftHex(element),
            fontSize: 10.5,
            lineHeight: 1.45,
            margin: [14, 12, 14, 12],
          },
        ],
      ],
    },
    layout: {
      hLineWidth: () => 0,
      vLineWidth: () => 0,
      paddingLeft: () => 0,
      paddingRight: () => 0,
      paddingTop: () => 0,
      paddingBottom: () => 0,
    },
    margin: [0, 0, 0, 10],
  };
}

export function mbtiAxisBarColor(leftDominant: boolean): string {
  return leftDominant ? PET_PREMIUM_SECTION_THEME.mbti.accent : "#A78BFA";
}

export { elementBarHex, PET_PREMIUM_SECTION_THEME };
