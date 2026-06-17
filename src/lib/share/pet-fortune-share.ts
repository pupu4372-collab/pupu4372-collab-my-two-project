import type { PetDailyFortune, PetFortunePetMeta } from "@/lib/saju/pet-daily-fortune";
import type { Locale } from "@/lib/saju/types";
import { getConfiguredAppBaseUrl } from "@/lib/app-url";

declare global {
  interface Window {
    Kakao?: {
      isInitialized(): boolean;
      init(key: string): void;
      Share: {
        sendDefault(options: Record<string, unknown>): void;
      };
    };
  }
}

const DEFAULT_SHARE_IMAGE_PATH = "/api/fortune/share-og";
const KAKAO_SDK_URL = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js";
const SHARE_FONT = '"SUIT Variable", "Noto Sans KR", sans-serif';
const STORY_W = 1080;
const STORY_H = 1920;
const PAD_X = 56;
const CONTENT_W = STORY_W - PAD_X * 2;

let kakaoLoadPromise: Promise<NonNullable<typeof window.Kakao>> | null = null;

function appShareBaseUrl() {
  return getConfiguredAppBaseUrl();
}

export function getPetFortuneShareUrl(petId: string) {
  return `${appShareBaseUrl()}/saju/result/${petId}`;
}

export function buildFortuneShareDescription(
  fortune: PetDailyFortune,
  petName: string,
  isKo: boolean
) {
  const headline = `${petName}${isKo ? "의 " : "'s "}${fortune.title}`;
  const body = fortune.messages[0]?.body ?? fortune.subtitle;
  return `${headline} ${body}`.replace(/\s+/g, " ").trim().slice(0, 200);
}

export function resolveShareImageUrl(profileImageUrl?: string | null) {
  const appBase = appShareBaseUrl();
  if (profileImageUrl?.startsWith("https://")) return profileImageUrl;
  if (profileImageUrl?.startsWith("http://")) {
    try {
      const url = new URL(profileImageUrl);
      return `https://${url.host}${url.pathname}${url.search}`;
    } catch {
      // fall through to default
    }
  }
  return `${appBase}${DEFAULT_SHARE_IMAGE_PATH}`;
}

async function loadKakaoSdk() {
  const key = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
  if (!key || typeof window === "undefined") {
    throw new Error("KAKAO_SDK_UNAVAILABLE");
  }

  if (window.Kakao?.isInitialized()) return window.Kakao;

  if (!kakaoLoadPromise) {
    kakaoLoadPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>('script[data-kakao-sdk="true"]');
      if (existing) {
        existing.addEventListener("load", () => resolve(window.Kakao!), { once: true });
        existing.addEventListener("error", () => reject(new Error("KAKAO_SDK_LOAD_FAILED")), {
          once: true,
        });
        return;
      }

      const script = document.createElement("script");
      script.src = KAKAO_SDK_URL;
      script.async = true;
      script.dataset.kakaoSdk = "true";
      script.onload = () => resolve(window.Kakao!);
      script.onerror = () => reject(new Error("KAKAO_SDK_LOAD_FAILED"));
      document.head.appendChild(script);
    });
  }

  const Kakao = await kakaoLoadPromise;
  if (!Kakao.isInitialized()) {
    Kakao.init(key);
  }
  return Kakao;
}

export async function sharePetFortuneToKakao(input: {
  petId: string;
  petName: string;
  fortune: PetDailyFortune;
  imageUrl?: string | null;
  locale?: "ko" | "en";
}) {
  const Kakao = await loadKakaoSdk();
  const shareUrl = getPetFortuneShareUrl(input.petId);
  const fortuneText = buildFortuneShareDescription(
    input.fortune,
    input.petName,
    (input.locale ?? "ko") === "ko"
  );
  const imageUrl = resolveShareImageUrl(input.imageUrl);

  Kakao.Share.sendDefault({
    objectType: "feed",
    content: {
      title: `${input.petName}의 오늘 운세 🔮`.slice(0, 200),
      description: fortuneText,
      imageUrl,
      link: {
        mobileWebUrl: shareUrl,
        webUrl: shareUrl,
      },
    },
    buttons: [
      {
        title: "운세 보기",
        link: {
          mobileWebUrl: shareUrl,
          webUrl: shareUrl,
        },
      },
    ],
  });
}

async function ensureShareFonts() {
  if (typeof document === "undefined") return;
  await Promise.all(
    [
      `800 48px ${SHARE_FONT}`,
      `700 36px ${SHARE_FONT}`,
      `700 28px ${SHARE_FONT}`,
      `600 24px ${SHARE_FONT}`,
      `400 24px ${SHARE_FONT}`,
    ].map((spec) => document.fonts.load(spec).catch(() => undefined))
  );
}

