import { formatElementLabelForLocale } from "@/lib/saju/elements";
import { buildPetLuckyScores, dominantElementLabel } from "@/lib/saju/pet-lucky-scores";
import type { ElementDisplay, ElementKey, Locale, SajuBasicResponse, Species } from "@/lib/saju/types";

const SHARE_FONT = '"SUIT Variable", "Noto Sans KR", sans-serif';
const SIZE = 1080;
const PAD = 80;
const FOOTER_H = 96;
const CONTENT_W = SIZE - PAD * 2;
const TOTAL_SLIDES = 3;
const CONTENT_TOP = PAD;
const CONTENT_BOTTOM = SIZE - FOOTER_H - 56;

const COLORS = {
  bg: "#14203A",
  ink: "#FFFFFF",
  sub: "#A9B6D4",
  footer: "#0A1120",
  footerText: "#FFFFFF",
  glass: "rgba(255, 255, 255, 0.07)",
  glassBorder: "rgba(255, 255, 255, 0.13)",
  barTrack: "rgba(255, 255, 255, 0.12)",
  cta: "#7C5CE0",
  star: "rgba(255, 255, 255, 0.6)",
} as const;

const ELEMENT_BAR: Record<ElementKey, string> = {
  wood: "#4FD08A",
  fire: "#FF6B54",
  earth: "#F2B84B",
  metal: "#C9C4D6",
  water: "#54A8F0",
};

/** Sections that list several items keep a pill chip; single-card sections use a card header bar. */
const CHIP = {
  elements: "#5B8DEF",
  lucky: "#F2B84B",
  traits: "#4FD08A",
} as const;

const CARE_HEADER = "#F2B84B";
const NEUTRAL_HEADER = CHIP.elements;

/**
 * Care is fixed gold by meaning; the summary header color is incidental (it just
 * follows the dominant element). So when 토(土) makes them collide, the summary
 * yields to neutral blue.
 */
function summaryHeaderColor(dominant: ElementKey): string {
  const color = ELEMENT_BAR[dominant];
  return color === CARE_HEADER ? NEUTRAL_HEADER : color;
}

const LUCKY_ACCENT = {
  routine: "#4FD08A",
  treat: "#F2B84B",
  health: "#54A8F0",
} as const;

const DOT_CYCLE = ["#F2B84B", "#4FD08A", "#FF6B54", "#54A8F0"] as const;

const CHIP_H = 52;
const CHIP_R = 26;
const CHIP_PAD_X = 22;
const GLASS_R = 26;
const GLASS_BORDER = 1.5;

const TITLE_SIZE = 46;
const TITLE_LH = 58;
const BODY_SIZE = 31;
const BODY_LH = 53;
const BODY_BOX_PAD = 28;
const BODY_FIRST_BASELINE = 64;
const BODY_TEXT_X = 36;
const BODY_TEXT_W = CONTENT_W - 72;
const HEADER_BAR_H = 64;
const HEADER_LABEL_SIZE = 28;

const LUCKY_CARD_H = 280;
const TAG_H = 84;

/** Fixed star positions, kept inside the outer margin so they never touch content. */
const STARS: ReadonlyArray<readonly [number, number]> = [
  [132, 34],
  [268, 52],
  [402, 28],
  [548, 46],
  [676, 30],
  [812, 50],
  [940, 36],
  [36, 150],
  [44, 300],
  [30, 470],
  [40, 640],
  [1044, 190],
  [1036, 360],
  [1050, 540],
];

const SPECIES_LABEL: Record<Locale, Record<Species, string>> = {
  ko: { dog: "강아지", cat: "고양이", reptile: "렙타일", other: "그외친구" },
  en: { dog: "dog", cat: "cat", reptile: "reptile", other: "pet" },
};

/** Bright emoji only — the dark paw print sinks into the navy background. */
const SPECIES_EMOJI: Record<Species, string> = {
  dog: "🐶",
  cat: "🐱",
  reptile: "🦎",
  other: "🐹",
};

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function layoutLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const hasSpaces = /\s/.test(text);
  const units = hasSpaces ? text.split(/\s+/) : [...text];
  const lines: string[] = [];
  let line = "";

  for (const unit of units) {
    const testLine = hasSpaces ? (line ? `${line} ${unit}` : unit) : `${line}${unit}`;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      lines.push(line);
      if (lines.length >= maxLines) return lines;
      line = unit;
    } else {
      line = testLine;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  return lines;
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  startY: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 12
) {
  const lines = layoutLines(ctx, text, maxWidth, maxLines);
  lines.forEach((line, index) => ctx.fillText(line, x, startY + index * lineHeight));
  return startY + lines.length * lineHeight;
}

