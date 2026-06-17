import type { PetDailyFortune } from "@/lib/saju/pet-daily-fortune";
import type { Locale } from "@/lib/saju/types";

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
const KAKAO_PUBLIC_ORIGIN = "https://ksajupet.com";

let kakaoLoadPromise: Promise<NonNullable<typeof window.Kakao>> | null = null;

/** Kakao scraper requires public HTTPS URLs (localhost fails verification). */
export function getKakaoPublicBaseUrl() {
  if (typeof window === "undefined") {
    const raw = process.env.NEXT_PUBLIC_APP_URL ?? KAKAO_PUBLIC_ORIGIN;
    const base = raw.replace(/\/$/, "");
    if (base.includes("localhost") || base.includes("127.0.0.1")) {
      return KAKAO_PUBLIC_ORIGIN;
    }
    return base;
  }

  const origin = window.location.origin.replace(/\/$/, "");
  if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
    return KAKAO_PUBLIC_ORIGIN;
  }
  return origin;
}

export function getShareBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_APP_URL ?? KAKAO_PUBLIC_ORIGIN;
  return raw.replace(/\/$/, "");
}

export function getPetFortuneShareUrl(petId: string, locale: "ko" | "en" = "ko") {
  return `${getKakaoPublicBaseUrl()}/${locale}/profile/pets/${petId}`;
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
  const publicBase = getKakaoPublicBaseUrl();
  if (profileImageUrl?.startsWith("https://")) {
    if (profileImageUrl.includes("supabase.co")) return profileImageUrl;
    return profileImageUrl;
  }
  if (profileImageUrl?.startsWith("http://")) {
    try {
      const url = new URL(profileImageUrl);
      return `https://${url.host}${url.pathname}${url.search}`;
    } catch {
      // fall through to default
    }
  }
  return `${publicBase}${DEFAULT_SHARE_IMAGE_PATH}`;
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
  const locale = input.locale ?? "ko";
  const shareUrl = getPetFortuneShareUrl(input.petId, locale);
  const fortuneText = buildFortuneShareDescription(
    input.fortune,
    input.petName,
    /[가-힣]/.test(input.fortune.title)
  );
  const imageUrl = resolveShareImageUrl(input.imageUrl);

  Kakao.Share.sendDefault({
    objectType: "feed",
    content: {
      title: `${input.petName}의 오늘 운세`.slice(0, 200),
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

export async function buildFortuneShareImageBase64(input: {
  petName: string;
  fortune: PetDailyFortune;
  isKo: boolean;
}) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("CANVAS_UNAVAILABLE");

  const gradient = ctx.createLinearGradient(0, 0, 1080, 1920);
  gradient.addColorStop(0, "#4b255d");
  gradient.addColorStop(0.55, "#351445");
  gradient.addColorStop(1, "#260d35");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.fillRect(72, 120, 936, 1680);

  ctx.fillStyle = "#ffd7ff";
  ctx.font = "bold 52px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("K-Saju Pet", 540, 260);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 72px sans-serif";
  ctx.fillText(
    input.isKo ? `${input.petName}의 오늘 운세` : `${input.petName}'s fortune`,
    540,
    420
  );

  ctx.fillStyle = "#f3e8ff";
  ctx.font = "bold 56px sans-serif";
  ctx.fillText(input.fortune.title, 540, 540);

  ctx.fillStyle = "#e9d5ff";
  ctx.font = "40px sans-serif";
  wrapCanvasText(ctx, input.fortune.messages[0]?.body ?? input.fortune.subtitle, 540, 660, 880, 52);

  ctx.fillStyle = "#ffd7ff";
  ctx.font = "bold 36px sans-serif";
  ctx.fillText("★".repeat(input.fortune.overall) + "☆".repeat(5 - input.fortune.overall), 540, 1500);

  ctx.fillStyle = "#ffffff";
  ctx.font = "32px sans-serif";
  ctx.fillText("ksajupet.com", 540, 1680);

  return canvas.toDataURL("image/png");
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  startY: number,
  maxWidth: number,
  lineHeight: number
) {
  const hasSpaces = /\s/.test(text);
  const units = hasSpaces ? text.split(/\s+/) : [...text];
  let line = "";
  let y = startY;

  for (const unit of units) {
    const testLine = hasSpaces ? (line ? `${line} ${unit}` : unit) : `${line}${unit}`;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, centerX, y);
      line = hasSpaces ? unit : unit;
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) ctx.fillText(line, centerX, y);
}

export async function shareToInstagramStory(imageBase64: string) {
  const { Filesystem, Directory } = await import("@capacitor/filesystem");
  const { Capacitor } = await import("@capacitor/core");

  const fileName = `saju-result-${Date.now()}.png`;
  await Filesystem.writeFile({
    path: fileName,
    data: imageBase64.replace(/^data:image\/png;base64,/, ""),
    directory: Directory.Cache,
  });

  const fileUri = await Filesystem.getUri({
    path: fileName,
    directory: Directory.Cache,
  });

  const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID ?? "";

  if (Capacitor.getPlatform() === "ios") {
    const igUrl = facebookAppId
      ? `instagram-stories://share?source_application=${facebookAppId}`
      : "instagram-stories://share";
    window.location.href = igUrl;
    return;
  }

  window.location.href =
    `intent://share#Intent;package=com.instagram.android;` +
    `action=android.intent.action.SEND;type=image/*;` +
    `S.android.intent.extra.STREAM=${fileUri.uri};end`;
}

export async function copyPetFortuneShareLink(petId: string, locale: "ko" | "en" = "ko") {
  const url = getPetFortuneShareUrl(petId, locale);
  await navigator.clipboard.writeText(url);
  return url;
}

export function isNativeShareAvailable() {
  return typeof window !== "undefined";
}

export type PetFortuneShareLocale = Locale;
