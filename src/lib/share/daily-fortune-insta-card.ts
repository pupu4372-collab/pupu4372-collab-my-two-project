import type { PetDailyFortune, PetFortunePetMeta } from "@/lib/saju/pet-daily-fortune";
import { fortuneStatScoreBand, type FortuneStatCategory } from "@/lib/saju/pet-fortune-score-bands";
import type { Species } from "@/lib/saju/types";
import { getTodayKstDateString } from "@/lib/saju/zodiac/fortunes";
import html2canvas from "html2canvas";

export function petInstaEmoji(species: Species): string {
  if (species === "dog") return "🐶";
  if (species === "cat") return "🐱";
  return "🦎";
}

export function formatInstaCardKstDate(isKo: boolean, dateKst = getTodayKstDateString()): string {
  const d = new Date(`${dateKst}T12:00:00+09:00`);
  const [year, month, day] = dateKst.split("-");
  const weekday = new Intl.DateTimeFormat(isKo ? "ko-KR" : "en-US", {
    timeZone: "Asia/Seoul",
    weekday: "long",
  }).format(d);

  if (isKo) {
    return `${year}. ${month}. ${day} · ${weekday}`;
  }

  const monthLabel = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    month: "short",
  }).format(d);
  return `${monthLabel} ${Number(day)}, ${year} · ${weekday}`;
}

export function harmonyScore(fortune: PetDailyFortune): number {
  const avg =
    fortune.categories.reduce((sum, cat) => sum + cat.score, 0) /
    Math.max(fortune.categories.length, 1);
  return Math.round(avg);
}

export function statScoreBand(
  score: number,
  category: FortuneStatCategory,
  isKo: boolean
): string {
  return fortuneStatScoreBand(score, category, isKo);
}

export function truncateInstaBody(text: string, max = 75): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 1)}…`;
}

function findCategory(fortune: PetDailyFortune, labelKo: string, labelEn: string) {
  return fortune.categories.find((c) => c.label === labelKo || c.label === labelEn);
}

export function instaCardStatItems(fortune: PetDailyFortune, isKo: boolean) {
  const health = findCategory(fortune, "건강운", "Health");
  const appetite = findCategory(fortune, "식욕운", "Appetite");
  const activity = findCategory(fortune, "활동운", "Activity");
  const sleep = findCategory(fortune, "수면운", "Sleep");

  return [
    health
      ? {
          label: isKo ? "건강운" : "Health",
          score: health.score,
          band: statScoreBand(health.score, "health", isKo),
          color: "#E36A7C",
        }
      : null,
    appetite
      ? {
          label: isKo ? "기쁨" : "Joy",
          score: appetite.score,
          band: statScoreBand(appetite.score, "appetite", isKo),
          color: "#E8C04A",
        }
      : null,
    activity
      ? {
          label: isKo ? "활력" : "Vitality",
          score: activity.score,
          band: statScoreBand(activity.score, "activity", isKo),
          color: "#6A9BD8",
        }
      : null,
    sleep
      ? {
          label: isKo ? "행운" : "Luck",
          score: sleep.score,
          band: statScoreBand(sleep.score, "sleep", isKo),
          color: "#4FBF9B",
        }
      : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null);
}

export function buildInstaSectionBodies(
  pet: PetFortunePetMeta,
  fortune: PetDailyFortune,
  isKo: boolean,
) {
  const moodBody = fortune.messages[0]?.body ?? "";
  const dailyBody = fortune.messages[1]?.body ?? "";
  const labels = isKo
    ? {
        mood: "기분:",
        daily: "오늘의 컨디션:",
        innate: "타고난 성향:",
        tip: "집사 팁:",
      }
    : {
        mood: "Mood:",
        daily: "Daily Luck:",
        innate: "Innate Personality:",
        tip: "Owner Advice:",
      };
  const todayState = truncateInstaBody(`${labels.mood} ${moodBody} ${labels.daily} ${dailyBody}`);
  const nature = truncateInstaBody(`${labels.innate} ${fortune.innatePersonality}`);
  const tipBody = truncateInstaBody(`${labels.tip} ${fortune.tips.map((tip) => tip.text).join(" ")}`);

  return { todayState, nature, tipBody };
}

function safeFileStem(name: string) {
  const stem = name.trim().replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-");
  return stem || "pet";
}

export function buildInstaShareFileName(petName: string, dateKst = getTodayKstDateString()) {
  const ymd = dateKst.replace(/-/g, "");
  return `${safeFileStem(petName)}_오늘의운세_${ymd}.png`;
}

export function instaLuckyKeyword(fortune: PetDailyFortune, isKo: boolean): string {
  const lucky = fortune.lucky[0]?.text ?? fortune.title;
  return stripLuckyPrefix(lucky, isKo);
}

export function stripLuckyPrefix(text: string, isKo: boolean): string {
  if (isKo) {
    return text
      .replace(/^럭키 컬러:\s*/, "")
      .replace(/^럭키 간식:\s*/, "")
      .replace(/^럭키 활동:\s*/, "");
  }
  return text
    .replace(/^Lucky color:\s*/i, "")
    .replace(/^Lucky snack:\s*/i, "")
    .replace(/^Lucky activity:\s*/i, "");
}

export type PhotoInstaCardContent = {
  dateLabel: string;
  petTitle: string;
  harmony: number;
  fortuneTitle: string;
  elementLabel: string;
  luckyColor: string;
  luckySnack: string;
  luckyActivity: string;
  todayLine: string;
};

export function buildPhotoInstaCardContent(
  pet: PetFortunePetMeta,
  fortune: PetDailyFortune,
  isKo: boolean,
): PhotoInstaCardContent {
  const luckyColor = fortune.lucky.find((item) => item.type === "color");
  const luckySnack = fortune.lucky.find((item) => item.type === "food");
  const luckyAct = fortune.lucky.find((item) => item.type === "act");
  const moodBody = fortune.messages[0]?.body ?? fortune.subtitle;

  return {
    dateLabel: formatInstaCardKstDate(isKo),
    petTitle: isKo
      ? `${petInstaEmoji(pet.species)} ${pet.name}의 오늘 케어`
      : `${petInstaEmoji(pet.species)} ${pet.name}'s care today`,
    harmony: harmonyScore(fortune),
    fortuneTitle: fortune.title,
    elementLabel: fortune.elementLabel,
    luckyColor: stripLuckyPrefix(luckyColor?.text ?? fortune.title, isKo),
    luckySnack: stripLuckyPrefix(luckySnack?.text ?? "—", isKo),
    luckyActivity: stripLuckyPrefix(luckyAct?.text ?? "—", isKo),
    todayLine: truncateInstaBody(moodBody, 110),
  };
}

