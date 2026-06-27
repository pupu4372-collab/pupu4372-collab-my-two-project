import type { ReportType } from "./types";

export const REPORT_PRICING: Record<ReportType, number> = {
  daily: 0,
  decade: 4900,
  monthly: 3900,
  yearly: 5900,
  mental: 3900,
  love: 4900,
  career: 4900,
  business: 4900,
  wealth: 5900,
  lifetime: 9900,
};

export const BUNDLE_PRICING = {
  all: 30000,
  themepack: 9900,
  timepack: 9900,
} as const;

export type HumanPremiumBundleKind = keyof typeof BUNDLE_PRICING;

export const REPORT_TYPE_SUBTITLES_KO: Record<ReportType, string> = {
  daily: "오늘 행운 플랜",
  decade: "10년 전략 로드맵",
  monthly: "이달 전략과 월간 리스크",
  yearly: "올해 로드맵과 분기별 행동",
  mental: "심리·건강·에너지·회복력",
  love: "연애·결혼·관계 중심",
  career: "직장·성장·성과 방향",
  business: "협업·네트워크·파트너",
  wealth: "자산흐름과 재테크 설계",
  lifetime: "평생 대운과 인생 설계",
};

export const REPORT_TYPE_SUBTITLES_EN: Record<ReportType, string> = {
  daily: "Today's action guide",
  decade: "10-year strategy roadmap",
  monthly: "Monthly strategy and risks",
  yearly: "Yearly roadmap and quarterly moves",
  mental: "Mind, health, energy, resilience",
  love: "Romance, marriage, relationships",
  career: "Work, growth, recognition",
  business: "Collaboration, network, partners",
  wealth: "Asset flow and wealth design",
  lifetime: "Full major-luck life design",
};

/** Paid shop grid — `daily` (데일리 럭키 루틴) is free via DayPillarPreview */
export const REPORT_TYPE_ORDER: ReportType[] = [
  "decade",
  "monthly",
  "yearly",
  "mental",
  "love",
  "career",
  "business",
  "wealth",
  "lifetime",
];

/** Shop grid card pastel tints (on dark hero background) */
export const REPORT_CARD_THEMES: Record<
  ReportType,
  { bg: string; border: string; accent: string }
> = {
  daily: {
    bg: "color-mix(in srgb, #dbeafe 78%, white)",
    border: "color-mix(in srgb, #60a5fa 45%, transparent)",
    accent: "#1d4ed8",
  },
  decade: {
    bg: "color-mix(in srgb, #ede9fe 78%, white)",
    border: "color-mix(in srgb, #a78bfa 45%, transparent)",
    accent: "#6d28d9",
  },
  monthly: {
    bg: "color-mix(in srgb, #ffedd5 76%, white)",
    border: "color-mix(in srgb, #fb923c 42%, transparent)",
    accent: "#c2410c",
  },
  yearly: {
    bg: "color-mix(in srgb, #fef9c3 74%, white)",
    border: "color-mix(in srgb, #eab308 40%, transparent)",
    accent: "#a16207",
  },
  mental: {
    bg: "color-mix(in srgb, #d1fae5 78%, white)",
    border: "color-mix(in srgb, #34d399 42%, transparent)",
    accent: "#047857",
  },
  love: {
    bg: "color-mix(in srgb, #fce7f3 80%, white)",
    border: "color-mix(in srgb, #f472b6 45%, transparent)",
    accent: "#be185d",
  },
  career: {
    bg: "color-mix(in srgb, #e0f2fe 78%, white)",
    border: "color-mix(in srgb, #38bdf8 42%, transparent)",
    accent: "#0369a1",
  },
  business: {
    bg: "color-mix(in srgb, #fef3c7 76%, white)",
    border: "color-mix(in srgb, #fbbf24 42%, transparent)",
    accent: "#b45309",
  },
  wealth: {
    bg: "color-mix(in srgb, #ccfbf1 78%, white)",
    border: "color-mix(in srgb, #2dd4bf 42%, transparent)",
    accent: "#0f766e",
  },
  lifetime: {
    bg: "color-mix(in srgb, #ede9fe 80%, #faf5ff)",
    border: "color-mix(in srgb, #8b5cf6 50%, transparent)",
    accent: "#5b21b6",
  },
};

export function formatKrw(amount: number): string {
  return `₩${amount.toLocaleString("ko-KR")}`;
}

export function sumPaidReportPricing(): number {
  return REPORT_TYPE_ORDER.reduce((sum, type) => sum + REPORT_PRICING[type], 0);
}

export function getBundleSavings(): number {
  return sumPaidReportPricing() - BUNDLE_PRICING.all;
}

export function resolveCheckoutAmount(options: {
  reportType?: ReportType;
  bundle?: HumanPremiumBundleKind | null;
  isBundle?: boolean;
  cartItems?: ReportType[];
}): number {
  if (options.cartItems?.length) return sumCartAmount(options.cartItems);
  if (options.bundle) return BUNDLE_PRICING[options.bundle];
  if (options.isBundle) return BUNDLE_PRICING.all;
  if (options.reportType) return REPORT_PRICING[options.reportType];
  return REPORT_PRICING.lifetime;
}

export function sumCartAmount(items: ReportType[]): number {
  const unique = [...new Set(items)];
  return unique.reduce((sum, type) => sum + REPORT_PRICING[type], 0);
}
