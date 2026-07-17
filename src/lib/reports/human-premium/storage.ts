import { randomBytes } from "node:crypto";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import {
  HUMAN_PREMIUM_AMOUNT_ORIGINAL_USD,
  HUMAN_PREMIUM_AMOUNT_PAID_USD,
  HUMAN_PREMIUM_PDF_BUCKET,
  type HumanPremiumBirthBasis,
  type HumanPremiumEmailStatus,
  type HumanPremiumFailureStage,
  type HumanPremiumPaymentProvider,
  type HumanPremiumReportInput,
  type HumanPremiumReportRow,
  type HumanPremiumReportStatus,
} from "./types";
import { humanPremiumWebExpiresAt } from "./retention";

type Db = SupabaseClient<Database>;

function requireDb(): Db {
  const supabase = getSupabaseServerClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase;
}

function toBirthBasis(input: HumanPremiumReportInput): HumanPremiumBirthBasis {
  return {
    birthDate: input.birthDate,
    birthTime: input.birthTime,
    birthTimeUnknown: input.birthTimeUnknown,
    timezone: input.timezone,
    calendarType: input.calendarType,
    locale: input.locale,
    gender: input.gender ?? null,
  };
}

function rowFromDb(data: unknown): HumanPremiumReportRow {
  return data as HumanPremiumReportRow;
}

function isUniqueViolation(error: { code?: string } | null): boolean {
  return error?.code === "23505";
}

export function buildHumanPremiumPdfPath(reportId: string): string {
  return `${reportId}/report.pdf`;
}

export function createHumanPremiumDownloadToken(): string {
  return randomBytes(24).toString("hex");
}

export async function createHumanPremiumReportDraft(
  input: HumanPremiumReportInput,
  options?: {
    status?: HumanPremiumReportStatus;
    paymentProvider?: HumanPremiumPaymentProvider | null;
    paymentOrderId?: string | null;
    checkoutSessionId?: string | null;
    amountPaid?: number;
    amountOriginal?: number;
    currency?: string;
    pgProvider?: string | null;
  }
): Promise<HumanPremiumReportRow> {
  const supabase = requireDb();
  const amountOriginal = options?.amountOriginal ?? HUMAN_PREMIUM_AMOUNT_ORIGINAL_USD;
  const currency = options?.currency ?? "USD";
  const checkoutSessionId = options?.checkoutSessionId ?? null;
  const paymentOrderId = options?.paymentOrderId ?? null;

  if (checkoutSessionId) {
    const existing = await getHumanPremiumReportByCheckoutSession(checkoutSessionId);
    if (existing) return existing;
  }
  if (paymentOrderId) {
    const existing = await getHumanPremiumReportByPaymentOrderId(paymentOrderId);
    if (existing) return existing;
  }

  const { data, error } = await supabase
    .from("human_premium_reports")
    .insert({
      user_id: input.userId ?? null,
      person_name: input.personName.trim(),
      email: input.email.trim().toLowerCase(),
      birth_date: input.birthDate,
      birth_time: input.birthTime,
      birth_time_unknown: input.birthTimeUnknown,
      birth_timezone: input.timezone,
      calendar_type: input.calendarType,
      locale: input.locale,
      privacy_consent: input.privacyConsent,
      birth_basis: toBirthBasis(input),
      report_type: input.reportType ?? "lifetime",
      status: options?.status ?? "draft",
      payment_provider: options?.paymentProvider ?? null,
      pg_provider: options?.pgProvider ?? null,
      payment_order_id: paymentOrderId,
      checkout_session_id: checkoutSessionId,
      amount_original: amountOriginal,
      amount_paid: options?.amountPaid ?? 0,
      currency,
    } as never)
    .select("*")
    .single();

  if (error) {
    if (isUniqueViolation(error)) {
      if (checkoutSessionId) {
        const existing = await getHumanPremiumReportByCheckoutSession(checkoutSessionId);
        if (existing) return existing;
      }
      if (paymentOrderId) {
        const existing = await getHumanPremiumReportByPaymentOrderId(paymentOrderId);
        if (existing) return existing;
      }
    }
    throw new Error(error.message ?? "Failed to create human premium report.");
  }
  if (!data) {
    throw new Error("Failed to create human premium report.");
  }

  return rowFromDb(data);
}

