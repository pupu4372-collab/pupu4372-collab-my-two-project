import type { PetDailyFortune, PetFortunePetMeta } from "@/lib/saju/pet-daily-fortune";
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

export function statScoreBand(score: number, isKo: boolean): string {
  if (score >= 90) return isKo ? "최고 활력" : "Peak vitality";
  if (score >= 80) return isKo ? "넘치는 활기" : "Overflowing vigor";
  if (score >= 70) return isKo ? "넘치는 행복" : "Overflowing joy";
  if (score >= 60) return isKo ? "균형 잡힌 행운" : "Balanced luck";
  return isKo ? "차분한 하루" : "A calm day";
}

export function truncateInstaBody(text: string, max = 90): string {
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
          band: statScoreBand(health.score, isKo),
          color: "#E36A7C",
        }
      : null,
    appetite
      ? {
          label: isKo ? "기쁨" : "Joy",
          score: appetite.score,
          band: statScoreBand(appetite.score, isKo),
          color: "#E8C04A",
        }
      : null,
    activity
      ? {
          label: isKo ? "활력" : "Vitality",
          score: activity.score,
          band: statScoreBand(activity.score, isKo),
          color: "#6A9BD8",
        }
      : null,
    sleep
      ? {
          label: isKo ? "행운" : "Luck",
          score: sleep.score,
          band: statScoreBand(sleep.score, isKo),
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
  const todayState = truncateInstaBody(
    isKo
      ? `Mood: ${moodBody} Daily Luck: ${dailyBody}`
      : `Mood: ${moodBody} Daily Luck: ${dailyBody}`,
  );
  const nature = truncateInstaBody(
    isKo
      ? `Innate Personality: ${fortune.elementLabel}. ${pet.dayBranchSign}의 기운을 지녔어요.`
      : `Innate Personality: ${fortune.elementLabel}. ${pet.dayBranchSign} energy.`,
  );
  const tipBody = truncateInstaBody(
    fortune.tips.map((tip) => tip.text).join(" "),
  );

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

export async function captureDailyFortuneInstaCard(cardEl: HTMLElement): Promise<Blob> {
  const canvas = await html2canvas(cardEl, {
    backgroundColor: "#F6F1E4",
    scale: 1,
    useCORS: true,
    width: 1080,
    height: 1350,
  });

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/png");
  });

  if (!blob) {
    throw new Error("BLOB_UNAVAILABLE");
  }

  return blob;
}

export type DailyFortuneInstaShareResult = "shared" | "downloaded" | "cancelled";

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
