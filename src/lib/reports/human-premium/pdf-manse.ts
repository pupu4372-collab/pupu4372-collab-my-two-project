import type { Content, TableCell } from "pdfmake/interfaces";
import { branchHangulLabel, charToElement, stemHangulLabel } from "@/lib/saju/elements";
import {
  BRANCH_META,
  formatTenGodLabel,
  STEM_META,
} from "@/lib/saju/sipseong";
import type { PillarDisplay } from "@/lib/saju/types";
import { obangPaleHex } from "./element-display";
import {
  PDF_JIG_HANJI,
  PDF_JIG_MUTED,
  PDF_JIG_SEAL,
  PDF_PAPER_BORDER,
  PDF_PAPER_FILL,
} from "./pdf-visuals";

export interface PdfMansePillars {
  year: PillarDisplay;
  month: PillarDisplay;
  day: PillarDisplay;
  hour: PillarDisplay | null;
}

const STEM_ORDER = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const BRANCH_ORDER = [
  "子",
  "丑",
  "寅",
  "卯",
  "辰",
  "巳",
  "午",
  "未",
  "申",
  "酉",
  "戌",
  "亥",
];

const PDF_INK = "#3E3A36";

function pdfSafeText(value: string): string {
  return value
    .replace(/[\u2648-\u2653]/g, "")
    .replace(/[\uFE0E\uFE0F]/g, "")
    .replace(/[\uD800-\uDFFF]/g, "")
    .replace(/[•·]/g, "-")
    .replace(/[–—]/g, "-");
}