const SENTENCE_SPLIT = /(?<=[.!?…]|요\.|니다\.|어요\.|예요\.|합니다\.|요!|요\?)\s+/;

function splitSentences(text: string): string[] {
  return text.split(SENTENCE_SPLIT).map((s) => s.trim()).filter(Boolean);
}

function extractKeySentence(paragraph: string): string {
  const trimmed = paragraph.replace(/\s+/g, " ").trim();
  if (!trimmed) return "";
  return splitSentences(trimmed)[0] ?? trimmed;
}

/**
 * Trims to a character budget on sentence boundaries only, so the copy always
 * reads as a finished thought (no mid-sentence cut, no trailing ellipsis).
 * A single sentence longer than the budget is kept whole and clamped by maxLines.
 */
function truncateToSentences(text: string, maxChars: number): string {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (!trimmed || trimmed.length <= maxChars) return trimmed;

  const sentences = splitSentences(trimmed);
  let out = "";
  for (const sentence of sentences) {
    const next = out ? `${out} ${sentence}` : sentence;
    if (next.length > maxChars) break;
    out = next;
  }
  return out || sentences[0] || trimmed;
}

/**
 * sajuNarrative·pillarsSummaryLine are HTML snippets (<strong> emphasis, escaped
 * pet name). Canvas draws strings verbatim, so tags must be unwrapped to plain
 * text before the character budget is applied.
 */
function htmlToPlainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

export function compressStoryForInstaSlide2(story: string, maxChars = 550): string {
  const paragraphs = story.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  const p1 = paragraphs[0] ?? "";
  const p2 = paragraphs[1] ? extractKeySentence(paragraphs[1]) : "";
  const p3 = paragraphs[2] ? extractKeySentence(paragraphs[2]) : "";
  return truncateToSentences([p1, p2, p3].filter(Boolean).join(" "), maxChars);
}

function sortElements(result: SajuBasicResponse): ElementDisplay[] {
  const dominant = result.dominantElement;
  return [...result.elements].sort((a, b) => {
    if (a.key === dominant) return -1;
    if (b.key === dominant) return 1;
    return b.percent - a.percent;
  });
}

/**
 * 3/3 상단 사주 요약. story 폴백을 쓰지 않는다(= 2/3 본문과 중복 방지).
 * 저장된 sajuNarrative → pillarsSummaryLine 순으로 쓰고, 둘 다 없으면
 * story가 아닌 명식 데이터(일주 + 대표 오행)로 요약 한 줄을 합성한다.
 */
function sajuSummaryLine(result: SajuBasicResponse, maxChars: number): string {
  const direct = result.sajuNarrative?.trim() || result.pillarsSummaryLine?.trim();
  if (direct) return truncateToSentences(htmlToPlainText(direct), maxChars);

  const isKo = result.locale === "ko";
  const dayPillar = result.pillars.day.pillar;
  const dominant = dominantElementLabel(result.dominantElement, result.locale);
  return isKo
    ? `${result.petName} · ${dayPillar} 일주 · 대표 오행 ${dominant}`
    : `${result.petName} · ${dayPillar} day pillar · dominant ${dominant}`;
}

function createSlideCanvas(): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("CANVAS_UNAVAILABLE");
  return { canvas, ctx };
}