function starsString(count: number) {
  return "★".repeat(count) + "☆".repeat(5 - count);
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

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  startY: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 4
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

function drawSectionTitle(
  ctx: CanvasRenderingContext2D,
  y: number,
  title: string,
  _isKo: boolean
) {
  ctx.fillStyle = "#ffd7ff";
  ctx.font = `700 26px ${SHARE_FONT}`;
  ctx.textAlign = "left";
  ctx.fillText(title, PAD_X, y);
  return y + 40;
}

function drawStoryChrome(
  ctx: CanvasRenderingContext2D,
  slideIndex: number,
  totalSlides: number,
  petName: string,
  isKo: boolean
) {
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffd7ff";
  ctx.font = `700 34px ${SHARE_FONT}`;
  ctx.fillText("K-Saju Pet", STORY_W / 2, 72);

  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = `600 22px ${SHARE_FONT}`;
  ctx.fillText(
    isKo ? `${petName} · ${slideIndex + 1}/${totalSlides}` : `${petName} · ${slideIndex + 1}/${totalSlides}`,
    STORY_W / 2,
    108
  );
}

function drawStoryFooter(ctx: CanvasRenderingContext2D, fortune: PetDailyFortune) {
  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(233,213,255,0.85)";
  ctx.font = `400 20px ${SHARE_FONT}`;
  wrapCanvasText(ctx, fortune.disclaimer, PAD_X, STORY_H - 120, CONTENT_W, 28, 2);

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.font = `600 28px ${SHARE_FONT}`;
  try {
    ctx.fillText(new URL(appShareBaseUrl()).hostname, STORY_W / 2, STORY_H - 48);
  } catch {
    ctx.fillText("K-Saju Pet", STORY_W / 2, STORY_H - 48);
  }
}

function createStorySlideCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = STORY_W;
  canvas.height = STORY_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("CANVAS_UNAVAILABLE");
  ctx.fillStyle = "#260d35";
  ctx.fillRect(0, 0, STORY_W, STORY_H);
  return { canvas, ctx };
}

function drawHeroExpanded(
  ctx: CanvasRenderingContext2D,
  y: number,
  input: { pet: PetFortunePetMeta; fortune: PetDailyFortune; isKo: boolean }
) {
  const { pet, fortune, isKo } = input;
  const boxH = 320;
  roundRect(ctx, PAD_X, y, CONTENT_W, boxH, 28);
  ctx.fillStyle = "#351445";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.lineWidth = 2;
  roundRect(ctx, PAD_X, y, CONTENT_W, boxH, 28);
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.fillStyle = "#ffd7ff";
  ctx.font = `700 24px ${SHARE_FONT}`;
  ctx.fillText(fortune.dateLabel, STORY_W / 2, y + 44);

  ctx.font = `56px ${SHARE_FONT}`;
  ctx.fillText(pet.icon, STORY_W / 2, y + 108);

  ctx.fillStyle = "#ffffff";
  ctx.font = `800 42px ${SHARE_FONT}`;
  ctx.fillText(
    isKo ? `${pet.name}의 오늘 운세` : `${pet.name}'s fortune`,
    STORY_W / 2,
    y + 162
  );

  ctx.fillStyle = "#f3e8ff";
  ctx.font = `700 34px ${SHARE_FONT}`;
  ctx.fillText(fortune.title, STORY_W / 2, y + 210);

  ctx.fillStyle = "#ffd7ff";
  ctx.font = `700 26px ${SHARE_FONT}`;
  ctx.fillText(
    `${pet.speciesLabel} · ${pet.dayBranchSign} ${starsString(fortune.overall)}`,
    STORY_W / 2,
    y + 248
  );

  ctx.fillStyle = "#e9d5ff";
  ctx.font = `400 26px ${SHARE_FONT}`;
  ctx.textAlign = "left";
  wrapCanvasText(ctx, fortune.subtitle, PAD_X + 40, y + 286, CONTENT_W - 80, 34, 2);

  return y + boxH + 24;
}

