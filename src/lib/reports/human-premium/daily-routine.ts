import { randomUUID } from "node:crypto";
import { buildHumanPremiumReportUrl, sendHumanPremiumReportEmail } from "./email";
import { isDeliverableHumanPremiumEmail } from "./email-policy";
import { buildHumanPremiumReportHybrid } from "./hybrid";
import { buildHumanPremiumReportUrl } from "./email";
import {
  createHumanPremiumReportDraft,
  getHumanPremiumReportByPaymentOrderId,
  markHumanPremiumReportReady,
} from "./storage";
import type {
  HumanPremiumPaymentProvider,
  HumanPremiumReportInput,
  HumanPremiumReportPayload,
  HumanPremiumReportRow,
  ReportType,
} from "./types";

export const DAILY_ROUTINE_REPORT_TYPE: ReportType = "daily";

/** 무료 데일리 럭키 루틴 — `daily-action-plan-report-prompt` (`daily` product key). */
export async function buildHumanPremiumDailyRoutineReport(
  input: HumanPremiumReportInput
): Promise<HumanPremiumReportPayload> {
  return buildHumanPremiumReportHybrid({
    ...input,
    reportType: DAILY_ROUTINE_REPORT_TYPE,
  });
}

/** Persist daily report so PDF + web link work like paid reports. */
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
    if (existing?.report_payload) {
      const payload = existing.report_payload as unknown as HumanPremiumReportPayload;
      return {
        row: existing,
        payload,
        webToken: existing.web_access_token,
        webUrl: buildHumanPremiumReportUrl(existing, options?.request),
      };
    }
  }

  const payload = await buildHumanPremiumDailyRoutineReport(dailyInput);

  const draft = await createHumanPremiumReportDraft(dailyInput, {
    status: "draft",
    paymentProvider: options?.paymentProvider ?? "demo",
    paymentOrderId,
    amountPaid: options?.amountPaid ?? 0,
    amountOriginal: options?.amountOriginal ?? 0,
    currency: options?.currency ?? "KRW",
    checkoutSessionId,
    pgProvider: options?.pgProvider ?? null,
  });

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
}
