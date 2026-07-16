import { requireAdminResponse } from "@/lib/admin/auth";
import { listAllPaymentHistoryForAdmin } from "@/lib/admin/payment-history";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const gate = await requireAdminResponse(request);
  if ("response" in gate) {
    // Hide admin payments endpoint from non-admins (same as previous 404).
    if (gate.response.status === 403) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    return gate.response;
  }

  try {
    const entries = await listAllPaymentHistoryForAdmin();
    return NextResponse.json({ entries });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Admin payment history failed.";
    const status = message.includes("SUPABASE_SERVICE_ROLE_KEY") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