function drawCategoriesExpanded(
  ctx: CanvasRenderingContext2D,
  y: number,
  fortune: PetDailyFortune,
  isKo: boolean
) {
  y = drawSectionTitle(ctx, y, isKo ? "항목별 운세" : "Category scores", isKo);
  const gap = 20;
  const cellW = (CONTENT_W - gap) / 2;
  const cellH = 156;

  fortune.categories.forEach((cat, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = PAD_X + col * (cellW + gap);
    const cy = y + row * (cellH + gap);

    roundRect(ctx, x, cy, cellW, cellH, 20);
    ctx.fillStyle = "#351445";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 1.5;
    roundRect(ctx, x, cy, cellW, cellH, 20);
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.font = `40px ${SHARE_FONT}`;
    ctx.fillText(cat.icon, x + cellW / 2, cy + 46);

    ctx.fillStyle = "#e9d5ff";
    ctx.font = `600 24px ${SHARE_FONT}`;
    ctx.fillText(cat.label, x + cellW / 2, cy + 82);

    ctx.fillStyle = cat.color;
    ctx.font = `800 34px ${SHARE_FONT}`;
    ctx.fillText(`${cat.score}${isKo ? "점" : ""}`, x + cellW / 2, cy + 118);

    const barX = x + 24;
    const barW = cellW - 48;
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    roundRect(ctx, barX, cy + 132, barW, 10, 5);
    ctx.fill();
    ctx.fillStyle = cat.color;
    roundRect(ctx, barX, cy + 132, barW * (cat.score / 100), 10, 5);
    ctx.fill();
  });

  const rows = Math.ceil(fortune.categories.length / 2);
  return y + rows * (cellH + gap);
}

function drawMessagesExpanded(ctx: CanvasRenderingContext2D, y: number, fortune: PetDailyFortune, isKo: boolean) {
  y = drawSectionTitle(ctx, y, isKo ? "오늘의 메시지" : "Today's messages", isKo);

  for (const msg of fortune.messages) {
    const boxH = 148;
    roundRect(ctx, PAD_X, y, CONTENT_W, boxH, 20);
    ctx.fillStyle = "#351445";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 1.5;
    roundRect(ctx, PAD_X, y, CONTENT_W, boxH, 20);
    ctx.stroke();

    ctx.textAlign = "left";
    ctx.fillStyle = "#ffd7ff";
    ctx.font = `700 26px ${SHARE_FONT}`;
    ctx.fillText(`${msg.icon} ${msg.label}`, PAD_X + 24, y + 42);

    ctx.fillStyle = "#ffffff";
    ctx.font = `400 26px ${SHARE_FONT}`;
    wrapCanvasText(ctx, msg.body, PAD_X + 24, y + 78, CONTENT_W - 48, 34, 3);
    y += boxH + 16;
  }

  return y + 8;
}

function drawLuckyExpanded(ctx: CanvasRenderingContext2D, y: number, fortune: PetDailyFortune, isKo: boolean) {
  y = drawSectionTitle(ctx, y, isKo ? "오늘의 럭키 아이템" : "Lucky items", isKo);

  const boxH = 28 + fortune.lucky.length * 40;
  roundRect(ctx, PAD_X, y, CONTENT_W, boxH, 20);
  ctx.fillStyle = "#351445";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.lineWidth = 1.5;
  roundRect(ctx, PAD_X, y, CONTENT_W, boxH, 20);
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.fillStyle = "#ffffff";
  ctx.font = `600 26px ${SHARE_FONT}`;
  let lineY = y + 44;
  for (const item of fortune.lucky) {
    ctx.fillText(`${item.icon} ${item.text}`, PAD_X + 24, lineY);
    lineY += 40;
  }

  return y + boxH + 16;
}

function drawWeekExpanded(
  ctx: CanvasRenderingContext2D,
  y: number,
  fortune: PetDailyFortune,
  petIcon: string,
  isKo: boolean
) {
  y = drawSectionTitle(ctx, y, isKo ? "이번 주 운세" : "This week", isKo);

  const gap = 8;
  const cellW = (CONTENT_W - gap * 6) / 7;
  const cellH = 112;

  fortune.week.forEach((day, index) => {
    const x = PAD_X + index * (cellW + gap);
    roundRect(ctx, x, y, cellW, cellH, 14);
    ctx.fillStyle = day.isToday ? "#6b4a82" : "#351445";
    ctx.fill();
    ctx.strokeStyle = day.isToday ? "#ffd7ff" : "rgba(255,255,255,0.15)";
    ctx.lineWidth = day.isToday ? 2 : 1.5;
    roundRect(ctx, x, y, cellW, cellH, 14);
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.fillStyle = day.isToday ? "#ffd7ff" : "#e9d5ff";
    ctx.font = `600 20px ${SHARE_FONT}`;
    ctx.fillText(day.dayLabel, x + cellW / 2, y + 30);

    ctx.font = `32px ${SHARE_FONT}`;
    ctx.fillText(day.isToday ? petIcon : day.icon, x + cellW / 2, y + 72);

    ctx.fillStyle = "#fbbf24";
    ctx.font = `16px ${SHARE_FONT}`;
    ctx.fillText(starsString(day.stars), x + cellW / 2, y + 102);
  });

  return y + cellH + 20;
}