function drawBackground(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, SIZE, SIZE);

  ctx.fillStyle = COLORS.star;
  for (const [x, y] of STARS) {
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFooter(ctx: CanvasRenderingContext2D, slideIndex: number) {
  const y = SIZE - FOOTER_H;
  ctx.fillStyle = COLORS.footer;
  ctx.fillRect(0, y, SIZE, FOOTER_H);
  ctx.fillStyle = COLORS.footerText;
  ctx.font = `600 26px ${SHARE_FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`ksajupet.com · ${slideIndex + 1}/${TOTAL_SLIDES}`, SIZE / 2, y + FOOTER_H / 2);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
}

function drawBigTitle(ctx: CanvasRenderingContext2D, y: number, text: string): number {
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = COLORS.ink;
  ctx.font = `900 ${TITLE_SIZE}px ${SHARE_FONT}`;
  const lines = layoutLines(ctx, text, CONTENT_W, 2);
  lines.forEach((line, index) => ctx.fillText(line, PAD, y + 44 + index * TITLE_LH));
  return y + lines.length * TITLE_LH;
}

function drawSectionChip(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  label: string,
  background: string
): number {
  ctx.font = `700 30px ${SHARE_FONT}`;
  const width = ctx.measureText(label).width + CHIP_PAD_X * 2;

  roundRect(ctx, x, y, width, CHIP_H, CHIP_R);
  ctx.fillStyle = background;
  ctx.fill();

  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(label, x + CHIP_PAD_X, y + CHIP_H / 2);
  ctx.textBaseline = "alphabetic";
  return y + CHIP_H;
}

function drawGlassBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  roundRect(ctx, x, y, w, h, GLASS_R);
  ctx.fillStyle = COLORS.glass;
  ctx.fill();
  ctx.strokeStyle = COLORS.glassBorder;
  ctx.lineWidth = GLASS_BORDER;
  roundRect(ctx, x, y, w, h, GLASS_R);
  ctx.stroke();
}

/** Element colors are opaque hex; the header bar sits at 0.9 over the navy background. */
function withAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function headeredCardHeight(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxLines: number
): number {
  ctx.font = `400 ${BODY_SIZE}px ${SHARE_FONT}`;
  const lines = layoutLines(ctx, text, BODY_TEXT_W, maxLines);
  return HEADER_BAR_H + BODY_BOX_PAD * 2 + lines.length * BODY_LH;
}

/** Largest line count that still fits between `top` and `limit`, capped at `cap`. */
function fittingMaxLines(top: number, limit: number, cap: number): number {
  const room = limit - top - HEADER_BAR_H - BODY_BOX_PAD * 2;
  return Math.max(1, Math.min(cap, Math.floor(room / BODY_LH)));
}

/**
 * Glass card whose colored top bar doubles as the section label, so these
 * single-card sections no longer need a separate pill chip.
 */
function drawHeaderedCard(
  ctx: CanvasRenderingContext2D,
  y: number,
  label: string,
  headerColor: string,
  text: string,
  maxLines: number
): number {
  const h = headeredCardHeight(ctx, text, maxLines);
  drawGlassBox(ctx, PAD, y, CONTENT_W, h);

  ctx.save();
  roundRect(ctx, PAD, y, CONTENT_W, h, GLASS_R);
  ctx.clip();
  ctx.fillStyle = withAlpha(headerColor, 0.9);
  ctx.fillRect(PAD, y, CONTENT_W, HEADER_BAR_H);
  ctx.restore();

  ctx.fillStyle = "#FFFFFF";
  ctx.font = `700 ${HEADER_LABEL_SIZE}px ${SHARE_FONT}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(label, PAD + BODY_TEXT_X, y + HEADER_BAR_H / 2);

  ctx.fillStyle = COLORS.ink;
  ctx.font = `400 ${BODY_SIZE}px ${SHARE_FONT}`;
  ctx.textBaseline = "alphabetic";
  wrapCanvasText(
    ctx,
    text,
    PAD + BODY_TEXT_X,
    y + HEADER_BAR_H + BODY_FIRST_BASELINE - 20,
    BODY_TEXT_W,
    BODY_LH,
    maxLines
  );
  return y + h;
}

function elementLabel(el: ElementDisplay, isKo: boolean) {
  return isKo
    ? `${el.romanized.toUpperCase()} (${el.hanja}) ${el.hangul}`
    : formatElementLabelForLocale(el.key, "en");
}

function drawElementRow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  el: ElementDisplay,
  isKo: boolean,
  isDominant: boolean
) {
  const labelH = isDominant ? 52 : 44;
  const barH = isDominant ? 22 : 16;

  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = COLORS.ink;
  ctx.font = `700 ${isDominant ? 30 : 24}px ${SHARE_FONT}`;
  ctx.fillText(elementLabel(el, isKo), x, y + labelH / 2);

  ctx.textAlign = "right";
  ctx.fillStyle = ELEMENT_BAR[el.key];
  ctx.font = `800 ${isDominant ? 32 : 26}px ${SHARE_FONT}`;
  ctx.fillText(`${el.percent}%`, x + width, y + labelH / 2);

  const barY = y + labelH;
  roundRect(ctx, x, barY, width, barH, barH / 2);
  ctx.fillStyle = COLORS.barTrack;
  ctx.fill();
  roundRect(ctx, x, barY, width * Math.max(0.04, el.percent / 100), barH, barH / 2);
  ctx.fillStyle = ELEMENT_BAR[el.key];
  ctx.fill();

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  return barY + barH;
}

function drawLuckyCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  accent: string,
  label: string,
  value: string,
  sub?: string
) {
  drawGlassBox(ctx, x, y, w, h);

  // Color band on the top edge only; clipped so it follows the card radius.
  ctx.save();
  roundRect(ctx, x, y, w, h, GLASS_R);
  ctx.clip();
  ctx.fillStyle = accent;
  ctx.fillRect(x, y, w, 10);
  ctx.restore();

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = COLORS.sub;
  ctx.font = `700 26px ${SHARE_FONT}`;
  ctx.fillText(label, x + w / 2, y + 78);

  ctx.fillStyle = accent;
  ctx.font = `900 76px ${SHARE_FONT}`;
  ctx.fillText(value, x + w / 2, y + 190);

  if (sub) {
    ctx.fillStyle = COLORS.sub;
    ctx.font = `500 24px ${SHARE_FONT}`;
    ctx.fillText(sub, x + w / 2, y + 240);
  }

  ctx.textAlign = "left";
}

function drawLuckyRow(
  ctx: CanvasRenderingContext2D,
  y: number,
  result: SajuBasicResponse,
  isKo: boolean
) {
  const lucky = buildPetLuckyScores(
    result.petName,
    result.birthUtc,
    result.dominantElement,
    result.locale
  );

  const gap = 20;
  const cardW = (CONTENT_W - gap * 2) / 3;
  const labels = isKo
    ? { routine: "행운 루틴", treat: "간식운", health: "컨디션운" }
    : { routine: "Lucky routine", treat: "Treat luck", health: "Condition" };
  const routineUnit = isKo ? "회" : "x";

  drawLuckyCard(
    ctx,
    PAD,
    y,
    cardW,
    LUCKY_CARD_H,
    LUCKY_ACCENT.routine,
    labels.routine,
    String(lucky.luckyNumber),
    routineUnit
  );
  drawLuckyCard(
    ctx,
    PAD + cardW + gap,
    y,
    cardW,
    LUCKY_CARD_H,
    LUCKY_ACCENT.treat,
    labels.treat,
    String(lucky.wealthScore)
  );
  drawLuckyCard(
    ctx,
    PAD + (cardW + gap) * 2,
    y,
    cardW,
    LUCKY_CARD_H,
    LUCKY_ACCENT.health,
    labels.health,
    String(lucky.healthScore)
  );
}

