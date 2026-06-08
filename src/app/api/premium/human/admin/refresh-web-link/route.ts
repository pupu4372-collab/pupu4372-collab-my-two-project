import { requireAdmin } from "@/lib/admin/auth";
import { buildHumanPremiumReportUrl } from "@/lib/reports/human-premium/email";
import {
  getHumanPremiumReportById,
  refreshHumanPremiumWebAccess,
} from "@/lib/reports/human-premium/storage";
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

  const existing = await getHumanPremiumReportById(reportId);
  if (!existing) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }

  const report = await refreshHumanPremiumWebAccess(reportId);
  return NextResponse.json({
    report,
    webUrl: buildHumanPremiumReportUrl(report, request),
  });
}
