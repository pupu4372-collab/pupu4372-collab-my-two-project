import { randomUUID } from "node:crypto";
import { buildHumanPremiumReportUrl, sendHumanPremiumReportEmail } from "./email";
import { isDeliverableHumanPremiumEmail } from "./email-policy";
import { buildHumanPremiumReportHybrid } from "./hybrid";
import {
  createHumanPremiumReportDraft,
  markHumanPremiumReportReady,
} from "./storage";
import type {
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

/** Persist free daily report so PDF + web link work like paid reports. */
export async function persistHumanPremiumDailyRoutineReport(
  input: HumanPremiumReportInput,
  options?: { sendEmail?: boolean; request?: Request | null }
): Promise<{
  row: HumanPremiumReportRow;
  payload: HumanPremiumReportPayload;
  webToken: string;
  webUrl: string;
}> {
  const dailyInput = { ...input, reportType: DAILY_ROUTINE_REPORT_TYPE };
  const payload = await buildHumanPremiumDailyRoutineReport(dailyInput);

  const draft = await createHumanPremiumReportDraft(dailyInput, {
    status: "draft",
    paymentProvider: "demo",
    paymentOrderId: `daily-${randomUUID()}`,
    amountPaid: 0,
    amountOriginal: 0,
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
