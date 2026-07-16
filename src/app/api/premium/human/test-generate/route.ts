import { requireAdminResponse } from "@/lib/admin/auth";
import {
  generateHumanPremiumTestReport,
  parseHumanPremiumReportInput,
} from "@/lib/reports/human-premium/service";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const gate = await requireAdminResponse(request);
  if ("response" in gate) {
    if (gate.response.status === 403) {
      return NextResponse.json({ error: "Admin only." }, { status: 403 });
    }
    return gate.response;
  }
  const { adminId } = gate;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  try {
    const input = parseHumanPremiumReportInput(body, adminId);
    const sendEmail = body.sendEmail !== false;
    const result = await generateHumanPremiumTestReport(input, {
      sendEmail,
      request,
    });

    return NextResponse.json({
      report: result.row,
      webUrl: result.webUrl,
      totals: result.payload.totals,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Test generate failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
