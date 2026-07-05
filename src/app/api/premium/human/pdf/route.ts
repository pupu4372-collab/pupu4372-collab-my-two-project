import { buildHumanPremiumPdfFilename } from "@/lib/reports/human-premium/filename";
import { getOrRenderHumanPremiumPdf } from "@/lib/reports/human-premium/pdf-cache";
import { resolveHumanPremiumReportByToken } from "@/lib/reports/human-premium/resolve";
import { markHumanPremiumReportFailed } from "@/lib/reports/human-premium/storage";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = String(searchParams.get("token") ?? "").trim();

  if (!token) {
    return NextResponse.json({ error: "token required." }, { status: 400 });
  }

  const resolved = await resolveHumanPremiumReportByToken(token);
  if (!resolved) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }

  try {
    const pdf = await getOrRenderHumanPremiumPdf(resolved.row, resolved.payload);
    const { display, asciiFallback } = buildHumanPremiumPdfFilename(resolved.payload);

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encodeURIComponent(display)}`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "PDF generation failed.";
    await markHumanPremiumReportFailed(resolved.row.id, "pdf", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
