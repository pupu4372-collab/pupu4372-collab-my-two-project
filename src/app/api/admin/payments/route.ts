import { requireAdminResponse } from "@/lib/admin/auth";
import {
  clampAdminPaymentLimit,
  listPaymentHistoryForAdmin,
} from "@/lib/admin/payment-history";
import { NextResponse } from "next/server";

function defaultFromTo(): { from: string; to: string } {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const today = new Date();
  const to = fmt.format(today);
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const from = fmt.format(weekAgo);
  return { from, to };
}

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
    const url = new URL(request.url);
    const defaults = defaultFromTo();
    const from = url.searchParams.get("from")?.trim() || defaults.from;
    const to = url.searchParams.get("to")?.trim() || defaults.to;
    const limit = clampAdminPaymentLimit(url.searchParams.get("limit") ?? 50);
    const cursor = url.searchParams.get("cursor");

    const { entries, nextCursor, hasMore } = await listPaymentHistoryForAdmin({
      from,
      to,
      limit,
      cursor,
    });

    return NextResponse.json({ entries, nextCursor, hasMore, from, to, limit });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Admin payment history failed.";
    if (message.includes("Invalid from/to") || message.includes("Invalid cursor") || message.includes("from must")) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    const status = message.includes("SUPABASE_SERVICE_ROLE_KEY") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
