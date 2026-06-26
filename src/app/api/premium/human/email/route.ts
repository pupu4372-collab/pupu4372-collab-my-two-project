import { sendHumanPremiumReportEmail } from "@/lib/reports/human-premium/email";
import { isDeliverableHumanPremiumEmail } from "@/lib/reports/human-premium/email-policy";
import { getHumanPremiumReportByWebToken } from "@/lib/reports/human-premium/storage";
import { isResendConfigured } from "@/lib/email/resend";
import { NextResponse } from "next/server";

function isAccessExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() < Date.now();
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const token = String(body.token ?? "").trim();
  if (!token) {
    return NextResponse.json({ error: "token required." }, { status: 400 });
  }

  const report = await getHumanPremiumReportByWebToken(token);
  if (!report || isAccessExpired(report.web_access_expires_at)) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }

  if (!isResendConfigured()) {
    return NextResponse.json({ error: "RESEND_NOT_CONFIGURED" }, { status: 503 });
  }

  if (!isDeliverableHumanPremiumEmail(report.email)) {
    return NextResponse.json({ error: "EMAIL_NOT_ON_FILE" }, { status: 400 });
  }

  const updated = await sendHumanPremiumReportEmail(report, request);
  if (updated.email_status === "failed") {
    return NextResponse.json(
      {
        error: updated.email_error ?? "Email failed.",
        report: updated,
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ report: updated });
}
