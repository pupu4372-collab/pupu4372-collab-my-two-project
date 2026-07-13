import type { Content } from "pdfmake/interfaces";
import {
  OBANG_COLORS,
  PDF_SCORE_BAR_FILL,
  SCORE_BAR_TRACK,
} from "./element-display";
import {
  PROPHECY_BORDER,
  PROPHECY_FILL,
  PROPHECY_INK,
  PROPHECY_MUTED,
} from "./prophecy-colors";

export const PDF_JIG_HANJI = "#F4F1EA";
export const PDF_JIG_SEAL = "#B22222";
export const PDF_JIG_MUTED = "#747878";
export const PDF_JIG_OBANG_RED = "#9A3B3B";
/** Core metric gauges — green (PDF). */
export const PDF_SCORE_FILL = PDF_SCORE_BAR_FILL;
export const PDF_SCORE_TRACK = SCORE_BAR_TRACK;
export const PDF_PAPER_FILL = "#FAF8F4";
export const PDF_PAPER_BORDER = "#E0DDD4";

/** Same muted 오방색 as web OBANG_COLORS. */
export const PDF_OBANG_COLORS = OBANG_COLORS;

export const PDF_OPPORTUNITY_FILL = "#E5F3E8";
export const PDF_OPPORTUNITY_BORDER = "#B8E6C0";
export const PDF_OPPORTUNITY_TIP_FILL = "#ECFDF5";
export const PDF_OPPORTUNITY_ACCENT = "#22C55E";

export const PDF_RISK_FILL = "#F9EFF3";
export const PDF_RISK_BORDER = "#E8C4CC";
export const PDF_RISK_TIP_FILL = "#FFF1F2";

/** Sealed prophecy card — gold field + dark ink (shared with web). */
export const PDF_PROPHECY_FILL = PROPHECY_FILL;
export const PDF_PROPHECY_BORDER = PROPHECY_BORDER;
export const PDF_PROPHECY_INK = PROPHECY_INK;
export const PDF_PROPHECY_MUTED = PROPHECY_MUTED;

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export function pdfElementAccentColor(key: string): string {
  return PDF_OBANG_COLORS[key] ?? "#888888";
}

export function pdfProgressBar(
  percent: number,
  color: string,
  maxWidth = 220,
  height = 8,
  trackColor = PDF_SCORE_TRACK
): Content {
  const clamped = clampPercent(percent);
  return {
    canvas: [
      {
        type: "rect",
        x: 0,
        y: 0,
        w: maxWidth,
        h: height,
        color: trackColor,
      },
      {
        type: "rect",
        x: 0,
        y: 0,
        w: (maxWidth * clamped) / 100,
        h: height,
        color,
      },
    ],
    margin: [0, 4, 0, 6],
  };
}

export function pdfScoreBar(score: number, maxWidth = 220): Content {
  return pdfProgressBar(score, PDF_SCORE_FILL, maxWidth, 8, PDF_SCORE_TRACK);
}

export function pdfBorderedCard(
  content: Content[],
  options: {
    fillColor: string;
    borderColor: string;
    margin?: [number, number, number, number];
    /** Keep title+body together across page breaks. */
    unbreakable?: boolean;
  }
): Content {
  return {
    unbreakable: options.unbreakable !== false,
    table: {
      widths: ["*"],
      body: [[{ stack: content, margin: [12, 10, 12, 10] }]],
    },
    layout: {
      hLineWidth: () => 1,
      vLineWidth: () => 1,
      hLineColor: () => options.borderColor,
      vLineColor: () => options.borderColor,
      paddingLeft: () => 0,
      paddingRight: () => 0,
      paddingTop: () => 0,
      paddingBottom: () => 0,
    },
    fillColor: options.fillColor,
    margin: options.margin ?? [0, 0, 0, 10],
  };
}

export function pdfInsetTip(
  label: string,
  text: string,
  options: {
    fillColor: string;
    labelColor: string;
  }
): Content {
  return {
    unbreakable: true,
    table: {
      widths: ["*"],
      body: [
        [
          {
            stack: [
              {
                text: [
                  { text: label, bold: true, color: options.labelColor },
                  { text: " · ", color: PDF_JIG_MUTED },
                  { text, color: "#222222" },
                ],
                fontSize: 10,
                lineHeight: 1.45,
              },
            ],
            margin: [10, 8, 10, 8],
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
    fillColor: options.fillColor,
    margin: [0, 6, 0, 0],
  };
}

/** Dot marker + content — matches web roadmap timeline rhythm. */
export function pdfTimelineItem(content: Content[]): Content {
  return {
    unbreakable: true,
    columns: [
      {
        width: 14,
        stack: [
          {
            canvas: [
              {
                type: "ellipse",
                x: 5,
                y: 3,
                r1: 3.5,
                r2: 3.5,
                color: PDF_JIG_SEAL,
              },
            ],
            margin: [0, 2, 0, 0],
          },
        ],
      },
      {
        width: "*",
        stack: content,
      },
    ],
    columnGap: 8,
    margin: [0, 0, 0, 10],
  };
}
