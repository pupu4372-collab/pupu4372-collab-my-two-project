import { sendResendEmail } from "@/lib/email/resend";
import { getConfiguredAppBaseUrl, resolveAppBaseUrl } from "@/lib/app-url";
import { updateHumanPremiumReport } from "./storage";
import {
  parseReportType,
  REPORT_TYPE_LABELS,
  REPORT_TYPE_LABELS_EN,
  type HumanPremiumReportRow,
} from "./types";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function buildHumanPremiumReportUrl(
  row: HumanPremiumReportRow,
  request?: Request | null
): string {
  const base = request ? resolveAppBaseUrl(request) : getConfiguredAppBaseUrl();
  return `${base}/${row.locale}/reports/human/${row.web_access_token}`;
}

function reportProductLabel(row: HumanPremiumReportRow): string {
  const reportType = parseReportType(row.report_type);
  return row.locale === "en"
    ? REPORT_TYPE_LABELS_EN[reportType]
    : REPORT_TYPE_LABELS[reportType];
}

function buildEmailCopy(row: HumanPremiumReportRow, reportUrl: string) {
  const isKo = row.locale === "ko";
  const productLabel = reportProductLabel(row);
  const name = escapeHtml(row.person_name);
  const product = escapeHtml(productLabel);
  const url = escapeHtml(reportUrl);

  if (isKo) {
    const headline = `${row.person_name}님의 ${productLabel} 리포트가 준비됐어요`;
    return {
      subject: `[K-Saju Pet] ${headline}`,
      text: `${headline}\n\n구매하신 리포트를 아래 링크에서 바로 확인할 수 있어요.\n웹 리포트 보기: ${reportUrl}\n\n이 링크는 구매하신 리포트 전용 링크예요. PDF로 저장해두시면 언제든 다시 볼 수 있어요.`,
      html: `
        <div style="font-family:Arial,'Apple SD Gothic Neo','Malgun Gothic',sans-serif;line-height:1.7;color:#3D2A4A;background:#FDF7EF;padding:28px;">
          <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid rgba(92,61,110,0.16);border-radius:28px;padding:28px;">
            <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.18em;color:#8B5CF6;font-weight:700;">K-SAJU PREMIUM</p>
            <h1 style="margin:0 0 14px;font-size:24px;color:#3D2A4A;">${name}님의 ${product} 리포트가 준비됐어요</h1>
            <p style="margin:0 0 22px;color:#5C3D6E;">구매하신 리포트를 아래 버튼에서 바로 확인할 수 있어요.</p>
            <a href="${url}" style="display:inline-block;background:#8B5CF6;color:#fff;text-decoration:none;border-radius:999px;padding:12px 20px;font-weight:700;">웹 리포트 보기</a>
            <p style="margin:22px 0 0;font-size:13px;color:rgba(92,61,110,0.72);">이 링크는 구매하신 리포트 전용 링크예요. PDF로 저장해두시면 언제든 다시 볼 수 있어요.</p>
          </div>
        </div>
      `,
    };
  }

  const headline = `Your ${productLabel} report is ready`;
  return {
    subject: `[K-Saju Pet] ${headline}`,
    text: `${headline}\n\nOpen your purchased report with the link below.\nOpen web report: ${reportUrl}\n\nThis link opens your purchased report. Save it as a PDF to keep it anytime.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.7;color:#3D2A4A;background:#FDF7EF;padding:28px;">
        <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid rgba(92,61,110,0.16);border-radius:28px;padding:28px;">
          <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.18em;color:#8B5CF6;font-weight:700;">K-SAJU PREMIUM</p>
          <h1 style="margin:0 0 14px;font-size:24px;color:#3D2A4A;">${escapeHtml(headline)}</h1>
          <p style="margin:0 0 22px;color:#5C3D6E;">Open your purchased report with the button below.</p>
          <a href="${url}" style="display:inline-block;background:#8B5CF6;color:#fff;text-decoration:none;border-radius:999px;padding:12px 20px;font-weight:700;">Open Web Report</a>
          <p style="margin:22px 0 0;font-size:13px;color:rgba(92,61,110,0.72);">This link opens your purchased report. Save it as a PDF to keep it anytime.</p>
        </div>
      </div>
    `,
  };
}

export async function sendHumanPremiumReportEmail(
  row: HumanPremiumReportRow,
  request?: Request | null
): Promise<HumanPremiumReportRow> {
  const reportUrl = buildHumanPremiumReportUrl(row, request);
  const copy = buildEmailCopy(row, reportUrl);

  try {
    const result = await sendResendEmail({
      to: row.email,
      subject: copy.subject,
      html: copy.html,
      text: copy.text,
    });

    return updateHumanPremiumReport(row.id, {
      status: "email_sent",
      email_status: "sent",
      email_sent_at: new Date().toISOString(),
      email_error: null,
      resend_message_id: result.id,
      failure_stage: null,
      failure_message: null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Human premium report email failed.";

    return updateHumanPremiumReport(row.id, {
      status: "email_failed",
      email_status: "failed",
      email_error: message,
      failure_stage: "email",
      failure_message: message,
    });
  }
}
