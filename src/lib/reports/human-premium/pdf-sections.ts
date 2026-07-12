import type { Content } from "pdfmake/interfaces";
import {
  COHORT_INSIGHT_TITLE_EN,
  COHORT_INSIGHT_TITLE_KO,
  stripCohortBodyPrefix,
} from "./cohort-insight-labels";
import {
  prophecyMantra,
} from "./prophecy-labels";
import {
  pdfBorderedCard,
  pdfInsetTip,
  pdfScoreBar,
  pdfTimelineItem,
  PDF_JIG_MUTED,
  PDF_JIG_OBANG_RED,
  PDF_JIG_SEAL,
  PDF_OPPORTUNITY_ACCENT,
  PDF_OPPORTUNITY_FILL,
  PDF_OPPORTUNITY_BORDER,
  PDF_OPPORTUNITY_TIP_FILL,
  PDF_PAPER_BORDER,
  PDF_PAPER_FILL,
  PDF_PROPHECY_BORDER,
  PDF_PROPHECY_FILL,
  PDF_PROPHECY_INK,
  PDF_PROPHECY_MUTED,
  PDF_RISK_FILL,
  PDF_RISK_BORDER,
  PDF_RISK_TIP_FILL,
} from "./pdf-visuals";
import {
  findChapterSection,
  isHumanPremiumSectionVisible,
  sectionBodyText,
} from "./section-visibility";
import type {
  HumanPremiumReportPayload,
  HumanPremiumSectionId,
} from "./types";
import { DEFAULT_REPORT_TYPE, HUMAN_PREMIUM_SECTION_IDS } from "./types";
import {
  normalizeDecisionScriptQuotes,
  normalizeOpportunityTip,
  normalizeRiskCountermeasure,
  sanitizeLlmSlotText,
} from "@/lib/saju/llm/slot-output-sanitize";

function pdfSafeText(value: string): string {
  return value
    .replace(/[\u2648-\u2653]/g, "")
    .replace(/[\uFE0E\uFE0F]/g, "")
    .replace(/[\uD800-\uDFFF]/g, "")
    .replace(/[•·]/g, "-")
    .replace(/[–—]/g, "-");
}

function paragraph(text: string, style: string = "body"): Content {
  const cleaned = sanitizeLlmSlotText("pdf:body", text);
  return { text: pdfSafeText(cleaned), style, margin: [0, 0, 0, 8] };
}

function chapterHeading(title: string, subtitle?: string): Content[] {
  const blocks: Content[] = [
    {
      text: pdfSafeText(title),
      style: "chapterTitle",
      pageBreak: "before",
    },
  ];
  if (subtitle?.trim()) {
    blocks.push({
      text: pdfSafeText(subtitle),
      style: "chapterSubtitle",
      margin: [0, 0, 0, 8],
    });
  }
  return blocks;
}

function labelCaps(text: string): Content {
  return {
    text: pdfSafeText(text),
    style: "labelCaps",
    margin: [0, 0, 0, 6],
  };
}

function metricsBlocks(report: HumanPremiumReportPayload, isKo: boolean): Content[] {
  const scores = report.structured?.scores ?? [];
  const header = isKo
    ? "핵심 운세 지표는 6개 영역 각각 100점 만점으로 읽습니다. 최저 40점은 '조건부 강점'으로 해석합니다."
    : "Six domains are scored out of 100. Scores at or above 40 are read as conditional strengths.";

  const blocks: Content[] = [paragraph(header)];

  for (const item of scores) {
    blocks.push(
      pdfBorderedCard(
        [
          {
            columns: [
              {
                text: pdfSafeText(item.label),
                width: "*",
                style: "sectionTitle",
                margin: [0, 0, 0, 0],
              },
              {
                text: [
                  { text: String(item.score), bold: true, fontSize: 16, color: PDF_JIG_SEAL },
                  { text: "/100", fontSize: 10, color: PDF_JIG_MUTED },
                ],
                width: 52,
                alignment: "right",
              },
            ],
            columnGap: 8,
            margin: [0, 0, 0, 2],
          },
          pdfScoreBar(item.score),
          paragraph(item.description),
        ],
        { fillColor: PDF_PAPER_FILL, borderColor: PDF_PAPER_BORDER }
      )
    );
  }

  return blocks;
}

