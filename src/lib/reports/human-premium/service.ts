import { buildHumanPremiumReport } from "./generator";
import { sendHumanPremiumReportEmail, buildHumanPremiumReportUrl } from "./email";
import {
  createHumanPremiumReportDraft,
  markHumanPremiumReportPaid,
  markHumanPremiumReportReady,
} from "./storage";
import type {
  HumanPremiumPaymentProvider,
  HumanPremiumReportInput,
  HumanPremiumReportPayload,
  HumanPremiumReportRow,
} from "./types";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function parseHumanPremiumReportInput(
  body: Record<string, unknown>,
  userId?: string | null
): HumanPremiumReportInput {
  const personName = String(body.personName ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const birthDate = String(body.birthDate ?? "").trim();
  const timezone = String(body.timezone ?? "Asia/Seoul").trim();
  const calendarType = body.calendarType === "lunar" ? "lunar" : "solar";
  const locale = body.locale === "en" ? "en" : "ko";
  const birthTimeUnknown = Boolean(body.birthTimeUnknown);
  const birthTime = birthTimeUnknown ? null : String(body.birthTime ?? "").trim() || null;

  if (!personName) throw new Error("personName required.");
  if (!email || !isValidEmail(email)) throw new Error("Valid email required.");
  if (!birthDate) throw new Error("birthDate required.");
  if (!timezone) throw new Error("timezone required.");
  if (!body.privacyConsent) throw new Error("privacyConsent required.");

  return {
    personName,
    email,
    birthDate,
    birthTime,
    birthTimeUnknown,
    timezone,
    calendarType,
    locale,
    privacyConsent: true,
    userId: userId ?? null,
  };
}

export function humanPremiumRowToInput(
  row: HumanPremiumReportRow
): HumanPremiumReportInput {
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

export async function completeHumanPremiumPayment(
  row: HumanPremiumReportRow,
  payment: {
    provider: HumanPremiumPaymentProvider;
    orderId: string;
    captureId: string;
    amountPaid: number;
  },
  options?: { sendEmail?: boolean; request?: Request | null }
): Promise<{
  row: HumanPremiumReportRow;
  payload: HumanPremiumReportPayload;
  webUrl: string;
}> {
  if (row.report_payload) {
    let saved = row;
    if (options?.sendEmail !== false && row.email_status !== "sent") {
      saved = await sendHumanPremiumReportEmail(row, options?.request);
    }

    return {
      row: saved,
      payload: row.report_payload as unknown as HumanPremiumReportPayload,
      webUrl: buildHumanPremiumReportUrl(saved, options?.request),
    };
  }

  const paid = await markHumanPremiumReportPaid(row.id, payment);
  const input = humanPremiumRowToInput(paid);
  const payload = buildHumanPremiumReport(input);
  let ready = await markHumanPremiumReportReady(
    paid.id,
    payload as unknown as Record<string, unknown>,
    payload.birthBasis
  );

  if (options?.sendEmail !== false) {
    ready = await sendHumanPremiumReportEmail(ready, options?.request);
  }

  return {
    row: ready,
    payload,
    webUrl: buildHumanPremiumReportUrl(ready, options?.request),
  };
}

export async function generateHumanPremiumTestReport(
  input: HumanPremiumReportInput,
  options?: { sendEmail?: boolean; request?: Request | null }
): Promise<{
  row: HumanPremiumReportRow;
  payload: HumanPremiumReportPayload;
  webUrl: string;
}> {
  const draft = await createHumanPremiumReportDraft(input, {
    status: "paid",
    paymentProvider: "demo",
    paymentOrderId: `demo-${Date.now()}`,
    amountPaid: 0,
  });

  return completeHumanPremiumPayment(
    draft,
    {
      provider: "demo",
      orderId: draft.payment_order_id ?? `demo-${draft.id}`,
      captureId: `demo-cap-${draft.id}`,
      amountPaid: 0,
    },
    { sendEmail: options?.sendEmail, request: options?.request }
  );
}
