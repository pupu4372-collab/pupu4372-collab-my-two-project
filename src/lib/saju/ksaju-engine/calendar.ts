/**
 * lunar-javascript 기반 음양력·절기·세운/월운 간지
 */
import { Lunar, LunarYear, Solar } from "lunar-javascript";
import type { Branch, Stem } from "./core-tables";

export function formatSolarYmd(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function convertLunarYmdToSolar(
  year: number,
  month: number,
  day: number,
  isLeapMonth = false
): string {
  const lunarMonth = isLeapMonth ? -month : month;
  const solar = Lunar.fromYmd(year, lunarMonth, day).getSolar();
  return formatSolarYmd(solar.getYear(), solar.getMonth(), solar.getDay());
}

export function splitGanZhi(ganzi: string): { stem: Stem; branch: Branch } {
  if (ganzi.length < 2) {
    throw new Error(`Invalid ganzi: ${ganzi}`);
  }
  return {
    stem: ganzi.charAt(0) as Stem,
    branch: ganzi.charAt(1) as Branch,
  };
}

/** Gregorian year → 流年 년주 (입춘 기준 연도 간지) */
export function getSeunYearGanZhi(year: number): string {
  return LunarYear.fromYear(year).getGanZhi();
}

/** Local civil datetime → 月柱 (절기 기준) */
export function getMonthGanZhiAtLocal(
  year: number,
  month: number,
  day = 15,
  hour = 12,
  minute = 0
): string {
  return Solar.fromYmdHms(year, month, day, hour, minute, 0)
    .getLunar()
    .getMonthInGanZhiExact();
}

function solarToInstant(solar: { toYmdHms(): string }): Date {
  const [datePart, timePart] = solar.toYmdHms().split(" ");
  return new Date(`${datePart}T${timePart}Z`);
}

/** birth instant 기준 다음/이전 절기(24) 시각 */
export function findAdjacentSolarTermInstant(
  birth: Date,
  direction: "forward" | "reverse"
): Date | null {
  const lunar = Solar.fromDate(birth).getLunar();
  const jieQi =
    direction === "forward"
      ? lunar.getNextJieQi(true)
      : lunar.getPrevJieQi(true);
  if (!jieQi) return null;
  return solarToInstant(jieQi.getSolar());
}
