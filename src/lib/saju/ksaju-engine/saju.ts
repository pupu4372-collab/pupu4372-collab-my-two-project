/**
 * 사주팔자(四柱八字) 계산 — lunar-javascript 절기 기준 위에 해석 레이어 구성
 */
import { Solar, Lunar } from "lunar-javascript";
import type { Branch, Stem } from "./core-tables";
import { normalizeHanja } from "./core-tables";
import { calcSpecialSal, type SpecialSalResult } from "./special-sal";

export type Gender = "M" | "F";

export interface BirthInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  gender: Gender;
  isLunar?: boolean;
  isLeapMonth?: boolean;
}

export interface PillarInfo {
  label: "年柱" | "月柱" | "日柱" | "時柱";
  ganzi: string;
  stem: Stem;
  branch: Branch;
  stemTenGod: string;
  branchTenGods: string[];
  twelveStage: string;
  hiddenStems: string[];
}

export interface DaewoonItem {
  index: number;
  ganzi: string;
  startAge: number;
  startYear: number;
}

export interface SajuResult {
  input: BirthInput;
  solar: { year: number; month: number; day: number; hour: number; minute: number };
  pillars: [PillarInfo, PillarInfo, PillarInfo, PillarInfo];
  dayMaster: Stem;
  gongmangBranches: Branch[];
  daewoon: { forward: boolean; list: DaewoonItem[] };
  specialSal: SpecialSalResult;
}

function toStrArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String);
  if (v == null) return [];
  return [String(v)];
}

export function calculateSaju(input: BirthInput): SajuResult {
  let solarBase;
  if (input.isLunar) {
    const lm = input.isLeapMonth ? -input.month : input.month;
    const lunarDateOnly = Lunar.fromYmd(input.year, lm, input.day);
    const solarDateOnly = lunarDateOnly.getSolar();
    solarBase = Solar.fromYmdHms(
      solarDateOnly.getYear(),
      solarDateOnly.getMonth(),
      solarDateOnly.getDay(),
      input.hour,
      input.minute,
      0
    );
  } else {
    solarBase = Solar.fromYmdHms(input.year, input.month, input.day, input.hour, input.minute, 0);
  }

  const lunar = solarBase.getLunar();
  const ec = lunar.getEightChar();

  const stems: Stem[] = [ec.getYearGan(), ec.getMonthGan(), ec.getDayGan(), ec.getTimeGan()] as Stem[];
  const branches: Branch[] = [ec.getYearZhi(), ec.getMonthZhi(), ec.getDayZhi(), ec.getTimeZhi()] as Branch[];

  const yearStemTenGod = normalizeHanja(ec.getYearShiShenGan());
  const monthStemTenGod = normalizeHanja(ec.getMonthShiShenGan());
  const timeStemTenGod = normalizeHanja(ec.getTimeShiShenGan());

  const yearBranchTenGods = toStrArray(ec.getYearShiShenZhi()).map(normalizeHanja);
  const monthBranchTenGods = toStrArray(ec.getMonthShiShenZhi()).map(normalizeHanja);
  const dayBranchTenGods = toStrArray(ec.getDayShiShenZhi()).map(normalizeHanja);
  const timeBranchTenGods = toStrArray(ec.getTimeShiShenZhi()).map(normalizeHanja);

  const yearHidden = toStrArray(ec.getYearHideGan());
  const monthHidden = toStrArray(ec.getMonthHideGan());
  const dayHidden = toStrArray(ec.getDayHideGan());
  const timeHidden = toStrArray(ec.getTimeHideGan());

  const pillars: [PillarInfo, PillarInfo, PillarInfo, PillarInfo] = [
    {
      label: "年柱",
      ganzi: stems[0] + branches[0],
      stem: stems[0],
      branch: branches[0],
      stemTenGod: yearStemTenGod,
      branchTenGods: yearBranchTenGods,
      twelveStage: normalizeHanja(ec.getYearDiShi()),
      hiddenStems: yearHidden,
    },
    {
      label: "月柱",
      ganzi: stems[1] + branches[1],
      stem: stems[1],
      branch: branches[1],
      stemTenGod: monthStemTenGod,
      branchTenGods: monthBranchTenGods,
      twelveStage: normalizeHanja(ec.getMonthDiShi()),
      hiddenStems: monthHidden,
    },
    {
      label: "日柱",
      ganzi: stems[2] + branches[2],
      stem: stems[2],
      branch: branches[2],
      stemTenGod: "日干",
      branchTenGods: dayBranchTenGods,
      twelveStage: normalizeHanja(ec.getDayDiShi()),
      hiddenStems: dayHidden,
    },
    {
      label: "時柱",
      ganzi: stems[3] + branches[3],
      stem: stems[3],
      branch: branches[3],
      stemTenGod: timeStemTenGod,
      branchTenGods: timeBranchTenGods,
      twelveStage: normalizeHanja(ec.getTimeDiShi()),
      hiddenStems: timeHidden,
    },
  ];

  const gongmangStr: string = ec.getDayXunKong();
  const gongmangBranches = [...gongmangStr] as Branch[];

  const yun = ec.getYun(input.gender === "M" ? 1 : 0);
  const daYunList = yun.getDaYun();
  const daewoon: DaewoonItem[] = daYunList
    .filter((dy) => dy.getGanZhi())
    .slice(0, 10)
    .map((dy) => ({
      index: dy.getIndex(),
      ganzi: dy.getGanZhi(),
      startAge: dy.getStartAge(),
      startYear: dy.getStartYear(),
    }));

  const specialSal = calcSpecialSal({
    yearStem: stems[0],
    yearBranch: branches[0],
    monthStem: stems[1],
    monthBranch: branches[1],
    dayStem: stems[2],
    dayBranch: branches[2],
    hourStem: stems[3],
    hourBranch: branches[3],
  });

  return {
    input,
    solar: {
      year: solarBase.getYear(),
      month: solarBase.getMonth(),
      day: solarBase.getDay(),
      hour: input.hour,
      minute: input.minute,
    },
    pillars,
    dayMaster: stems[2],
    gongmangBranches,
    daewoon: { forward: yun.isForward(), list: daewoon },
    specialSal,
  };
}
