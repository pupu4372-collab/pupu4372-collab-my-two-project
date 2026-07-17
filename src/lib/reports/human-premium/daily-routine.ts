import { randomUUID } from "node:crypto";
import { buildHumanPremiumReportUrl, sendHumanPremiumReportEmail } from "./email";
import { isDeliverableHumanPremiumEmail } from "./email-policy";
import { buildHumanPremiumReportHybrid } from "./hybrid";
import {
  createHumanPremiumReportDraft,
  getHumanPremiumReportByPaymentOrderId,
  markHumanPremiumReportFailed,
  markHumanPremiumReportReady,
  updateHumanPremiumReport,
} from "./storage";
import type {
  HumanPremiumPaymentProvider,
  HumanPremiumReportInput,
  HumanPremiumReportPayload,
  HumanPremiumReportRow,
  ReportType,
} from "./types";

export const DAILY_ROUTINE_REPORT_TYPE: ReportType = "daily";

/** 데일리 럭키 루틴 — `daily-action-plan-report-prompt` (`daily` product key). */
export async function buildHumanPremiumDailyRoutineReport(
  input: HumanPremiumReportInput
): Promise<HumanPremiumReportPayload> {
  return buildHumanPremiumReportHybrid({
    ...input,
    reportType: DAILY_ROUTINE_REPORT_TYPE,
  });
}

/**
 * Persist daily report. Inserts `generating` **before** LLM so concurrent coupon
 * races see an in-flight seat. On LLM/persist failure → `failed`.
 */
export async function persistHumanPremiumDailyRoutineReport(
  input: HumanPremiumReportInput,
  options?: {
    sendEmail?: boolean;
    request?: Request | null;
    paymentProvider?: HumanPremiumPaymentProvider;
    paymentOrderId?: string;
    amountPaid?: number;
    amountOriginal?: number;
    currency?: string;
    checkoutSessionId?: string | null;
    pgProvider?: string | null;
  }
): Promise<{
  row: HumanPremiumReportRow;
  payload: HumanPremiumReportPayload;
  webToken: string;
  webUrl: string;
}> {
  const dailyInput = { ...input, reportType: DAILY_ROUTINE_REPORT_TYPE };
  const isPaidExtra = (options?.amountPaid ?? 0) > 0;
  const paymentOrderId = options?.paymentOrderId ?? `daily-free-${randomUUID()}`;
  const checkoutSessionId =
    options?.checkoutSessionId ?? (isPaidExtra ? paymentOrderId : null);

  if (isPaidExtra && paymentOrderId) {
    const existing = await getHumanPremiumReportByPaymentOrderId(paymentOrderId);
    if (existing?.report_payload && (existing.status === "ready" || existing.status === "email_sent")) {
      const payload = existing.report_payload as unknown as HumanPremiumReportPayload;
      return {
        row: existing,
        payload,
        webToken: existing.web_access_token,
        webUrl: buildHumanPremiumReportUrl(existing, options?.request),
      };
    }
    if (existing?.status === "generating") {
      return finishDailyRoutineFromGenerating(existing, dailyInput, options);
    }
    if (existing?.status === "failed") {
      const restarted = await updateHumanPremiumReport(existing.id, {
        status: "generating",
        failure_stage: null,
        failure_message: null,
      });
      return finishDailyRoutineFromGenerating(restarted, dailyInput, options);
    }
  }

  const draft = await createHumanPremiumReportDraft(dailyInput, {
    status: "generating",
    paymentProvider: options?.paymentProvider ?? "demo",
    paymentOrderId,
    amountPaid: options?.amountPaid ?? 0,
    amountOriginal: options?.amountOriginal ?? 0,
    currency: options?.currency ?? "KRW",
    checkoutSessionId,
    pgProvider: options?.pgProvider ?? null,
  });

  if (draft.status === "failed") {
    const restarted = await updateHumanPremiumReport(draft.id, {
      status: "generating",
      failure_stage: null,
      failure_message: null,
    });
    return finishDailyRoutineFromGenerating(restarted, dailyInput, options);
  }

  if (draft.report_payload && (draft.status === "ready" || draft.status === "email_sent")) {
    const payload = draft.report_payload as unknown as HumanPremiumReportPayload;
    return {
      row: draft,
      payload,
      webToken: draft.web_access_token,
      webUrl: buildHumanPremiumReportUrl(draft, options?.request),
    };
  }

  return finishDailyRoutineFromGenerating(draft, dailyInput, options);
}

async function finishDailyRoutineFromGenerating(
  draft: HumanPremiumReportRow,
  dailyInput: HumanPremiumReportInput,
  options?: {
    sendEmail?: boolean;
    request?: Request | null;
  }
): Promise<{
  row: HumanPremiumReportRow;
  payload: HumanPremiumReportPayload;
  webToken: string;
  webUrl: string;
}> {
  try {
    const payload = await buildHumanPremiumDailyRoutineReport(dailyInput);

    let ready = await markHumanPremiumReportReady(
      draft.id,
      payload as unknown as Record<string, unknown>,
      payload.birthBasis
    );

    if (options?.sendEmail !== false && isDeliverableHumanPremiumEmail(ready.email)) {
      ready = await sendHumanPremiumReportEmail(ready, options?.request);
    }

    return {
      row: ready,
      payload,
      webToken: ready.web_access_token,
      webUrl: buildHumanPremiumReportUrl(ready, options?.request),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Daily routine generation failed.";
    try {
      await markHumanPremiumReportFailed(draft.id, "generation", message);
    } catch (markErr) {
      console.error("[daily-routine] mark_failed_error", {
        reportId: draft.id,
        message: markErr instanceof Error ? markErr.message : String(markErr),
      });
    }
    throw err instanceof Error ? err : new Error(message);
  }
}