function opportunitiesBlocks(report: HumanPremiumReportPayload, isKo: boolean): Content[] {
  const items = report.structured?.opportunities ?? [];
  const catchLabel = isKo ? "잡는 법" : "How to catch";

  return items.map((item, index) =>
    pdfBorderedCard(
      [
        labelCaps(String(index + 1).padStart(2, "0")),
        {
          text: pdfSafeText(item.title),
          style: "sectionTitle",
          margin: [0, 0, 0, 4],
        },
        paragraph(item.body),
        pdfInsetTip(
          catchLabel,
          pdfSafeText(
            normalizeOpportunityTip(sanitizeLlmSlotText("pdf:opportunity.tip", item.tip))
          ),
          {
            fillColor: PDF_OPPORTUNITY_TIP_FILL,
            labelColor: PDF_OPPORTUNITY_ACCENT,
          }
        ),
      ],
      { fillColor: PDF_OPPORTUNITY_FILL, borderColor: PDF_OPPORTUNITY_BORDER }
    )
  );
}

function risksBlocks(report: HumanPremiumReportPayload, isKo: boolean): Content[] {
  const items = report.structured?.risks ?? [];
  const counterLabel = isKo ? "대비책" : "Countermeasure";
  const cautionLabel = isKo ? "주의" : "Caution";

  return items.map((item, index) =>
    pdfBorderedCard(
      [
        labelCaps(`${cautionLabel} ${index + 1}`),
        {
          text: pdfSafeText(item.title),
          style: "sectionTitle",
          margin: [0, 0, 0, 4],
        },
        paragraph(item.body),
        pdfInsetTip(
          counterLabel,
          pdfSafeText(
            normalizeRiskCountermeasure(
              sanitizeLlmSlotText("pdf:risk.countermeasure", item.countermeasure)
            )
          ),
          {
            fillColor: PDF_RISK_TIP_FILL,
            labelColor: PDF_JIG_OBANG_RED,
          }
        ),
      ],
      { fillColor: PDF_RISK_FILL, borderColor: PDF_RISK_BORDER }
    )
  );
}

function roadmapBlocks(report: HumanPremiumReportPayload, isKo: boolean): Content[] {
  const roadmap = report.structured?.roadmap ?? [];
  const moments = report.structured?.decisionMoments ?? [];
  const reportType = report.reportType ?? DEFAULT_REPORT_TYPE;

  const header =
    reportType === "daily"
      ? isKo
        ? "오늘 하루 시간대별 루틴과 결정의 순간을 함께 봅니다."
        : "Today's time-band routine paired with decision moments."
      : isKo
        ? "대운별 행동 전략과 결정의 순간을 함께 봅니다."
        : "Major-cycle strategies paired with decision moments.";

  const blocks: Content[] = [paragraph(header)];

  for (const item of roadmap) {
    blocks.push(
      pdfTimelineItem([
        labelCaps(item.period),
        {
          text: pdfSafeText(item.label),
          style: "sectionTitle",
          margin: [0, 0, 0, 4],
        },
        paragraph(item.body),
      ])
    );
  }

  if (moments.length) {
    blocks.push({
      text: pdfSafeText(isKo ? "결정의 순간" : "Decision moments"),
      style: "sectionTitle",
      margin: [0, 12, 0, 8],
    });
    for (const item of moments) {
      blocks.push(
        pdfBorderedCard(
          [
            {
              text: pdfSafeText(item.situation),
              style: "sectionSubtitle",
              color: PDF_JIG_SEAL,
              margin: [0, 0, 0, 6],
            },
            {
              text: pdfSafeText(
                `"${normalizeDecisionScriptQuotes(
                  sanitizeLlmSlotText("pdf:decision.script", item.script)
                )}"`
              ),
              style: "decisionQuote",
              margin: [0, 0, 0, 0],
            },
          ],
          { fillColor: PDF_PAPER_FILL, borderColor: PDF_PAPER_BORDER, margin: [0, 0, 0, 8] }
        )
      );
    }
  }

  return blocks;
}

