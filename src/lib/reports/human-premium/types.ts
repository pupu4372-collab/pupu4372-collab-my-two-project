import type { Locale } from "@/lib/saju/types";

export type ReportType =
  | "daily"
  | "decade"
  | "monthly"
  | "yearly"
  | "mental"
  | "love"
  | "career"
  | "business"
  | "wealth"
  | "lifetime";

/** @deprecated DB/API legacy alias — maps to `decade` */
export const LEGACY_REPORT_TYPE_WEEKLY = "weekly" as const;

const LEGACY_REPORT_TYPE_ALIASES: Record<string, ReportType> = {
  weekly: "decade",
};

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  daily: "데일리 럭키 루틴",
  decade: "10년 인생 청사진",
  monthly: "월간 로드맵",
  yearly: "올해의 인생 청사진",
  mental: "멘탈디톡스",
  love: "로맨스시그널",
  career: "커리어 빌드업",
  business: "비즈니스 파트너 플랜",
  wealth: "자산과 재테크",
  lifetime: "인생의 마스터플랜",
};

export const REPORT_TYPE_LABELS_EN: Record<ReportType, string> = {
  daily: "Daily Lucky Routine",
  decade: "10-Year Life Blueprint",
  monthly: "Monthly Roadmap",
  yearly: "This Year's Major-Luck Plan",
  mental: "Mental Detox",
  love: "Romance Signal",
  career: "Career Build-up",
  business: "Business Partner",
  wealth: "Assets & Wealth",
  lifetime: "Life Master Plan",
};

export const DEFAULT_REPORT_TYPE: ReportType = "lifetime";

const REPORT_TYPE_SET = new Set<ReportType>([
  "daily",
  "decade",
  "monthly",
  "yearly",
  "mental",
  "love",
  "career",
  "business",
  "wealth",
  "lifetime",
]);

export function normalizeReportTypeKey(value: string): ReportType | null {
  const key = LEGACY_REPORT_TYPE_ALIASES[value] ?? value;
  if (REPORT_TYPE_SET.has(key as ReportType)) return key as ReportType;
  return null;
}

export function parseReportType(value: unknown): ReportType {
  if (typeof value === "string") {
    const parsed = normalizeReportTypeKey(value);
    if (parsed) return parsed;
  }
  return DEFAULT_REPORT_TYPE;
}

export const HUMAN_PREMIUM_SECTION_IDS = [
  "section-cover",
  "section-structure",
  "section-metrics",
  "section-depth",
  "section-opportunity",
  "section-risk",
  "section-roadmap",
  "section-prophecy",
] as const;

export type HumanPremiumSectionId = (typeof HUMAN_PREMIUM_SECTION_IDS)[number];

export interface ReportScore {
  label: string;
  score: number;
  description: string;
}

export interface ReportOpportunity {
  title: string;
  body: string;
  tip: string;
}

export interface ReportRisk {
  title: string;
  body: string;
  countermeasure: string;
}

export interface ReportRoadmapItem {
  period: string;
  label: string;
  body: string;
}

export interface ReportDecisionMoment {
  situation: string;
  script: string;
}

export interface ReportProphecy {
  short: string;
  full?: string;
}

export interface ReportCohortInsight {
  body: string;
}

/** S4 domain scores (e.g. monthly/yearly areas out of 10). */
export interface ReportDomainScore {
  domain: string;
  /** Integer 1–10 (out of 10). */
  score: number;
  analysis: string;
}

/** S4 thematic sections (career/wealth/mental/business/love) — title + body, no gauge. */
export interface ReportDeepSection {
  title: string;
  body: string;
}

/** S4 decade year cards. */
export interface ReportYearCard {
  year: string;
  /** Typically 40–100. */
  score: number;
  summary: string;
}

/** S4 lifetime major-luck cycles. */
export interface ReportLifeCycle {
  period: string;
  title: string;
  body: string;
}

export interface HumanPremiumReportStructured {
  scores: ReportScore[];
  opportunities: ReportOpportunity[];
  risks: ReportRisk[];
  roadmap: ReportRoadmapItem[];
  decisionMoments: ReportDecisionMoment[];
  prophecy: ReportProphecy;
  cohortInsight: ReportCohortInsight;
  /** Optional S4 structured domains (monthly / yearly quarters). */
  domainScores?: ReportDomainScore[];
  /** Optional lucky dates/months from S4 (monthly dates, yearly months). */
  luckyDates?: string[];
  /** Optional thematic S4 sections (C-group products). */
  deepSections?: ReportDeepSection[];
  /** Optional decade year cards. */
  yearCards?: ReportYearCard[];
  /** Optional lifetime daewoon cycles. */
  lifeCycles?: ReportLifeCycle[];
}

export type HumanPremiumReportStatus =
  | "draft"
  | "payment_pending"
  | "paid"
  | "generating"
  | "ready"
  | "email_sent"
  | "failed"
  | "email_failed";

export type HumanPremiumCalendarType = "solar" | "lunar";

export type HumanPremiumPaymentProvider = "paypal" | "card_pg" | "demo";

export type HumanPremiumEmailStatus = "pending" | "sent" | "failed";

export type HumanPremiumFailureStage =
  | "generation"
  | "storage"
  | "email"
  | "pdf";

export interface HumanPremiumBirthBasis {
  birthDate: string;
  birthTime: string | null;
  birthTimeUnknown: boolean;
  timezone: string;
  calendarType: HumanPremiumCalendarType;
  locale: Locale;
  birthUtc?: string;
  convertedSolarDate?: string;
  gender?: "male" | "female" | null;
  cart?: HumanPremiumCartMeta;
}

