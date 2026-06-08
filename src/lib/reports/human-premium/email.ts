import { sendResendEmail } from "@/lib/email/resend";
import { getConfiguredAppBaseUrl, resolveAppBaseUrl } from "@/lib/app-url";
import { updateHumanPremiumReport } from "./storage";
import type { HumanPremiumReportRow } from "./types";

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

function buildEmailCopy(row: HumanPremiumReportRow, reportUrl: string) {
  const isKo = row.locale === "ko";
  const name = escapeHtml(row.person_name);
  const url = escapeHtml(reportUrl);

  if (isKo) {
    return {
      subject: `[K-Saju Pet] ${row.person_name}님의 Premium 평생 리포트가 준비됐어요`,
      text: `${row.person_name}님의 Premium 평생 리포트가 준비됐어요.\n\n웹 리포트 보기: ${reportUrl}\n\nPDF는 리포트 페이지에서 선택 다운로드로 제공됩니다.\n운세는 재미로만 보세요~`,
      html: `
        <div style="font-family:Arial,'Apple SD Gothic Neo','Malgun Gothic',sans-serif;line-height:1.7;color:#3D2A4A;background:#FDF7EF;padding:28px;">
          <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid rgba(92,61,110,0.16);border-radius:28px;padding:28px;">
            <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.18em;color:#8B5CF6;font-weight:700;">K-SAJU PREMIUM</p>
            <h1 style="margin:0 0 14px;font-size:24px;color:#3D2A4A;">${name}님의 Premium 평생 리포트가 준비됐어요</h1>
            <p style="margin:0 0 22px;color:#5C3D6E;">사주 100장급 웹 리포트와 별자리 운세를 아래 버튼에서 바로 확인할 수 있어요.</p>
            <a href="${url}" style="display:inline-block;background:#8B5CF6;color:#fff;text-decoration:none;border-radius:999px;padding:12px 20px;font-weight:700;">웹 리포트 보기</a>
            <p style="margin:22px 0 0;font-size:13px;color:rgba(92,61,110,0.72);">PDF는 리포트 페이지에서 선택 다운로드로 제공됩니다.</p>
            <p style="margin:10px 0 0;font-size:12px;color:rgba(92,61,110,0.58);">운세는 재미로만 보세요~</p>
          </div>
        </div>
      `,
    };
  }

  return {
    subject: `[K-Saju Pet] Your Premium lifetime report is ready`,
    text: `Your Premium lifetime report is ready.\n\nOpen web report: ${reportUrl}\n\nPDF will be available as an optional download from the report page.\nEnjoy fortunes lightly, for fun only.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.7;color:#3D2A4A;background:#FDF7EF;padding:28px;">
        <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid rgba(92,61,110,0.16);border-radius:28px;padding:28px;">
          <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.18em;color:#8B5CF6;font-weight:700;">K-SAJU PREMIUM</p>
          <h1 style="margin:0 0 14px;font-size:24px;color:#3D2A4A;">Your Premium lifetime report is ready</h1>
          <p style="margin:0 0 22px;color:#5C3D6E;">Open your premium K-Saju web report and zodiac guidance below.</p>
          <a href="${url}" style="display:inline-block;background:#8B5CF6;color:#fff;text-decoration:none;border-radius:999px;padding:12px 20px;font-weight:700;">Open Web Report</a>
          <p style="margin:22px 0 0;font-size:13px;color:rgba(92,61,110,0.72);">PDF will be available as an optional download from the report page.</p>
          <p style="margin:10px 0 0;font-size:12px;color:rgba(92,61,110,0.58);">Enjoy fortunes lightly, for fun only.</p>
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
