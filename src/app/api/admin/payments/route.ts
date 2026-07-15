import { requireAdmin } from "@/lib/admin/auth";
import { listAllPaymentHistoryForAdmin } from "@/lib/admin/payment-history";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const adminId = await requireAdmin(request);
  if (!adminId) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  try {
    const entries = await listAllPaymentHistoryForAdmin();
    return NextResponse.json({ entries });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Admin payment history failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