function prophecyBlocks(report: HumanPremiumReportPayload, isKo: boolean): Content[] {
  const prophecy = report.structured?.prophecy;
  const cohort = report.structured?.cohortInsight;
  const sealed = sanitizeLlmSlotText(
    "pdf:prophecy",
    prophecy?.full ?? prophecy?.short ?? ""
  );
  const keywordCard = sanitizeLlmSlotText(
    "pdf:prophecy.short",
    prophecy?.short ?? ""
  );
  const showKeywordCard =
    Boolean(keywordCard) &&
    Boolean(prophecy?.full) &&
    keywordCard !== sanitizeLlmSlotText("pdf:prophecy.full", prophecy?.full ?? "");
  const locale = isKo ? "ko" : "en";

  const blocks: Content[] = [];

  if (showKeywordCard) {
    blocks.push(
      pdfBorderedCard(
        [
          labelCaps(isKo ? "행운 키워드" : "Lucky keywords"),
          paragraph(keywordCard),
        ],
        { fillColor: PDF_PAPER_FILL, borderColor: PDF_PAPER_BORDER }
      )
    );
  }

  blocks.push(
    pdfBorderedCard(
      [
        {
          text: pdfSafeText(sealed),
          style: "prophecySealed",
          color: PDF_PROPHECY_INK,
          margin: [0, 0, 0, 10],
        },
        {
          canvas: [
            {
              type: "line",
              x1: 0,
              y1: 0,
              x2: 420,
              y2: 0,
              lineWidth: 0.5,
              lineColor: PDF_PROPHECY_BORDER,
            },
          ],
          margin: [0, 4, 0, 8],
        },
        {
          text: pdfSafeText(prophecyMantra(isKo)),
          style: "prophecyMantra",
          color: PDF_PROPHECY_MUTED,
          alignment: "center",
          margin: [0, 0, 0, 0],
        },
      ],
      {
        fillColor: PDF_PROPHECY_FILL,
        borderColor: PDF_PROPHECY_BORDER,
        unbreakable: true,
      }
    )
  );

  if (cohort?.body?.trim()) {
    blocks.push(
      pdfBorderedCard(
        [
          labelCaps(isKo ? COHORT_INSIGHT_TITLE_KO : COHORT_INSIGHT_TITLE_EN),
          paragraph(stripCohortBodyPrefix(cohort.body, locale)),
        ],
        { fillColor: PDF_PAPER_FILL, borderColor: PDF_PAPER_BORDER }
      )
    );
  }

  return blocks;
}

function depthBlocks(report: HumanPremiumReportPayload, isKo: boolean): Content[] {
  const body = sectionBodyText(report, "section-depth");
  const domains = report.structured?.domainScores ?? [];
  const luckyDates = report.structured?.luckyDates ?? [];
  const sections = report.structured?.deepSections ?? [];
  const yearCards = report.structured?.yearCards ?? [];
  const lifeCycles = report.structured?.lifeCycles ?? [];
  const blocks: Content[] = [];

  if (body.trim()) {
    blocks.push(paragraph(body));
  }

  if (domains.length) {
    blocks.push({
      text: pdfSafeText(isKo ? "영역별 분석" : "Domain analysis"),
      style: "sectionTitle",
      margin: [0, 8, 0, 8],
    });
    for (const item of domains) {
      blocks.push(
        pdfBorderedCard(
          [
            {
              columns: [
                {
                  text: pdfSafeText(item.domain),
                  width: "*",
                  style: "sectionTitle",
                  margin: [0, 0, 0, 0],
                },
                {
                  text: [
                    { text: String(item.score), bold: true, fontSize: 14, color: PDF_JIG_SEAL },
                    { text: "/10", fontSize: 10, color: PDF_JIG_MUTED },
                  ],
                  width: 40,
                  alignment: "right",
                },
              ],
              columnGap: 8,
              margin: [0, 0, 0, 4],
            },
            pdfScoreBar(item.score * 10),
            paragraph(item.analysis),
          ],
          { fillColor: PDF_PAPER_FILL, borderColor: PDF_PAPER_BORDER }
        )
      );
    }
  }

  if (sections.length) {
    for (const item of sections) {
      blocks.push(
        pdfBorderedCard(
          [
            {
              text: pdfSafeText(item.title),
              style: "sectionTitle",
              margin: [0, 0, 0, 4],
            },
            paragraph(item.body),
          ],
          { fillColor: PDF_PAPER_FILL, borderColor: PDF_PAPER_BORDER }
        )
      );
    }
  }

  if (yearCards.length) {
    blocks.push({
      text: pdfSafeText(isKo ? "연도별 카드" : "Year cards"),
      style: "sectionTitle",
      margin: [0, 8, 0, 8],
    });
    for (const item of yearCards) {
      blocks.push(
        pdfBorderedCard(
          [
            {
              columns: [
                {
                  text: pdfSafeText(item.year),
                  width: "*",
                  style: "sectionTitle",
                  margin: [0, 0, 0, 0],
                },
                {
                  text: [
                    { text: String(item.score), bold: true, fontSize: 12, color: PDF_JIG_SEAL },
                    { text: "/100", fontSize: 9, color: PDF_JIG_MUTED },
                  ],
                  width: 48,
                  alignment: "right",
                },
              ],
              margin: [0, 0, 0, 4],
            },
            pdfScoreBar(item.score),
            paragraph(item.summary),
          ],
          { fillColor: PDF_PAPER_FILL, borderColor: PDF_PAPER_BORDER }
        )
      );
    }
  }

  if (lifeCycles.length) {
    blocks.push({
      text: pdfSafeText(isKo ? "대운 사이클" : "Major-luck cycles"),
      style: "sectionTitle",
      margin: [0, 8, 0, 8],
    });
    for (const item of lifeCycles) {
      blocks.push(
        pdfBorderedCard(
          [
            labelCaps(item.period),
            {
              text: pdfSafeText(item.title),
              style: "sectionTitle",
              margin: [0, 0, 0, 4],
            },
            paragraph(item.body),
          ],
          { fillColor: PDF_PAPER_FILL, borderColor: PDF_PAPER_BORDER }
        )
      );
    }
  }

  if (luckyDates.length) {
    const luckyLabel =
      report.reportType === "yearly"
        ? isKo
          ? "황금의 달"
          : "Golden months"
        : isKo
          ? "행운의 날짜"
          : "Lucky dates";
    blocks.push(
      pdfBorderedCard(
        [
          labelCaps(luckyLabel),
          {
            text: pdfSafeText(luckyDates.join("  ·  ")),
            style: "body",
            margin: [0, 0, 0, 0],
          },
        ],
        { fillColor: PDF_PAPER_FILL, borderColor: PDF_PAPER_BORDER }
      )
    );
  }

  return blocks;
}

