import { getOrRenderHumanPremiumPdf } from "@/lib/reports/human-premium/pdf-cache";
import { resolveHumanPremiumReportByToken } from "@/lib/reports/human-premium/resolve";
import { markHumanPremiumReportFailed } from "@/lib/reports/human-premium/storage";
import { NextResponse } from "next/server";

/** HTTP header filenames must be ASCII (ByteString). Korean name goes via client save picker. */
function pdfHeaderFilename(personName: string): string {
  const ascii = personName.replace(/[^\x20-\x7E]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return `jigwanjae-${ascii || "report"}.pdf`;
}

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

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${pdfHeaderFilename(resolved.payload.personName)}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "PDF generation failed.";
    await markHumanPremiumReportFailed(resolved.row.id, "pdf", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
