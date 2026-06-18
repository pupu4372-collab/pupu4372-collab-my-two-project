import { ELEMENT_META } from "@/lib/saju/elements";
import type { CompatibilityResponse } from "@/lib/saju/compatibility/engine";
import type { SajuBasicResponse } from "@/lib/saju/types";
import type { ZodiacFortuneResponse } from "@/lib/saju/zodiac/engine";
import { getConfiguredAppBaseUrl } from "@/lib/app-url";
import {
  resolveShareImageUrl,
  saveFortuneStorySlidesToDevice,
} from "@/lib/share/pet-fortune-share";
import { shareKakaoFeed } from "@/lib/share/kakao-share";

const SHARE_FONT = '"SUIT Variable", "Noto Sans KR", sans-serif';
const STORY_W = 1080;
const STORY_H = 1920;
const PAD_X = 56;
const CONTENT_W = STORY_W - PAD_X * 2;
const DEFAULT_SHARE_IMAGE_PATH = "/api/fortune/share-og";

const JIG = {
  hanji: "#f4f1ea",
  surface: "#fcf9f2",
  ink: "#222222",
  seal: "#b22222",
  muted: "#444748",
  border: "rgba(34, 34, 34, 0.12)",
};

function appBase() {
  return getConfiguredAppBaseUrl();
}

export function getBasicSajuShareUrl(result: SajuBasicResponse) {
  if (result.petId) return `${appBase()}/saju/result/${result.petId}`;
  const q = new URLSearchParams({
    petName: result.petName,
    species: result.species,
    birthDate: result.birthUtc.slice(0, 10),
    locale: result.locale,
  });
  return `${appBase()}/saju?${q}`;
}

export function getZodiacShareUrl(result: ZodiacFortuneResponse) {
  if (result.petId) return `${appBase()}/saju/result/${result.petId}`;
  const q = new URLSearchParams({
    petName: result.petName,
    species: result.species,
    birthDate: result.birthDate,
    locale: result.locale,
  });
  return `${appBase()}/saju/zodiac?${q}`;
}

export function getCompatibilityShareUrl(result: CompatibilityResponse) {
  if (result.petId) return `${appBase()}/saju/result/${result.petId}`;
  return `${appBase()}/saju/compatibility`;
}

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

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  startY: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 5
) {
  const words = text.split(/\s+/);
  let line = "";
  let y = startY;
  let lines = 0;

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      lines += 1;
      if (lines >= maxLines) return y + lineHeight;
      line = word;
      y += lineHeight;
    } else {
      line = test;
    }
  }
  if (line && lines < maxLines) ctx.fillText(line, x, y);
  return y + lineHeight;
}