export async function getHumanPremiumReportById(
  reportId: string
): Promise<HumanPremiumReportRow | null> {
  const supabase = requireDb();
  const { data, error } = await supabase
    .from("human_premium_reports")
    .select("*")
    .eq("id", reportId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? rowFromDb(data) : null;
}

export async function getHumanPremiumReportByPaymentOrderId(
  paymentOrderId: string
): Promise<HumanPremiumReportRow | null> {
  const supabase = requireDb();
  const { data, error } = await supabase
    .from("human_premium_reports")
    .select("*")
    .eq("payment_order_id", paymentOrderId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? rowFromDb(data) : null;
}

export async function getHumanPremiumReportByCheckoutSession(
  checkoutSessionId: string
): Promise<HumanPremiumReportRow | null> {
  const supabase = requireDb();
  const { data, error } = await supabase
    .from("human_premium_reports")
    .select("*")
    .eq("checkout_session_id", checkoutSessionId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? rowFromDb(data) : null;
}

export async function getHumanPremiumReportByWebToken(
  token: string
): Promise<HumanPremiumReportRow | null> {
  const supabase = requireDb();
  const { data, error } = await supabase
    .from("human_premium_reports")
    .select("*")
    .eq("web_access_token", token)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? rowFromDb(data) : null;
}

export async function getHumanPremiumReportByDownloadToken(
  token: string
): Promise<HumanPremiumReportRow | null> {
  const supabase = requireDb();
  const { data, error } = await supabase
    .from("human_premium_reports")
    .select("*")
    .eq("download_token", token)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? rowFromDb(data) : null;
}

export async function updateHumanPremiumReport(
  reportId: string,
  patch: Partial<{
    status: HumanPremiumReportStatus;
    birth_basis: HumanPremiumBirthBasis;
    report_payload: Record<string, unknown>;
    payment_provider: HumanPremiumPaymentProvider | null;
    pg_provider: string | null;
    payment_order_id: string | null;
    checkout_session_id: string | null;
    payment_capture_id: string | null;
    amount_paid: number;
    failure_stage: HumanPremiumFailureStage | null;
    failure_message: string | null;
    retry_allowed: boolean;
    web_access_token: string;
    pdf_storage_path: string | null;
    pdf_generated_at: string | null;
    download_token: string | null;
    download_expires_at: string | null;
    web_access_expires_at: string | null;
    email_status: HumanPremiumEmailStatus;
    email_sent_at: string | null;
    email_error: string | null;
    resend_message_id: string | null;
  }>
): Promise<HumanPremiumReportRow> {
  const supabase = requireDb();
  const { data, error } = await supabase
    .from("human_premium_reports")
    .update(patch as never)
    .eq("id", reportId)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to update human premium report.");
  }

  return rowFromDb(data);
}

export async function markHumanPremiumReportPaid(
  reportId: string,
  payment: {
    provider: HumanPremiumPaymentProvider;
    orderId: string;
    captureId: string;
    amountPaid?: number;
    pgProvider?: string | null;
  }
): Promise<HumanPremiumReportRow> {
  return updateHumanPremiumReport(reportId, {
    status: "paid",
    payment_provider: payment.provider,
    payment_order_id: payment.orderId,
    payment_capture_id: payment.captureId,
    amount_paid: payment.amountPaid ?? HUMAN_PREMIUM_AMOUNT_PAID_USD,
    pg_provider: payment.pgProvider ?? null,
  });
}

export async function markHumanPremiumReportReady(
  reportId: string,
  reportPayload: Record<string, unknown>,
  birthBasis?: HumanPremiumBirthBasis
): Promise<HumanPremiumReportRow> {
  return updateHumanPremiumReport(reportId, {
    status: "ready",
    report_payload: reportPayload,
    pdf_storage_path: null,
    pdf_generated_at: null,
    download_token: null,
    download_expires_at: null,
    web_access_expires_at: humanPremiumWebExpiresAt(),
    failure_stage: null,
    failure_message: null,
    ...(birthBasis ? { birth_basis: birthBasis } : {}),
  });
}

export async function listHumanPremiumCartOrderRows(options: {
  userId?: string | null;
  orderIds?: string[];
  limit?: number;
}): Promise<HumanPremiumReportRow[]> {
  const supabase = requireDb();
  const limit = options.limit ?? 20;
  const rows: HumanPremiumReportRow[] = [];

  // Legacy null-user_id rows + device session splits: merge client-provided paid orderIds.
  if (options.orderIds?.length) {
    const { data, error } = await supabase
      .from("human_premium_reports")
      .select("*")
      .in("payment_order_id", options.orderIds)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    rows.push(...(data ?? []).map(rowFromDb));
  }

  if (options.userId) {
    const { data, error } = await supabase
      .from("human_premium_reports")
      .select("*")
      .eq("user_id", options.userId)
      .like("payment_order_id", "hp_cart_%")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    rows.push(...(data ?? []).map(rowFromDb));
  }

  const seen = new Set<string>();
  return rows.filter((row) => {
    if (seen.has(row.id)) return false;
    seen.add(row.id);
    return Boolean(row.birth_basis?.cart?.cartOrder);
  });
}

/**
 * Legacy cart-exclusion only: null-user_id rows matched by deliverable email.
 * Not used for vault recovery.
 */
export async function listLegacyNullUserCartOrdersByEmail(
  email: string,
  limit = 50
): Promise<HumanPremiumReportRow[]> {
  const normalized = email.trim().toLowerCase();
  if (!normalized || normalized.endsWith("@ksajupet.local")) return [];

  const supabase = requireDb();
  const { data, error } = await supabase
    .from("human_premium_reports")
    .select("*")
    .eq("email", normalized)
    .is("user_id", null)
    .like("payment_order_id", "hp_cart_%")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? [])
    .map(rowFromDb)
    .filter((row) => Boolean(row.birth_basis?.cart?.cartOrder));
}

export async function markHumanPremiumReportFailed(
  reportId: string,
  stage: HumanPremiumFailureStage,
  message: string
): Promise<HumanPremiumReportRow> {
  return updateHumanPremiumReport(reportId, {
    status: stage === "email" ? "email_failed" : "failed",
    failure_stage: stage,
    failure_message: message,
  });
}

export async function incrementHumanPremiumWebViewCount(
  reportId: string
): Promise<void> {
  const supabase = requireDb();
  const current = await getHumanPremiumReportById(reportId);
  if (!current) return;

  const { error } = await supabase
    .from("human_premium_reports")
    .update({
      web_access_view_count: current.web_access_view_count + 1,
    } as never)
    .eq("id", reportId);

  if (error) throw new Error(error.message);
}

export async function searchHumanPremiumReports(
  query: string,
  limit = 20
): Promise<HumanPremiumReportRow[]> {
  const supabase = requireDb();
  const trimmed = query.trim();
  if (!trimmed) return [];

  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidPattern.test(trimmed)) {
    const row = await getHumanPremiumReportById(trimmed);
    return row ? [row] : [];
  }

  const byOrder = await getHumanPremiumReportByPaymentOrderId(trimmed);
  if (byOrder) return [byOrder];

  const safe = trimmed.replace(/[%_]/g, "");
  const { data, error } = await supabase
    .from("human_premium_reports")
    .select("*")
    .or(
      `person_name.ilike.%${safe}%,email.ilike.%${safe}%`
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []).map(rowFromDb);
}