function drawTraitPills(ctx: CanvasRenderingContext2D, y: number, traits: string[]) {
  const gap = 24;
  const tagW = (CONTENT_W - gap) / 2;

  traits.slice(0, 4).forEach((trait, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = PAD + col * (tagW + gap);
    const ty = y + row * (TAG_H + 20);

    drawGlassBox(ctx, x, ty, tagW, TAG_H);

    ctx.beginPath();
    ctx.arc(x + 40, ty + TAG_H / 2, 14, 0, Math.PI * 2);
    ctx.fillStyle = DOT_CYCLE[index % DOT_CYCLE.length]!;
    ctx.fill();

    ctx.fillStyle = COLORS.ink;
    ctx.font = `700 28px ${SHARE_FONT}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(trait, x + 72, ty + TAG_H / 2);
    ctx.textBaseline = "alphabetic";
  });
}

function renderSlide1(result: SajuBasicResponse): string {
  const { canvas, ctx } = createSlideCanvas();
  const isKo = result.locale === "ko";
  const sorted = sortElements(result);
  const dominant = sorted[0]!;
  const others = sorted.slice(1);
  const species = SPECIES_LABEL[result.locale][result.species];

  drawBackground(ctx);

  let y = CONTENT_TOP;
  y = drawBigTitle(
    ctx,
    y,
    isKo ? `✨ ${result.petName}의 K-사주` : `✨ ${result.petName}'s K-Saju`
  );
  y += 36;

  // [상단] 오행 분석 — 대표 오행 강조 + 나머지 2열 그리드
  drawSectionChip(ctx, PAD, y, isKo ? "오행 분석" : "Five Elements", CHIP.elements);
  ctx.fillStyle = COLORS.sub;
  ctx.font = `500 26px ${SHARE_FONT}`;
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillText(
    `${isKo ? "대표 오행" : "Dominant"}: ${dominantElementLabel(result.dominantElement, result.locale)}`,
    PAD + CONTENT_W,
    y + CHIP_H / 2
  );
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  y += CHIP_H + 30;

  y = drawElementRow(ctx, PAD, y, CONTENT_W, dominant, isKo, true);
  y += 28;

  const gap = 24;
  const colW = (CONTENT_W - gap) / 2;
  const rowPitch = 88;
  others.forEach((el, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    drawElementRow(ctx, PAD + col * (colW + gap), y + row * rowPitch, colW, el, isKo, false);
  });

  // [하단] 오늘의 {종} 행운 포인트 — 하단 정렬로 남는 세로 공간을 흡수
  const luckyTop = CONTENT_BOTTOM - (CHIP_H + 30 + LUCKY_CARD_H);
  drawSectionChip(
    ctx,
    PAD,
    luckyTop,
    isKo ? `오늘의 ${species} 행운 포인트` : "Today's lucky points",
    CHIP.lucky
  );
  drawLuckyRow(ctx, luckyTop + CHIP_H + 30, result, isKo);

  drawFooter(ctx, 0);
  return canvas.toDataURL("image/png");
}

function renderSlide2(result: SajuBasicResponse): string {
  const { canvas, ctx } = createSlideCanvas();
  const isKo = result.locale === "ko";
  const species = SPECIES_LABEL[result.locale][result.species];

  drawBackground(ctx);

  const emoji = SPECIES_EMOJI[result.species];

  let y = CONTENT_TOP;
  y = drawBigTitle(
    ctx,
    y,
    isKo
      ? `${emoji} ${result.petName}는 어떤 ${species}?`
      : `${emoji} What kind of ${species} is ${result.petName}?`
  );
  y += 36;

  // [하단] 상세 특징 태그는 하단 정렬 — 성격 카드가 침범하지 않게 먼저 자리를 잡는다.
  const traitCount = Math.min(result.traits.length, 4);
  const traitRows = Math.ceil(traitCount / 2);
  const traitsTop =
    traitCount > 0
      ? CONTENT_BOTTOM - (CHIP_H + 30 + traitRows * TAG_H + (traitRows - 1) * 20)
      : CONTENT_BOTTOM;

  // [상단] 성격 설명 문단 — 헤더바가 섹션 라벨을 겸한다.
  drawHeaderedCard(
    ctx,
    y,
    isKo ? "성격" : "Personality",
    ELEMENT_BAR[result.dominantElement],
    compressStoryForInstaSlide2(result.story, 170),
    fittingMaxLines(y, traitsTop - 36, 6)
  );

  if (traitCount > 0) {
    drawSectionChip(
      ctx,
      PAD,
      traitsTop,
      isKo ? "상세 특징" : "Trait highlights",
      CHIP.traits
    );
    drawTraitPills(ctx, traitsTop + CHIP_H + 30, result.traits);
  }

  drawFooter(ctx, 1);
  return canvas.toDataURL("image/png");
}

function renderSlide3(result: SajuBasicResponse): string {
  const { canvas, ctx } = createSlideCanvas();
  const isKo = result.locale === "ko";

  drawBackground(ctx);

  let y = CONTENT_TOP;
  y = drawBigTitle(
    ctx,
    y,
    isKo ? `🔮 ${result.petName}의 사주` : `🔮 ${result.petName}'s K-Saju`
  );
  y += 36;

  // [하단] CTA — 링크 없음, 시각적 안내용
  const ctaH = 108;
  const ctaY = CONTENT_BOTTOM - ctaH;

  // 케어 블록이 없으면 요약에 더 많은 줄을 허용해 아래쪽이 비지 않게 한다.
  const care = truncateToSentences(result.carePointText?.trim() ?? "", 90);
  const careCardH = care ? headeredCardHeight(ctx, care, 3) : 0;
  const summaryLimit = care ? ctaY - 40 - careCardH - 30 : ctaY - 40;

  // [상단] 사주 요약 (story 폴백 없이 dedup-safe) — 헤더바가 섹션 라벨을 겸한다.
  y = drawHeaderedCard(
    ctx,
    y,
    isKo ? "사주 요약" : "K-Saju summary",
    summaryHeaderColor(result.dominantElement),
    sajuSummaryLine(result, care ? 90 : 180),
    fittingMaxLines(y, summaryLimit, care ? 3 : 6)
  );

  // [중단] 케어 포인트 — carePointText가 있을 때만. 비면 블록 생략.
  if (care) {
    y += 30;
    drawHeaderedCard(
      ctx,
      y,
      isKo ? "케어 포인트" : "Care points",
      CARE_HEADER,
      care,
      fittingMaxLines(y, ctaY - 40, 3)
    );
  }

  roundRect(ctx, PAD, ctaY, CONTENT_W, ctaH, 54);
  ctx.fillStyle = COLORS.cta;
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `700 36px ${SHARE_FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(
    isKo ? "프로필 링크에서 확인하세요 ›" : "Link in bio ›",
    SIZE / 2,
    ctaY + ctaH / 2
  );
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  drawFooter(ctx, 2);
  return canvas.toDataURL("image/png");
}

async function ensureCarouselFonts() {
  if (typeof document === "undefined") return;
  await Promise.all(
    [
      `900 76px ${SHARE_FONT}`,
      `900 46px ${SHARE_FONT}`,
      `800 32px ${SHARE_FONT}`,
      `800 26px ${SHARE_FONT}`,
      `700 36px ${SHARE_FONT}`,
      `700 30px ${SHARE_FONT}`,
      `700 28px ${SHARE_FONT}`,
      `700 26px ${SHARE_FONT}`,
      `700 24px ${SHARE_FONT}`,
      `600 26px ${SHARE_FONT}`,
      `500 26px ${SHARE_FONT}`,
      `500 24px ${SHARE_FONT}`,
      `400 31px ${SHARE_FONT}`,
    ].map((spec) => document.fonts.load(spec).catch(() => undefined))
  );
}

export async function buildPetSajuInstaCarouselSlides(
  result: SajuBasicResponse,
  _mbtiType?: string | null
): Promise<string[]> {
  await ensureCarouselFonts();
  return [
    renderSlide1(result),
    renderSlide2(result),
    renderSlide3(result),
  ];
}

function safeFileStem(name: string) {
  const stem = name.trim().replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-");
  return stem || "pet";
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl);
  return response.blob();
}

export function canShareCarouselImageFiles(count: number): boolean {
  if (typeof navigator === "undefined" || typeof navigator.canShare !== "function") {
    return false;
  }
  try {
    const files = Array.from({ length: count }, (_, i) =>
      new File([""], `probe-${i + 1}.png`, { type: "image/png" })
    );
    return navigator.canShare({ files });
  } catch {
    return false;
  }
}

export type PetSajuInstaShareResult = "shared" | "downloaded" | "cancelled";

export async function sharePetSajuInstaCarouselSlides(
  slides: string[],
  petName: string
): Promise<PetSajuInstaShareResult> {
  const stem = safeFileStem(petName);
  const files = await Promise.all(
    slides.map(async (slide, index) => {
      const blob = await dataUrlToBlob(slide);
      return new File([blob], `${stem}-k-saju-${index + 1}.png`, { type: "image/png" });
    })
  );

  if (canShareCarouselImageFiles(files.length)) {
    try {
      await navigator.share({ files });
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return "cancelled";
      }
    }
  }

  for (let i = 0; i < slides.length; i++) {
    const anchor = document.createElement("a");
    anchor.href = slides[i]!;
    anchor.download = `${stem}-k-saju-${i + 1}.png`;
    anchor.click();
    if (i < slides.length - 1) await sleep(320);
  }

  return "downloaded";
}