export interface HumanPremiumCartGeneratedItem {
  reportId: string;
  webToken: string;
}

export interface HumanPremiumCartMeta {
  cartOrder: true;
  items: ReportType[];
  generated: Partial<Record<ReportType, HumanPremiumCartGeneratedItem>>;
  deliverEmail: boolean;
}

export type HumanPremiumDeliveryMode = "paid";

export interface HumanPremiumReportInput {
  personName: string;
  email: string;
  birthDate: string;
  birthTime: string | null;
  birthTimeUnknown: boolean;
  timezone: string;
  calendarType: HumanPremiumCalendarType;
  locale: Locale;
  privacyConsent: boolean;
  gender?: "male" | "female" | null;
  userId?: string | null;
  /** Defaults to {@link DEFAULT_REPORT_TYPE} when omitted */
  reportType?: ReportType;
  /** Optional delivery channel; prompts follow reportType. */
  deliveryMode?: HumanPremiumDeliveryMode;
}

export interface HumanPremiumReportRow {
  id: string;
  user_id: string | null;
  person_name: string;
  email: string;
  birth_date: string;
  birth_time: string | null;
  birth_time_unknown: boolean;
  birth_timezone: string;
  calendar_type: HumanPremiumCalendarType;
  locale: Locale;
  privacy_consent: boolean;
  birth_basis: HumanPremiumBirthBasis;
  payment_provider: HumanPremiumPaymentProvider | null;
  pg_provider: string | null;
  payment_order_id: string | null;
  checkout_session_id: string | null;
  payment_capture_id: string | null;
  amount_original: number;
  amount_paid: number;
  currency: string;
  status: HumanPremiumReportStatus;
  report_payload: Record<string, unknown> | null;
  failure_stage: HumanPremiumFailureStage | null;
  failure_message: string | null;
  retry_allowed: boolean;
  web_access_token: string;
  web_access_expires_at: string | null;
  web_access_view_count: number;
  pdf_storage_path: string | null;
  pdf_generated_at: string | null;
  download_token: string | null;
  download_expires_at: string | null;
  email_status: HumanPremiumEmailStatus;
  email_sent_at: string | null;
  email_error: string | null;
  resend_message_id: string | null;
  /** Present after migration 031; defaults to lifetime in DB */
  report_type?: ReportType;
  created_at: string;
  updated_at: string;
}

export type HumanPremiumReportInsert = Pick<
  HumanPremiumReportRow,
  | "person_name"
  | "email"
  | "birth_date"
  | "birth_time_unknown"
  | "birth_timezone"
  | "calendar_type"
  | "locale"
  | "privacy_consent"
> & {
  user_id?: string | null;
  birth_time?: string | null;
  birth_basis?: HumanPremiumBirthBasis;
  status?: HumanPremiumReportStatus;
  payment_provider?: HumanPremiumPaymentProvider | null;
  payment_order_id?: string | null;
  checkout_session_id?: string | null;
  amount_original?: number;
  amount_paid?: number;
  currency?: string;
};

export const HUMAN_PREMIUM_AMOUNT_ORIGINAL_USD = 50;
export const HUMAN_PREMIUM_AMOUNT_PAID_USD = 10;
export const HUMAN_PREMIUM_PRODUCT_TYPE = "human_premium_lifetime_report";
export const HUMAN_PREMIUM_PDF_BUCKET = "human-premium-reports";

export type HumanPremiumSectionKind =
  | "cover"
  | "structure"
  | "metrics"
  | "depth"
  | "opportunity"
  | "risk"
  | "roadmap"
  | "prophecy"
  | "intro"
  | "pillar"
  | "element"
  | "domain"
  | "cycle"
  | "summary"
  | "zodiac"
  | "ziwei";

export interface HumanPremiumReportSection {
  id: string;
  chapterId: string;
  chapterTitle: string;
  title: string;
  subtitle?: string;
  body: string;
  bullets?: string[];
  kind: HumanPremiumSectionKind;
  pageEstimate: number;
}

export interface HumanPremiumReportChapter {
  id: string;
  title: string;
  subtitle?: string;
  sections: HumanPremiumReportSection[];
  pageEstimate: number;
}

export type HumanPremiumLlmSectionSource =
  | "claude"
  | "openai"
  | "gemini"
  | "template";

export interface HumanPremiumLlmSectionMeta {
  source: HumanPremiumLlmSectionSource;
  error?: string | null;
}

export interface HumanPremiumLlmMeta {
  enabled: boolean;
  sections: Record<string, HumanPremiumLlmSectionMeta>;
}

export interface HumanPremiumReportPayload {
  version: 1;
  generatedAt: string;
  personName: string;
  locale: Locale;
  reportType: ReportType;
  deliveryMode?: HumanPremiumDeliveryMode;
  calendarType: HumanPremiumCalendarType;
  birthBasis: HumanPremiumBirthBasis;
  analysisMode: "three_pillars" | "four_pillars";
  structured: HumanPremiumReportStructured;
  llm?: HumanPremiumLlmMeta;
  cover: {
    title: string;
    subtitle: string;
    tagline: string;
  };
  summary: {
    headline: string;
    story: string;
    traits: string[];
  };
  saju: {
    dominantElement: string;
    pillars: Record<string, unknown>;
    elements: Record<string, unknown>[];
    ziwei?: Record<string, unknown>;
    chapters: HumanPremiumReportChapter[];
    sectionCount: number;
    estimatedPages: number;
  };
  zodiac: {
    signKey: string;
    signName: string;
    chapters: HumanPremiumReportChapter[];
    sectionCount: number;
    estimatedPages: number;
  };
  totals: {
    sections: number;
    estimatedPages: number;
  };
}
