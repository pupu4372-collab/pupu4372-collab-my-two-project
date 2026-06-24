import { buildHumanPremiumReportHybrid } from "./hybrid";
import { sendHumanPremiumReportEmail, buildHumanPremiumReportUrl } from "./email";
import {
  createHumanPremiumReportDraft,
  markHumanPremiumReportPaid,
  markHumanPremiumReportReady,
} from "./storage";
import {
  parseReportType,
  type HumanPremiumBirthBasis,
  type HumanPremiumPaymentProvider,
  type HumanPremiumReportInput,
  type HumanPremiumReportPayload,
  type HumanPremiumReportRow,
} from "./types";

import {
  isDeliverableHumanPremiumEmail,
  resolveHumanPremiumEmail,
} from "./email-policy";

function parseGender(body: Record<string, unknown>): "male" | "female" | null {
  if (body.gender === "male") return "male";
  if (body.gender === "female") return "female";
  return null;
}

export function parseHumanPremiumReportInput(
  body: Record<string, unknown>,
  userId?: string | null
): HumanPremiumReportInput {
  const personName = String(body.personName ?? "").trim();
  const { email } = resolveHumanPremiumEmail(body.email);
  const birthDate = String(body.birthDate ?? "").trim();
  const timezone = String(body.timezone ?? "Asia/Seoul").trim();
  const calendarType = body.calendarType === "lunar" ? "lunar" : "solar";
  const locale = body.locale === "en" ? "en" : "ko";
  const birthTimeUnknown = Boolean(body.birthTimeUnknown);
  const birthTime = birthTimeUnknown ? null : String(body.birthTime ?? "").trim() || null;

  if (!personName) throw new Error("personName required.");
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
    gender: parseGender(body),
    userId: userId ?? null,
    reportType: parseReportType(body.reportType),
  };
}

export function humanPremiumRowToInput(
  row: HumanPremiumReportRow
): HumanPremiumReportInput {
  const basis = row.birth_basis as HumanPremiumBirthBasis | null;
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
    gender: basis?.gender ?? null,
    userId: row.user_id,
    reportType: parseReportType(row.report_type),
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
    if (
      options?.sendEmail !== false &&
      isDeliverableHumanPremiumEmail(row.email) &&
      row.email_status !== "sent"
    ) {
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
  const payload = await buildHumanPremiumReportHybrid(input);
  let ready = await markHumanPremiumReportReady(
    paid.id,
    payload as unknown as Record<string, unknown>,
    payload.birthBasis
  );

  if (options?.sendEmail !== false && isDeliverableHumanPremiumEmail(ready.email)) {
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
