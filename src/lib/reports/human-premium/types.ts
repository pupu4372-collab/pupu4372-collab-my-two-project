import type { Locale } from "@/lib/saju/types";

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
}

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
  calendarType: HumanPremiumCalendarType;
  birthBasis: HumanPremiumBirthBasis;
  analysisMode: "three_pillars" | "four_pillars";
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
