declare module "lunar-javascript" {
  export class Solar {
    static fromYmdHms(
      year: number,
      month: number,
      day: number,
      hour: number,
      minute: number,
      second: number
    ): Solar;
    static fromYmd(year: number, month: number, day: number): Solar;
    getLunar(): Lunar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
  }

  export class Lunar {
    static fromYmd(year: number, month: number, day: number): Lunar;
    getSolar(): Solar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getEightChar(): EightChar;
  }

  export interface EightChar {
    getYearGan(): string;
    getMonthGan(): string;
    getDayGan(): string;
    getTimeGan(): string;
    getYearZhi(): string;
    getMonthZhi(): string;
    getDayZhi(): string;
    getTimeZhi(): string;
    getYearShiShenGan(): string;
    getMonthShiShenGan(): string;
    getTimeShiShenGan(): string;
    getYearShiShenZhi(): unknown;
    getMonthShiShenZhi(): unknown;
    getDayShiShenZhi(): unknown;
    getTimeShiShenZhi(): unknown;
    getYearHideGan(): unknown;
    getMonthHideGan(): unknown;
    getDayHideGan(): unknown;
    getTimeHideGan(): unknown;
    getYearDiShi(): string;
    getMonthDiShi(): string;
    getDayDiShi(): string;
    getTimeDiShi(): string;
    getDayXunKong(): string;
    getYun(gender: number): Yun;
  }

  export interface Yun {
    isForward(): boolean;
    getDaYun(): DaYun[];
  }

  export interface DaYun {
    getGanZhi(): string;
    getIndex(): number;
    getStartAge(): number;
    getStartYear(): number;
  }
}