function drawHanjiBg(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = JIG.hanji;
  ctx.fillRect(0, 0, STORY_W, STORY_H);
  const grad = ctx.createLinearGradient(0, 0, STORY_W, STORY_H);
  grad.addColorStop(0, "rgba(255,255,255,0.35)");
  grad.addColorStop(1, "rgba(0,0,0,0.03)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, STORY_W, STORY_H);
  ctx.strokeStyle = JIG.border;
  ctx.lineWidth = 2;
  ctx.strokeRect(36, 36, STORY_W - 72, STORY_H - 72);
}

function drawCard(ctx: CanvasRenderingContext2D, y: number, h: number) {
  roundRect(ctx, PAD_X, y, CONTENT_W, h, 16);
  ctx.fillStyle = JIG.surface;
  ctx.fill();
  ctx.strokeStyle = JIG.border;
  ctx.lineWidth = 2;
  roundRect(ctx, PAD_X, y, CONTENT_W, h, 16);
  ctx.stroke();
}

async function ensureFonts() {
  if (typeof document === "undefined") return;
  await Promise.all(
    [`800 42px ${SHARE_FONT}`, `700 32px ${SHARE_FONT}`, `600 26px ${SHARE_FONT}`, `400 26px ${SHARE_FONT}`].map(
      (spec) => document.fonts.load(spec).catch(() => undefined)
    )
  );
}

function renderStorySlide(input: {
  badge: string;
  title: string;
  subtitle: string;
  body: string;
  footer: string;
  emoji?: string;
}) {
  const canvas = document.createElement("canvas");
  canvas.width = STORY_W;
  canvas.height = STORY_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("CANVAS_UNAVAILABLE");

  drawHanjiBg(ctx);

  ctx.textAlign = "center";
  ctx.fillStyle = JIG.seal;
  ctx.font = `700 30px ${SHARE_FONT}`;
  ctx.fillText("지관재 (知觀齋)", STORY_W / 2, 72);

  ctx.fillStyle = JIG.ink;
  ctx.font = `800 36px ${SHARE_FONT}`;
  ctx.fillText("K-Saju Pet", STORY_W / 2, 118);

  ctx.fillStyle = JIG.muted;
  ctx.font = `600 24px ${SHARE_FONT}`;
  ctx.fillText(input.badge, STORY_W / 2, 156);

  if (input.emoji) {
    ctx.font = `88px ${SHARE_FONT}`;
    ctx.fillText(input.emoji, STORY_W / 2, 250);
  }

  const cardY = input.emoji ? 290 : 200;
  const cardH = STORY_H - cardY - 120;
  drawCard(ctx, cardY, cardH);

  ctx.textAlign = "left";
  ctx.fillStyle = JIG.ink;
  ctx.font = `800 42px ${SHARE_FONT}`;
  wrapText(ctx, input.title, PAD_X + 40, cardY + 64, CONTENT_W - 80, 52, 2);

  ctx.fillStyle = JIG.seal;
  ctx.font = `700 28px ${SHARE_FONT}`;
  wrapText(ctx, input.subtitle, PAD_X + 40, cardY + 180, CONTENT_W - 80, 38, 2);

  ctx.fillStyle = JIG.muted;
  ctx.font = `400 28px ${SHARE_FONT}`;
  wrapText(ctx, input.body, PAD_X + 40, cardY + 260, CONTENT_W - 80, 40, 6);

  ctx.textAlign = "center";
  ctx.fillStyle = JIG.muted;
  ctx.font = `600 24px ${SHARE_FONT}`;
  ctx.fillText(input.footer, STORY_W / 2, STORY_H - 64);

  return canvas.toDataURL("image/png");
}

async function kakaoFeed(input: {
  title: string;
  description: string;
  shareUrl: string;
  buttonTitle: string;
  imageUrl?: string;
}) {
  await shareKakaoFeed({
    title: input.title,
    description: input.description.replace(/\s+/g, " ").trim(),
    shareUrl: input.shareUrl,
    buttonTitle: input.buttonTitle,
    imageUrl: input.imageUrl ?? `${appBase()}${DEFAULT_SHARE_IMAGE_PATH}`,
  });
}

export async function shareBasicSajuToKakao(result: SajuBasicResponse) {
  const isKo = result.locale === "ko";
  const el = ELEMENT_META[result.dominantElement];
  const shareUrl = getBasicSajuShareUrl(result);

  await kakaoFeed({
    title: isKo
      ? `지관재 · ${result.petName} K-사주`
      : `Jigwanjae · ${result.petName} K-Saju`,
    description: `${el.hanja} ${el.hangul} · ${result.headline} ${result.story}`.replace(/\s+/g, " ").trim(),
    shareUrl,
    buttonTitle: isKo ? "사주 보기" : "View reading",
  });
}

export async function shareZodiacToKakao(result: ZodiacFortuneResponse) {
  const isKo = result.locale === "ko";
  const shareUrl = getZodiacShareUrl(result);

  await kakaoFeed({
    title: isKo
      ? `지관재 · ${result.petName} 별자리 운세`
      : `Jigwanjae · ${result.petName} zodiac fortune`,
    description: `${result.sign.displayName} · ${result.daily.keyword} · ${result.daily.today}`.replace(
      /\s+/g,
      " "
    ),
    shareUrl,
    buttonTitle: isKo ? "운세 보기" : "View fortune",
  });
}

export async function shareCompatibilityToKakao(result: CompatibilityResponse) {
  const isKo = result.locale === "ko";
  const shareUrl = getCompatibilityShareUrl(result);

  await kakaoFeed({
    title: isKo
      ? `지관재 · ${result.petName} × ${result.ownerName} 궁합`
      : `Jigwanjae · ${result.petName} × ${result.ownerName} bond`,
    description: `${result.bondEmoji} ${result.bondLabel} (${result.bondScore}) · ${result.headline}`.replace(
      /\s+/g,
      " "
    ),
    shareUrl,
    buttonTitle: isKo ? "궁합 보기" : "View bond",
  });
}

export async function buildBasicSajuStorySlide(result: SajuBasicResponse) {
  await ensureFonts();
  const isKo = result.locale === "ko";
  const el = ELEMENT_META[result.dominantElement];

  return renderStorySlide({
    badge: isKo ? "우리 아이 K-사주" : "Pet K-Saju reading",
    title: `${result.petName}${isKo ? "의 사주" : "'s chart"}`,
    subtitle: `${el.hanja} ${el.meaning} · ${el.hangul}`,
    body: `${result.headline}\n${result.story}`.slice(0, 320),
    footer: isKo ? "ksajupet.com" : "ksajupet.com",
    emoji: result.species === "dog" ? "🐕" : result.species === "cat" ? "🐈" : "🐾",
  });
}

export async function buildZodiacStorySlide(result: ZodiacFortuneResponse) {
  await ensureFonts();
  const isKo = result.locale === "ko";

  return renderStorySlide({
    badge: isKo ? "별자리 운세" : "Zodiac fortune",
    title: result.petName,
    subtitle: `${result.sign.displayName} · ${"★".repeat(result.daily.luckScore)}${"☆".repeat(5 - result.daily.luckScore)}`,
    body: `${result.daily.keyword} · ${result.daily.today}`.slice(0, 320),
    footer: `${isKo ? "기준일" : "Date"}: ${result.fortuneDateKst}`,
    emoji: result.sign.emoji,
  });
}

export async function buildCompatibilityStorySlide(result: CompatibilityResponse) {
  await ensureFonts();
  const isKo = result.locale === "ko";
  const petEl = result.petElementLabel;
  const ownerEl = result.ownerElementLabel;

  return renderStorySlide({
    badge: isKo ? "펫·집사 궁합" : "Pet-parent bond",
    title: `${result.petName} × ${result.ownerName}`,
    subtitle: `${result.bondEmoji} ${result.bondLabel} · ${result.bondScore}${isKo ? "점" : ""}`,
    body: `${petEl.hangul} × ${ownerEl.hangul} · ${result.headline}\n${result.story}`.slice(0, 320),
    footer: isKo ? "K-Saju Pet · ksajupet.com" : "K-Saju Pet · ksajupet.com",
    emoji: result.bondEmoji,
  });
}

export async function saveSajuStorySlide(slide: string, fileStem: string) {
  return saveFortuneStorySlidesToDevice([slide], fileStem);
}

export async function copySajuShareLink(url: string) {
  await navigator.clipboard.writeText(url);
  return url;
}

export { resolveShareImageUrl };
