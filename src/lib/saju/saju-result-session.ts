import type { MbtiAnswerMap } from "@/lib/pet/calc-mbti";
import type { Gender, Locale, SajuBasicResponse, Species } from "@/lib/saju/types";

const SESSION_KEY = "saju_basic_result_session_v1";

export type SajuResultSessionSnapshot = {
  result: SajuBasicResponse;
  petName: string;
  species: Species;
  petGender: Gender;
  birthDate: string;
  birthTime: string;
  timezone: string;
  locale: Locale;
  mbtiAnswers?: MbtiAnswerMap;
};

export function saveSajuResultSession(snapshot: SajuResultSessionSnapshot): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(snapshot));
  } catch {
    // ignore quota / private mode
  }
}

export function readSajuResultSession(): SajuResultSessionSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SajuResultSessionSnapshot;
  } catch {
    return null;
  }
}

export function clearSajuResultSession(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

export function isBackForwardNavigation(): boolean {
  if (typeof window === "undefined") return false;
  const entry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  return entry?.type === "back_forward";
}
