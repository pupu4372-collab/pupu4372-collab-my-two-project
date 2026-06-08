import { buildHumanPremiumReport } from "./generator";
import {
  getHumanPremiumReportByWebToken,
  incrementHumanPremiumWebViewCount,
  markHumanPremiumReportReady,
  updateHumanPremiumReport,
} from "./storage";
import type {
  HumanPremiumReportInput,
  HumanPremiumReportPayload,
  HumanPremiumReportRow,
} from "./types";

function rowToInput(row: HumanPremiumReportRow): HumanPremiumReportInput {
  return {
    personName: row.person_name,
    email: row.email,
    birthDate: row.birth_date,
    birthTime: row.birth_time,
    birthTimeUnknown: row.birth_time_unknown,
    timezone: row.birth_timezone,
    calendarType: row.calendar_type,
    locale: row.locale,
    privacyConsent: row.privacy_consent,
    userId: row.user_id,
  };
}

function isAccessExpired(row: HumanPremiumReportRow): boolean {
  if (!row.web_access_expires_at) return false;
  return new Date(row.web_access_expires_at).getTime() < Date.now();
}

function isCurrentReportTemplate(payload: HumanPremiumReportPayload): boolean {
  return payload.saju.chapters[0]?.id === "introduction";
}

export async function resolveHumanPremiumReportByToken(
  token: string
): Promise<{
  row: HumanPremiumReportRow;
  payload: HumanPremiumReportPayload;
} | null> {
  const row = await getHumanPremiumReportByWebToken(token);
  if (!row || isAccessExpired(row)) return null;

  if (row.report_payload) {
    const payload = row.report_payload as unknown as HumanPremiumReportPayload;
    if (!isCurrentReportTemplate(payload)) {
      const rebuilt = buildHumanPremiumReport(rowToInput(row));
      const saved = await markHumanPremiumReportReady(
        row.id,
        rebuilt as unknown as Record<string, unknown>,
        rebuilt.birthBasis
      );
      await incrementHumanPremiumWebViewCount(saved.id);
      return { row: saved, payload: rebuilt };
    }

    await incrementHumanPremiumWebViewCount(row.id);
    return {
      row,
      payload,
    };
  }

  const allowedStatuses = new Set([
    "paid",
    "generating",
    "ready",
    "email_sent",
    "failed",
    "email_failed",
  ]);
  if (!allowedStatuses.has(row.status) && row.payment_provider !== "demo") {
    return null;
  }

  await updateHumanPremiumReport(row.id, { status: "generating" });

  try {
    const payload = buildHumanPremiumReport(rowToInput(row));
    const saved = await markHumanPremiumReportReady(
      row.id,
      payload as unknown as Record<string, unknown>,
      payload.birthBasis
    );
    await incrementHumanPremiumWebViewCount(saved.id);
    return { row: saved, payload };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Report generation failed.";
    await updateHumanPremiumReport(row.id, {
      status: "failed",
      failure_stage: "generation",
      failure_message: message,
    });
    throw error;
  }
}