function mixHex(accent: string, mixPct: number, base: string): string {
  const parse = (hex: string) => {
    const h = hex.replace("#", "");
    return [
      Number.parseInt(h.slice(0, 2), 16),
      Number.parseInt(h.slice(2, 4), 16),
      Number.parseInt(h.slice(4, 6), 16),
    ] as const;
  };
  const [ar, ag, ab] = parse(accent);
  const [br, bg, bb] = parse(base);
  const t = Math.max(0, Math.min(100, mixPct)) / 100;
  const mix = (a: number, b: number) => Math.round(a * t + b * (1 - t));
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${toHex(mix(ar, br))}${toHex(mix(ag, bg))}${toHex(mix(ab, bb))}`;
}

/** Same 공망 pair as web ManseTable.emptyBranchesForDay. */
export function emptyBranchesForDay(dayPillar: PillarDisplay): string[] {
  const stem = dayPillar.stemHanja || dayPillar.stem || dayPillar.pillar.charAt(0);
  const branch =
    dayPillar.branchHanja || dayPillar.branch || dayPillar.pillar.charAt(1);
  const stemIndex = STEM_ORDER.indexOf(stem);
  const branchIndex = BRANCH_ORDER.indexOf(branch);
  if (stemIndex < 0 || branchIndex < 0) return [];

  const cycleStartBranchIndex =
    (branchIndex - stemIndex + BRANCH_ORDER.length) % BRANCH_ORDER.length;
  return [
    BRANCH_ORDER[(cycleStartBranchIndex + 10) % BRANCH_ORDER.length],
    BRANCH_ORDER[(cycleStartBranchIndex + 11) % BRANCH_ORDER.length],
  ];
}

function pillarCellBg(hanja: string, emphasis?: boolean): string {
  const element = charToElement(hanja);
  if (!element) {
    return emphasis ? mixHex(PDF_JIG_SEAL, 6, PDF_JIG_HANJI) : "#FFFFFF";
  }
  const pale = obangPaleHex(element, emphasis ? 16 : 12, PDF_JIG_HANJI);
  return emphasis ? mixHex(PDF_JIG_SEAL, 7, pale) : pale;
}

function fortuneFill(emphasis: boolean | undefined, colIndex: number): string {
  if (emphasis) return mixHex(PDF_JIG_SEAL, 8, PDF_JIG_HANJI);
  if (colIndex % 2 === 0) return mixHex(PDF_INK, 4, PDF_JIG_HANJI);
  return mixHex(PDF_INK, 2, "#FFFFFF");
}

function tenGodFill(emphasis: boolean | undefined, colIndex: number): string {
  if (emphasis) return mixHex(PDF_JIG_SEAL, 6, PDF_JIG_HANJI);
  if (colIndex % 2 === 0) return mixHex(PDF_INK, 3, "#FFFFFF");
  return mixHex(PDF_INK, 2, PDF_JIG_HANJI);
}

function rowHeaderCell(label: string): TableCell {
  return {
    text: pdfSafeText(label),
    alignment: "left",
    fontSize: 8,
    bold: true,
    color: PDF_INK,
    margin: [2, 6, 4, 6],
    border: [false, false, false, false],
  };
}

type ManseCol = {
  key: keyof PdfMansePillars;
  label: string;
  fortune: string;
  hint: string;
  relation: string;
  emphasis?: boolean;
};

/** Full-spec 만세력 table matching web ManseTable (rows + 공망/십성). */
export function buildPdfManseTable(
  pillars: PdfMansePillars,
  hasHour: boolean,
  isKo: boolean
): Content {
  const locale = isKo ? "ko" : "en";
  const dayStem =
    pillars.day.stemHanja || pillars.day.stem || pillars.day.pillar.charAt(0);
  const emptyBranches = emptyBranchesForDay(pillars.day);

  const cols: ManseCol[] = [
    ...(hasHour && pillars.hour
      ? [
          {
            key: "hour" as const,
            label: isKo ? "생시" : "Hour",
            fortune: isKo ? "말년운" : "Late life",
            hint: isKo ? "자녀운, 결실" : "Legacy, results",
            relation: isKo ? "자녀" : "Legacy",
          },
        ]
      : []),
    {
      key: "day",
      label: isKo ? "생일" : "Day",
      fortune: isKo ? "중년운" : "Midlife",
      hint: isKo ? "정체성, 자아" : "Identity, self",
      relation: isKo ? "본인" : "Self",
      emphasis: true,
    },
    {
      key: "month",
      label: isKo ? "생월" : "Month",
      fortune: isKo ? "청년운" : "Youth",
      hint: isKo ? "부모, 사회상" : "Parents, society",
      relation: isKo ? "사회" : "Society",
    },
    {
      key: "year",
      label: isKo ? "생년" : "Year",
      fortune: isKo ? "초년운" : "Early life",
      hint: isKo ? "조상, 시대상" : "Ancestry, era",
      relation: isKo ? "조상" : "Ancestry",
    },
  ];

  const resolvePillar = (key: ManseCol["key"]): PillarDisplay | null => {
    if (key === "hour") return pillars.hour;
    return pillars[key];
  };

  const labelRow: TableCell[] = [
    { text: "", border: [false, false, false, false] },
    ...cols.map(
      (col): TableCell => ({
        text: pdfSafeText(col.label),
        alignment: "center",
        bold: true,
        fontSize: 9,
        color: PDF_INK,
        fillColor: PDF_PAPER_FILL,
        margin: [2, 5, 2, 4],
      })
    ),
  ];

  const fortuneRow: TableCell[] = [
    { text: "", border: [false, false, false, false] },
    ...cols.map(
      (col, colIndex): TableCell => ({
        stack: [
          {
            text: pdfSafeText(col.fortune),
            alignment: "center",
            bold: true,
            fontSize: 10,
            color: PDF_INK,
            margin: [0, 0, 0, 2],
          },
          {
            text: pdfSafeText(col.hint),
            alignment: "center",
            fontSize: 7,
            color: PDF_JIG_MUTED,
          },
        ],
        fillColor: fortuneFill(col.emphasis, colIndex),
        margin: [3, 6, 3, 6],
      })
    ),
  ];

  const stemRow: TableCell[] = [
    rowHeaderCell(isKo ? "천간" : "Stem"),
    ...cols.map((col): TableCell => {
      const pillar = resolvePillar(col.key);
      if (!pillar) {
        return { text: "-", alignment: "center" };
      }
      const stemHanja =
        pillar.stemHanja || pillar.stem || pillar.pillar.charAt(0);
      const hangul = isKo
        ? stemHangulLabel(stemHanja)
        : pillar.stemLabel;
      return {
        stack: [
          {
            columns: [
              {
                width: "*",
                text: "",
              },
              {
                width: "auto",
                text: pdfSafeText(stemHanja),
                fontSize: 18,
                bold: true,
                color: col.emphasis ? PDF_INK : PDF_JIG_MUTED,
                margin: [0, 0, 3, 0],
              },
              {
                width: "auto",
                text: pdfSafeText(hangul),
                fontSize: 8,
                bold: true,
                color: PDF_INK,
                margin: [0, 8, 0, 0],
              },
              {
                width: "*",
                text: "",
              },
            ],
            columnGap: 0,
          },
          {
            text: pdfSafeText(col.relation),
            alignment: "right",
            fontSize: 6.5,
            bold: true,
            color: PDF_JIG_MUTED,
            margin: [0, 4, 2, 0],
          },
        ],
        fillColor: pillarCellBg(stemHanja, col.emphasis),
        margin: [2, 6, 2, 4],
      };
    }),
  ];

  const stemTenGodRow: TableCell[] = [
    rowHeaderCell(isKo ? "십성" : "Ten god"),
    ...cols.map((col, colIndex): TableCell => {
      const pillar = resolvePillar(col.key);
      if (!pillar) {
        return { text: "-", alignment: "center" };
      }
      const stemHanja =
        pillar.stemHanja || pillar.stem || pillar.pillar.charAt(0);
      return {
        text: pdfSafeText(
          formatTenGodLabel(dayStem, STEM_META[stemHanja], locale)
        ),
        alignment: "center",
        fontSize: 8.5,
        color: PDF_INK,
        fillColor: tenGodFill(col.emphasis, colIndex),
        margin: [2, 5, 2, 5],
      };
    }),
  ];

  const branchRow: TableCell[] = [
    rowHeaderCell(isKo ? "지지" : "Branch"),
    ...cols.map((col): TableCell => {
      const pillar = resolvePillar(col.key);
      if (!pillar) {
        return { text: "-", alignment: "center" };
      }
      const branchHanja =
        pillar.branchHanja || pillar.branch || pillar.pillar.charAt(1);
      const hangul = isKo
        ? branchHangulLabel(branchHanja)
        : pillar.branchLabel;
      const branchRelation = col.emphasis
        ? isKo
          ? "배우자"
          : "Partner"
        : col.relation;
      return {
        stack: [
          {
            columns: [
              { width: "*", text: "" },
              {
                width: "auto",
                text: pdfSafeText(branchHanja),
                fontSize: 18,
                bold: true,
                color: PDF_INK,
                margin: [0, 0, 3, 0],
              },
              {
                width: "auto",
                text: pdfSafeText(hangul),
                fontSize: 8,
                bold: true,
                color: PDF_INK,
                margin: [0, 8, 0, 0],
              },
              { width: "*", text: "" },
            ],
            columnGap: 0,
          },
          {
            text: pdfSafeText(branchRelation),
            alignment: "right",
            fontSize: 6.5,
            bold: true,
            color: PDF_JIG_MUTED,
            margin: [0, 4, 2, 0],
          },
        ],
        fillColor: pillarCellBg(branchHanja, col.emphasis),
        margin: [2, 6, 2, 4],
      };
    }),
  ];

  const branchTenGodRow: TableCell[] = [
    rowHeaderCell(isKo ? "십성" : "Ten god"),
    ...cols.map((col, colIndex): TableCell => {
      const pillar = resolvePillar(col.key);
      if (!pillar) {
        return { text: "-", alignment: "center" };
      }
      const branchHanja =
        pillar.branchHanja || pillar.branch || pillar.pillar.charAt(1);
      return {
        text: pdfSafeText(
          formatTenGodLabel(dayStem, BRANCH_META[branchHanja], locale)
        ),
        alignment: "center",
        fontSize: 8.5,
        color: PDF_INK,
        fillColor: tenGodFill(col.emphasis, colIndex),
        margin: [2, 5, 2, 5],
      };
    }),
  ];

  const manseTitle = isKo ? "사주 만세력 (四柱)" : "Four pillars (Manse)";
  const colCount = cols.length;

  const voidLabel =
    emptyBranches.length > 0
      ? emptyBranches.join("")
      : "-";
  const voidRow: TableCell[] = [
    rowHeaderCell(isKo ? "공망" : "Void"),
    {
      text: pdfSafeText(
        voidLabel === "-"
          ? "-"
          : isKo
            ? `${voidLabel} 공망`
            : `${voidLabel} void`
      ),
      colSpan: colCount,
      alignment: "center",
      fontSize: 8,
      color: PDF_JIG_MUTED,
      fillColor: mixHex(PDF_INK, 3, PDF_JIG_HANJI),
      margin: [2, 5, 2, 5],
    },
    ...Array.from({ length: Math.max(0, colCount - 1) }, () => ({
      text: "",
    })),
  ];

  return {
    unbreakable: true,
    pageBreak: "before",
    stack: [
      {
        text: pdfSafeText(manseTitle),
        style: "sectionTitle",
        margin: [0, 0, 0, 10],
      },
      {
        table: {
          widths: [32, ...Array.from({ length: colCount }, () => "*")],
          body: [
            labelRow,
            fortuneRow,
            stemRow,
            stemTenGodRow,
            branchRow,
            branchTenGodRow,
            voidRow,
          ],
          dontBreakRows: true,
        },
        layout: {
          hLineWidth: (i, node) => (i === 0 || i === node.table.body.length ? 1 : 0.6),
          vLineWidth: (i, node) => {
            const widthCount = node.table.widths?.length ?? 0;
            if (i === 0) return 0;
            if (i === 1) return 1;
            if (i === widthCount) return 1;
            return 0.6;
          },
          hLineColor: () => PDF_PAPER_BORDER,
          vLineColor: () => PDF_PAPER_BORDER,
          paddingLeft: () => 0,
          paddingRight: () => 0,
          paddingTop: () => 0,
          paddingBottom: () => 0,
        },
      },
      {
        text: pdfSafeText(
          isKo
            ? `분석 모드: ${hasHour ? "사주(四柱)" : "삼주(三柱)"}`
            : `Mode: ${hasHour ? "Four pillars" : "Three pillars"}`
        ),
        style: "bodyMuted",
        alignment: "center",
        margin: [0, 8, 0, 0],
        color: PDF_JIG_SEAL,
      },
    ],
  };
}
