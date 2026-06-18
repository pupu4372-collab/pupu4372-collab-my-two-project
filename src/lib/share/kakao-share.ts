import { Capacitor } from "@capacitor/core";
import { KakaoLoginPlugin } from "capacitor-kakao-login-plugin";
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

const KAKAO_SDK_URL = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js";
const DEFAULT_SHARE_IMAGE_PATH = "/api/fortune/share-og";

let kakaoLoadPromise: Promise<NonNullable<typeof window.Kakao>> | null = null;

export type KakaoFeedShareInput = {
  title: string;
  description: string;
  shareUrl: string;
  buttonTitle: string;
  imageUrl?: string;
};

export function isCapacitorNativeApp() {
  return Capacitor.isNativePlatform();
}

export async function loadKakaoSdk() {
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

function resolveShareImageUrl(imageUrl?: string) {
  const appBase = getConfiguredAppBaseUrl();
  if (imageUrl?.startsWith("https://")) return imageUrl;
  if (imageUrl?.startsWith("http://")) {
    try {
      const url = new URL(imageUrl);
      return `https://${url.host}${url.pathname}${url.search}`;
    } catch {
      // fall through
    }
  }
  if (imageUrl?.startsWith("/")) return `${appBase}${imageUrl}`;
  return `${appBase}${DEFAULT_SHARE_IMAGE_PATH}`;
}

async function shareKakaoFeedWeb(input: KakaoFeedShareInput) {
  const Kakao = await loadKakaoSdk();
  const imageUrl = resolveShareImageUrl(input.imageUrl);
  const shareUrl = input.shareUrl;

  Kakao.Share.sendDefault({
    objectType: "feed",
    content: {
      title: input.title.slice(0, 200),
      description: input.description.slice(0, 200),
      imageUrl,
      link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
    },
    buttons: [
      {
        title: input.buttonTitle,
        link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
      },
    ],
  });
}

async function shareKakaoFeedNative(input: KakaoFeedShareInput) {
  const imageUrl = resolveShareImageUrl(input.imageUrl);
  await KakaoLoginPlugin.sendLinkFeed({
    title: input.title.slice(0, 200),
    description: input.description.slice(0, 200),
    imageUrl,
    imageLinkUrl: input.shareUrl,
    buttonTitle: input.buttonTitle,
  });
}

/** Web: JS SDK. Native Capacitor shell: Kakao native SDK (no WebView domain check). */
export async function shareKakaoFeed(input: KakaoFeedShareInput) {
  if (isCapacitorNativeApp()) {
    await shareKakaoFeedNative(input);
    return;
  }
  await shareKakaoFeedWeb(input);
}
