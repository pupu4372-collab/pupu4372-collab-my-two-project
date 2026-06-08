import { requireAdmin } from "@/lib/admin/auth";
import { sendHumanPremiumReportEmail } from "@/lib/reports/human-premium/email";
import { getHumanPremiumReportById } from "@/lib/reports/human-premium/storage";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const adminId = await requireAdmin(request);
  if (!adminId) {
    return NextResponse.json({ error: "Admin only." }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const reportId = String(body.reportId ?? "").trim();
  if (!reportId) {
    return NextResponse.json({ error: "reportId required." }, { status: 400 });
  }

  const report = await getHumanPremiumReportById(reportId);
  if (!report) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
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