export function canShareImageFiles(): boolean {
  if (typeof navigator === "undefined" || typeof navigator.canShare !== "function") {
    return false;
  }
  try {
    const probe = new File([""], "probe.png", { type: "image/png" });
    return navigator.canShare({ files: [probe] });
  } catch {
    return false;
  }
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

/** Wait until every <img> under root has loaded (or errored). */
export function waitForElementImages(root: HTMLElement, timeoutMs = 15000): Promise<void> {
  const imgs = Array.from(root.querySelectorAll("img"));
  const pending = imgs.filter((img) => !img.complete || img.naturalWidth === 0);
  if (pending.length === 0) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error("IMAGE_LOAD_TIMEOUT"));
    }, timeoutMs);

    let remaining = pending.length;
    const done = () => {
      remaining -= 1;
      if (remaining <= 0) {
        window.clearTimeout(timer);
        resolve();
      }
    };

    for (const img of pending) {
      img.addEventListener("load", done, { once: true });
      img.addEventListener("error", done, { once: true });
    }
  });
}

/**
 * Fetches remote image into a same-origin blob URL so html2canvas can paint it
 * without cross-origin taint (Supabase Storage public URLs).
 */
export async function resolveImageForCanvasCapture(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`IMAGE_FETCH_FAILED:${res.status}`);
  }
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

export async function captureDailyFortuneInstaCard(cardEl: HTMLElement): Promise<Blob> {
  const INSTA_SIZE = 1080;

  await waitForElementImages(cardEl);
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });

  const canvas = await html2canvas(cardEl, {
    backgroundColor: "#1a1814",
    scale: 1,
    useCORS: true,
    width: INSTA_SIZE,
    height: INSTA_SIZE,
  });

  if (canvas.width !== INSTA_SIZE || canvas.height !== INSTA_SIZE) {
    throw new Error(`INSTA_CAPTURE_SIZE_MISMATCH:${canvas.width}x${canvas.height}`);
  }

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/png");
  });

  if (!blob) {
    throw new Error("BLOB_UNAVAILABLE");
  }

  return blob;
}

export type DailyFortuneInstaShareResult = "shared" | "downloaded" | "cancelled";

export async function shareDailyFortuneInstaCardFromBlob(
  blob: Blob,
  petName: string,
): Promise<DailyFortuneInstaShareResult> {
  const fileName = buildInstaShareFileName(petName);
  const file = new File([blob], fileName, { type: "image/png" });

  if (canShareImageFiles()) {
    try {
      await navigator.share({ files: [file] });
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return "cancelled";
      }
    }
  }

  downloadBlob(blob, fileName);
  return "downloaded";
}

export async function shareDailyFortuneInstaCard(
  cardEl: HTMLElement,
  petName: string,
): Promise<DailyFortuneInstaShareResult> {
  const blob = await captureDailyFortuneInstaCard(cardEl);
  const fileName = buildInstaShareFileName(petName);
  const file = new File([blob], fileName, { type: "image/png" });

  if (canShareImageFiles()) {
    try {
      await navigator.share({ files: [file] });
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return "cancelled";
      }
    }
  }

  downloadBlob(blob, fileName);
  return "downloaded";
}
