import { buildHumanPremiumReportUrl } from "@/lib/reports/human-premium/email";
import { getHumanPremiumReportById } from "@/lib/reports/human-premium/storage";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reportId = String(searchParams.get("reportId") ?? "").trim();
  const token = String(searchParams.get("token") ?? "").trim();

  if (!reportId) {
    return NextResponse.json({ error: "reportId required." }, { status: 400 });
  }

  const row = await getHumanPremiumReportById(reportId);
  if (!row) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }

  if (token && row.web_access_token && token !== row.web_access_token) {
    return NextResponse.json({ error: "Invalid token." }, { status: 403 });
  }

  const ready = row.status === "ready" || row.status === "email_sent" || Boolean(row.report_payload);

  return NextResponse.json({
    reportId: row.id,
    status: row.status,
    emailStatus: row.email_status,
    ready,
    webUrl: ready ? buildHumanPremiumReportUrl(row, request) : null,
    paymentProvider: row.payment_provider,
  });
}