export async function refreshHumanPremiumWebAccess(
  reportId: string,
  expiresAt?: string | null
): Promise<HumanPremiumReportRow> {
  const token = randomBytes(24).toString("hex");

  return updateHumanPremiumReport(reportId, {
    web_access_token: token,
    web_access_expires_at: expiresAt ?? null,
  });
}

export async function uploadHumanPremiumPdf(
  reportId: string,
  pdf: Buffer
): Promise<HumanPremiumReportRow> {
  const supabase = requireDb();
  const storagePath = buildHumanPremiumPdfPath(reportId);

  const { error } = await supabase.storage
    .from(HUMAN_PREMIUM_PDF_BUCKET)
    .upload(storagePath, pdf, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (error) throw new Error(error.message);

  return updateHumanPremiumReport(reportId, {
    pdf_storage_path: storagePath,
    pdf_generated_at: new Date().toISOString(),
    download_token: createHumanPremiumDownloadToken(),
    download_expires_at: null,
    failure_stage: null,
    failure_message: null,
  });
}

export async function downloadHumanPremiumPdf(storagePath: string): Promise<Buffer> {
  const supabase = requireDb();
  const { data, error } = await supabase.storage
    .from(HUMAN_PREMIUM_PDF_BUCKET)
    .download(storagePath);

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to download PDF.");
  }

  return Buffer.from(await data.arrayBuffer());
}

export async function createHumanPremiumPdfSignedUrl(
  storagePath: string,
  expiresInSeconds = 3600
): Promise<string> {
  const supabase = requireDb();
  const { data, error } = await supabase.storage
    .from(HUMAN_PREMIUM_PDF_BUCKET)
    .createSignedUrl(storagePath, expiresInSeconds);

  if (error || !data?.signedUrl) {
    throw new Error(error?.message ?? "Failed to create signed PDF URL.");
  }

  return data.signedUrl;
}
