import { ELEMENT_META, ELEMENT_ORDER } from "@/lib/saju/elements";
import { buildPetLuckyScores, dominantElementLabel } from "@/lib/saju/pet-lucky-scores";
import type { ElementDisplay, ElementKey, Locale, SajuBasicResponse, Species } from "@/lib/saju/types";
import { getMbtiTypeData } from "@/lib/pet/mbti-types";
import { petInstaEmoji } from "@/lib/share/daily-fortune-insta-card";

const SHARE_FONT = '"SUIT Variable", "Noto Sans KR", sans-serif';
const SIZE = 1080;
const PAD = 80;
const FOOTER_H = 72;
const CONTENT_W = SIZE - PAD * 2;
const TOTAL_SLIDES = 3;

const COLORS = {
  bg: "#F6F1E4",
  ink: "#3D2A4A",
  muted: "#6B6458",
  footer: "#3A362D",
  footerText: "#F6F1E4",
  saju: "#8B5CF6",
  sajuTint: "rgba(139, 92, 246, 0.18)",
  card: "#FDFAF1",
  cardBorder: "#E4DCC8",
  cta: "#5C3D6E",
} as const;

const ELEMENT_BAR: Record<ElementKey, string> = {
  wood: "#4A9B6E",
  fire: "#C75C5C",
  earth: "#C9956A",
  metal: "#9A9488",
  water: "#3E6B8A",
};

const ELEMENT_PILL_BG: Record<ElementKey, string> = {
  wood: "#E8F5EE",
  fire: "#FBEAEA",
  earth: "#F8F0E6",
  metal: "#F0EFEC",
  water: "#E8F1F6",
};

const SPECIES_LABEL: Record<Locale, Record<Species, string>> = {
  ko: { dog: "강아지", cat: "고양이", reptile: "렙타일", other: "그외친구" },
  en: { dog: "dog", cat: "cat", reptile: "reptile", other: "pet" },
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

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  startY: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 12
) {
  const hasSpaces = /\s/.test(text);
  const units = hasSpaces ? text.split(/\s+/) : [...text];
  let line = "";
  let y = startY;
  let lines = 0;

  for (const unit of units) {
    const testLine = hasSpaces ? (line ? `${line} ${unit}` : unit) : `${line}${unit}`;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      lines += 1;
      if (lines >= maxLines) return y + lineHeight;
      line = hasSpaces ? unit : unit;
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line && lines < maxLines) ctx.fillText(line, x, y);
  return y + lineHeight;
}

function extractKeySentence(paragraph: string): string {
  const trimmed = paragraph.replace(/\s+/g, " ").trim();
  if (!trimmed) return "";
  const parts = trimmed.split(/(?<=[.!?…]|요\.|니다\.|어요\.|예요\.|합니다\.|요!|요\?)\s+/);
  return (parts[0] ?? trimmed).trim();
}

export function compressStoryForInstaSlide2(story: string, maxChars = 550): string {
  const paragraphs = story.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  const p1 = paragraphs[0] ?? "";
  const p2 = paragraphs[1] ? extractKeySentence(paragraphs[1]) : "";
  const p3 = paragraphs[2] ? extractKeySentence(paragraphs[2]) : "";
  let body = [p1, p2, p3].filter(Boolean).join("\n\n");
  if (body.length > maxChars) body = `${body.slice(0, maxChars - 1)}…`;
  return body;
}

function sortElements(result: SajuBasicResponse): ElementDisplay[] {
  const dominant = result.dominantElement;
  return [...result.elements].sort((a, b) => {
    if (a.key === dominant) return -1;
    if (b.key === dominant) return 1;
    return b.percent - a.percent;
  });
}

function personalityLine(result: SajuBasicResponse, mbtiType?: string | null): string {
  const isKo = result.locale === "ko";
  if (mbtiType) {
    const data = getMbtiTypeData(mbtiType);
    if (data) {
      return isKo
        ? `${result.petName}은(는) ${data.titleKo}`
        : `${result.petName} is the "${data.titleKo}" type`;
    }
  }
  return result.headline;
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
}

