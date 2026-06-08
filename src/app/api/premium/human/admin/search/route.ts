import { requireAdmin } from "@/lib/admin/auth";
import { buildHumanPremiumReportUrl } from "@/lib/reports/human-premium/email";
import { searchHumanPremiumReports } from "@/lib/reports/human-premium/storage";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const adminId = await requireAdmin(request);
  if (!adminId) {
    return NextResponse.json({ error: "Admin only." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const query = String(searchParams.get("query") ?? "").trim();
  if (!query) {
    return NextResponse.json({ reports: [] });
  }

  const reports = await searchHumanPremiumReports(query);
  return NextResponse.json({
    reports: reports.map((report) => ({
      ...report,
      webUrl: buildHumanPremiumReportUrl(report, request),
    })),
  });
}