function defaultSectionBlocks(
  report: HumanPremiumReportPayload,
  sectionId: HumanPremiumSectionId
): Content[] {
  const body = sectionBodyText(report, sectionId);
  if (!body) return [];
  return [paragraph(body)];
}

export function buildPdfSectionBlocks(
  report: HumanPremiumReportPayload,
  sectionId: HumanPremiumSectionId,
  isKo: boolean
): Content[] | null {
  if (sectionId === "section-cover") return null;
  if (!isHumanPremiumSectionVisible(report, sectionId)) return null;

  const meta = findChapterSection(report, sectionId);
  if (!meta) return null;

  const { section } = meta;
  const countAwareSubtitle =
    sectionId === "section-opportunity"
      ? (() => {
          const n = report.structured?.opportunities?.length ?? 0;
          return isKo
            ? `${n}가지 + 잡는 법`
            : `${n} openings + how to catch them`;
        })()
      : sectionId === "section-risk"
        ? (() => {
            const n = report.structured?.risks?.length ?? 0;
            return isKo
              ? `${n}가지 + 대비책`
              : `${n} risks + countermeasures`;
          })()
        : section.subtitle;
  const blocks = chapterHeading(section.title, countAwareSubtitle);

  switch (sectionId) {
    case "section-metrics":
      blocks.push(...metricsBlocks(report, isKo));
      break;
    case "section-depth":
      blocks.push(...depthBlocks(report, isKo));
      break;
    case "section-opportunity":
      blocks.push(...opportunitiesBlocks(report, isKo));
      break;
    case "section-risk":
      blocks.push(...risksBlocks(report, isKo));
      break;
    case "section-roadmap":
      blocks.push(...roadmapBlocks(report, isKo));
      break;
    case "section-prophecy":
      blocks.push(...prophecyBlocks(report, isKo));
      break;
    default:
      blocks.push(...defaultSectionBlocks(report, sectionId));
      break;
  }

  return blocks;
}

export function buildOrderedPdfBodySections(
  report: HumanPremiumReportPayload,
  isKo: boolean
): Content[] {
  const content: Content[] = [];

  for (const sectionId of HUMAN_PREMIUM_SECTION_IDS) {
    const blocks = buildPdfSectionBlocks(report, sectionId, isKo);
    if (blocks?.length) content.push(...blocks);
  }

  return content;
}