function drawFooter(ctx: CanvasRenderingContext2D, slideIndex: number) {
  const y = SIZE - FOOTER_H;
  ctx.fillStyle = COLORS.footer;
  ctx.fillRect(0, y, SIZE, FOOTER_H);
  ctx.fillStyle = COLORS.footerText;
  ctx.font = `600 24px ${SHARE_FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`ksajupet.com · ${slideIndex + 1}/${TOTAL_SLIDES}`, SIZE / 2, y + FOOTER_H / 2);
}

function elementLabel(el: ElementDisplay, isKo: boolean) {
  return isKo
    ? `${el.romanized.toUpperCase()} (${el.hanja}) ${el.hangul}`
    : `${el.romanized.toUpperCase()} (${el.hanja}) ${el.meaning}`;
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
  const barH = isDominant ? 14 : 10;
  const labelH = 34;

  roundRect(ctx, x, y, width, labelH, 999);
  ctx.fillStyle = ELEMENT_PILL_BG[el.key];
  ctx.fill();

  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = COLORS.ink;
  ctx.font = `700 ${isDominant ? 22 : 18}px ${SHARE_FONT}`;
  ctx.fillText(elementLabel(el, isKo), x + 14, y + labelH / 2);

  ctx.textAlign = "right";
  ctx.font = `800 ${isDominant ? 24 : 20}px ${SHARE_FONT}`;
  ctx.fillText(`${el.percent}%`, x + width - 14, y + labelH / 2);

  const barY = y + labelH + 8;
  roundRect(ctx, x, barY, width, barH, barH / 2);
  ctx.fillStyle = "rgba(61, 42, 74, 0.08)";
  ctx.fill();
  roundRect(ctx, x, barY, width * Math.max(0.04, el.percent / 100), barH, barH / 2);
  ctx.fillStyle = ELEMENT_BAR[el.key];
  ctx.fill();

  return barY + barH + (isDominant ? 22 : 16);
}

function renderSlide1(result: SajuBasicResponse, mbtiType?: string | null): string {
  const { canvas, ctx } = createSlideCanvas();
  const isKo = result.locale === "ko";
  const emoji = petInstaEmoji(result.species);
  const sorted = sortElements(result);
  const dominant = sorted[0]!;
  const others = sorted.slice(1);

  drawBackground(ctx);
  let y = PAD;

  ctx.textAlign = "left";
  ctx.fillStyle = COLORS.ink;
  ctx.font = `800 44px ${SHARE_FONT}`;
  y = wrapCanvasText(
    ctx,
    `${emoji} ${result.petName}${isKo ? "의 K-사주" : "'s K-Saju"}`,
    PAD,
    y + 36,
    CONTENT_W,
    52,
    2
  );

  ctx.fillStyle = COLORS.muted;
  ctx.font = `600 26px ${SHARE_FONT}`;
  y = wrapCanvasText(ctx, personalityLine(result, mbtiType), PAD, y + 8, CONTENT_W, 34, 2);

  if (mbtiType) {
    const badgeW = Math.min(CONTENT_W, ctx.measureText(mbtiType).width + 56);
    const badgeH = 52;
    roundRect(ctx, PAD, y + 10, badgeW, badgeH, badgeH / 2);
    ctx.fillStyle = COLORS.sajuTint;
    ctx.fill();
    ctx.fillStyle = COLORS.saju;
    ctx.font = `800 36px ${SHARE_FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(mbtiType, PAD + badgeW / 2, y + 10 + badgeH / 2);
    y += badgeH + 24;
  } else {
    y += 16;
  }

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = COLORS.ink;
  ctx.font = `800 30px ${SHARE_FONT}`;
  ctx.fillText(isKo ? "☯️ 오행 분석" : "☯️ Five Elements", PAD, y + 8);

  ctx.fillStyle = COLORS.muted;
  ctx.font = `600 22px ${SHARE_FONT}`;
  ctx.textAlign = "right";
  ctx.fillText(
    `${isKo ? "대표 오행" : "Dominant"}: ${dominantElementLabel(result.dominantElement, result.locale)}`,
    PAD + CONTENT_W,
    y + 8
  );

  y += 36;
  y = drawElementRow(ctx, PAD, y, CONTENT_W, dominant, isKo, true);

  const gap = 20;
  const colW = (CONTENT_W - gap) / 2;
  others.forEach((el, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = PAD + col * (colW + gap);
    const rowY = y + row * 78;
    drawElementRow(ctx, x, rowY, colW, el, isKo, false);
  });

  drawFooter(ctx, 0);
  return canvas.toDataURL("image/png");
}

function renderSlide2(result: SajuBasicResponse): string {
  const { canvas, ctx } = createSlideCanvas();
  const isKo = result.locale === "ko";
  const species = SPECIES_LABEL[result.locale][result.species];

  drawBackground(ctx);
  let y = PAD;

  ctx.textAlign = "left";
  ctx.fillStyle = COLORS.ink;
  ctx.font = `800 40px ${SHARE_FONT}`;
  const title = isKo
    ? `🐾 ${result.petName}는 어떤 ${species}?`
    : `🐾 What kind of ${species} is ${result.petName}?`;
  y = wrapCanvasText(ctx, title, PAD, y + 36, CONTENT_W, 48, 3);

  ctx.fillStyle = COLORS.ink;
  ctx.font = `400 26px ${SHARE_FONT}`;
  const body = compressStoryForInstaSlide2(result.story);
  const paragraphs = body.split(/\n\n+/);
  for (const paragraph of paragraphs) {
    y = wrapCanvasText(ctx, paragraph, PAD, y + 20, CONTENT_W, 38, 20);
    y += 8;
  }

  drawFooter(ctx, 1);
  return canvas.toDataURL("image/png");
}

function drawLuckyCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  value: string,
  sub?: string
) {
  roundRect(ctx, x, y, w, h, 20);
  ctx.fillStyle = COLORS.card;
  ctx.fill();
  ctx.strokeStyle = COLORS.cardBorder;
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, w, h, 20);
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.fillStyle = COLORS.muted;
  ctx.font = `700 20px ${SHARE_FONT}`;
  ctx.fillText(label, x + w / 2, y + 34);

  ctx.fillStyle = COLORS.ink;
  ctx.font = `800 52px ${SHARE_FONT}`;
  ctx.fillText(value, x + w / 2, y + h / 2 + 12);

  if (sub) {
    ctx.fillStyle = COLORS.muted;
    ctx.font = `600 20px ${SHARE_FONT}`;
    ctx.fillText(sub, x + w / 2, y + h - 24);
  }
}

function renderSlide3(result: SajuBasicResponse): string {
  const { canvas, ctx } = createSlideCanvas();
  const isKo = result.locale === "ko";
  const lucky = buildPetLuckyScores(
    result.petName,
    result.birthUtc,
    result.dominantElement,
    result.locale
  );
  const traits = result.traits.slice(0, 4);

  drawBackground(ctx);
  let y = PAD;

  ctx.textAlign = "left";
  ctx.fillStyle = COLORS.ink;
  ctx.font = `800 34px ${SHARE_FONT}`;
  ctx.fillText(isKo ? "✨ 오늘의 펫 행운 포인트" : "✨ Today's lucky points", PAD, y + 30);
  y += 52;

  const gap = 16;
  const cardW = (CONTENT_W - gap * 2) / 3;
  const cardH = 148;
  const labels = isKo
    ? { routine: "행운 루틴", treat: "간식운", health: "컨디션운", traits: "상세 특징", cta: "우리 아이 맞춤 케어법 보러가기 →" }
    : { routine: "Lucky routine", treat: "Treat luck", health: "Condition", traits: "Trait highlights", cta: "Get personalized pet care →" };
  const routineUnit = isKo ? "회" : "x";

  drawLuckyCard(ctx, PAD, y, cardW, cardH, labels.routine, String(lucky.luckyNumber), routineUnit);
  drawLuckyCard(ctx, PAD + cardW + gap, y, cardW, cardH, labels.treat, String(lucky.wealthScore));
  drawLuckyCard(ctx, PAD + (cardW + gap) * 2, y, cardW, cardH, labels.health, String(lucky.healthScore));
  y += cardH + 28;

  ctx.textAlign = "left";
  ctx.fillStyle = COLORS.ink;
  ctx.font = `800 30px ${SHARE_FONT}`;
  ctx.fillText(labels.traits, PAD, y + 8);
  y += 36;

  const pillGap = 14;
  const pillW = (CONTENT_W - pillGap) / 2;
  const pillH = 52;
  traits.forEach((trait, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = PAD + col * (pillW + pillGap);
    const py = y + row * (pillH + pillGap);
    roundRect(ctx, x, py, pillW, pillH, pillH / 2);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.strokeStyle = COLORS.cardBorder;
    ctx.lineWidth = 2;
    roundRect(ctx, x, py, pillW, pillH, pillH / 2);
    ctx.stroke();
    ctx.fillStyle = COLORS.ink;
    ctx.font = `700 22px ${SHARE_FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(trait, x + pillW / 2, py + pillH / 2);
  });

  const ctaY = SIZE - FOOTER_H - PAD - 56;
  roundRect(ctx, PAD, ctaY, CONTENT_W, 56, 28);
  ctx.fillStyle = COLORS.cta;
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `700 24px ${SHARE_FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(labels.cta, SIZE / 2, ctaY + 28);

  drawFooter(ctx, 2);
  return canvas.toDataURL("image/png");
}

async function ensureCarouselFonts() {
  if (typeof document === "undefined") return;
  await Promise.all(
    [
      `800 52px ${SHARE_FONT}`,
      `800 44px ${SHARE_FONT}`,
      `800 36px ${SHARE_FONT}`,
      `800 30px ${SHARE_FONT}`,
      `800 24px ${SHARE_FONT}`,
      `700 36px ${SHARE_FONT}`,
      `700 30px ${SHARE_FONT}`,
      `700 24px ${SHARE_FONT}`,
      `700 22px ${SHARE_FONT}`,
      `700 20px ${SHARE_FONT}`,
      `600 26px ${SHARE_FONT}`,
      `600 24px ${SHARE_FONT}`,
      `600 22px ${SHARE_FONT}`,
      `400 26px ${SHARE_FONT}`,
    ].map((spec) => document.fonts.load(spec).catch(() => undefined))
  );
}

export async function buildPetSajuInstaCarouselSlides(
  result: SajuBasicResponse,
  mbtiType?: string | null
): Promise<string[]> {
  await ensureCarouselFonts();
  return [
    renderSlide1(result, mbtiType),
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
