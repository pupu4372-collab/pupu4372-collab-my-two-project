import type { ReportType } from "./types";

export const REPORT_PRICING: Record<ReportType, number> = {
  daily: 2900,
  weekly: 2900,
  monthly: 3900,
  yearly: 5900,
  mental: 3900,
  love: 4900,
  career: 4900,
  business: 4900,
  lifetime: 9900,
};

export const BUNDLE_PRICING = {
  all: 30000,
  themepack: 9900,
  timepack: 9900,
} as const;

export type HumanPremiumBundleKind = keyof typeof BUNDLE_PRICING;

export const REPORT_TYPE_SUBTITLES_KO: Record<ReportType, string> = {
  daily: "오늘 하루 행동 지침",
  weekly: "이번 주 흐름과 전략",
  monthly: "이달 전략과 월간 리스크",
  yearly: "올해 로드맵과 분기별 행동",
  mental: "심리·건강·에너지·회복력",
  love: "연애·결혼·관계 중심",
  career: "직장·성장·성과 방향",
  business: "협업·네트워크·파트너",
  lifetime: "대운 전체와 인생 설계",
};

export const REPORT_TYPE_SUBTITLES_EN: Record<ReportType, string> = {
  daily: "Today's action guide",
  weekly: "This week's flow and strategy",
  monthly: "Monthly strategy and risks",
  yearly: "Yearly roadmap and quarterly moves",
  mental: "Mind, health, energy, resilience",
  love: "Romance, marriage, relationships",
  career: "Work, growth, recognition",
  business: "Collaboration, network, partners",
  lifetime: "Full major-luck life design",
};

export const REPORT_TYPE_ORDER: ReportType[] = [
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "mental",
  "love",
  "career",
  "business",
  "lifetime",
];

export function formatKrw(amount: number): string {
  return `₩${amount.toLocaleString("ko-KR")}`;
}

export function getBundleSavings(): number {
  const allSingle = Object.values(REPORT_PRICING).reduce((a, b) => a + b, 0);
  return allSingle - BUNDLE_PRICING.all;
}

export function resolveCheckoutAmount(options: {
  reportType?: ReportType;
  bundle?: HumanPremiumBundleKind | null;
  isBundle?: boolean;
}): number {
  if (options.bundle) return BUNDLE_PRICING[options.bundle];
  if (options.isBundle) return BUNDLE_PRICING.all;
  if (options.reportType) return REPORT_PRICING[options.reportType];
  return REPORT_PRICING.lifetime;
}
