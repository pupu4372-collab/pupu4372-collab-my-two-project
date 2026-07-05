import { persistHumanPremiumDailyRoutineReport } from "@/lib/reports/human-premium/daily-routine";
import { formatHumanPremiumError } from "@/lib/reports/human-premium/client-errors";
import { scheduleHumanPremiumPdfPrewarm } from "@/lib/reports/human-premium/pdf-cache";
import { parseHumanPremiumReportInput } from "@/lib/reports/human-premium/service";
import { NextResponse, after } from "next/server";

export const maxDuration = 120;

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const locale = body.locale === "en" ? "en" : "ko";

  try {
    const input = parseHumanPremiumReportInput(body);
    const { payload, webToken, webUrl, row } = await persistHumanPremiumDailyRoutineReport(
      input,
      { request }
    );

    after(() => {
      scheduleHumanPremiumPdfPrewarm(row, payload);
    });

    return NextResponse.json({ report: payload, webToken, webUrl });
  } catch (err) {
    const raw = err instanceof Error ? err.message : "Daily routine report failed.";
    return NextResponse.json({ error: formatHumanPremiumError(raw, locale) }, { status: 500 });
  }
}
