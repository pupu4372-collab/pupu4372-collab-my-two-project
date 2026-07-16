import { requireAdminResponse } from "@/lib/admin/auth";
import { fetchAdminReports } from "@/lib/admin/moderation";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const gate = await requireAdminResponse(request);
  if ("response" in gate) return gate.response;

  try {
    const page = await fetchAdminReports(60);
    return NextResponse.json(page);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Service unavailable.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