function drawTipsExpanded(ctx: CanvasRenderingContext2D, y: number, fortune: PetDailyFortune, isKo: boolean) {
  y = drawSectionTitle(ctx, y, isKo ? "오늘 이렇게 해주세요" : "Care tips", isKo);

  const boxH = 28 + fortune.tips.length * 42;
  roundRect(ctx, PAD_X, y, CONTENT_W, boxH, 20);
  ctx.fillStyle = "#351445";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.lineWidth = 1.5;
  roundRect(ctx, PAD_X, y, CONTENT_W, boxH, 20);
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.fillStyle = "#ffffff";
  ctx.font = `600 26px ${SHARE_FONT}`;
  let lineY = y + 44;
  for (const tip of fortune.tips) {
    wrapCanvasText(ctx, `${tip.icon} ${tip.text}`, PAD_X + 24, lineY, CONTENT_W - 48, 34, 2);
    lineY += 42;
  }

  return y + boxH;
}

function renderStorySlide(
  slideIndex: number,
  totalSlides: number,
  input: { pet: PetFortunePetMeta; fortune: PetDailyFortune; isKo: boolean }
) {
  const { canvas, ctx } = createStorySlideCanvas();
  drawStoryChrome(ctx, slideIndex, totalSlides, input.pet.name, input.isKo);

  let y = 132;
  if (slideIndex === 0) {
    y = drawHeroExpanded(ctx, y, input);
    drawCategoriesExpanded(ctx, y, input.fortune, input.isKo);
  } else if (slideIndex === 1) {
    y = drawMessagesExpanded(ctx, y, input.fortune, input.isKo);
    drawLuckyExpanded(ctx, y, input.fortune, input.isKo);
  } else {
    y = drawWeekExpanded(ctx, y, input.fortune, input.pet.icon, input.isKo);
    drawTipsExpanded(ctx, y, input.fortune, input.isKo);
    drawStoryFooter(ctx, input.fortune);
  }

  return canvas.toDataURL("image/png");
}

export async function buildFortuneShareStorySlides(input: {
  pet: PetFortunePetMeta;
  fortune: PetDailyFortune;
  isKo: boolean;
}) {
  await ensureShareFonts();
  const totalSlides = 3;
  return Array.from({ length: totalSlides }, (_, index) =>
    renderStorySlide(index, totalSlides, input)
  );
}

/** @deprecated Use buildFortuneShareStorySlides */
export async function buildFortuneShareImageBase64(input: {
  pet: PetFortunePetMeta;
  fortune: PetDailyFortune;
  isKo: boolean;
}) {
  const slides = await buildFortuneShareStorySlides(input);
  return slides[0]!;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function safeFileStem(name: string) {
  const stem = name.trim().replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-");
  return stem || "pet";
}

export async function downloadFortuneStorySlides(slides: string[], petName: string) {
  const stem = safeFileStem(petName);
  for (let i = 0; i < slides.length; i++) {
    const anchor = document.createElement("a");
    anchor.href = slides[i]!;
    anchor.download = `${stem}-fortune-${i + 1}.png`;
    anchor.click();
    if (i < slides.length - 1) await sleep(320);
  }
}

export async function saveFortuneStorySlidesToDevice(slides: string[], petName: string) {
  const { Capacitor } = await import("@capacitor/core");
  if (!Capacitor.isNativePlatform()) {
    await downloadFortuneStorySlides(slides, petName);
    return slides.length;
  }

  const { Filesystem, Directory } = await import("@capacitor/filesystem");
  const stem = safeFileStem(petName);
  for (let i = 0; i < slides.length; i++) {
    const fileName = `${stem}-fortune-${i + 1}.png`;
    await Filesystem.writeFile({
      path: fileName,
      data: slides[i]!.replace(/^data:image\/png;base64,/, ""),
      directory: Directory.Documents,
    });
  }
  return slides.length;
}

export async function copyPetFortuneShareLink(petId: string) {
  const url = getPetFortuneShareUrl(petId);
  await navigator.clipboard.writeText(url);
  return url;
}

export function isNativeShareAvailable() {
  return typeof window !== "undefined";
}

export type PetFortuneShareLocale = Locale;
